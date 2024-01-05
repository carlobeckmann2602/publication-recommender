from scraper import ArxivApiScraper, ArxivWebScraper, PdfScraper
from db import DatabaseApi
from base_scraper import BaseScraper

year = 2023

# ! files and directories have to exist !
tmp_state_data = "/scraper/data/temp/"+str(year)+"/state_data.csv"
tmp_id_list = "/scraper/data/temp/"+str(year)+"/id_list.csv"
tmp_metadata_list = "/scraper/data/temp/"+str(year)+"/metadata_list.csv" 
tmp_pub_list = "/scraper/data/temp/"+str(year)+"/pub_list.csv"
tmp_txt_dir = "/scraper/data/temp/"

ax_api = ArxivApiScraper()
ax_web = ArxivWebScraper()
sc_pdf = PdfScraper(tmp_txt_dir)
db_api = DatabaseApi()

base = BaseScraper(tmp_id_list, tmp_metadata_list, tmp_pub_list, ax_api, db_api, sc_pdf, tmp_state_data)

if __name__ == '__main__':
    print("\nYear scraper start ...")
    ### SCRAPER 2: ALS CRONJOB alle 2 Std: hole 100 Publikationen von o.g Jahr ###

    ## 1. TEMP DATEN ABRUFEN UND SICHERN ##
    # schaue in temp dateien nach aktuellem stand
    print("\n- collecting state and unstored data from temp files ...")
    state_data = base.read_state_data()
    id_list = base.read_id_list()
    metadata_list = base.read_metadata_list()
    pub_list = base.read_pub_list()

    ## NOCH NICHT GESCRAPTE PUBLIKATIONEN AUS O.G. JAHR ABRUFEN UND SICHERN ##
    for month in range(1,2):
        num_counter = 0
        # startnummer initialisieren falls vorhanden
        if state_data is not None and int(state_data["year"]) != year:
            print("-- state data year and scraper year don't match. terminating ...")
            break
        if state_data is not None and int(state_data["month"]) != month:
            continue
        if state_data is not None:
            num_counter = int(state_data["max_num"])+1

        print("\n- collecting publication data of " + str(year) + "." + str(month) + " starting from " + str(num_counter) + " from arxiv ...")
        # publikationen in 100er blöcken abrufen, angefangen mit num_counter als index
        block_size = 100
        # erzeuge die nächsten 100 ids
        num_counter, id_block = base.create_id_block(year, month, num_counter, block_size)  # solange 100er id blöcke erzeugen bis
        id_list.extend(id_block)
        base.save_id_list(id_list)
        # rufe metadaten über die arxiv api ab
        if len(id_list) > 0:
            print("\n- collecting publication metadata from arxiv ...")
            metadata_list.extend(base.get_metadata_list(id_list))
            base.save_metadata_list(metadata_list)
            id_list = base.update_id_list(id_list, metadata_list) # erfolgreich gescrapte aus tmp_id_list entfernen
        # lese pdfs und generiere vektoren
        if len(metadata_list) > 0:
            base.save_state_data(year, month, metadata_list)
            print("\n- collecting new publication pdf from arxiv and calculating vectors ...")
            stored_list = list()
            for pub in metadata_list:
                if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                    ret_val, pub = base.read_pdf_and_calc_vectors(pub)
                    if ret_val:
                        if db_api.add_arxiv_pub(pub):
                            stored_list.append(pub)
                else:
                    stored_list.append(pub)
            metadata_list = base.update_metadata_list(metadata_list, stored_list) # erfolgreich gescrapte aus tmp_metadata_list entfernen
        else:
            base.save_id_list(id_list.clear())
        # lege publikation in datenbank ab
        if len(pub_list) > 0:
            print("\n- storing new publications from arvix to database ...")
            stored_list = list()
            for pub in pub_list:
                if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                    if db_api.add_arxiv_pub(pub):
                        stored_list.append(pub)
                else:
                    stored_list.append(pub)
            pub_list = base.update_pub_list(pub_list, stored_list) # erfolgreich gescrapte aus temp entfernen
        #else:
        #    base.save_metadata_list(metadata_list.clear())
