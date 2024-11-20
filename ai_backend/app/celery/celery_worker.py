import asyncio

import numpy as np
import pandas as pd
import logging
from celery import Celery
from celery.signals import after_setup_logger
from app.vae_model import VAE
from app.graphql_backend import update_tsne_coordinates
from app.celery import celeryconfig
import app.celery.errors as worker_error
from app.engine import (
    CoordinateModel,
    Summarizer,
    perform_pca,
    build_tsne_for_publication,
    train_svm,
    svm_predict,
)
from app.nns_request import RemoteDatabase
from app.util.misc import DisableLogger
from typing import Dict, List
from logging.handlers import RotatingFileHandler
import datetime
import os
import time

celery = Celery(__name__)
celery.config_from_object(celeryconfig)
celery.api = "http://ai_backend:" + os.environ["API_PORT"]

celery_logger = logging.getLogger(__name__)

gql_logger = logging.getLogger("gql.transport.aiohttp")
gql_logger.addFilter(DisableLogger())


def get_new_summarizer() -> Summarizer:
    return Summarizer()


def get_new_coordinate_model() -> CoordinateModel:
    return CoordinateModel(VAE(768, 256, 3))


def convert_matching_to_response(
    matching: pd.DataFrame, pub_id_key: str, sentence_key: str
) -> Dict[str, List[Dict[str, str | int]]]:
    result = {"matches": []}
    for index, row in matching.iterrows():
        pub_id = row[pub_id_key]
        matching_sentence = row[sentence_key]
        input_info = row["input"]
        distance = row["distance"]
        result["matches"].append(
            {
                "id": pub_id,
                "input": input_info,
                "matching_sentence": matching_sentence,
                "distance": distance,
            }
        )
    return result


def chunker(seq, size):
    return (seq[pos : pos + size] for pos in range(0, len(seq), size))


def upload_tsne_coordinates(tsne_coordinates: pd.DataFrame):
    celery_logger.info("(↑1) Prepare dataframe for t-SNE coordinates upload")

    tsne_coordinates = tsne_coordinates.drop("embedding", axis=1)
    tsne_coordinates.rename(columns={"publication_id": "id"}, inplace=True)

    celery_logger.info("(↑2) Begin t-SNE coordinates upload")

    result = []

    for chunk in chunker(tsne_coordinates, 1000):
        celery_logger.info(f"(↑2) Upload of {len(chunk)} t-SNE coordinates")
        result += asyncio.run(update_tsne_coordinates(chunk))

    celery_logger.info(
        f"(↑3) Upload of a total of {len(result)} t-SNE coordinates done"
    )
    return


class SummarizerTask(celery.Task):
    summarizer: Summarizer = None
    last_changed: float = 0.0

    def before_start(self, task_id, *args, **kwargs):
        self.update_summarizer()
        self.summarizer.transformer.eval()
        self.summarizer.debug = False
        celery_logger.debug(self.get_start_string())

    def on_success(self, retval, task_id, *args, **kwargs):
        celery_logger.debug(f"[{task_id}, {self.name}]: Successfully executed")

    def update_summarizer(self):
        if self.summarizer is None:
            self.summarizer = get_new_summarizer()
            self.last_changed = time.time()

    def get_start_string(self):
        return (
            f"Starting {self.name} with summarizer ({datetime.datetime.fromtimestamp(self.last_changed)}):"
            + "\n"
            + str(self.summarizer.__getstate__())
        )


class AtomicTask(celery.Task):
    running: bool = None

    def before_start(self, task_id, *args, **kwargs):
        if self.running is None:
            self.running = False  #

        if self.running:
            raise worker_error.AtomicTaskRejectionError(task_id)
        else:
            self.running = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        if not isinstance(exc, worker_error.AtomicTaskRejectionError):
            self.running = False

    def on_replace(self, sig):
        self.running = False

    def on_success(self, retval, task_id, args, kwargs):
        self.running = False


class CoordinateModelTask(celery.Task):
    coordinateModel: CoordinateModel = None
    last_changed: float = 0.0

    def before_start(self, task_id, *args, **kwargs):
        self.update_model()
        celery_logger.debug(self.get_start_string())

    def on_success(self, retval, task_id, *args, **kwargs):
        celery_logger.debug(f"[{task_id}, {self.name}]: Successfully executed")

    def update_model(self):
        if self.coordinateModel is None:
            self.coordinateModel = get_new_coordinate_model()
            self.last_changed = time.time()

    def get_start_string(self):
        return (
            f"Starting {self.name} with coordinate model ({datetime.datetime.fromtimestamp(self.last_changed)}):"
            + "\n"
            + str(self.coordinateModel.__getstate__())
        )


