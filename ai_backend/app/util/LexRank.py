# -*- coding: utf-8 -*-
"""
LexRank implementation
Source: https://github.com/pypi-data/pypi-mirror-240/blob/code/packages/fastlexrank/fastlexrank-0.1.4.tar.gz/fastlexrank-0.1.4/src/fastlexrank/FastLexRank.py
Author: Mao Li
"""
from sentence_transformers import SentenceTransformer
import numpy as np
import torch
device = "cuda" if torch.cuda.is_available() else "cpu"


class FastLexRankSummarizer:
    """
    Calculate the LexRank score for each sentence in the corpus and return the top sentences using a fast implementation.
    :param corpus: list of sentences
    :param model_path: path to the sentence transformer model used for sentence embeddings
    :param threshold: threshold for the cosine similarity
    :return: list of sentences with the highest LexRank score
    """

    def __init__(
        self,
        model: SentenceTransformer = SentenceTransformer("all-mpnet-base-v2", device=device),
        threshold: float = None,
    ) -> None:
        self.threshold = threshold
        self.model = model

    def _get_sentence_embeddings(self, corpus: list[str]) -> np.ndarray:
        """
        Calculate the sentence embeddings for the corpus
        :return: sentence embeddings
        """
        embeddings = self.model.encode(corpus, show_progress_bar=True)
        return embeddings

    def get_lexrank_scores(self, corpus: list[str]) -> tuple[np.ndarray, np.ndarray]:
        """
        Calculate the LexRank score for each sentence
        :return: LexRank scores
        """
        embeddings = self._get_sentence_embeddings(corpus)

        # Transpose the similarity matrix
        F = embeddings.T
        # Normalize the similarity matrix
        z = embeddings.sum(axis=0)
        z = z / np.sqrt((z**2).sum(axis=0))
        # Calculate the LexRank scores
        approx_scores = np.dot(z.T, F)
        return approx_scores, embeddings

    def _get_top_sentences(self, lexrank_scores: np.ndarray, n: int = 3) -> list[str]:
        """
        Return the top sentences with the highest LexRank score
        :param lexrank_scores: LexRank scores
        :param n: number of sentences to return
        :return: list of sentences with the highest LexRank score
        """
        top_sentences = np.argsort(lexrank_scores)[::-1][:n]
        return top_sentences

    def summarize(self, corpus: list[str], n: int = 3) -> tuple[list[str], list[float]]:
        """
        Calculate the LexRank score for each sentence in the corpus and return the top sentences
        :param n: number of sentences to return
        :return: list of sentences with the highest LexRank score
        """

        lexrank_scores, embeddings = self.get_lexrank_scores(corpus)
        top_indices = self._get_top_sentences(lexrank_scores, n)

        corpus = np.array(corpus)
        top_indices = np.array(top_indices, dtype=int)
        embeddings = np.array(embeddings)

        ranked_sentences: np.ndarray = corpus[top_indices]
        ranked_sentences = np.vectorize(lambda x: x.strip())(ranked_sentences)
        ranked_embeddings: np.ndarray = embeddings[top_indices]
        return ranked_sentences.tolist(), ranked_embeddings.tolist()

    def __call__(self, n: int = 3) -> list:
        """
        Calculate the LexRank score for each sentence in the corpus and return the top sentences
        :param n: number of sentences to return
        :return: list of sentences with the highest LexRank score
        """
        return self.summarize(n)

    def __repr__(self) -> str:
        return f"fastLexRankSummarizer(corpus={self.corpus}, model={self.model}, threshold={self.threshold})"

    def __str__(self) -> str:
        return f"fastLexRankSummarizer(corpus={self.corpus}, model={self.model}, threshold={self.threshold})"
