import numpy as np
import pandas as pd
from tqdm import tqdm
from celery import Celery
from celery.signals import worker_ready, worker_init
from app.celery import celeryconfig
import app.celery.errors as worker_error
from app.engine import Recommender, Summarizer, device
from app.util.misc import create_file_structure
from app.graphql_backend import get_all_vectors, client
from typing import Dict, List, Literal
import shutil
import requests
import datetime
import os

celery = Celery(__name__)
celery.config_from_object(celeryconfig)
celery.data_path = os.environ["DATA_PATH"]
celery.recommender_name = "recommender"
celery.zip_path = f"{celery.data_path}/{celery.recommender_name}.zip"
celery.unzip_path = f"{celery.data_path}/{celery.recommender_name}"
celery.api = "http://ai_backend:" + os.environ["API_PORT"]

create_file_structure(celery.data_path)


def get_last_changed_on_disk(path) -> float:
    if os.path.exists(path):
        return os.path.getmtime(path)
    else:
        return 0.0


def get_blank_recommender() -> Recommender:
    summarizer = Summarizer()
    return Recommender(summarizer)


def convert_matching_to_response(matching: pd.DataFrame,
                                 pub_id_key: str, sentence_key: str) -> Dict[str, List[Dict[str, str | int]]]:
    result = {"matches": []}
    for index, row in matching.iterrows():
        pub_id = row[pub_id_key]
        matching_sentence = row[sentence_key]
        input_info = row["input"]
        distance = row["distance"]
        result["matches"].append({
            "id": pub_id,
            "input": input_info,
            "mathing_sentence": matching_sentence,
            "distance": distance
        })
    return result


def convert_matching_to_response(matching: pd.DataFrame,
                                 pub_id_key: str, sentence_key: str) -> Dict[str, List[Dict[str, str | int]]]:
    result = {"matches": []}
    for index, row in matching.iterrows():
        pub_id = row[pub_id_key]
        matching_sentence = row[sentence_key]
        input_info = row["input"]
        distance = row["distance"]
        result["matches"].append({
            "id": pub_id,
            "input": input_info,
            "mathing_sentence": matching_sentence,
            "distance": distance
        })
    return result


def download_recommender(zip_path: str = None, unzip_path: str = None):
    print("Starting recommender download")
    archive = requests.get(f"{celery.api}/model.zip/")

    """ archive = requests.get(f"{celery.api}/model.zip/",stream=True)
    # Sizes in bytes.
    total_size = int(archive.headers.get("content-length", 0))
    block_size = 1024 """

    delete = False
    print("Received archive")
    if zip_path is None:
        delete = True
        zip_path = f"{celery.data_path}/temp_download.zip"
    with open(zip_path, "wb") as zip_file:
#        with tqdm(total=total_size, unit="B", unit_scale=True) as progress_bar:
        zip_file.write(archive.content)
        """ for data in archive.iter_content(block_size):
                progress_bar.update(len(data))
                zip_file.write(data) """
        print(f"Archive written to {zip_path}")
        if unzip_path is not None:
            if os.path.exists(unzip_path):
                print("Deleting exsisting recommender")
                shutil.rmtree(unzip_path)
            print("Unzipping")
            shutil.unpack_archive(zip_file.name, unzip_path)
            print(f"Recommender written to {unzip_path}")
    if delete:
        os.remove(zip_path)
        print("Removed temp file")


def upload_recommender(path: str = None, zip_mode: Literal["none", "temp", "permanent"] = True):
    print("Starting recommender upload")
    if zip_mode != "none":
        shutil.make_archive(path, format="zip", root_dir=path)
        path = path + ".zip"
        print(f"Created archive at {path}")
    #        model_name = path.split("/")[-1].split("0")[0]
    #        model_location = os.path.dirname(path)
    with open(path, "rb") as file:
        requests.post(celery.api + "/update_model/", files={"file": file})
    print("Uploaded recommender")
    if zip_mode == "temp":
        os.remove(path)
        print(f"Removed {path}")


