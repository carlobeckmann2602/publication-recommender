from fastapi import FastAPI, HTTPException
from typing import List, Dict
from .engine import Summarizer, Recommender
import os

rec_api = FastAPI()
initial_engines: Dict[str, Recommender] = {}
rec_api.engines = initial_engines

rec_api.model_path = "../data/generated_data/"


@rec_api.get("/models/possible")
def get_model_names() -> Dict[str, List[str]]:
    """
    Lists all registered annoy models, that can be loaded from disk

    **return**: a list of possible model names
    """
    models = next(os.walk(rec_api.model_path))[1]
    return {"disk_models": models}


@rec_api.get("/{model_name}/load/")
def load_recommender(model_name: str,
                     token_amount: int = 5,
                     annoy_input_length: int = 768,
                     annoy_n_trees: int = 100):
    """
    Loads a registered models from disk and sets it as the current recommendation engine.
    - **model_name**: The name of the recommendation engine (model). Use /models/ to get list of options.
    - **token_amount**: The amount of tokens that are used for every publication entry
    - **annoy_input_length**: Vector length of annoy inputs
    - **annoy_n_trees**: Tree amount separating the annoy planes

    **return**: The currently loaded model after calculation
    """
    summarizer = Summarizer(transformer="all-mpnet-base-v2",
                            tokenize=False)
    recommender = Recommender(summarizer,
                              transformer="all-mpnet-base-v2",
                              token_amount=token_amount,
                              annoy_input_length=annoy_input_length,
                              annoy_n_trees=annoy_n_trees)
    recommender.load(path=rec_api.model_path, model_name=model_name)
    rec_api.engines[model_name] = recommender
    return {"loaded": model_name}


@rec_api.get("/{model_name}/match_id/{publication_id}/")
async def get_recommendation(model_name: str, publication_id: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    - **model_name**: The model that should be used
    - **publication_id**: The input publication
    - **amount**: The amount of matches to be included

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    if model_name not in rec_api.engines.keys():
        raise HTTPException(status_code=404, detail="No model with this name loaded")
    recommender = rec_api.engines[model_name]
    if publication_id not in recommender.mapping[Recommender.PUB_ID_KEY].values:
        raise HTTPException(status_code=404, detail="No Publication with this ID in mapping")
    matches = recommender.get_match_by_id(str(publication_id), amount)
    return matches.to_dict()


@rec_api.get("/{model_name}/match_token/{token}/")
async def get_recommendation(model_name: str, token: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    - **model_name**: The model that should be used
    - **token**: The input token. For example a sentence
    - **amount**: The amount of matches to be included

    **return**: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    if model_name not in rec_api.engines.keys():
        raise HTTPException(status_code=404, detail="No model with this name loaded")
    recommender = rec_api.engines[model_name]
    matches = recommender.get_match_by_token(str(token), amount)
    return matches.to_dict()


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
