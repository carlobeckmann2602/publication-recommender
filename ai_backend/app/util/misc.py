import json
import logging

import aiohttp
import tqdm
import shutil
import numpy as np
import pandas as pd
import aiohttp
from typing import Dict, Literal
import re
import os


class DisableLogger(logging.Filter):

    def __init__(self, key: Literal["name", "module", "filename", "message"] = None, value: str = None):
        super().__init__()
        self.filter_key = key
        self.filter_value = value

    def filter(self, record):
        if self.filter_value is None or self.filter_key is None:
            return False
        else:
            record_value = None
            match self.filter_key:
                case "name":
                    record_value = record.name
                case "module":
                    record_value = record.module
                case "filename":
                    record_value = record.filename
                case "message":
                    record_value = record.getMessage()
            return self.filter_value not in record_value


def add_array_column(dataframe: pd.DataFrame, column_name: str, value_array: np.ndarray) -> pd.DataFrame:
    """Overrides or adds a column with array-like values to the dataframe.
    Data should be specified like [[cir1_val, cir1_val, ...], [cir2_val, cir2_val, ...], ...]

    :param dataframe: The dataframe to be edited
    :param column_name: The name of the new column. If column already exists it will be overwritten
    :param value_array: The data for the new Column in 2D Array
    :return: The dataframe with the new data
    """
    dataframe = dataframe.copy()
    if value_array.ndim > 1:
        dataframe.reset_index(inplace=True, drop=True)
        value_list = value_array.tolist()
        value_series = pd.Series(value_list)
        dataframe[column_name] = value_series
    else:
        dataframe[column_name] = value_array
    return dataframe


def fast_read_jsonline(path_to_file: str) -> pd.DataFrame:
    with open(path_to_file) as file:
        lines = file.read().splitlines()
        dataframe = pd.DataFrame(lines)
    dataframe.columns = ["source"]
    return pd.json_normalize(dataframe["source"].apply(json.loads))


def get_arxiv_url(arxiv_id: str):
    match = re.match(r"([a-z-]+)([0-9]+)", arxiv_id, re.I)
    if match:
        items = match.groups()
        access = str(items[0]) + "/" + str(items[1])
    else:
        access = arxiv_id
    return "https://arxiv.org/abs/" + access


def load_json_dict(json_path: str) -> Dict:
    with open(json_path) as file:
        json_dict = json.load(file)
    return json_dict


def create_file_structure(*args):
    for path in args:
        if not os.path.exists(path):
            os.makedirs(path)
