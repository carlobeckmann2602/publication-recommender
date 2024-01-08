import argparse, sys
from scraper import ArxivApiScraper, ArxivWebScraper, PdfScraper
from db import DatabaseApi
from base_scraper import BaseScraper


def parse_argument():
    parser = argparse.ArgumentParser(description='Year')
    parser.add_argument('--year', type=int, help='The year to scrape')
    args = parser.parse_args()
    return args.year

if __name__ == '__main__':
    year = parse_argument()
    if not year: sys.exit(1)
    
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

    print("\nYear scraper start ...")
    ### SCRAPER 2: ALS CRONJOB alle 2 Std: hole 100 Publikationen von o.g Jahr ###

    ## 1. TEMP DATEN ABRUFEN UND SICHERN ##
    # schaue in temp dateien nach aktuellem stand
    print("\n- collecting state and unstored data from temp files ...")
    state_data = base.read_state_data() 
    metadata_list = base.read_metadata_list()
    pub_list = base.read_pub_list()

    # zu temp metadaten pdfs scrapen und vektoren berechnen
    if len(metadata_list) > 0:
        print("\n- scraping publication pdf from tmp_metadata_list and calculating vectors ...")
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
    '''
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
        pub_list = base.update_pub_list(pub_list, stored_list) # erfolgreich gescrapte aus temp entfernen
    '''
    ## 2. NOCH NICHT GESCRAPTE PUBLIKATIONEN AUS O.G. JAHR ABRUFEN UND SICHERN ##
    for month in range(1,13):
        num_idx = 0
        # wenn aktueller monat schon final_max_num hat springe weiter
        for entry in state_data:
            if entry["month"] == month and entry["final_max_num"] != 0:
                continue
            else:
                max_num = entry["current_max_num"]
                num_idx = max_num+1
        # scrape metadaten für aktuellen monat in 100er blöcken bis eine leere response kommt
        block_size = 100
        while True:
            num_idx, id_block = base.create_id_block(year, month, num_idx, block_size)
            if len(id_block) > 0:
                print("\n- collecting publication metadata from arxiv ...")
                metadata_block = base.get_metadata_list(id_block)
                if len(metadata_block) > 0:
                    max_num = base.get_max_num(metadata_block)
                    state_data = base.save_state_data(year, month, max_num, state_data, False)
                    metadata_list.extend(metadata_block)
                    base.save_metadata_list(metadata_list)
                else: # leere arxiv api response bedeutet max_num wurde für diesen monat erreicht
                    state_data = base.save_state_data(year, month, max_num, state_data, True)
                    break
            # lese pdfs und generiere vektoren
            if len(metadata_list) > 0:
                print("\n- collecting new publication pdf from arxiv and calculating vectors ...")
                stored_list = list()
                failed_list = list()
                for pub in metadata_list:
                    if not db_api.get_arxiv_pub_by_id(pub.arxiv_id):
                        ret_val, pub = base.read_pdf_and_calc_vectors(pub)
                        if ret_val:
                            if db_api.add_arxiv_pub(pub):
                                stored_list.append(pub)
                        else:
                            failed_list.append(pub)
                    else:
                        stored_list.append(pub)
                metadata_list = base.update_metadata_list(metadata_list, stored_list) # erfolgreich gescrapte aus tmp_metadata_list entfernen
                metadata_list = base.update_metadata_list(metadata_list, failed_list)
                #base.save_pub_list(pub_list)
            '''
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
            '''
