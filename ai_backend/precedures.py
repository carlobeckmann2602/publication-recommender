import pandas as pd
import re
from app.util.misc import get_arxiv_url
from app.engine import Recommender, Summarizer
from prettytable import PrettyTable


def filter_short_texts(key) -> pd.DataFrame:
    df = data.copy()
    df[key+"_len"] = df[key].apply(len)
    df = df[df[key+"_len"] >= 65]
    return df


def build_and_save():
    recommender_system.add_to_mapping(dataset=data, data_key="article_text", id_key="article_id")
    recommender_system.build_annoy()
    recommender_system.save(model_name="arxiv_6k-v2")


def sample_test():
    title_key = "article_id"
    text_key = "abstract_text"
    id_key = "id"
    recommender_system.load(model_name="arxiv_6k-v2")

    def subject(arxiv_id):
        match = re.match(r"([a-z-]+)([0-9]+)", arxiv_id, re.I)
        if match:
            items = match.groups()
            return str(items[0])
        else:
            return ""

    temp_data = data.copy()
    temp_data["subject"] = temp_data["article_id"].apply(subject)
    temp_data = temp_data[temp_data["subject"] == "cs"]

    chosen_publication = temp_data.sample().iloc[0]
    table = PrettyTable()
    table.field_names = ["type", "id", "link", "abstract"]
    initial_row = ["chosen",
                   chosen_publication[id_key],
                   get_arxiv_url(chosen_publication[title_key]),
                   chosen_publication[text_key]]
    table.add_row(initial_row)

    recommendations = recommender_system.get_match_by_id(chosen_publication["article_id"], amount=5)
    for index, current_recommendation in recommendations.iterrows():
        publication = data[data[title_key] == current_recommendation["publication_id"]].iloc[0]
        current_row = ["Top " + str(index+1),
                       publication[id_key],
                       get_arxiv_url(publication[title_key]),
                       publication[text_key]]
        table.add_row(current_row)
    table.align = "l"
    print(table)


if __name__ == '__main__':
    data: pd.DataFrame = pd.read_pickle("./data/datasets/arxiv_full/test_id.pkl")
    print(data.info())
    print(data.sample().iloc[0]["article_id"])
    summy = Summarizer(transformer="all-mpnet-base-v2", debug=True, tokenize=False)
    recommender_system = Recommender(summy,
                                     transformer="all-mpnet-base-v2",
                                     token_amount=5,
                                     annoy_input_length=768,
                                     annoy_n_trees=100)
#    build_and_save()
    sample_test()

