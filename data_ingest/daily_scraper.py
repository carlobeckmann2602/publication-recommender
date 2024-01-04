import csv, json, requests
from ast import literal_eval
from publications import ArxivPublication
from scraper import ArxivApiScraper, ArxivWebScraper, PdfScraper
from db import DatabaseApi

tmp_id_list = "/scraper/data/temp/id_list.csv"
tmp_metadata_list = "/scraper/data/temp/metadata_list.csv" 
tmp_pub_list = "/scraper/data/temp/pub_list.csv"
tmp_txt_dir = "/scraper/data/temp/"

ax_pdf_url = "https://arxiv.org/pdf/"

ax_api = ArxivApiScraper()
ax_web = ArxivWebScraper()
sc_pdf = PdfScraper(tmp_txt_dir)
db_api = DatabaseApi()

def save_id_list(id_list):
    print("--- writing " + str(len(id_list)) + " entries to '" + tmp_id_list + "' ...")
    with open(tmp_id_list, 'w', newline='') as file:
        writer = csv.writer(file)
        for id in id_list:
            writer.writerow([id])
    return True

def save_metadata_list(metadata_list):
    print("--- writing " + str(len(metadata_list)) + " entries to '" + tmp_metadata_list + "' ...")
    with open(tmp_metadata_list, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["arxiv_id", "title", "authors", "src", "url", "pub_date", "upd_date", "doi", "abstract"])
        for pub in metadata_list:
            writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract])
    return True

def save_pub_list(pub_list):
    print("--- writing " + str(len(pub_list)) + " entries to '" + tmp_pub_list + "' ...")
    with open(tmp_pub_list, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["arxiv_id", "title", "authors", "src", "url", "pub_date", "upd_date", "doi", "abstract", "vector_dict"])
        for pub in pub_list:
            writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract, pub.vector_dict])
    return True

def read_id_list():
    print("-- reading ids from '" + tmp_id_list + "' ...")
    id_list = list()
    with open(tmp_id_list, 'r') as file:
        reader = csv.reader(file)
        for row in reader:
            id = row[0]
            id_list.append(id)
    id_list = list(set(id_list))
    id_list.sort()
    print("--- found " + str(len(id_list)) + " ids.")
    return id_list

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

def read_pub_list():
    print("-- reading publications from '" + tmp_pub_list + "' ...")
    pub_list = list()
    with open(tmp_pub_list, 'r') as file:
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
                vector_dict=literal_eval(row['vector_dict'])
            )
            pub_list.append(pub)
    pub_list = list(set(pub_list))
    print("--- found " + str(len(pub_list)) + " publications.")
    return pub_list

def get_metadata_list(id_list):
    full_metadata_list = list()
    # rufe daten zu ids in 100er blöcken über api ab
    block_size = 100
    block_list = [id_list[i:i + block_size] for i in range(0, len(id_list), block_size)]
    #for i, chunk in enumerate(block_list, start=1):
        #print(f"Chunk {i}: {len(chunk)}")
    for block in block_list:
        metadata_list = ax_api.scrape_by_id_list(block, block_size)
        if len(metadata_list) > 0:
            full_metadata_list.extend(metadata_list)
    print("-- collected metadata of " + str(len(full_metadata_list)) + " publications.")
    return full_metadata_list

def update_id_list(id_list, metadata_list):
    to_remove = list()
    print("-- removing successfully scraped metadata from tmp_id_list ...")
    for pub in metadata_list:
        to_remove.append(pub.arxiv_id)
    filtered_id_list = [item for item in id_list if item not in to_remove]
    # update id list
    if save_id_list(filtered_id_list):
        return filtered_id_list
    else: return id_list

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

def update_pub_list(pub_list, stored_list):
    to_remove = list()
    for pub in stored_list:
        to_remove.append(pub.arxiv_id)
    filtered_pub_list = [item for item in pub_list if item.arxiv_id not in to_remove]
    # update pub list
    if save_pub_list(filtered_pub_list):
        return filtered_pub_list
    else: return pub_list

def scrape_pdf_and_calc_vectors(pub):
    print("-- collect pdf content of publication id '" + str(pub.arxiv_id) + "' ...")
    pdf_text = sc_pdf.read_pdf(pub.url, pub.arxiv_id)
    if pdf_text is None:
        sc_pdf.delete()
        return False, pub
    vector_dict = None
    file_param = {"file": open("/scraper/data/temp/"+pub.arxiv_id+".txt", "rb")}
    res_ai_api = requests.post("http://ai_backend:8000/summarize?tokenize=true&amount=5", files=file_param)
    if res_ai_api.status_code == 200:
        vector_dict = json.loads(res_ai_api.text)
        pub.vector_dict = vector_dict
        print("-- vector calculation for publication id '" + str(pub.arxiv_id) + "' successful.")
        sc_pdf.delete()
        #print("-- response: "+str(vector_dict["0"]["token"]))
    else:
        print("-- vector calculation for publication id '" + str(pub.arxiv_id) + "' failed.")
        sc_pdf.delete()
        return False, pub
    #print("-- collected vector data of " + str(len(pub_list)) + " publications.")
    return True, pub

