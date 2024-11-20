import logging
from pathlib import Path
import nltk
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, PowerTransformer
from scipy.ndimage import gaussian_filter
import torch
from numpy import random
from sklearn.decomposition import PCA
from sklearn import svm
from sklearn.calibration import CalibratedClassifierCV

from sentence_transformers import SentenceTransformer
from sklearn.manifold import TSNE

from .vae_model import VAE, get_dataloader, load_model, save_model, train_vae

from .util.LexRank import FastLexRankSummarizer
from typing import List, Union
from tqdm.auto import tqdm
from .nns_request import VectorDatabase

device = "cuda" if torch.cuda.is_available() else "cpu"

engine_logger = logging.getLogger(__name__)


class Summarizer:
    transformer: SentenceTransformer
    lexrank: FastLexRankSummarizer
    lexrank_threshold = 0.1
    transformer_name: str = None

    def __init__(
        self,
        transformer: str | SentenceTransformer = "all-mpnet-base-v2",
        tokenize: bool = True,
        debug=False,
    ):
        self.debug = debug
        self.tokenize = tokenize

        if isinstance(transformer, str):
            self.transformer_name = transformer
            transformer = SentenceTransformer(transformer, device=device)
        self.transformer = transformer
        self.create_lexrank()

    def create_lexrank(self):
        self.lexrank = FastLexRankSummarizer(
            model=self.transformer, threshold=self.lexrank_threshold
        )

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
                nltk.data.find("tokenizers/punkt")
            except LookupError:
                nltk.download("punkt")
        return list(nltk.sent_tokenize(input_text))

    def run(
        self, input_data: str | pd.Series, amount=1, add_embedding=False
    ) -> np.ndarray[str] | Union[np.ndarray[str], np.ndarray[float]]:
        if amount < 1:
            raise Exception("The desired sentence amount must be greater than 1")
        if isinstance(input_data, str):
            input_data = pd.Series([input_data])
        dataframe = pd.DataFrame(data={"input": input_data})
        if self.tokenize:
            tqdm.pandas(desc="(Summarizing) Tokenizing")
            dataframe["token"] = dataframe["input"].progress_apply(
                Summarizer.tokenize_input
            )
        else:
            dataframe["token"] = input_data

        dataframe["token_amount"] = dataframe["token"].apply(len)
        if dataframe["token_amount"].min() < amount:
            raise Exception(
                "Not enough tokens" + "\n" + str(dataframe["token_amount"].idxmin())
            )

        def rank_tokens(row: pd.Series):
            token_list = row["token"]

            token_ranking, embedding_ranking = self.lexrank.summarize(
                token_list, amount
            )

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


def perform_pca(embeddings: List[List[float]], component_amount) -> List:
    embeddings = np.array(embeddings, dtype=float)
    pca = PCA(n_components=component_amount)
    pca.fit(embeddings)

    anchor_point = None
    for index in range(component_amount):
        new_anchor_point = random.normal(0, 1) * pca.components_[index]
        if anchor_point is None:
            anchor_point = new_anchor_point
        else:
            anchor_point = anchor_point + new_anchor_point

    return anchor_point.tolist()


def build_tsne_for_publication(
    vector_database: VectorDatabase,
    amount: int = None,
    create_model: bool = False,
    latent_weight: float = 1,
) -> pd.DataFrame:
    publication_df = vector_database.get_embeddings(amount, perform_pca)

    embeddings = np.array(publication_df[vector_database.EMBEDDING_KEY].tolist())
    engine_logger.info("Start t-SNE dimensionality reduction")
    coordinates = TSNE(n_components=3, perplexity=50, random_state=42).fit_transform(
        embeddings
    )
    engine_logger.info("t-SNE dimensionality reduction completed")

    coordinates[:, 1] = gaussianScaleCoordinateAxis(coordinates[:, 1], 0, 30)

    publication_df[vector_database.COORDINATE_KEY] = coordinates.tolist()

    if create_model:
        generateVAE(
            np.array(publication_df[vector_database.EMBEDDING_KEY].tolist()),
            np.array(publication_df[vector_database.COORDINATE_KEY].tolist()),
            latent_weight,
        )

    return publication_df


