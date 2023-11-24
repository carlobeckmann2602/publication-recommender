from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse
from typing import List, Dict
from .engine import Summarizer, Recommender
from .util.misc import create_file_structure
from .celery_worker import recommend_by_token, recommend_by_publication, update_recommender
import os
import aiofiles

rec_api = FastAPI(
    title="HSD Publication Recommendation Engine",
    description="This is a beautiful description",
    version="0.2.0"
)

# Setup file structure
rec_api.data_path = os.environ["DATA_PATH"]
rec_api.generated_data_path = f"{rec_api.data_path}/generated_data"
rec_api.model_path = f"{rec_api.generated_data_path}/models"
rec_api.upload_path = f"{rec_api.generated_data_path}/upload"
rec_api.archive_path = f"{rec_api.generated_data_path}/archive"
create_file_structure(rec_api.model_path, rec_api.upload_path, rec_api.archive_path)

# Initiate model
rec_api.current_model = f"{rec_api.archive_path}/arxiv_6k-v2.zip"


@rec_api.get("/stress_test/")
async def stress_test(amount=100):
    for index in amount:
        task = recommend_by_token.delay("This is a test.", amount=5)


@rec_api.get("/last_changed")
def get_model_modification_date():
    if os.path.exists(rec_api.current_model):
        return {"last_changed": os.path.getmtime(rec_api.current_model)}
    else:
        raise HTTPException(status_code=404, detail=fr"No models archive found for {rec_api.current_model}")


@rec_api.get("/model.zip")
def get_model_data():
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
    task = recommend_by_publication.delay(str(publication_id), amount)
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
    task = recommend_by_token.delay(str(token), amount)
    result = task.get()
    return result


@rec_api.get("/{model_name}/random_id/")
async def get_random(model_name: str):
    """
    Selects a random publication ID that is included in the mapping of the selected model
    - **model_name**: The model that should be used

    **return**: A random publication
    """
    if model_name not in rec_api.engines.keys():
        raise HTTPException(status_code=404, detail="No model with this name loaded")
    publication = rec_api.engines[model_name].mapping.sample()[[Recommender.PUB_ID_KEY, Recommender.ANNOY_INDEX_KEY]]
    return publication.to_dict()


@rec_api.get("/models/loaded/")
async def get_current_recommender():
    """
    Returns all the names of the currently loaded models

    **return**: The current model (recommendation engine)
    """
    return {"current_model": str(list(rec_api.engines.keys()))}


@rec_api.post("/summarize/")
async def summarize(file: UploadFile):
    try:
        file_content = await read_file_in_chunks(file=file, delete_buffer=True)
        ranked_tokens, ranked_embeddings = rec_api.recommender.summarizer.run(input_data=file_content, amount=5, add_embedding=True)
        output_dict = {}
        for index, (token, embedding) in enumerate(zip(ranked_tokens[0], ranked_embeddings[0])):
            output_dict[index] = {"token": token, "embedding": list(embedding)}
        return output_dict
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail="Error while uploading the file")


async def read_file_in_chunks(file: UploadFile, delete_buffer=True) -> str:
    if not os.path.exists(rec_api.upload_path):
        os.makedirs(rec_api.upload_path)
    try:
        async with aiofiles.open(rec_api.upload_path + file.filename, 'wb') as f:
            while contents := await file.read(1024 * 1024):
                await f.write(contents)
                contents = contents.decode("utf-8")
                return contents
    except Exception as e:
        raise e
    finally:
        await file.close()
        if delete_buffer:
            os.remove(rec_api.upload_path + file.filename)
