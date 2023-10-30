import nltk
import os
import pandas as pd
import numpy as np
import torch
from .util.misc import add_array_column
from sentence_transformers import SentenceTransformer, util
from .util.LexRank import degree_centrality_scores
from annoy import AnnoyIndex
from typing import Literal, List
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

    @staticmethod
    def tokenize_input(input_text: str, check_download=True) -> List[str]:
        if check_download:
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
        return list(nltk.sent_tokenize(input_text))

    def run(self, input_data: str | pd.Series, amount=1) -> np.ndarray[str]:
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

        def rank_tokens(cosine_vector: list, token_list: list):
            score_mask = degree_centrality_scores(cosine_vector, threshold=None)
            significance_mask = np.argsort(-score_mask)
            significance_mask = significance_mask[0:amount]
            significance_mask = np.array(significance_mask, dtype=int)

            token_vector = np.array(token_list)
            token_vector = np.vectorize(lambda x: x.strip())(token_vector)
            token_ranking = token_vector[significance_mask]
            return list(token_ranking)

        tqdm.pandas(desc="(Summarizing) Ranking Tokens")
        dataframe["ranking"] = dataframe[["cosine", "token"]].progress_apply(
            lambda x: rank_tokens(x["cosine"], x["token"]),
            axis=1)

        return np.array(dataframe["ranking"].tolist(), dtype=str)


class Recommender:
    ANNOY_INDEX_KEY = "annoy_index"
    PUB_ID_KEY = "publication_id"
    SUMMARY_KEY = "summary"
    VECTOR_KEY = "embed"

    mapping: pd.DataFrame = None
    annoy_database: AnnoyIndex

    def __init__(self,
                 summarization: Summarizer,
                 transformer: str | SentenceTransformer = "all-MiniLM-L6-v2",
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
        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer
        self.instantiate_annoy()

    def instantiate_annoy(self):
        self.annoy_database = AnnoyIndex(self.annoy_input_length, self.annoy_mode)

    def add_to_mapping(self, dataset: pd.DataFrame, data_key: str, id_key: str = "id"):
        summarizations = self.summarizer.run(dataset[data_key], amount=self.token_amount)
        new_data = pd.DataFrame()
        new_data[self.PUB_ID_KEY] = dataset[id_key]
        new_data = add_array_column(new_data, "summary", summarizations)
        new_data[self.ANNOY_INDEX_KEY] = np.full(len(new_data), -1)
        new_data = new_data.explode("summary")
        new_data.reset_index(inplace=True, drop=True)

        def encode(token: list):
            embedding = self.transformer.encode(token, convert_to_numpy=True)
            return embedding
        tqdm.pandas(desc="(Mapping Annoy) Creating Embeds")
        new_data[self.VECTOR_KEY] = new_data[self.SUMMARY_KEY].progress_apply(encode)
        if self.mapping is None:
            self.mapping = new_data
        else:
            self.mapping = pd.concat([self.mapping, new_data], ignore_index=True)

    def build_annoy(self):
        if self.mapping is None:
            raise Exception("No mapping data found. Use add_to_mapping first")
        if self.mapping.empty:
            raise Exception("No mapping data found (Mapping is empty). Use add_to_mapping first")

        def add_to_annoy(index: int, vector: list):
            embed = np.array(vector).flatten()
            self.annoy_database.add_item(index, embed)

        self.instantiate_annoy()
        tqdm.pandas(desc="(Building Annoy) Adding to Annoy")
        self.mapping.drop(columns=self.ANNOY_INDEX_KEY, inplace=True)
        self.mapping.reset_index(inplace=True, names=self.ANNOY_INDEX_KEY)
        self.mapping[[self.ANNOY_INDEX_KEY, self.VECTOR_KEY]].progress_apply(
            lambda row: add_to_annoy(index=row[self.ANNOY_INDEX_KEY], vector=row[self.VECTOR_KEY]),
            axis=1)
        self.annoy_database.build(n_trees=self.annoy_n_trees)

    def save(self, path="./data/generated_data", model_name="current"):
        path = path + "/" + model_name + "/"
        if not os.path.exists(path):
            os.makedirs(path)
        self.annoy_database.save(path + "annoy.ann")
        self.mapping.to_pickle(path + "mapping.pkl")

    def load(self, path="./data/generated_data", model_name="current"):
        path = path + "/" + model_name + "/"
        self.annoy_database.load(path + "annoy.ann")
        self.mapping = pd.read_pickle(path + "mapping.pkl")

    def get_match_by_token(self, token: str | List[float], amount: int = 1) -> pd.DataFrame:
        original_token = token
        if isinstance(token, str):
            token = self.transformer.encode(token, convert_to_numpy=True)

        nns_amount = amount * self.token_amount
        neighbours, distances = self.annoy_database.get_nns_by_vector(token, nns_amount, include_distances=True)
        nns_output = pd.DataFrame(data={
            self.ANNOY_INDEX_KEY: neighbours,
            "distance": distances,
            "input_token": np.full(len(neighbours), original_token)
        })

        nns_output = pd.merge(
            nns_output, self.mapping[[self.ANNOY_INDEX_KEY, self.PUB_ID_KEY, self.SUMMARY_KEY]],
            how="left", on=self.ANNOY_INDEX_KEY
        )
        nns_output.rename(inplace=True, columns={self.SUMMARY_KEY: "matching_token"})
        nns_output.sort_values(by="distance", ascending=True, inplace=True)
        nns_output.drop_duplicates(subset=self.PUB_ID_KEY, keep="first", inplace=True)

        return nns_output.iloc[0:amount].reset_index(drop=True)

    def get_match_by_id(self, publication_id: str, amount: int = 1) -> pd.DataFrame:
        publication_df = self.mapping[self.mapping[self.PUB_ID_KEY] == publication_id].copy()
        publication_df = publication_df[publication_df[self.ANNOY_INDEX_KEY] != -1]
        search_items = publication_df[self.ANNOY_INDEX_KEY].tolist()

        nns_output = None
        nns_amount = (amount + 1) * self.token_amount  # TODO: Find better way
        for item in search_items:
            input_token = publication_df[publication_df[self.ANNOY_INDEX_KEY] == item][self.SUMMARY_KEY].tolist()[0]
            neighbours, distances = self.annoy_database.get_nns_by_item(item, nns_amount, include_distances=True)
            if nns_output is None:
                nns_output = pd.DataFrame(data={
                    self.ANNOY_INDEX_KEY: neighbours,
                    "distance": distances,
                    "input_token": np.full(len(neighbours), input_token)
                })
            else:
                nns_output = pd.concat([nns_output, pd.DataFrame(data={
                    self.ANNOY_INDEX_KEY: neighbours,
                    "distance": distances,
                    "input_token": np.full(len(neighbours), input_token)
                })], ignore_index=True)

        nns_output = pd.merge(
            nns_output, self.mapping[[self.ANNOY_INDEX_KEY, self.PUB_ID_KEY, self.SUMMARY_KEY]],
            how="left", on=self.ANNOY_INDEX_KEY
        )
        nns_output.rename(inplace=True, columns={self.SUMMARY_KEY: "matching_token"})
        nns_output = nns_output[nns_output[self.PUB_ID_KEY] != publication_id].copy()
        nns_output.sort_values(by="distance", ascending=True, inplace=True)
        nns_output.drop_duplicates(subset=self.PUB_ID_KEY, keep="first", inplace=True)
        return nns_output.iloc[0:amount].reset_index(drop=True)