class EngineTask(celery.Task):
    recommender: Recommender = None
    last_changed: float = 0.0

    def before_start(self, task_id, *args, **kwargs):
        self.update_engine()
        if self.recommender is None:
            print(f"Executing task {task_id} without up-to-date engine")
            self.recommender = get_blank_recommender()
        self.recommender.summarizer.transformer.eval()
        self.recommender.debug = True
        print(self.get_start_string())

    def on_success(self, retval, task_id, *args, **kwargs):
        print(f"[{task_id}, {self.name}]: Successfully executed")

    def update_engine(self):
        last_changed_on_disk = get_last_changed_on_disk(celery.unzip_path)

        if last_changed_on_disk > self.last_changed:
            if self.recommender is None:
                self.recommender = get_blank_recommender()
            self.recommender.load(path=celery.data_path, model_name=celery.recommender_name)
            self.last_changed = last_changed_on_disk

    def get_start_string(self):
        return f"Starting {self.name} with recommender ({datetime.datetime.fromtimestamp(self.last_changed)}):" + \
            "\n" + str(self.recommender.__getstate__()) + "\n" + "summarizer:" + "\n" + \
            str(self.recommender.summarizer.__getstate__())


class StrictEngineTask(EngineTask):
    max_retries = 5

    def before_start(self, task_id, *args, **kwargs):
        self.update_engine()
        if self.recommender is None:
            try:
                print("No recommendation engine found. Trying to download")
                download_recommender(celery.zip_path, celery.unzip_path)
                self.update_engine()
            except Exception as e:
                print("Could not download because" + "\n" + str(e))
                exception = worker_error.MissingEngine(self.__name__)
                cooldown = 1 + (self.request.retries * 2)
                print(f"Waiting for {cooldown}s to try again")
                self.retry(countdown=10,
                           max_retries=5,
                           throw=True, exc=exception,
                           args=tuple(args[0]), # args are not formatted correctly. currently args is ([amount], {})
                           kwargs=kwargs)
                raise exception
        self.recommender.summarizer.transformer.eval()
        print(self.get_start_string())


# @worker_ready.connect
def on_worker_ready(**_):
    print("Starting Worker")
    try:
        download_recommender(celery.zip_path, celery.unzip_path)
    except Exception as e:
        print("Could not download because" + "\n" + str(e))
    print(f"Running Worker on {device}")


@celery.task(name="update_recommender")
def update_recommender(remote_change_time: float | None = None, forced=False):
    if forced:
        do_update = True
    else:
        if remote_change_time is None:
            try:
                remote_change_time = requests.get(f"{celery.api}/last_changed/")["last_changed"]
            except requests.HTTPError:
                remote_change_time = 0
        do_update = remote_change_time > get_last_changed_on_disk(celery.unzip_path)

    if do_update:
        print(f"Run recommender update with forced={forced} and remote time: {remote_change_time}")
        download_recommender(celery.zip_path, celery.unzip_path)
    else:
        print("No recommender update needed")


@celery.task(name="summarize",
             base=EngineTask,
             bind=True)
def summarize(self: EngineTask,
              input_text: str, amount: int, tokenize: bool | None):
    amount = int(amount)

    if tokenize is not None:
        original_tokenize = self.recommender.summarizer.tokenize
        self.recommender.summarizer.tokenize = tokenize
    ranked_tokens, ranked_embeddings = self.recommender.summarizer.run(input_data=input_text, amount=amount,
                                                                       add_embedding=True)

    output_dict = {}
    for index, (token, embedding) in enumerate(zip(ranked_tokens[0], ranked_embeddings[0])):
        output_dict[index] = {"token": token, "embedding": list(embedding)}

    if tokenize is not None:
        self.recommender.summarizer.tokenize = original_tokenize
    return output_dict


@celery.task(name="build_annoy",
             base=EngineTask,
             bind=True)
def build_annoy(self: EngineTask):
    result = get_all_vectors()
    if result is None:
        raise worker_error.NoBackendData(client.transport)
    new_mapping, embeddings = self.recommender.convert_to_mapping(result, "id", "vectors", "embeddings")
    self.recommender.token_amount = new_mapping[self.recommender.SENTENCE_ID_KEY].max() + 1
    original_annoy_input_length = self.recommender.annoy_input_length
    self.recommender.annoy_input_length = embeddings.shape[1]
    self.recommender.build_annoy(new_mapping, embeddings, "override")
    if os.path.exists(celery.data_path + "/temp"):
        shutil.rmtree(celery.data_path + "/temp")
    self.recommender.save(path=celery.data_path, model_name="temp")
    upload_recommender(celery.data_path + "/temp", zip_mode="temp")
    shutil.rmtree(celery.data_path + "/temp")
    self.recommender.annoy_input_length = original_annoy_input_length

    added_entries = len(new_mapping)
    added_publications = len(np.unique(new_mapping[self.recommender.PUBLICATION_ID_KEY]))
    overall_entries = len(self.recommender.mapping)
    overall_publications = len(np.unique(self.recommender.mapping[self.recommender.PUBLICATION_ID_KEY]))
    return {"added_sentences": added_entries,
            "added_publications": added_publications,
            "sentence_amount": overall_entries,
            "publication_amount": overall_publications}


