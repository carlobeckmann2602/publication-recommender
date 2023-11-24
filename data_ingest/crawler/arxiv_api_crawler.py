import os, re, io, csv, PyPDF2
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import urllib.request as libreq
from pdf_crawler import PdfCrawler

class ArxivApiCrawler:
    root = "http://export.arxiv.org/api/" #{method_name}?{parameters}
    temp_path = os.getcwd() + "/_data/temp/"
    dataset_path = os.getcwd() + "/_data/"
    
    def __init__(self):
        self.pdf_crawler = PdfCrawler(ArxivApiCrawler.temp_path)
        self.publications = list()
        self.id = None
        self.arxiv_id = None

    def run(self):
        # get publications in database
        # crawl 50 publications start at number of pub in database
        # for each publication
            # if in database skip
            # else create new entry
        pass

    def run_alt(self):
        # get publications in database
            # get largest id
            # get smallest id
        # crawl newest publication
            # if newest publication is not same id as largest id: crawl missing
            # else: skip
        # from smallest id crawl the next 50 smaller ids
            # create new entry
        pass
    
    def get_db_entries(self):
        self.db_entries = self.read_csv(ArxivApiCrawler.dataset_path+"dataset.csv")
        return self.db_entries
    
    def update_db_entries(self, pub_list):
        return self.write_csv(ArxivApiCrawler.dataset_path+"dataset.csv", pub_list)

    def crawl_publications(self, start_at=0, max_results=50, descending=True, csv_path=None):
        root = ArxivApiCrawler.root
        method = "query"
        search_query = "all"
        sort_by = "submittedDate"
        sort_order = "descending" if descending else "ascending"
        url = root+method+"?search_query="+search_query+"&sortBy="+sort_by+"&sortOrder="+sort_order+"&start="+str(start_at)+"&max_results="+str(max_results)
        if descending:
            print("crawling '" + root + "' for newest " + str(max_results) + " publications at distance " + str(start_at) + " from newest (0) ...")
        else:
            print("crawling '" + root + "' for oldest " + str(max_results) + " publications at distance " + str(start_at) + " from oldest (0) ...")
        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        try:
            with libreq.urlopen(url) as self.response:
                if self.response.status == 200:
                    content = self.response.read()
                    xml_root = ET.fromstring(content)
                    for entry in xml_root.findall(xml_tag_prefix+'entry'):
                        arxiv_id = entry.find(xml_tag_prefix+'id').text
                        doi = self._find_doi(arxiv_id)
                        arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
                        if "v" in arxiv_id:
                            arxiv_id = arxiv_id[:-2]
                        self.arxiv_id = arxiv_id
                        pub_date = entry.find(xml_tag_prefix+'published').text
                        upd_date = entry.find(xml_tag_prefix+'updated').text
                        title = entry.find(xml_tag_prefix+'title').text
                        abstract = entry.find(xml_tag_prefix+'summary').text.strip()
                        abstract = abstract.replace("\n", " ")
                        author = ""
                        for author_tag in entry.findall(xml_tag_prefix+'author'):
                            author += author_tag.find(xml_tag_prefix+'name').text + ", "
                        author = author[:-2]
                        for link_tag in entry.findall(xml_tag_prefix+'link'):
                            if "application/pdf" in link_tag.get('type'):
                                pdf_url = link_tag.get('href')
                        category = ""
                        for category_tag in entry.findall(xml_tag_prefix+'category'):
                            category += category_tag.get('term') + ", "
                        category = category[:-2]
                        full_text = self._crawl_pdf(pdf_url, self.arxiv_id + ".txt")
                        self.publications.append([self.arxiv_id, "https://arxiv.org/", pub_date, upd_date, title, abstract, author, doi, pdf_url, category])
                else:
                    print(f"- failed to retrieve data. status code: {self.response.status}")
        except ConnectionResetError as e:
                print(f"- failed to retrieve data. error: {e.args}")
        except requests.exceptions.ConnectionError as e:
                print(f"- failed to retrieve data. error: {e.args}")
        
        #csv_pat = r"\d{4}.csv$"
        #match = re.search(csv_pat, csv_path)
        #self._write_to_csv(ArxivApiCrawler.dataset_path+match.group(), self.publications)
        return self.publications
    
    def write_csv(self, csv_path, data):
        print("writing " + str(len(data)) + " entries to '" + csv_path + "' ...")
        with open(csv_path, 'w', newline='') as file:
            writer = csv.writer(file)
            for row in data:
                    writer.writerow(row)
        return True
    
    def read_csv(self, csv_path):
        print("reading ids from '" + csv_path + "' ...")
        id_list = list()
        with open(csv_path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                id = row[0]
                id_list.append(id)
        id_list = list(set(id_list))
        id_list.sort()
        print("- found '" + str(len(id_list)) + "' ids.")
        return id_list

    def _find_doi(self, url):
        try:
            self.response = requests.get(url)
            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                doi_pat = r"https://doi.org/"
                doi = None
                a_tags = soup.find_all('a')
                for a in a_tags:
                    href = a.get('href')
                    if href is not None and re.match(r"^"+doi_pat, href):
                        doi = href.replace(doi_pat, "")
            else:
                print(f"- failed to retrieve the pdf. Status code: {self.response.status_code}")
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        return doi
    
    def _crawl_pdf(self, url, filename):
        if self.pdf_crawler.pull(url, filename):
            full_text = self.pdf_crawler.read()
        else: full_text = None

        return full_text