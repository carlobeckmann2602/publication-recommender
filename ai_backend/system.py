import time

import nltk
import os
import pandas as pd
import numpy as np
import torch
from util import *
from sentence_transformers import SentenceTransformer, util
from LexRank import degree_centrality_scores
from annoy import AnnoyIndex
from typing import Literal, List
from tqdm.auto import tqdm
# More models: https://www.sbert.net/docs/pretrained_models.html
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
            tqdm.pandas(desc="Tokenizing")
            dataframe["token"] = dataframe["input"].progress_apply(Summarizer.tokenize_input)
        else:
            dataframe["token"] = input_data

        dataframe["token_amount"] = dataframe["token"].apply(len)
        if dataframe["token_amount"].min() < amount:
            raise Exception("Not enough tokens" + "\n" + str(dataframe["token_amount"].idxmin()))

        def encode(token: list):
            embedding = self.transformer.encode(token, convert_to_numpy=True)
            return embedding
        tqdm.pandas(desc="Creating Embeds")
        dataframe["embedding"] = dataframe["token"].progress_apply(encode)
        dataframe["embedding_amount"] = dataframe["embedding"].apply(len)

        def cos_sim(vectors: list):
            tensor = torch.tensor(vectors, dtype=torch.float)
            c = util.cos_sim(tensor, tensor).cpu().numpy()
            return c

        tqdm.pandas(desc="Calculating Cosine")
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

        tqdm.pandas(desc="Ranking Tokens")
        dataframe["ranking"] = dataframe[["cosine", "token"]].progress_apply(
            lambda x: rank_tokens(x["cosine"], x["token"]),
            axis=1)

        return np.array(dataframe["ranking"].tolist(), dtype=str)


class Recommender:
    summarizer: Summarizer
    transformer: SentenceTransformer
    mapping: pd.DataFrame
    annoy_database: AnnoyIndex

    def __init__(self,
                 summarization: Summarizer,
                 transformer: str | SentenceTransformer = "all-MiniLM-L6-v2",
                 annoy_mode: Literal["angular", "euclidean", "manhattan", "hamming", "dot"] = "angular",
                 annoy_input_length: int = 384,
                 token_amount=1,
                 debug=False):
        self.debug = debug
        self.summarizer = summarization
        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer
        self.token_amount = token_amount
        self.annoy_database = AnnoyIndex(annoy_input_length, annoy_mode)

    def build_annoy(self, dataset: pd.DataFrame, input_key):
        summarizations = self.summarizer.run(dataset[input_key], amount=self.token_amount)
        summarization_df = pd.DataFrame()
        summarization_df["id"] = dataset["id"]
        summarization_df = add_array_column(summarization_df, "summary", summarizations)

        def encode(token: list):
            embedding = self.transformer.encode(token, convert_to_numpy=True)
            return embedding
        tqdm.pandas(desc="Creating Embeds")
        summarization_df["embed"] = summarization_df["summary"].progress_apply(encode)
        summarization_df.explode("embed")
        summarization_df.reset_index(inplace=True)

        def add_to_annoy(row: pd.Series):
            index = row["index"]
            embed = np.array(row["embed"]).flatten()
            self.annoy_database.add_item(index, embed)
        tqdm.pandas(desc="Adding to Annoy")
        summarization_df[["index", "embed"]].progress_apply(add_to_annoy, axis=1)
        self.annoy_database.build(n_trees=10)
        self.mapping = summarization_df

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

    def get_match(self, publication_id: str, amount: int = 1) -> np.ndarray:
        annoy_index = self.mapping[self.mapping["id"] == publication_id]["index"].tolist()[0]
        # TODO: Check if nns always include themself first
        # TODO: Surely there is a better way to this
        neighbours = self.annoy_database.get_nns_by_item(annoy_index, (amount * self.token_amount)+1)
        neighbours = neighbours[1:]
        neighbours = pd.merge(
            pd.DataFrame(data={"index": neighbours}), self.mapping,
            how="left", on="index"
        )
        neighbours = neighbours[neighbours["id"] != publication_id].copy()
        neighbours = np.unique(neighbours["id"].tolist())
        neighbours = neighbours[0:amount]
        return neighbours