@celery.task(name="random_id",
             base=StrictEngineTask,
             bind=True)
def get_random_id(self: StrictEngineTask, amount: int):
    sample = self.recommender.mapping.sample(int(amount))
    sample = sample[self.recommender.PUBLICATION_ID_KEY].to_list()
    return sample


@celery.task(name="recommend_group",
             base=StrictEngineTask,
             bind=True)
def recommend_by_group(self: StrictEngineTask,
                       publication_ids: List[str] | List[List[str]],
                       amount: int,
                       exclude: List[str] | List[List[str]] = None) -> Dict | List:
    for publication_id in np.unique(publication_ids):
        if publication_id not in self.recommender.mapping[Recommender.PUBLICATION_ID_KEY].values:
            raise worker_error.MissingPublication(publication_id)

    if isinstance(publication_ids[0], str):
        matches = self.recommender.get_match_by_group(publication_ids, int(amount), exclude)
        return convert_matching_to_response(
            matches,
            self.recommender.PUBLICATION_ID_KEY,
            self.recommender.SENTENCE_ID_KEY
        )
    else:
        response = []
        for index, current_group in enumerate(publication_ids):
            current_exclude = exclude if exclude is None else exclude[index]

            matches = self.recommender.get_match_by_group(current_group, int(amount), current_exclude)
            response.append(
                convert_matching_to_response(
                    matches,
                    self.recommender.PUBLICATION_ID_KEY,
                    self.recommender.SENTENCE_ID_KEY
                )
            )
        return response


@celery.task(name="recommend_publication_id",
             base=StrictEngineTask,
             bind=True)
def recommend_by_publication(self: StrictEngineTask,
                             publication_id: str | List[str],
                             amount: int,
                             exclude: List[str] | List[List[str]] = None) -> Dict | List:
    if isinstance(publication_id, str):
        if publication_id not in self.recommender.mapping[Recommender.PUBLICATION_ID_KEY].values:
            raise worker_error.MissingPublication(publication_id)

        matches = self.recommender.get_match_by_id(str(publication_id), amount, exclude)

        return convert_matching_to_response(
            matches,
            self.recommender.PUBLICATION_ID_KEY,
            self.recommender.SENTENCE_ID_KEY
        )
    else:
        for current_publication_id in np.unique(publication_id):
            if current_publication_id not in self.recommender.mapping[Recommender.PUBLICATION_ID_KEY].values:
                raise worker_error.MissingPublication(current_publication_id)

        response = []
        for index, current_id in enumerate(publication_id):
            current_exclude = exclude if exclude is None else exclude[index]

            matches = self.recommender.get_match_by_id(current_id, int(amount), current_exclude)
            response.append(
                convert_matching_to_response(
                    matches,
                    self.recommender.PUBLICATION_ID_KEY,
                    self.recommender.SENTENCE_ID_KEY
                )
            )
        return response


@celery.task(name="recommend_token",
             base=StrictEngineTask,
             bind=True)
def recommend_by_token(self: StrictEngineTask,
                       token: str | List[str],
                       amount: int,
                       exclude: List[str] | List[List[str]] = None) -> Dict | List:
    if isinstance(token, str):
        matches = self.recommender.get_match_by_token(str(token), int(amount), exclude)

        return convert_matching_to_response(
            matches,
            self.recommender.PUBLICATION_ID_KEY,
            self.recommender.SENTENCE_ID_KEY
        )
    else:
        response = []
        for index, current_token in enumerate(token):
            current_exclude = exclude if exclude is None else exclude[index]

            matches = self.recommender.get_match_by_token(current_token, int(amount), current_exclude)
            response.append(
                convert_matching_to_response(
                    matches,
                    self.recommender.PUBLICATION_ID_KEY,
                    self.recommender.SENTENCE_ID_KEY
                )
            )
        return response


@celery.task(name="encode_sentence",
             base=EngineTask,
             bind=True)
def encode_sentence(self: EngineTask, sentence: str) -> List:
    return self.recommender.summarizer.transformer.encode(sentence, convert_to_numpy=True).tolist()
