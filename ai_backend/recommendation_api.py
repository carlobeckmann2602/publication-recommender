from fastapi import FastAPI, HTTPException
from typing import List, Dict
from .system import Summarizer, Recommender
import os

ml_backend = FastAPI()
ml_backend.summarizer = Summarizer(transformer="all-mpnet-base-v2",
                                   tokenize=False)
ml_backend.recommender = Recommender(ml_backend.summarizer,
                                     transformer="all-mpnet-base-v2",
                                     token_amount=5,
                                     annoy_input_length=768,
                                     annoy_n_trees=100)

ml_backend.model_path = "./ai_backend/data/generated_data/"
ml_backend.current_model = ""


@ml_backend.get("/models/")
async def get_model_names() -> Dict[str, List[str]]:
    """
    Lists all registered annoy models, that can be loaded from disk
    :return: a list of possible model names
    """
    models = next(os.walk(ml_backend.model_path))[1]
    return {"disk_models": models}


@ml_backend.get("/load-recommender/{model_name}/")
async def load_recommender(model_name: str,
                           token_amount: int = 5,
                           annoy_input_length: int = 768,
                           annoy_n_trees: int = 100):
    """
    Loads a registered models from disk and sets it as the current recommendation engine.
    :param model_name: The name of the recommendation engine (model). Use /models/ to get list of options.
    :param token_amount: The amount of tokens that are used for every publication entry
    :param annoy_input_length: Vector length of annoy inputs
    :param annoy_n_trees: Tree amount separating the annoy planes
    :return: The currently loaded model after calculation
    """
    ml_backend.recommender.token_amount = token_amount
    ml_backend.recommender.annoy_input_length = annoy_input_length
    ml_backend.recommender.annoy_n_trees = annoy_n_trees
    ml_backend.recommender.instantiate_annoy()
    ml_backend.recommender.load(path=ml_backend.model_path, model_name=model_name)
    ml_backend.current_model = model_name
    return {"current_model": model_name}


@ml_backend.get("/recommendation/id/{publication_id}/")
async def get_recommendation(publication_id: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    :param publication_id: The input publication
    :param amount: The amount of matches to be included
    :return: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    if publication_id not in ml_backend.recommender.mapping[Recommender.PUB_ID_KEY].values:
        raise HTTPException(status_code=404, detail="No Publication with this ID in mapping")
    matches = ml_backend.recommender.get_match_by_id(str(publication_id), amount)
    return matches.to_dict()


@ml_backend.get("/recommendation/token/{token}/")
async def get_recommendation(token: str, amount: int = 5):
    """
    Runs the recommendation engine for a publication ID.
    :param token: The input token. For example a sentence
    :param amount: The amount of matches to be included
    :return: The found matches plus additional information like the used tokens, the distances and anny indexes
    """
    matches = ml_backend.recommender.get_match_by_token(str(token), amount)
    return matches.to_dict()


@ml_backend.get("/random/")
async def get_random():
    """
    Selects a random publication ID that is included in the mapping of the current model
    :return: A random publication
    """
    publication = ml_backend.recommender.mapping.sample()[[Recommender.PUB_ID_KEY, Recommender.ANNOY_INDEX_KEY]]
    print(publication)
    return publication.to_dict()


@ml_backend.get("/current/")
async def get_current_recommender():
    """
    Returns the name of the currently used model
    :return: The current model (recommendation engine)
    """
    return {"current_model": ml_backend.current_model}
