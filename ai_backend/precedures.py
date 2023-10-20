import pandas as pd
import torch
from ai_backend.util import *
from system import *
from prettytable import PrettyTable
# For arxiv dataset: You can access title via https://arxiv.org/abs/<id>


def filter_short_texts(key) -> pd.DataFrame:
    df = data.copy()
    df[key+"_len"] = df[key].apply(len)
    df = df[df[key+"_len"] >= 40]
    return df


def build_and_save():
    summy = Summarizer(debug=True, tokenize=False)
    recommender_system = Recommender(summy, token_amount=5, annoy_input_length=1920)
    recommender_system.build_annoy(data, "article_text")
    recommender_system.save(model_name="multi-embed_test")


def sample_test():
    title_key = "article_id"
    text_key = "abstract_text"
    id_key = "id"

    summy = Summarizer(debug=True, tokenize=False)
    recommender_system = Recommender(summy, annoy_input_length=1920)
    recommender_system.load(model_name="multi-embed_test")
    chosen_publication = data.sample().iloc[0]
    table = PrettyTable()
    table.field_names = ["type", "id", "title", "abstract"]
    initial_row = ["chosen", chosen_publication[id_key], chosen_publication[title_key], chosen_publication[text_key]]
    table.add_row(initial_row)

    recommendations = recommender_system.get_match(chosen_publication["id"], amount=4)
    for index, current_recommendation in enumerate(recommendations):
        publication = data[data[id_key] == current_recommendation].iloc[0]
        current_row = ["Top " + str(index+1),
                       publication[id_key],
                       publication[title_key],
                       publication[text_key]]
        table.add_row(current_row)
    table.align = "l"
    print(table)


if __name__ == '__main__':
    data = pd.read_pickle("./data/datasets/arxiv_full/test_id.pkl")
    print(data.info())
#    build_and_save()
    sample_test()
