import asyncio
import aiohttp
import numpy as np
import requests
import random
from wonderwords import RandomSentence

API_URL = "http://localhost:8000"
sentence_generator = RandomSentence()


async def fetch(s, endpoint: str, path_parameter: str = None, params={}):
    if path_parameter is not None:
        path_parameter = path_parameter + "/"
    else:
        path_parameter = ""
    async with s.get(f'{API_URL}/{endpoint}/{path_parameter}', params=params) as r:
        if r.status != 200:
            r.raise_for_status()
        return await r.text()


async def fetch_all(s, configs):
    # tasks = [build_annoy_task(s)]
    tasks = []
    for current_config in configs:
        task = asyncio.create_task(fetch(s,
                                         current_config["endpoint"],
                                         current_config["path_param"],
                                         current_config["params"]
                                         )
                                   )
        tasks.append(task)
    res = await asyncio.gather(*tasks)
    return res


def build_annoy_task(session):
    return asyncio.create_task(fetch(session, "build_annoy"))


def get_random_request():
    endpoints = ["match_id", "match_group", "match_token"]
    selected_endpoint = random.choice(endpoints)
    excluded_ids = random.sample(random_ids, random.randint(0, 5))
    request = {}
    match selected_endpoint:
        case "match_id":
            request = {
                "endpoint": selected_endpoint,
                "path_param": random.choice(random_ids),
                "params": {"amount": 5, "excluded_ids": excluded_ids}
            }
            pass
        case "match_group":
            request = {
                "endpoint": selected_endpoint,
                "path_param": None,
                "params": {"amount": 5, "group": random.sample(random_ids, random.randint(1, 5)), "excluded_ids": excluded_ids}
            }
        case "match_token":
            request = {
                "endpoint": selected_endpoint,
                "path_param": sentence_generator.bare_bone_sentence(),
                "params": {"amount": 5, "excluded_ids": excluded_ids}
            }
    return request


async def main(amount=100):
    all_requests = []
    for index in range(0, amount):
        all_requests.append(get_random_request())

    async with aiohttp.ClientSession() as session:
        htmls = await fetch_all(session, all_requests)
        print(len(htmls))


def get_random_ids(amount) -> list:
    id_response = requests.get(f"{API_URL}/random/", params={"amount": amount}).json()
    return id_response["id"]


if __name__ == '__main__':
    print(str(np.random.random(size=[4, 10])))
    random_ids = [
        "3595e714-0d45-4689-b87c-8783c7b98056",
        "64604b42-d303-45a2-bce7-d127dbc96cc2",
        "5de44a87-0617-4afb-b2ce-c5ebf01f7d04",
        "6c670e42-bbd5-40ea-b7dc-625403e795eb",
        "82176bfd-254b-4e62-8f65-72a5b92c5fdc",
        "b221c7e8-37bf-4617-9f2e-c45b51ed2e59",
        "d6d73a57-08bd-4148-be36-e45ae16645ed",
        "6ae88dfb-8918-42b3-b8dc-9a53b730cd73",
        "d3f8bd7e-98b3-4c20-a6af-9c3e07a7cfdb"]
#    start = perf_counter()
#    asyncio.run(main(amount=5))
#    stop = perf_counter()
#    print("time taken:", stop - start)