if __name__ == '__main__':
    print("\nDaily scraper start ...")
    ### SCRAPER 1: ALS CRONJOB 1-2 MAL AM TAG: hole alle neuen von heute ###

    ## 1. TEMP DATEN ABRUFEN UND SICHERN ##
    # schaue in temp dateien ob was nachträglich gesichert werden kann
    print("\n- collecting data from temp files ...")
    id_list = read_id_list()
    metadata_list = read_metadata_list()
    pub_list = read_pub_list()
    
    # zu temp ids metadaten scrapen
    if len(id_list) > 0:
        print("\n- scraping metadata from tmp_id_list ...")
        metadata_list.extend(get_metadata_list(id_list))
        id_list = update_id_list(id_list, metadata_list) # erfolgreich gescrapte aus tmp_id_list entfernen
    
    # zu temp metadaten pdfs scrapen und vektoren berechnen
    if len(metadata_list) > 0:
        print("\n- scraping publication pdf from tmp_metadata_list and calculating vectors ...")
        stored_list = list()
        for pub in metadata_list:
            if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                ret_val, pub = scrape_pdf_and_calc_vectors(pub)
                if ret_val:
                    if db_api.add_arxiv_pub(pub):
                        stored_list.append(pub)
            else:
                stored_list.append(pub)
        metadata_list = update_metadata_list(metadata_list, stored_list) # erfolgreich gescrapte aus tmp_metadata_list entfernen
    
    # temp publikationen in datenbank ablegen
    if len(pub_list) > 0:
        print("\n- storing publications from tmp_pub_list files to database ...")
        stored_list = list()
        for pub in pub_list:
            if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                if db_api.add_arxiv_pub(pub):
                    stored_list.append(pub)
            else:
                stored_list.append(pub)
        pub_list = update_pub_list(pub_list, stored_list) # erfolgreich gescrapte aus temp entfernen

    ## NEUE PUBLIKATIONEN ABRUFEN UND SICHERN ##
    print("\n- collecting new publication data from arxiv ...")
    # scrape neueste id von arxiv api/web
    ax_new_id = ax_api.scrape_newest_id()
    if ax_new_id is None:
        ax_new_id = ax_web.scrape_newest_id()
    if ax_new_id is not None:
        ax_yy_new = int(ax_new_id[:2])
        ax_mm_new = int(ax_new_id[2:4])
        ax_id_new_num = int(ax_new_id[5:])
    
    # rufe neuste id in datenbank ab
    db_new_id = None
    db_new_id = db_api.get_newest_arxiv_pub() 
    if db_new_id is not None:
        db_yy_new = int(db_new_id[:2])
        db_mm_new = int(db_new_id[2:4])
        db_id_new_num = int(db_new_id[5:])
    
    # berechne distanz zur neusten id aus datenbank
    distance = 0
    if ax_new_id is not None and db_new_id is not None:
        # sind die publikationen sind aus dem selben jahr, monat kann man den abstand berechnen
        yy_equal = ax_yy_new == db_yy_new
        mm_equal = ax_mm_new == db_mm_new
        print("- calculating distance ...")
        if yy_equal and mm_equal:
            distance = ax_id_new_num - db_id_new_num
            if distance < 0:
                distance = distance*(-1)
        # sind die publikationen nicht aus dem gleichen jahr, monat dann
        else:
            # nehme den abstand der neusten arxiv id zu 0
            distance = ax_id_new_num - 0
        print("-- found approx "+str(distance)+" new publications.")
    
    # ermittel fehlende arxiv ids
    if distance > 0:
        print("\n- collecting new publication ids from arxiv ...")
        ax_id_list = list()
        idx = 0
        if yy_equal and mm_equal:
            idx = db_id_new_num+1
        while idx <= ax_id_new_num:
            to_add = str(ax_new_id[:2])+str(ax_new_id[2:4])+'.'+'{:05d}'.format(idx)
            ax_id_list.append(to_add)
            idx += 1
        if len(ax_id_list) > 0:
            id_list.extend(ax_id_list)
        if len(id_list) > 0:
            print("\n- collecting new publication metadata from arxiv ...")
            metadata_list.extend(get_metadata_list(id_list))
            id_list = update_id_list(id_list, metadata_list) # erfolgreich gescrapte aus temp entfernen
        if len(metadata_list) > 0:
            print("\n- collecting new publication pdf from arxiv and calculating vectors ...")
            stored_list = list()
            for pub in metadata_list:
                if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                    ret_val, pub = scrape_pdf_and_calc_vectors(pub)
                    if ret_val:
                        if db_api.add_arxiv_pub(pub):
                            stored_list.append(pub)
                else:
                    stored_list.append(pub)
            metadata_list = update_metadata_list(metadata_list, stored_list) # erfolgreich gescrapte aus tmp_metadata_list entfernen
        if len(pub_list) > 0:
            print("\n- storing new publications from arvix to database ...")
            stored_list = list()
            for pub in pub_list:
                if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                    if db_api.add_arxiv_pub(pub):
                        stored_list.append(pub)
                else:
                    stored_list.append(pub)
            pub_list = update_pub_list(pub_list, stored_list) # erfolgreich gescrapte aus temp entfernen
