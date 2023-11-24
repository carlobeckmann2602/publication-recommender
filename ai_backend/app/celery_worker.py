import sched, time
from celery import Celery
from celery.signals import worker_ready
from .engine import Recommender, Summarizer
from .util.misc import create_file_structure
import shutil
import requests
import os

celery = Celery(__name__)

celery.conf.broker_url = os.environ["BROKER"]
celery.conf.result_backend = os.environ["RESULT_BACKEND"]
celery.data_path = os.environ["DATA_PATH"]
celery.recommender_name = "recommender"

celery.api = "http://ai_backend:" + os.environ["API_PORT"]
celery.update_delay = 60*60

create_file_structure(celery.data_path)
my_scheduler = sched.scheduler(time.time, time.sleep)    


def scheduled_update(scheduler):
    if recommender_old():
        print("Updateing recommender from update scheduler")
        update_recommender()
    scheduler.enter(celery.update_delay, 1, scheduled_update, (scheduler,))


my_scheduler.enter(celery.update_delay, 1, scheduled_update, (my_scheduler,))


def get_recommender() -> Recommender:
    recommender = Recommender(Summarizer())
    recommender.load(path=celery.data_path, model_name=celery.recommender_name)
    return recommender


def recommender_old():
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


@worker_ready.connect
def on_worker_ready(**_):
    print("Starting Worker")
    update_recommender()
    print("Run Worker")


@celery.task(name="recommend_token")
def recommend_by_token(token: str, amount: int) -> dict:
    print("test")
    recommender = get_recommender()
    result = recommender.get_match_by_token(str(token), amount).to_dict()
    return result


@celery.task(name="recommend_publication_id")
def recommend_by_publication(publication_id: str, amount: int) -> dict:
    recommender = get_recommender()
    if publication_id not in recommender.mapping[Recommender.PUB_ID_KEY].values:
        return {"state": "FAILURE"}
    matches = recommender.get_match_by_id(str(publication_id), amount)
    return matches.to_dict()


@celery.task(name="update_recommender")
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
