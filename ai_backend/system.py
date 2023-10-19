import time

import nltk
import os
import pandas as pd
import numpy as np
import scipy
import torch
from util import *
from sentence_transformers import SentenceTransformer, util
from LexRank import degree_centrality_scores
from annoy import AnnoyIndex
from typing import Literal, List


class Summarizer:
    transformer: SentenceTransformer

    def __init__(self, transformer: str | SentenceTransformer = "all-MiniLM-L6-v2", debug=False):
        self.debug = debug

        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer

    @staticmethod
    def tokenize(input_text: str, check_download=True) -> List[str]:
        if check_download:
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
        return list(nltk.sent_tokenize(input_text))

    def run(self, input_data: str | pd.Series, amount=1, tokenize: bool = True) -> np.ndarray[str]:
        if amount < 1:
            raise Exception("The desired sentence amount must be greater than 1")
        if isinstance(input_data, str):
            input_data = pd.Series([input_data])
        dataframe = pd.DataFrame(data={"input": input_data})
        print("Data loaded" + "\n" + str(dataframe.info()))
        if tokenize:
            dataframe["token"] = dataframe["input"].apply(Summarizer.tokenize)
        else:
            dataframe["token"] = input_data

        dataframe["token_amount"] = dataframe["token"].apply(len)
        print(fr"Tokens: {str(dataframe.token_amount.to_list())}")

        def encode(token: list):
            embedding = self.transformer.encode(token, convert_to_numpy=True)
            return embedding
        dataframe["embedding"] = dataframe["token"].apply(encode)
        dataframe["embedding_amount"] = dataframe["embedding"].apply(len)
        print(fr"Embeddings (len: {str(len(dataframe.iloc[0].embedding[0]))}): "
              fr"{str(dataframe.embedding_amount.to_list())}")

        def cos_sim(vectors: list):
            tensor = torch.tensor(vectors, dtype=torch.float)
            c = util.cos_sim(tensor, tensor).cpu().numpy()
            return c
        dataframe["cosine"] = dataframe["embedding"].apply(cos_sim)

        def rank_tokens(cosine_vector: list, token_list: list):
            score_mask = degree_centrality_scores(cosine_vector, threshold=None)
            significance_mask = np.argsort(-score_mask)
            significance_mask = significance_mask[0:amount]
            significance_mask = np.array(significance_mask, dtype=int)

            token_vector = np.array(token_list)
            token_vector = np.vectorize(lambda x: x.strip())(token_vector)
            token_ranking = token_vector[significance_mask]
            return list(token_ranking)
        dataframe["ranking"] = dataframe[["cosine", "token"]].apply(
            lambda x: rank_tokens(x["cosine"], x["token"]),
            axis=1)

        return dataframe["ranking"].tolist()


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
                 debug=False):
        self.debug = debug
        self.summarizer = summarization
        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer
        self.annoy_database = AnnoyIndex(annoy_input_length, annoy_mode)

    def build_annoy(self, dataset: pd.DataFrame, input_key):
        summarizations = self.summarizer.run(np.array(dataset[input_key]), amount=1)
        summarization_df = pd.DataFrame()
        # TODO: Handle multiple sentences as summaries
        summarization_df["id"] = dataset["id"]
        summarization_df = add_array_column(summarization_df, "summary", summarizations)
        summarization_df["embed"] = summarization_df["summary"].apply(
            lambda x: self.transformer.encode(x, convert_to_numpy=True)
        )
        summarization_df.reset_index(inplace=True)

        def add_to_annoy(row: pd.Series):
            index = row["index"]
            embed = np.array(row["embed"]).flatten()
            self.annoy_database.add_item(index, embed)

        summarization_df[["index", "embed"]].apply(add_to_annoy, axis=1)
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

    def get_match(self, publication_id: str, amount: int = 1) -> List:
        annoy_index = self.mapping[self.mapping["id"] == publication_id]["index"].tolist()[0]
        # TODO: Check if nns always include themself first
        neighbours = self.annoy_database.get_nns_by_item(annoy_index, amount+1)
        neighbours = neighbours[1:]
        nearest_publications = []
        for current_neighbour in neighbours:
            corresponding_id = self.mapping[self.mapping["index"] == current_neighbour]["id"].tolist()[0]
            nearest_publications.append(corresponding_id)
        return nearest_publications


if __name__ == '__main__':
    device = "cuda" if torch.cuda.is_available() else "cpu"
    data = fast_read_jsonline("./data/datasets/arxiv_full/test.txt")
    data = pd.read_pickle("./data/datasets/abstracts/arxiv-metadata-oai-snapshot.pkl")
    data = data.iloc[0:100]
    print(data.info())
    print(data.iloc[0]["abstract"])

    summy = Summarizer(debug=True)
    start = time.time()
    print(summy.run(data["abstract"]))
    print("time: " + str(time.time() - start))
#    data = pd.read_pickle("./data/datasets/arxiv-metadata-oai-snapshot.pkl")
#    data = data.sample(50000)
#    data.to_pickle("./data/datasets/arxiv-metadata-oai-snapshot_rand-test.pkl")
#    summy = Summarizer(debug=True)
#    recommender_system = Recommender(summy)
#    recommender_system.build_annoy(data, "abstract")
#    recommender_system.save()
#    recommender_system.load(model_name="rand-test")

#    chosen_publication = data.sample()
#    recommendations = recommender_system.get_match(chosen_publication["id"].tolist()[0], amount=4)
#    chosen_title = chosen_publication.title.tolist()[0]
#    print("\"" + chosen_title + "\"" + "\n" + "====================")
#    for current in recommendations:
#        recommended_title = data[data.id == current].title.tolist()[0]
#        print("\"" + recommended_title + "\"")
#    print("====================")
