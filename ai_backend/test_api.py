import asyncio
from time import perf_counter

import aiohttp
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
    tasks = [build_annoy_task(s)]
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
    random_ids = get_random_ids(50)
    start = perf_counter()
    asyncio.run(main(amount=100))
    stop = perf_counter()
    print("time taken:", stop - start)
