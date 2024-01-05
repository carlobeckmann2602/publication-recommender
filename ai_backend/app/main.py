import time

import celery
import numpy as np
import asyncio
from asgiref.sync import sync_to_async
from celery.result import AsyncResult
from fastapi import FastAPI, HTTPException, UploadFile, Query
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from fastapi.concurrency import run_in_threadpool
from typing import List, Dict, Annotated
from .util.misc import create_file_structure
from . import celery as tasks
import os
import aiofiles

STANDARD_MODEL = "current_model.zip"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup file structure
    create_file_structure(app.model_path, app.upload_path, app.archive_path)
    # Setup initial model and build if no model is found
    initial_model = os.environ["INITIAL_MODEL"]
    if initial_model != "":
        print(f"Using the API with {initial_model} as the initial model")
        app.current_model = f"{app.archive_path}/{initial_model}"
    else:
        print("Using the API without an initial model")
        app.current_model = f"{app.archive_path}/{STANDARD_MODEL}"

    if os.path.exists(app.current_model):
        app.last_changed = os.path.getmtime(app.current_model)
    else:
        app.last_changed = 0
        tasks.build_annoy.apply_async(args=[])
    yield


rec_api = FastAPI(
    title="HSD Publication Recommendation Engine",
    description="This is a beautiful description",
    version="0.2.0",
    lifespan=lifespan
)
# Setup api parameters
rec_api.data_path = os.environ["DATA_PATH"]
rec_api.generated_data_path = f"{rec_api.data_path}/generated_data"
rec_api.model_path = f"{rec_api.generated_data_path}/models"
rec_api.upload_path = f"{rec_api.generated_data_path}/upload"
rec_api.archive_path = f"{rec_api.generated_data_path}/archive"
rec_api.current_model = ""


def task_to_async(task, queue: str = tasks.task_default_queue):
    task_timeout = 5 * 60 * 60

    async def wrapper(*args, **kwargs):
        delay = 0.1
        async_result = await sync_to_async(task.apply_async, thread_sensitive=True)(
            args=args,
            kwargs=kwargs,
            queue=queue
        )
        while not async_result.ready():
            if delay >= task_timeout:
                raise HTTPException(status_code=404, detail=fr"{task.name} timed out in wait.")
            await asyncio.sleep(delay)
            delay = min(delay * 1.5, 2)  # exponential backoff, max 2 seconds
        return async_result.get(timeout=task_timeout)
    return wrapper


@rec_api.get("/build_annoy/")
def build_annoy():
    """
    Forces to build a new annoy index
    """
    tasks.build_annoy.apply_async(args=[])
    return {"started": True}


@rec_api.get("/random/")
async def get_random_id(amount=5):
    result = await task_to_async(tasks.get_random_id)(amount)
    return {"id": result}


@rec_api.get("/last_changed/")
def get_model_modification_date():
    """
    Returns the float value (UNIX time) of the last time the current recommender engine was changed.

    **return**: The UNIX time value with pattern: {last_changed: float}
    """
    if os.path.exists(rec_api.current_model):
        # TODO: Decide if read should stay or rec_api.last_changed
        return {"last_changed": os.path.getmtime(rec_api.current_model)}
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.post("/update_model/")
async def update_model(file: UploadFile):
    """
    Replaces the current recommendation engine.
    - **file**: The new recommendation engine as a zip archive.
    """
    await read_file_in_chunks(file, as_file=STANDARD_MODEL,
                              delete_buffer=False, return_raw=True,
                              destination=rec_api.archive_path)
    rec_api.current_model = f"{rec_api.archive_path}/{STANDARD_MODEL}"
    rec_api.last_changed = os.path.getmtime(rec_api.current_model)
    tasks.update_recommender.apply_async(
        args=[rec_api.last_changed],
        queue='ml_broadcast'
    )


