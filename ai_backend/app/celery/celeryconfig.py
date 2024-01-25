import os
from celery.schedules import crontab
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

beat_schedule = {
    "build annoy 4am": {
        "task": "build_annoy",
        "schedule": crontab(
            hour="4", minute="0",
        ),
        "args": ()
    }
}
timezone = "Europe/Berlin"

broker_connection_retry_on_startup = True
broker_connection_retry = True
broker_connection_max_retries = 100
worker_cancel_long_running_tasks_on_connection_loss = True

result_serializer = "json"
task_serializer = "json"
accept_content = ["json", "yaml"]
C_FORCE_ROOT = False
# worker_enable_remote_control = True
#worker_prefetch_multiplier = 2
#worker_concurrency = 1