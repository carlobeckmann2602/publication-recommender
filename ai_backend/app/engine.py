import nltk
import os
import pickle
import pandas as pd
import numpy as np
import torch
from .util.misc import add_array_column
from sentence_transformers import SentenceTransformer, util
from .util.LexRank import degree_centrality_scores
from annoy import AnnoyIndex
from typing import Literal, List, Union
from tqdm.auto import tqdm
device = "cuda" if torch.cuda.is_available() else "cpu"


class Summarizer:
    transformer: SentenceTransformer

    def __init__(self, transformer: str | SentenceTransformer = "all-MiniLM-L6-v2", tokenize: bool = True,
                 debug=False):
        self.debug = debug
        self.tokenize = tokenize

        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer

    def __getstate__(self):
        state = self.__dict__.copy()
        del state["transformer"]
        return state

    @staticmethod
    def tokenize_input(input_text: str, check_download=True) -> List[str]:
        if check_download:
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
        return list(nltk.sent_tokenize(input_text))

    def run(self, input_data: str | pd.Series,
            amount=1, add_embedding=False) -> np.ndarray[str] | Union[np.ndarray[str], np.ndarray[float]]:
        if amount < 1:
            raise Exception("The desired sentence amount must be greater than 1")
        if isinstance(input_data, str):
            input_data = pd.Series([input_data])
        dataframe = pd.DataFrame(data={"input": input_data})
        if self.tokenize:
            tqdm.pandas(desc="(Summarizing) Tokenizing")
            dataframe["token"] = dataframe["input"].progress_apply(Summarizer.tokenize_input)
        else:
            dataframe["token"] = input_data

        dataframe["token_amount"] = dataframe["token"].apply(len)
        if dataframe["token_amount"].min() < amount:
            raise Exception("Not enough tokens" + "\n" + str(dataframe["token_amount"].idxmin()))

        def encode(token: list):
            embedding = self.transformer.encode(token, convert_to_numpy=True)
            return embedding
        tqdm.pandas(desc="(Summarizing) Creating Embeds")
        dataframe["embedding"] = dataframe["token"].progress_apply(encode)
        dataframe["embedding_amount"] = dataframe["embedding"].apply(len)

        def cos_sim(vectors: list):
            tensor = torch.tensor(vectors, dtype=torch.float)
            c = util.cos_sim(tensor, tensor).cpu().numpy()
            return c

        tqdm.pandas(desc="(Summarizing) Calculating Cosine")
        dataframe["cosine"] = dataframe["embedding"].progress_apply(cos_sim)

        def rank_tokens(row: pd.Series):
            cosine_vector = row["cosine"]
            token_list = row["token"]
            embedding_list = row["embedding"]
            score_mask = degree_centrality_scores(cosine_vector, threshold=None)
            significance_mask = np.argsort(-score_mask)
            significance_mask = significance_mask[0:amount]
            significance_mask = np.array(significance_mask, dtype=int)

            token_vector = np.array(token_list)
            token_vector = np.vectorize(lambda x: x.strip())(token_vector)
            token_ranking = token_vector[significance_mask]
            embedding_ranking = np.array(embedding_list)[significance_mask]

            row["ranked_tokens"] = list(token_ranking)
            row["ranked_embeddings"] = list(embedding_ranking)
            return row

        tqdm.pandas(desc="(Summarizing) Ranking Tokens")
        dataframe = dataframe.progress_apply(rank_tokens, axis=1)

        tokens = np.array(dataframe["ranked_tokens"].tolist(), dtype=str)
        if add_embedding:
            embeddings = np.array(dataframe["ranked_embeddings"].tolist(), dtype=float)
            return tokens, embeddings
        else:
            return tokens