@rec_api.get("/model.zip/")
def get_model_data():
    """
    Returns the current model as a zip archive.

    **return**: The recommendation engine as a zip archive.
    """
    if os.path.exists(rec_api.current_model):
        return FileResponse(rec_api.current_model)
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.get("/match_id/{publication_id}/")
async def get_recommendation(publication_id: str, amount: int = 5,
                             excluded_ids: Annotated[List[str], Query()] = []):
    """
    Runs the recommendation engine for a publication ID.
    - **publication_id**: The input publication
    - **amount**: The amount of matches to be included
    - **excluded_ids**: A list of ids which should not appear as valid recommendations

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """

    print(f"[match_id] {publication_id} - > {type(publication_id)}")
    try:
        result = await task_to_async(tasks.recommend_by_publication)(publication_id, amount, excluded_ids)
        return result
    except tasks.errors.MissingPublication as e:
        raise HTTPException(status_code=404, detail=str(e))


@rec_api.get("/match_token/{token}/")
async def get_recommendation(token: str, amount: int = 5,
                             excluded_ids: Annotated[List[str], Query()] = []):
    """
    Runs the recommendation engine for a token.
    - **token**: The input token. For example a sentence
    - **amount**: The amount of matches to be included
    - **excluded_ids**: A list of ids which should not appear as valid recommendations

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """

    print(f"[match_token] {token} - > {type(token)}")
    result = await task_to_async(tasks.recommend_by_token)(token, amount, excluded_ids)
    return result


@rec_api.get("/match_group/")
async def get_recommendation(group: Annotated[List[str], Query()] = [],
                             amount: int = 5,
                             excluded_ids: Annotated[List[str], Query()] = []):
    """
    Runs the recommendation engine for a list of publication IDs as a group.
    This can be used to recommend based of a user library for example.
    - **group**: A list of publication IDs
    - **amount**: The amount of matches to be included
    - **excluded_ids**: A list of ids which should not appear as valid recommendations

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    if group is None:
        return {}

    print(f"[match_group] {group} - > {type(group)}")
    result = await task_to_async(tasks.recommend_by_group)(group, amount, excluded_ids)
    return result


@rec_api.post("/summarize/")
async def summarize(file: UploadFile, amount=5, tokenize: bool | None = None):
    """
    Condenses a given textfile to the most important sentences contained in it.
    Also appends the calculated embeddings (vectors) for each sentence
    - **file**: The text file
    - **amount**: The amount of most important sentences
    - **tokenize**: If set to True or False, the underlying recommendation engine will ignore the current saved
                    settings and behave as set

    **return**: The summarization with pattern: {*n*: {token: str, embedding: [float]} *for n in amount*}
    """
    try:
        file_content = await read_file_in_chunks(file=file, as_file=file.filename, delete_buffer=True)
        return await summarize_text(file_content, amount, tokenize)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error while uploading the file")


@rec_api.get("/summarize/{text}/")
async def summarize_text(text: str, amount=5, tokenize: bool | None = None):
    """
    Condenses a given text to the most important sentences contained in it.
    Also appends the calculated embeddings (vectors) for each sentence
    - **text**: The text
    - **amount**: The amount of most important sentences
    - **tokenize**: If set to True or False, the underlying recommendation engine will ignore the current saved
                    settings and behave as set

    **return**: The summarization with pattern: {*n*: {token: str, embedding: [float]} *for n in amount*}
    """
    result = await task_to_async(tasks.summarize)(text, amount, tokenize)
    return result


async def read_file_in_chunks(file: UploadFile, as_file: str,
                              delete_buffer=True, return_raw=False,
                              destination=rec_api.upload_path) -> str | bytes:
    if not os.path.exists(destination):
        os.makedirs(destination)
    try:
        async with aiofiles.open(destination + "/" + as_file, 'wb') as f:
            all_content = b''
            while contents := await file.read(1024 * 1024):
                await f.write(contents)
                all_content += contents
        if not return_raw:
            all_content = all_content.decode("utf-8")
        return all_content
    except Exception as e:
        raise e
    finally:
        await file.close()
        if delete_buffer:
            os.remove(destination + "/" + as_file)
