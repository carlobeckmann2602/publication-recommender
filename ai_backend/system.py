import nltk
import os
import pandas as pd
import numpy as np
import torch
from util import add_array_column
from sentence_transformers import SentenceTransformer, util
from LexRank import degree_centrality_scores
from annoy import AnnoyIndex
from typing import Literal, List


class Summarizer:
    transformer: SentenceTransformer

    def __init__(self, transformer: str | SentenceTransformer = "all-MiniLM-L6-v2", debug=False):
        self.debug = debug
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt')

        if isinstance(transformer, str):
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer

    def run(self, input_data: str | np.ndarray, amount=1) -> np.ndarray[str]:
        if amount < 1:
            raise Exception("The desired sentence amount must be greater than 1")
        if isinstance(input_data, str):
            sentence_tokens = nltk.sent_tokenize(input_data)
            if len(sentence_tokens) < amount:
                raise Exception(fr"Found less tokens than desired output sentence amount." +
                                "\n" + str(input_data) +
                                "\n" + str(sentence_tokens))
            embeddings = self.transformer.encode(sentence_tokens, convert_to_tensor=True)
            cos_scores = util.cos_sim(embeddings, embeddings).cpu().numpy()
            centrality_scores = degree_centrality_scores(cos_scores, threshold=None)
            most_central_sentence_indices = np.argsort(-centrality_scores)

            most_central_sentence_indices = most_central_sentence_indices[0:amount]
            most_central_sentence_indices = np.array(most_central_sentence_indices, dtype=int)

            sentence_tokens = np.array(sentence_tokens)
            sentence_tokens = np.vectorize(lambda x: x.strip())(sentence_tokens)
            most_central_sentences = sentence_tokens[most_central_sentence_indices]

            if self.debug:
                print(fr"Found {len(sentence_tokens)} tokens -> Ranking: {most_central_sentence_indices}")

            return most_central_sentences
        else:
            output_data = []
            for index, current_input in enumerate(input_data):
                output_data.append(self.run(current_input, amount))
                if self.debug:
                    print(fr"[{round((index + 1) / len(input_data) * 100, 3)}%] " +
                          fr"-> Summarized input {index + 1} of {len(input_data)} inputs")
            return np.array(output_data, dtype=str)


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
    data = pd.read_pickle("./data/datasets/arxiv-metadata-oai-snapshot.pkl")
    data = data.sample(50000)
    data.to_pickle("./data/datasets/arxiv-metadata-oai-snapshot_rand-test.pkl")
    summy = Summarizer(debug=True)
    recommender_system = Recommender(summy)
#    recommender_system.build_annoy(data, "abstract")
#    recommender_system.save()
    recommender_system.load(model_name="rand-test")

    chosen_publication = data.sample()
    recommendations = recommender_system.get_match(chosen_publication["id"].tolist()[0], amount=4)
    chosen_title = chosen_publication.title.tolist()[0]
    print("\"" + chosen_title + "\"" + "\n" + "====================")
    for current in recommendations:
        recommended_title = data[data.id == current].title.tolist()[0]
        print("\"" + recommended_title + "\"")
    print("====================")
