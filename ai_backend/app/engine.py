import nltk
import os
import pickle
import pandas as pd
import numpy as np
import torch
from numpy import random
from sklearn.decomposition import PCA
from .util.misc import add_array_column
from sentence_transformers import SentenceTransformer
from .util.LexRank import FastLexRankSummarizer
from annoy import AnnoyIndex
from typing import Literal, List, Union
from tqdm.auto import tqdm

device = "cuda" if torch.cuda.is_available() else "cpu"


class Summarizer:
    transformer: SentenceTransformer
    lexrank: FastLexRankSummarizer
    lexrank_threshold = .1

    def __init__(self, transformer: str | SentenceTransformer = "all-mpnet-base-v2", tokenize: bool = True,
                 debug=False):
        self.debug = debug
        self.tokenize = tokenize

        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer
        self.create_lexrank()

    def create_lexrank(self):
        self.lexrank = FastLexRankSummarizer(model=self.transformer, threshold=self.lexrank_threshold)

    def __getstate__(self):
        state = self.__dict__.copy()
        excluded_parameters = ["transformer", "lexrank"]
        for parameter in excluded_parameters:
            if parameter in state:
                del state[parameter]
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

        def rank_tokens(row: pd.Series):
            token_list = row["token"]

            token_ranking, embedding_ranking = self.lexrank.summarize(token_list, amount)

            row["ranked_tokens"] = token_ranking
            row["ranked_embeddings"] = embedding_ranking
            return row

#        tqdm.pandas(desc="(Summarizing) Apply LexRank")
        dataframe = dataframe.apply(rank_tokens, axis=1)

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
        excluded_parameters = ["annoy_database", "mapping"]
        for parameter in excluded_parameters:
            if parameter in state:
                del state[parameter]
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
            self.summarizer.create_lexrank()
            self.instantiate_annoy()
        self.annoy_database.load(path + "annoy.ann")
        self.mapping = pd.read_pickle(path + "mapping.pkl")

    def instantiate_annoy(self):
        self.annoy_database = AnnoyIndex(self.annoy_input_length, self.annoy_mode)

    def get_embedding_from_annoy(self, annoy_id: int) -> list:
        return self.annoy_database.get_item_vector(annoy_id)

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
        embeddings = np.array(dataframe[input_key].tolist())
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

                tqdm.pandas(desc="(Building Annoy) Reconstructing old Embeddings")
                old_mapping["embedding"] = old_mapping[self.ANNOY_INDEX_KEY].progress_apply(
                    self.get_embedding_from_annoy
                )
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

    def __run_recommender__(self, data: np.ndarray | int, input_info: str, amount: int,
                            exclude: List[str] = None) -> pd.DataFrame:
        if exclude is None:
            exclude = []

        # All blocked entries + enough neighbours so that amount unique publications are found
        nns_amount = (len(exclude) * self.token_amount) + (amount * self.token_amount)
        if self.debug:
            print(f"Generating {nns_amount} neighbours with {len(exclude)} excludes, "
                  f"{self.token_amount} tokens per entry and {amount} desired results")

        if isinstance(data, int):
            neighbours, distances = self.annoy_database.get_nns_by_item(data, nns_amount, include_distances=True)
        else:
            neighbours, distances = self.annoy_database.get_nns_by_vector(data, nns_amount, include_distances=True)

        nns_data = pd.DataFrame(data={
            self.ANNOY_INDEX_KEY: neighbours,
            "distance": distances,
            "input": np.full(len(neighbours), input_info)
        })
        nns_data = pd.merge(
            nns_data, self.mapping[[self.ANNOY_INDEX_KEY, self.PUBLICATION_ID_KEY, self.SENTENCE_ID_KEY]],
            how="left", on=self.ANNOY_INDEX_KEY
        )
        return nns_data

    def __to_recommender_output(self, nns_data: pd.DataFrame, amount: int, exclude: List[str] = None) -> pd.DataFrame:
        if exclude is None:
            exclude = []
        nns_data = nns_data[~nns_data[self.PUBLICATION_ID_KEY].isin(exclude)].copy()
        nns_data.sort_values(by="distance", ascending=True, inplace=True)
        nns_data.drop_duplicates(subset=self.PUBLICATION_ID_KEY, keep="first", inplace=True)
        return nns_data.iloc[0:amount].reset_index(drop=True)

    def get_match_by_token(self, token: str | List[float], amount: int = 1, exclude: List[str] = None) -> pd.DataFrame:
        if exclude is None:
            exclude = []
        original_token = token
        if isinstance(token, str):
            token = self.summarizer.transformer.encode(token, convert_to_numpy=True)
            printable_token = original_token
        else:
            printable_token = f"Vector with: {np.array(original_token).shape} -> (0:10): {original_token[0:10]}"

        nns_output = self.__run_recommender__(token, printable_token, amount, exclude)
        nns_output = self.__to_recommender_output(nns_output, amount, exclude)

        return nns_output

    def get_match_by_id(self, publication_id: str, amount: int = 1, exclude: List[str] = None) -> pd.DataFrame:
        if exclude is None:
            exclude = [publication_id]
        else:
            exclude.append(publication_id)

        publication_df = self.mapping[self.mapping[self.PUBLICATION_ID_KEY] == publication_id].copy()

        nns_output = None
        for index, row in publication_df.iterrows():
            annoy_index = row[self.ANNOY_INDEX_KEY]
            input_token_id = row[self.SENTENCE_ID_KEY]
            if nns_output is None:
                nns_output = self.__run_recommender__(annoy_index, input_token_id, amount, exclude)
            else:
                nns_output = pd.concat([
                    nns_output,
                    self.__run_recommender__(annoy_index, input_token_id, amount, exclude)
                ], ignore_index=True)

        nns_output = self.__to_recommender_output(nns_output, amount, exclude)

        return nns_output

    def get_match_by_group(self, publications_ids: List[str], amount: int = 1,
                           exclude: List[str] = None) -> pd.DataFrame:
        if exclude is None:
            exclude = publications_ids
        else:
            exclude.extend(publications_ids)

        publication_df = self.mapping[self.mapping[self.PUBLICATION_ID_KEY].isin(publications_ids)].copy()

        publication_df["embedding"] = publication_df[self.ANNOY_INDEX_KEY].apply(self.get_embedding_from_annoy)
        embeddings = np.array(publication_df["embedding"].to_list())
        pca = PCA(n_components=3)
        pca.fit(embeddings)
        pca1 = pca.components_[0]
        pca2 = pca.components_[1]
        pca3 = pca.components_[2]
        anchor_point = (random.normal(0, 1) * pca1) + (random.normal(0, 1) * pca2) + (random.normal(0, 1) * pca3)

        return self.get_match_by_token(anchor_point, amount, exclude)