def train_svm(
    positive_embeddings: List[List[float]] | np.ndarray,
    negative_embeddings: List[List[float]] | np.ndarray,
) -> CalibratedClassifierCV:
    positive_labels = np.full(len(positive_embeddings), 1)
    negative_labels = np.full(len(negative_embeddings), 0)

    embeddings = np.concatenate((positive_embeddings, negative_embeddings), axis=0)
    labels = np.concatenate((positive_labels, negative_labels), axis=0)

    classifier = svm.LinearSVC(class_weight="balanced", verbose=False, max_iter=10000, tol=1e-6, C=0.1)
    classifier = CalibratedClassifierCV(classifier)
    classifier.fit(embeddings, labels)

    return classifier


def svm_predict(classifier: CalibratedClassifierCV, embedding_df: pd.DataFrame, amount: int):
    embedding_df = embedding_df.copy()
    embeddings = np.array(embedding_df["embedding"].tolist(), dtype=np.float64)
    predictions = classifier.predict_proba(embeddings)
    embedding_df["prediction"] = predictions[:, 1]
    engine_logger.info(embedding_df["prediction"].max())
    embedding_df.sort_values("prediction", ascending=False, inplace=True)
    embedding_df.reset_index(inplace=True, drop=True)

    return embedding_df[:amount]


def gaussianScaleCoordinateAxis(
    axis_coordinates: np.ndarray[float], min: int, max: int
) -> np.ndarray[float]:
    engine_logger.info("Gaussian distribute and scale coordinates of one axis")

    coords_gaussian = gaussian_filter(axis_coordinates, sigma=4)

    scaler_gauss = MinMaxScaler(feature_range=(min, max))
    coords_gauss_scaled = scaler_gauss.fit_transform(coords_gaussian.reshape(-1, 1))

    return coords_gauss_scaled.reshape(1, -1).flatten()


def generateVAE(
    X_data: np.ndarray[np.float32],
    y_data: np.ndarray[np.float32],
    latent_weight: float = 1,
    do_train_test_split: bool = False,
) -> None:
    X_train = X_data
    y_train = y_data

    if do_train_test_split:
        X_train, X_test, y_train, y_test = train_test_split(
            X_data, y_data, test_size=0.1, random_state=42
        )
        Path("./data/test_data").mkdir(parents=True, exist_ok=True)
        pd.DataFrame(X_test).to_csv("./data/test_data/test_embeddings.csv")
        pd.DataFrame(y_test).to_csv("./data/test_data/test_coordinates.csv")

    # Normalisierung der Daten mit MinMaxScaler
    normalizer = MinMaxScaler()
    X_train = normalizer.fit_transform(X_train)

    train_loader = get_dataloader(torch.from_numpy(X_train), torch.from_numpy(y_train))

    # Parameter für das Netzwerk
    input_dim = X_train.shape[1]
    hidden_dim = 256
    latent_dim = y_train.shape[1]

    # Modell und Training
    model = VAE(input_dim, hidden_dim, latent_dim)
    train_vae(model, train_loader, latent_weight=latent_weight)

    # Modell speichern
    save_model(model, "vae.pth")


class CoordinateModel:
    vae: VAE

    def __init__(self, model: VAE):
        self.vae = load_model(model)

    def __getstate__(self):
        state = self.__dict__.copy()
        excluded_parameters = ["vae"]
        for parameter in excluded_parameters:
            if parameter in state:
                del state[parameter]
        return state

    def run(self, embedding: List[float]) -> List:
        embedding = np.array(embedding).astype(np.float32)
        normalizer = MinMaxScaler()
        embedding_normalized = torch.from_numpy(
            normalizer.fit_transform(embedding.reshape(-1, 1)).reshape(1, -1).flatten()
        )
        reconstructed_data, mu, logvar = self.vae(embedding_normalized)
        return mu.detach().numpy().tolist()
