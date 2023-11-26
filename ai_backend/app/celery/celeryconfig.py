import os
from kombu.common import Broadcast, Queue, Exchange

default_exchange = Exchange("ml_celery", type="topic")

task_queues = (
    Queue("ml_celery", default_exchange),
    Broadcast("ml_broadcast"),
)
task_default_exchange = "ml_celery"
task_default_queue = "ml_celery"
broker_url = os.environ["BROKER"]
result_backend = os.environ["RESULT_BACKEND"]