@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # FileHandler
    if os.environ["WRITE_LOGS"] == "True":
        max_mb = 30
        fh = RotatingFileHandler(
            "celery_logs.log",
            mode="a",
            maxBytes=max_mb * 1024 * 1024,
            backupCount=2,
            encoding=None,
        )
        fh.setFormatter(formatter)
        logger.addHandler(fh)


@celery.task(name="summarize", base=SummarizerTask, bind=True)
def summarize(
    self: SummarizerTask, input_text: str, amount: int, tokenize: bool | None
):
    amount = int(amount)

    if tokenize is not None:
        original_tokenize = self.summarizer.tokenize
        self.summarizer.tokenize = tokenize
    ranked_tokens, ranked_embeddings = self.summarizer.run(
        input_data=input_text, amount=amount, add_embedding=True
    )

    output_dict = {}
    for index, (token, embedding) in enumerate(
        zip(ranked_tokens[0], ranked_embeddings[0])
    ):
        output_dict[index] = {"token": token, "embedding": list(embedding)}

    if tokenize is not None:
        self.summarizer.tokenize = original_tokenize
    return output_dict


@celery.task(name="encode_sentence", base=SummarizerTask, bind=True)
def encode_sentence(self: SummarizerTask, sentence: str) -> List:
    return self.summarizer.transformer.encode(sentence, convert_to_numpy=True).tolist()


@celery.task(name="run_pca")
def run_pca(embeddings: List[List[float]], component_amount) -> List:
    return perform_pca(embeddings, component_amount)


@celery.task(name="run_svm")
def run_svm(
    positive_embeddings: List[Dict[str, List[float] | str]],
    negative_embeddings: List[Dict[str, List[float] | str]],
    test_embeddings: List[Dict[str, List[float] | str]],
    amount: int,
) -> List:
    def convert_embedding(embedding: str) -> List[float]:
        value_str = embedding[1:-1]
        value_str.replace(" ", "")
        values = value_str.split(",")
        return np.array(values, np.float64).tolist()

    positive_df = pd.DataFrame.from_records(positive_embeddings)
    positive_df["label"] = np.full(len(positive_embeddings), "positive")
    positive_df["embedding"] = positive_df["embedding"].apply(convert_embedding)

    negative_df = pd.DataFrame.from_records(negative_embeddings)
    negative_df["label"] = np.full(len(negative_embeddings), "negative")
    negative_df["embedding"] = negative_df["embedding"].apply(convert_embedding)

    test_df = pd.DataFrame.from_records(test_embeddings)
    test_df["label"] = np.full(len(test_embeddings), "test")
    test_df["embedding"] = test_df["embedding"].apply(convert_embedding)

    positive_embeddings = np.array(positive_df["embedding"].tolist(), dtype=np.float64)
    negative_embeddings = np.array(negative_df["embedding"].tolist(), dtype=np.float64)

    classifier = train_svm(positive_embeddings, negative_embeddings)
    prediction_df = svm_predict(classifier, test_df, amount)
    prediction_df.drop("label", axis=1, inplace=True)

    return prediction_df.to_dict("records")


@celery.task(name="build_tsne", base=AtomicTask)
def build_tsne(
    amount: int = None,
    create_model: bool = False,
    latent_weight: float = 1,
):
    event_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(event_loop)
    vector_database = RemoteDatabase(os.environ["GRAPHQL_ENDPOINT"], event_loop)

    celery_logger.info(f"Starting build t-SNE coordinates")
    tsne_coordinates = build_tsne_for_publication(
        vector_database, amount, create_model, latent_weight
    )
    upload_tsne_coordinates(tsne_coordinates)
    return


@celery.task(name="generate_coordinate", base=CoordinateModelTask, bind=True)
def generate_coordinate(self: CoordinateModelTask, embedding: List[float]) -> List:
    try:
        return self.coordinateModel.run(embedding)
    except TypeError:
        celery_logger.error("No coordinate model loaded")
