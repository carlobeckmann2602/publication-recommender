from scraper import ArxivApiScraper, ArxivWebScraper, PdfScraper
from db import DatabaseApi
from base_scraper import BaseScraper

# ! files and directories have to exist !
tmp_id_list = "/scraper/data/temp/id_list.csv"
tmp_metadata_list = "/scraper/data/temp/metadata_list.csv" 
tmp_pub_list = "/scraper/data/temp/pub_list.csv"
tmp_txt_dir = "/scraper/data/temp/"

ax_api = ArxivApiScraper()
ax_web = ArxivWebScraper()
sc_pdf = PdfScraper(tmp_txt_dir)
db_api = DatabaseApi()

base = BaseScraper(tmp_id_list, tmp_metadata_list, tmp_pub_list, ax_api, db_api, sc_pdf)

if __name__ == '__main__':
    print("\nDaily scraper start ...")
    ### SCRAPER 1: ALS CRONJOB 1-2 MAL AM TAG: hole alle neuen von heute ###

    ## 1. TEMP DATEN ABRUFEN UND SICHERN ##
    # schaue in temp dateien ob was nachträglich gesichert werden kann
    print("\n- collecting data from temp files ...")
    id_list = base.read_id_list()
    metadata_list = base.read_metadata_list()
    pub_list = base.read_pub_list()
    
    # zu temp ids metadaten scrapen
    if len(id_list) > 0:
        print("\n- scraping metadata from tmp_id_list ...")
        metadata_list.extend(base.get_metadata_list(id_list))
        id_list = base.update_id_list(id_list, metadata_list) # erfolgreich gescrapte aus tmp_id_list entfernen
    
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
            metadata_list.extend(base.get_metadata_list(id_list))
            id_list = base.update_id_list(id_list, metadata_list) # erfolgreich gescrapte aus temp entfernen
        if len(metadata_list) > 0:
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
