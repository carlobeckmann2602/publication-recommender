import csv, re, os
from dataclasses import dataclass
from crawler import ArxivCrawler, PdfCrawler, ArxivApiCrawler
import urllib, urllib.request
import urllib.request as libreq

if __name__ == '__main__':
    ac = ArxivApiCrawler()
    #ac.crawl_publications(csv_path=os.getcwd() + "/data_ingest/_data/ids/2023.csv")
    #ac.crawl_ids(year=2017) # 1991=304, 1992=2254, 2008=58356, 
    #ac.crawl_ids(year=2018, months=["12"], main_cat='astro-ph')
    #ac.crawl_ids(year=2017, months=["01", "02"], main_cat='cond-mat')
    #ac.clean_duplicates(os.getcwd() + "/data_ingest/_data/ids/2018.csv") # 58671

    # query over ids 
    #url = 'http://export.arxiv.org/api/query?id_list=2301.00001,2301.00002'
    #data = urllib.request.urlopen(url)
    #print(data.read().decode('utf-8'))

    #We recommend to refine queries which return more than 1,000 results
    # query over last 50 publications ascending (first publications ever)
    #url = 'http://export.arxiv.org/api/query?search_query=all&sortBy=submittedDate&sortOrder=ascending&start=0&max_results=50'
    #data = urllib.request.urlopen(url)
    #print(data.read().decode('utf-8'))

    #url = 'http://export.arxiv.org/api/query?search_query=all&sortBy=submittedDate&sortOrder=descending&start=0&max_results=10'
    #response = urllib.request.urlopen(url)
    #data = response.read()
    #print(data.decode('utf-8'))

    start_at = 0
    step_size = 50  
    current = start_at
    db_data = ac.read_csv(os.getcwd()+"/data_ingest/_data/arxiv_dataset/publications.csv")
    pub_data = ac.crawl_publications(current, step_size, True, None)
    ac.write_csv(os.getcwd()+"/data_ingest/_data/arxiv_dataset/publications.csv", pub_data, db_data)
