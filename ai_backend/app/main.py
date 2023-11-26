from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from typing import List, Dict
from .util.misc import create_file_structure
from celery.app import control
from .celery.celery_worker import Tasks, celery
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
rec_api.current_model = f"{rec_api.archive_path}/arxiv_6k-v2.zip"


@rec_api.get("/last_changed")
async def get_model_modification_date():
    if os.path.exists(rec_api.current_model):
        return {"last_changed": os.path.getmtime(rec_api.current_model)}
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.post("/update_model/")
async def update_model(file: UploadFile):
    await read_file_in_chunks(file, as_file="current_model.zip",
                              delete_buffer=False, return_raw=True,
                              destination=rec_api.archive_path)
    rec_api.current_model = f"{rec_api.archive_path}/current_model.zip"
    Tasks.triggered_update.apply_async(queue='ml_broadcast')


@rec_api.get("/model.zip")
async def get_model_data():
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
    task = Tasks.recommend_by_publication.delay(str(publication_id), amount)
    result = task.get()
    return result


@rec_api.get("/match_token/{token}/")
async def get_recommendation(token: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    - **token**: The input token. For example a sentence
    - **amount**: The amount of matches to be included

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    task = Tasks.recommend_by_token.delay(str(token), amount)
    result = task.get()
    return result


@rec_api.post("/summarize/")
async def summarize(file: UploadFile, amount=5):
    try:
        file_content = await read_file_in_chunks(file=file, as_file=file.filename, delete_buffer=True)
        task = Tasks.summarize.delay(file_content, amount)
        return task.get()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error while uploading the file")


async def read_file_in_chunks(file: UploadFile, as_file: str,
                              delete_buffer=True, return_raw=False,
                              destination=rec_api.upload_path) -> str | bytes:
    if not os.path.exists(destination):
        os.makedirs(destination)
    try:
        async with aiofiles.open(destination + "/" + as_file, 'wb') as f:
            while contents := await file.read(1024 * 1024):
                await f.write(contents)
                if not return_raw:
                    contents = contents.decode("utf-8")
                return contents
    except Exception as e:
        raise e
    finally:
        await file.close()
        if delete_buffer:
            os.remove(destination + "/" + as_file)
