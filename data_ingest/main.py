from scraper import ArxivApiScraper, ArxivWebScraper
from db import DatabaseApi

if __name__ == '__main__':
    print("Daily scraper start ...")
    ### SCRAPER 1: ALS CRONJOB 1-2 MAL AM TAG: hole alle neuen von heute ###
    
    # scrape neueste id von arxiv 
    ax_api = ArxivApiScraper()
    ax_web = ArxivWebScraper()
    ax_new_id = ax_api.scrape_newest_id()
    if ax_new_id is None:
        ax_new_id = ax_web.scrape_newest_id()
    if ax_new_id is not None:
        ax_yy_new = int(ax_new_id[:2])
        ax_mm_new = int(ax_new_id[2:4])
        ax_id_new_num = int(ax_new_id[5:])
    
    # rufe neuste id in datenbank ab
    db_api = DatabaseApi()
    db_new_id = None
    db_new_id = db_api.get_oldest_arxiv_pub() # oldest ist newest in db
    if db_new_id is not None:
        db_yy_new = int(db_new_id[:2])
        db_mm_new = int(db_new_id[2:4])
        db_id_new_num = int(db_new_id[5:])
    
    # berechne distanz zur neusten id aus datenbank
    if ax_new_id is not None and db_new_id is not None:
        # sind die publikationen sind aus dem selben jahr, monat kann man den abstand berechnen
        yy_equal = ax_yy_new == db_yy_new
        mm_equal = ax_mm_new == db_mm_new
        distance = 0
        if yy_equal and mm_equal:
            distance = ax_id_new_num - db_id_new_num
            if distance < 0:
                distance = distance*(-1)
        # sind die publikationen nicht aus dem gleichen jahr, monat dann
        else:
            # nehme den abstand der neusten arxiv id zu 0
            distance = ax_id_new_num - 0
        print(distance)
    
    # ermittel fehlende arxiv ids
    if ax_new_id is not None and db_new_id is not None and distance > 0:
        ax_id_list = list()
        if yy_equal and mm_equal:
            idx = db_id_new_num
            while idx != ax_id_new_num:
                idx += 1
                to_add = str(db_new_id[:2])+str(db_new_id[2:4])+'.'+'{:05d}'.format(idx)
                ax_id_list.append(to_add)
        if len(ax_id_list) > 0:
            # rufe daten zu ids über api ab
            pub_list = ax_api.scrape_by_id_list(ax_id_list)
            print(len(pub_list))
                # zwischenspeichere daten in csv!
                # für jede zwischen gespeicherte publikation: 
                    # berechne vektoren, update datenbank und lösche aus csv
    #ac = ArxivApiScraper()
    #ac.run()
