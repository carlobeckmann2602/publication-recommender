import pandas as pd
from celery import Celery
from celery.signals import worker_ready
from app.celery import celeryconfig
from app.engine import Recommender, Summarizer, device
from app.util.misc import create_file_structure
from app.graphql_backend import get_all_vectors
from typing import Dict, List
import shutil
import requests
import os

celery = Celery(__name__)
celery.config_from_object(celeryconfig)
celery.data_path = os.environ["DATA_PATH"]
celery.recommender_name = "recommender"
celery.api = "http://ai_backend:" + os.environ["API_PORT"]

create_file_structure(celery.data_path)


@worker_ready.connect
def on_worker_ready(**_):
    print("Starting Worker")
    update_recommender()
    print(f"Runing Worker on {device}")


def get_recommender() -> Recommender:
    recommender = Recommender(Summarizer())
    recommender.load(path=celery.data_path, model_name=celery.recommender_name)
    return recommender


def recommend_by_token(token: str, amount: int) -> dict:
    recommender = get_recommender()
    matches = recommender.get_match_by_token(str(token), amount)
    return convert_matching_to_response(matches, recommender.PUBLICATION_ID_KEY)


def recommend_by_publication(publication_id: str, amount: int) -> dict:
    recommender = get_recommender()
    if publication_id not in recommender.mapping[Recommender.PUBLICATION_ID_KEY].values:
        raise MissingPublication(f"Publication <{publication_id}> not in mapping")
    matches = recommender.get_match_by_id(str(publication_id), amount)
    return convert_matching_to_response(matches, recommender.PUBLICATION_ID_KEY)


def convert_matching_to_response(mathing: pd.DataFrame, pub_id_key: str) -> Dict[str, List[Dict[str, str | int]]]:
    result = {"matches": []}
    for index, row in mathing.iterrows():
        pub_id = row[pub_id_key]
        input_token = row["input_token"]
        matching_token = row["matching_token"]
        result["matches"].append({
            "id": pub_id,
            "input_token": input_token,
            "mathing_token": matching_token
        })
    return result


def summarize(input_text: str, amount: int, tokenize: bool | None = None):
    recommender = get_recommender()
    if tokenize is not None:
        recommender.summarizer.tokenize = tokenize
    ranked_tokens, ranked_embeddings = recommender.summarizer.run(input_data=input_text, amount=amount,
                                                                  add_embedding=True)
    output_dict = {}
    for index, (token, embedding) in enumerate(zip(ranked_tokens[0], ranked_embeddings[0])):
        output_dict[index] = {"token": token, "embedding": list(embedding)}
    return output_dict


def update_recommender():
    zip_path = f"{celery.data_path}/{celery.recommender_name}.zip"
    unzip_path = f"{celery.data_path}/{celery.recommender_name}"

    archive = requests.get(f"{celery.api}/model.zip")
    print("Received archive")
    with open(zip_path, "wb") as zip_file:
        zip_file.write(archive.content)
        if os.path.exists(unzip_path):
            print("Deleting exsisting recommender")
            shutil.rmtree(unzip_path)
        print("Unzipping")
        shutil.unpack_archive(zip_file.name, unzip_path)
        print("Unzipped")
        zip_file.close()
        print("Closed Zip File")


def recommender_outdated(remote_change_time: float = None):
    zip_path = f"{celery.data_path}/{celery.recommender_name}.zip"
    if os.path.exists(zip_path):
        local_change_time = os.path.getmtime(zip_path)
    else:
        local_change_time = 0
    try:
        if remote_change_time is None:
            result = requests.get(f"{celery.api}/last_changed").json()
            remote_change_time = result["last_changed"]
        return local_change_time < remote_change_time
    except Exception:
        return False


class MissingPublication(Exception):
    pass


class Tasks:
    @staticmethod
    @celery.task(name="update_recommender")
    def update_recommender():
        update_recommender()

    @staticmethod
    @celery.task(name="recommend_publication_id",
                 # autoretry_for=[MissingPublication],
                 # retry_kwargs={"max_retries": 5}
                 )
    def recommend_by_publication(publication_id: str, amount: int) -> dict:
        return recommend_by_publication(publication_id, amount)

    @staticmethod
    @celery.task(name="recommend_token")
    def recommend_by_token(token: str, amount: int) -> dict:
        return recommend_by_token(token, amount)

    @staticmethod
    @celery.task(name="summarize")
    def summarize(text: str, amount: int, tokenize: bool | None):
        return summarize(text, amount=int(amount), tokenize=tokenize)

    @staticmethod
    @celery.task(name="update")
    def triggered_update(remote_change_time: float):
        print(f"Run triggered update with time: {remote_change_time}")
        if recommender_outdated(remote_change_time):
            print("Updating")
            update_recommender()
        else:
            print("Recommender already up to date")

    @staticmethod
    @celery.task(name="build_annoy")
    def build_annoy():
        recommender = get_recommender()
        recommender.annoy_input_length = 500
        result = get_all_vectors()
        new_mapping, embeddings = recommender.convert_to_mapping(result, "id", "vectors", "embeddings")
        recommender.build_annoy(new_mapping, embeddings, "override")
        if os.path.exists(celery.data_path + "/temp"):
            shutil.rmtree(celery.data_path + "/temp")
        recommender.save(path=celery.data_path, model_name="temp")
        shutil.make_archive(celery.data_path + "/temp", format="zip", root_dir=celery.data_path + "/temp")
        requests.post(celery.api + "/update_model/", files={"file": open(celery.data_path + "/temp.zip", "rb")})
        shutil.rmtree(celery.data_path + "/temp")
        os.remove(celery.data_path + "/temp.zip")
        print(new_mapping.info())
        print(new_mapping.head(10))