class Recommender:
    ANNOY_INDEX_KEY = "annoy_index"
    PUBLICATION_ID_KEY = "publication_id"
    SENTENCE_ID_KEY = "sentence_id"

    mapping: pd.DataFrame = None
    annoy_database: AnnoyIndex

    def __init__(self,
                 summarization: Summarizer,
                 annoy_input_length: int = 384,
                 annoy_mode: Literal["angular", "euclidean", "manhattan", "hamming", "dot"] = "angular",
                 token_amount: int = 1,
                 annoy_n_trees: int = 10,
                 debug=False):
        self.debug = debug
        self.annoy_input_length = annoy_input_length
        self.annoy_mode = annoy_mode
        self.token_amount = token_amount
        self.annoy_n_trees = annoy_n_trees

        self.summarizer = summarization
        self.instantiate_annoy()

    def __getstate__(self):
        state = self.__dict__.copy()
        del state["annoy_database"]
        del state["mapping"]
        return state

    def save(self, path="./data/generated_data", model_name="current"):
        path = path + "/" + model_name + "/"
        if not os.path.exists(path):
            os.makedirs(path)
        self.annoy_database.save(path + "annoy.ann")
        self.mapping.to_pickle(path + "mapping.pkl")
        state_file = open(path + "state.pkl", "wb")
        self.summarizer.transformer.save(path + "summy_transformer")
        pickle.dump(self.__getstate__(), state_file)
        state_file.close()

    def load(self, path="./data/generated_data", model_name="current"):
        path = path + "/" + model_name + "/"
        if os.path.exists(path + "state.pkl"):
            state_file = open(path + "state.pkl", "rb")
            state_dict = pickle.load(state_file)
            state_file.close()
            self.__dict__.update(state_dict)
            self.summarizer.transformer = SentenceTransformer(path + "summy_transformer")
            self.instantiate_annoy()
        self.annoy_database.load(path + "annoy.ann")
        self.mapping = pd.read_pickle(path + "mapping.pkl")

    def instantiate_annoy(self):
        self.annoy_database = AnnoyIndex(self.annoy_input_length, self.annoy_mode)

    def convert_to_mapping(self, dataframe: pd.DataFrame,
                           id_key: str, input_key: str,
                           input_mode: Literal["text", "embeddings"]) -> (pd.DataFrame, np.ndarray[float]):
        dataframe = dataframe[[id_key, input_key]].copy()
        match input_mode:
            case "text":
                tokens, embeddings = self.summarizer.run(dataframe[input_key],
                                                         amount=self.token_amount, add_embedding=True)
                dataframe = add_array_column(dataframe, input_key, embeddings)

        dataframe = dataframe.explode(input_key)
        dataframe[self.SENTENCE_ID_KEY] = dataframe.groupby(id_key).cumcount()
        print(dataframe.info())
        embeddings = np.array(dataframe[input_key].tolist())
        print(embeddings.shape)
        dataframe.drop([input_key], axis=1, inplace=True)
        dataframe.rename(columns={id_key: self.PUBLICATION_ID_KEY}, inplace=True)
        dataframe.reset_index(inplace=True, drop=True)

        return dataframe, embeddings

    def build_annoy(self, new_mapping: pd.DataFrame,
                    new_embeddings: np.ndarray[float],
                    build_mode: Literal["override", "add"]):
        embeddings: np.ndarray = np.array([])
        match build_mode:
            case "override":
                embeddings = new_embeddings
            case "add":
                if self.mapping is None:
                    raise Exception("No mapping data found. Do not use build mode add")
                if self.mapping.empty:
                    raise Exception("No mapping data found (Mapping is empty). Do not use build mode add")
                old_mapping = self.mapping.copy()

                def get_embedding_from_annoy(annoy_id: int) -> list:
                    return self.annoy_database.get_item_vector(annoy_id)
                tqdm.pandas(desc="(Building Annoy) Reconstructing old Embeddings")
                old_mapping["embedding"] = old_mapping[self.ANNOY_INDEX_KEY].progress_apply(get_embedding_from_annoy)
                embeddings = np.concatenate((np.ndarray(old_mapping["embedding"].tolist()), new_embeddings), axis=0)
                old_mapping.drop(columns=[self.ANNOY_INDEX_KEY], inplace=True)
                new_mapping = pd.concat([old_mapping, new_mapping], ignore_index=True)

        new_mapping = add_array_column(new_mapping, "embedding", embeddings)

        def add_to_annoy(index: int, vector: list):
            embed = np.array(vector).flatten()
            self.annoy_database.add_item(index, embed)

        self.instantiate_annoy()
        tqdm.pandas(desc="(Building Annoy) Adding to Annoy")
        new_mapping.reset_index(inplace=True, names=self.ANNOY_INDEX_KEY)
        new_mapping[[self.ANNOY_INDEX_KEY, "embedding"]].progress_apply(
            lambda row: add_to_annoy(index=row[self.ANNOY_INDEX_KEY], vector=row["embedding"]),
            axis=1)
        self.annoy_database.build(n_trees=self.annoy_n_trees)
        new_mapping.drop(columns=["embedding"], inplace=True)
        self.mapping = new_mapping

    def get_match_by_token(self, token: str | List[float], amount: int = 1) -> pd.DataFrame:
        original_token = token
        if isinstance(token, str):
            token = self.summarizer.transformer.encode(token, convert_to_numpy=True)

        nns_amount = amount * self.token_amount
        neighbours, distances = self.annoy_database.get_nns_by_vector(token, nns_amount, include_distances=True)
        nns_output = pd.DataFrame(data={
            self.ANNOY_INDEX_KEY: neighbours,
            "distance": distances,
            "input_token": np.full(len(neighbours), original_token)
        })

        nns_output = pd.merge(
            nns_output, self.mapping[[self.ANNOY_INDEX_KEY, self.PUBLICATION_ID_KEY, self.SENTENCE_ID_KEY]],
            how="left", on=self.ANNOY_INDEX_KEY
        )
        nns_output.rename(inplace=True, columns={self.SENTENCE_ID_KEY: "matching_token"})
        nns_output.sort_values(by="distance", ascending=True, inplace=True)
        nns_output.drop_duplicates(subset=self.PUBLICATION_ID_KEY, keep="first", inplace=True)

        return nns_output.iloc[0:amount].reset_index(drop=True)

    def get_match_by_id(self, publication_id: str, amount: int = 1) -> pd.DataFrame:
        publication_df = self.mapping[self.mapping[self.PUBLICATION_ID_KEY] == publication_id].copy()

        nns_output = None
        nns_amount = (amount + 1) * self.token_amount  # TODO: Find better way
        for index, row in publication_df.iterrows():
            annoy_index = row[self.ANNOY_INDEX_KEY]
            input_token_id = row[self.SENTENCE_ID_KEY]
            neighbours, distances = self.annoy_database.get_nns_by_item(annoy_index, nns_amount, include_distances=True)
            if nns_output is None:
                nns_output = pd.DataFrame(data={
                    self.ANNOY_INDEX_KEY: neighbours,
                    "distance": distances,
                    "input_token": np.full(len(neighbours), input_token_id)
                })
            else:
                nns_output = pd.concat([nns_output, pd.DataFrame(data={
                    self.ANNOY_INDEX_KEY: neighbours,
                    "distance": distances,
                    "input_token": np.full(len(neighbours), input_token_id)
                })], ignore_index=True)

        nns_output = pd.merge(
            nns_output, self.mapping[[self.ANNOY_INDEX_KEY, self.PUBLICATION_ID_KEY, self.SENTENCE_ID_KEY]],
            how="left", on=self.ANNOY_INDEX_KEY
        )
        nns_output.rename(inplace=True, columns={self.SENTENCE_ID_KEY: "matching_token"})
        nns_output = nns_output[nns_output[self.PUBLICATION_ID_KEY] != publication_id].copy()
        nns_output.sort_values(by="distance", ascending=True, inplace=True)
        nns_output.drop_duplicates(subset=self.PUBLICATION_ID_KEY, keep="first", inplace=True)
        return nns_output.iloc[0:amount].reset_index(drop=True)
