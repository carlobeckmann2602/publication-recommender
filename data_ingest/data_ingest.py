import csv, re, os
from dataclasses import dataclass
from crawler import ArxivCrawler, PdfCrawler

if __name__ == '__main__':
    ac = ArxivCrawler()
    ac.crawl_publications(csv_path=os.getcwd() + "/data_ingest/_data/ids/2023.csv")
    #ac.crawl_ids(year=2017) # 1991=304, 1992=2254, 2008=58356, 
    #ac.crawl_ids(year=2018, months=["12"], main_cat='astro-ph')
    #ac.crawl_ids(year=2017, months=["01", "02"], main_cat='cond-mat')
    #ac.clean_duplicates(os.getcwd() + "/data_ingest/_data/ids/2018.csv") # 58671