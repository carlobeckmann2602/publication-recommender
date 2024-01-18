import csv
from publications import ArxivPublication
from db import DatabaseApi
from ast import literal_eval

tmp_metadata_list = "/scraper/data/temp/metadata_list.csv" 
db_api = DatabaseApi()

def read_metadata_list():
    print("-- reading publication metadata from '" + tmp_metadata_list + "' ...")
    metadata_list = list()
    with open(tmp_metadata_list, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            pub = ArxivPublication(
                arxiv_id=row['arxiv_id'], 
                title=row['title'], 
                authors=literal_eval(row['authors']), 
                src=row['src'], 
                url=row['url'], 
                pub_date=row['pub_date'], 
                upd_date=row['upd_date'], 
                doi=literal_eval(row['doi']), 
                abstract=row['abstract'],
                vector_dict=None
            )
            metadata_list.append(pub)
    metadata_list = list(set(metadata_list))
    print("--- found metadata of " + str(len(metadata_list)) + " publications.")
    return metadata_list

def save_metadata_list(metadata_list):
    print("--- writing " + str(len(metadata_list)) + " entries to '" + tmp_metadata_list + "' ...")
    with open(tmp_metadata_list, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["arxiv_id", "title", "authors", "src", "url", "pub_date", "upd_date", "doi", "abstract"])
        for pub in metadata_list:
            writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract])
    return True

def update_metadata_list(metadata_list, pub_list):
    to_remove = list()
    print("-- removing successfully scraped publications from tmp_metadata_list ...")
    for pub in pub_list:
        to_remove.append(pub.arxiv_id)
    filtered_metadata_list = [item for item in metadata_list if item.arxiv_id not in to_remove]
    # update metadata list
    if save_metadata_list(filtered_metadata_list):
        return filtered_metadata_list
    else: return metadata_list

if __name__ == '__main__':
    metadata = read_metadata_list()
    to_remove = list()
    for pub in metadata:
        if db_api.get_arxiv_pub_by_id(pub.arxiv_id):
            to_remove.append(pub)
    metadata = update_metadata_list(metadata, to_remove)