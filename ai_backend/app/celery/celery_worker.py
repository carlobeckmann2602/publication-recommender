from celery import Celery
from celery.signals import worker_ready
from app.celery import celeryconfig
from celery.worker.control import Panel
from app.engine import Recommender, Summarizer
from app.util.misc import create_file_structure
import shutil
import requests
import os

celery = Celery(__name__)
celery.config_from_object(celeryconfig)

celery.data_path = os.environ["DATA_PATH"]
celery.recommender_name = "recommender"

celery.api = "http://ai_backend:" + os.environ["API_PORT"]
celery.update_delay = 60 * 60

create_file_structure(celery.data_path)


@worker_ready.connect
def on_worker_ready(**_):
    print("Starting Worker")
    update_recommender()
    print("Run Worker")


def get_recommender() -> Recommender:
    recommender = Recommender(Summarizer())
    recommender.load(path=celery.data_path, model_name=celery.recommender_name)
    return recommender


def recommend_by_token(token: str, amount: int) -> dict:
    recommender = get_recommender()
    result = recommender.get_match_by_token(str(token), amount).to_dict()
    return result


def recommend_by_publication(publication_id: str, amount: int) -> dict:
    recommender = get_recommender()
    if publication_id not in recommender.mapping[Recommender.PUB_ID_KEY].values:
        return {"state": "FAILURE"}
    matches = recommender.get_match_by_id(str(publication_id), amount)
    return matches.to_dict()


def summarize(input_text: str, amount: int):
    recommender = get_recommender()
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


def recommender_outdated():
    zip_path = f"{celery.data_path}/{celery.recommender_name}.zip"
    if os.path.exists(zip_path):
        local_change_time = os.path.getmtime(zip_path)
    else:
        local_change_time = 0
    try:
        result = requests.get(f"{celery.api}/last_changed").json()
        remote_change_time = result["last_changed"]
        return local_change_time < remote_change_time
    except Exception:
        return False


class Tasks:
    @staticmethod
    @celery.task(name="update_recommender")
    def update_recommender():
        update_recommender()

    @staticmethod
    @celery.task(name="recommend_publication_id")
    def recommend_by_publication(publication_id: str, amount: int) -> dict:
        return recommend_by_publication(publication_id, amount)

    @staticmethod
    @celery.task(name="recommend_token")
    def recommend_by_token(token: str, amount: int) -> dict:
        return recommend_by_token(token, amount)

    @staticmethod
    @celery.task(name="summarize")
    def summarize(text: str, amount: int):
        return summarize(text, amount=amount)

    @staticmethod
    @celery.task(name="update")
    def triggered_update():
        print("Run triggered update")
        return None
        if recommender_outdated():
            print("Updating")
            update_recommender()
        else:
            print("Recommender already up to date")
