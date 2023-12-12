from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from typing import List, Dict
from .util.misc import create_file_structure
from celery.app import control
from .celery.celery_worker import Tasks, MissingPublication
import os
import aiofiles

rec_api = FastAPI(
    title="HSD Publication Recommendation Engine",
    description="This is a beautiful description",
    version="0.2.0"
)

# Setup file structure
rec_api.data_path = "data"  # os.environ["DATA_PATH"]
rec_api.generated_data_path = f"{rec_api.data_path}/generated_data"
rec_api.model_path = f"{rec_api.generated_data_path}/models"
rec_api.upload_path = f"{rec_api.generated_data_path}/upload"
rec_api.archive_path = f"{rec_api.generated_data_path}/archive"
create_file_structure(rec_api.model_path, rec_api.upload_path, rec_api.archive_path)

# Initiate model
rec_api.current_model = f"{rec_api.archive_path}/arxiv_6k-v3.zip"


@rec_api.get("/build_annoy/")
async def build_annoy():
    """
    Forces to build a new annoy index
    """
    Tasks.build_annoy.apply_async(args=[])


@rec_api.get("/last_changed/")
async def get_model_modification_date():
    """
    Returns the float value (UNIX time) of the last time the current recommender engine was changed.

    **return**: The UNIX time value with pattern: {last_changed: float}
    """
    if os.path.exists(rec_api.current_model):
        return {"last_changed": os.path.getmtime(rec_api.current_model)}
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.post("/update_model/")
async def update_model(file: UploadFile):
    """
    Replaces the current recommendation engine.
    - **file**: The new recommendation engine as a zip archive.
    """
    await read_file_in_chunks(file, as_file="current_model.zip",
                              delete_buffer=False, return_raw=True,
                              destination=rec_api.archive_path)
    rec_api.current_model = f"{rec_api.archive_path}/current_model.zip"
    Tasks.triggered_update.apply_async(
        args=[os.path.getmtime(rec_api.current_model)],
        queue='ml_broadcast'
    )


@rec_api.get("/model.zip/")
async def get_model_data():
    """
    Returns the current model as a zip archive.

    **return**: The recommendation engine as a zip archive.
    """
    if os.path.exists(rec_api.current_model):
        return FileResponse(rec_api.current_model)
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.get("/match_id/{publication_id}/")
async def get_recommendation(publication_id: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    - **publication_id**: The input publication
    - **amount**: The amount of matches to be included

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    task = Tasks.recommend_by_publication.apply_async(args=[str(publication_id), amount])
    try:
        result = task.get()
        return result
    except MissingPublication as e:
        raise HTTPException(status_code=404, detail=str(e))


@rec_api.get("/match_token/{token}/")
async def get_recommendation(token: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    - **token**: The input token. For example a sentence
    - **amount**: The amount of matches to be included

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    task = Tasks.recommend_by_token.apply_async(args=[str(token), amount])
    result = task.get()
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
    task = Tasks.summarize.apply_async(args=[text, amount, tokenize])
    return task.get()


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
