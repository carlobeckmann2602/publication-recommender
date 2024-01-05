import re, csv, requests, json, datetime
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import urllib.request as libreq
import urllib, urllib.request
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError

from publications import ArxivPublication
from db import DatabaseApi
from .pdf_scraper import PdfScraper

class ArxivApiScraper:
    root = "https://export.arxiv.org/api/" #{method_name}?{parameters}
    temp_path = "/scraper/data/temp/"
    dataset_path = "/scraper/data/arxiv_dataset/"
    id_patterns = {"current": r"\d{4}\.\d{4,5}","old": r"[a-z]+(?:-[a-z]+)?\/\d{7}"}
    interval = 3
    
    def __init__(self):
        self.pdf_scraper = PdfScraper(ArxivApiScraper.temp_path)
        self.db_api = DatabaseApi()

    def run(self):
        print("ArxivApiScraper.run()")

        pub_count = int(self.db_api.get_arxiv_pub_count())
        
        id_max = None
        id_min = None
        if pub_count > 0:
            id_max = self.db_api.get_oldest_arxiv_pub() 
            if id_max is not None:
                yy_max = int(id_max[:2])
                mm_max = int(id_max[2:4])
                id_max_num = int(id_max[5:])
                #print("--- id_max: " + str(id_max) + " -> YY:" + str(yy_max)+", MM: "+str(mm_max)+", NUM: " + str(id_max_num))
            #id_min = self.db_api.get_oldest_arxiv_pub() # müsste in db 2312.06793 sein am 2023-12-11
            #if id_min is not None:
            #    yy_min = int(id_min[:2])
            #    mm_min = int(id_min[2:4])
            #    id_min_num = int(id_min[5:])

        # get newer publications
        id_new = self.scrape_newest_id() # '2311.17055'
        if id_new is not None:
            yy_new = int(id_new[:2])
            mm_new = int(id_new[2:4])
            id_new_num = int(id_new[5:])
            #print("--- id_new: " + str(id_new) + " -> YY:" + str(yy_new)+", MM: "+str(mm_new)+", NUM: " + str(id_new_num))
        else:
            return

        if id_max is not None and id_new is not None:
            if id_max != id_new:
                # get distance from newest id
                if yy_max == yy_new and mm_max == mm_new:
                    distance = id_new_num - id_max_num
                    self.scrape_publications(start_at=0, max_results=distance, descending=True)
                else:
                    self.scrape_publications(start_at=0, max_results=ArxivApiScraper.interval, descending=True)

        # get the next x publications after publication count in db
        print("--- pub_count: " + str(pub_count) + ", interval: " + str(ArxivApiScraper.interval))
        self.scrape_publications(start_at=pub_count, max_results=ArxivApiScraper.interval, descending=True)
    
    def scrape_by_id_list(self, id_list, block_size):
        root = ArxivApiScraper.root
        method = "query"
        api_url = root+method+"?id_list=" # https://export.arxiv.org/api/query?id_list=
        
        pub_list = list()
        url = api_url 
        for id in id_list:
            url += id + ","
        url = url[:-1]
        url += "&max_results="+str(block_size)
        #print(url)
        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        try:
            with libreq.urlopen(url) as self.response:
                if self.response.status == 200:
                    content = self.response.read().decode('utf-8')
                    #print(content)
                    xml_root = ET.fromstring(content)
                    entry_list = xml_root.findall(xml_tag_prefix+'entry')
                    print("-- collecting " + str(len(entry_list)) + " api metadata entries ...")
                    for entry in entry_list:
                        # find arxiv id
                        arxiv_id = entry.find(xml_tag_prefix+'id').text
                        arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
                        if "v" in arxiv_id:
                            arxiv_id = arxiv_id[:-2]
                        print("--- collect api metadata of publication id '" + str(arxiv_id) + "' ...")
                        # find published and updated timestamps
                        pub_date_str = entry.find(xml_tag_prefix+'published').text
                        #pub_date = datetime.datetime.strptime(pub_date_str,"%Y-%m-%dT%H:%M:%SZ") #2023-11-29T18:57:18Z
                        upd_date_str = entry.find(xml_tag_prefix+'updated').text
                        #upd_date = datetime.datetime.strptime(upd_date_str,"%Y-%m-%dT%H:%M:%SZ") #2023-11-29T18:57:18Z
                        # find title
                        title = entry.find(xml_tag_prefix+'title').text
                        title = self.clean(title)
                        # find abstract
                        abstract = entry.find(xml_tag_prefix+'summary').text
                        abstract = self.clean(abstract)
                        # find author/s
                        authors = list()
                        for author_tag in entry.findall(xml_tag_prefix+'author'):
                            authors.append(author_tag.find(xml_tag_prefix+'name').text)
                        # find pdf link and doi link
                        dois = list()
                        doi_1 = "10.48550/arXiv."+arxiv_id
                        dois.append(doi_1)
                        for link_tag in entry.findall(xml_tag_prefix+'link'):
                            if link_tag.get('title') is not None:
                                if "pdf" in link_tag.get('title'):
                                    pdf_url = link_tag.get('href')
                                elif "doi" in link_tag.get('title'):
                                    doi_url = link_tag.get('href')
                                    doi_2 = doi_url.replace("http://dx.doi.org/", "")
                                    dois.append(doi_2)
                            
                        pub = ArxivPublication(
                            arxiv_id=arxiv_id, 
                            title=title, 
                            authors=authors, 
                            src="ARXIV",
                            url=pdf_url,
                            pub_date=pub_date_str,
                            upd_date=upd_date_str,
                            doi=dois,
                            abstract=abstract,
                            vector_dict=None
                        )
                        pub_list.append(pub)
                else:
                    print(f"-- failed to retrieve data. status code: {self.response.status}")
                    return pub_list
        except ConnectionResetError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return pub_list
        except requests.exceptions.ConnectionError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return pub_list
        return pub_list
    
    def scrape_newest_id(self):
        root = ArxivApiScraper.root
        method = "query"
        search_query = "all"
        sort_by = "submittedDate"
        sort_order = "descending" 
        url = root+method+"?search_query="+search_query+"&sortBy="+sort_by+"&sortOrder="+sort_order+"&start="+str(0)+"&max_results="+str(1)
        print("- scraping arxiv api for newest arxiv publication ...")

        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        arxiv_id = None
        pub_date = None
        try:
            with urllib.request.urlopen(url) as self.response:
                if self.response.status == 200:
                    content = self.response.read().decode('utf-8')
                    xml_root = ET.fromstring(content)
                    for entry in xml_root.findall(xml_tag_prefix+'entry'):
                        # find arxiv id
                        arxiv_id = entry.find(xml_tag_prefix+'id').text
                        arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
                        if "v" in arxiv_id:
                            arxiv_id = arxiv_id[:-2]
                        # find published and updated timestamps
                        pub_date = entry.find(xml_tag_prefix+'published').text
                else:
                    print(f"-- failed to retrieve data. status code: {self.response.status}")
        except ConnectionResetError as e:
            print(f"-- failed to retrieve data. error: {e.args}")
            return arxiv_id
        except requests.exceptions.ConnectionError as e:
            print(f"-- failed to retrieve data. error: {e.args}")
            return arxiv_id
        print("-- found arxiv id " + str(arxiv_id) + ", published " + str(pub_date)+".")
        return arxiv_id

    def scrape_publications(self, start_at, max_results, descending=True, csv_path=None):
        pub_list = list()
        root = ArxivApiScraper.root
        method = "query"
        search_query = "all"
        sort_by = "submittedDate"
        sort_order = "descending" if descending else "ascending"
        url = root+method+"?search_query="+search_query+"&sortBy="+sort_by+"&sortOrder="+sort_order+"&start="+str(start_at)+"&max_results="+str(max_results)
        if descending:
            print("- scraping '" + root + "' for newest " + str(max_results) + " publications at distance " + str(start_at) + " from newest (0) ...")
        else:
            print("- scraping '" + root + "' for oldest " + str(max_results) + " publications at distance " + str(start_at) + " from oldest (0) ...")
        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        arxiv_id = None
        try:
            with libreq.urlopen(url) as self.response:
                if self.response.status == 200:
                    content = self.response.read()
                    xml_root = ET.fromstring(content)
                    for entry in xml_root.findall(xml_tag_prefix+'entry'):
                        # find arxiv id
                        arxiv_id = entry.find(xml_tag_prefix+'id').text
                        arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
                        if "v" in arxiv_id:
                            arxiv_id = arxiv_id[:-2]
                        print("-- collect api metadata of publication id '" + str(arxiv_id) + "' ...")
                        # find published and updated timestamps
                        pub_date_str = entry.find(xml_tag_prefix+'published').text
                        pub_date = datetime.datetime.strptime(pub_date_str,"%Y-%m-%dT%H:%M:%SZ") #2023-11-29T18:57:18Z
                        upd_date_str = entry.find(xml_tag_prefix+'updated').text
                        upd_date = datetime.datetime.strptime(upd_date_str,"%Y-%m-%dT%H:%M:%SZ") #2023-11-29T18:57:18Z
                        # find title
                        title = entry.find(xml_tag_prefix+'title').text
                        title = self.clean(title)
                        # find abstract
                        abstract = entry.find(xml_tag_prefix+'summary').text
                        abstract = self.clean(abstract)
                        # find author/s
                        authors = list()
                        for author_tag in entry.findall(xml_tag_prefix+'author'):
                            authors.append(author_tag.find(xml_tag_prefix+'name').text)
                        # find pdf link and doi link
                        dois = list()
                        doi_1 = "10.48550/arXiv."+arxiv_id
                        dois.append(doi_1)
                        for link_tag in entry.findall(xml_tag_prefix+'link'):
                            if link_tag.get('title') is not None:
                                if "pdf" in link_tag.get('title'):
                                    pdf_url = link_tag.get('href')
                                elif "doi" in link_tag.get('title'):
                                    doi_url = link_tag.get('href')
                                    doi_2 = doi_url.replace("http://dx.doi.org/", "")
                                    dois.append(doi_2)
                        # find arxiv categories
                        #category = ""
                        #for category_tag in entry.findall(xml_tag_prefix+'category'):
                        #    category += category_tag.get('term') + ", "
                        #category = category[:-2]

                        # check if publication is alread in database
                        if not self.db_api.get_arxiv_pub_by_id(arxiv_id):

                            # scrape pdf contents and calculate vectors
                            print("- collect pdf content of publication id '" + str(arxiv_id) + "' ...")
                            pdf_content = self.pdf_scraper.read_pdf(pdf_url, arxiv_id)
                            if pdf_content is None:
                                continue
                            
                            # calculate vectors with ai backend
                            print("- calculate vectors for publication id '" + str(arxiv_id) + "' ...")
                            vector_dict = None
                            
                            file_param = {"file": open("/scraper/data/temp/"+arxiv_id+".txt", "rb")}
                            res_ai_api = requests.post("http://ai_backend:8000/summarize?tokenize=true&amount=5", files=file_param)
                            if res_ai_api.status_code == 200:
                                vector_dict = json.loads(res_ai_api.text)
                                #print("-- response: "+str(vector_dict["0"]["token"]))
                            else:
                                print("-- vector calculation for publication id '" + str(arxiv_id) + "' failed.")
                                continue
                            
                            pub = ArxivPublication(
                                arxiv_id=arxiv_id, 
                                title=title, 
                                authors=authors, 
                                src="ARXIV",
                                url=pdf_url,
                                pub_date=pub_date_str,
                                upd_date=upd_date_str,
                                doi=dois,
                                abstract=abstract,
                                vector_dict=vector_dict
                                #category=category
                            )
                            pub_list.append(pub)
                            self.pdf_scraper.delete()

                            self.db_api.add_arxiv_pub(pub)
                else:
                    print(f"-- failed to retrieve data. status code: {self.response.status}")
                    return False
        except ConnectionResetError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return False
        except requests.exceptions.ConnectionError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return False
        return True
    
    def clean(self, text):
        text = text.strip()
        text = text.replace("\n", " ")
        text = text.replace('´´', '"')
        text = text.replace('``', '"')
        text = text.replace("\'\'", '"')
        text = re.sub(' +', ' ', text)
        text = re.sub(r'\\x[0-9a-fA-F]{2}', ' ', text)
        return text

    def scrape_doi(self, url):
        doi = None
        try:
            self.response = requests.get(url)
            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                doi_pat = r"https://doi.org/"
                a_tags = soup.find_all('a')
                for a in a_tags:
                    href = a.get('href')
                    if href is not None and re.match(r"^"+doi_pat, href):
                        doi = href.replace(doi_pat, "")
            else:
                print(f"- failed to retrieve the doi. status code: {self.response.status_code}")
                return doi
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. error: {e.args}")
            return doi
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. error: {e.args}")
            return doi
        return doi

    def write_csv(self, csv_path, pub_list):
        print("writing " + str(len(pub_list)) + " entries to '" + csv_path + "' ...")
        with open(csv_path, 'a', newline='') as file:
            writer = csv.writer(file)
            for pub in pub_list:
                writer.writerow([pub.arxiv_id, pub.title, pub.authors, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract, pub.vector_dict])
        return True
    
    def read_csv(self, csv_path):
        print("- reading ids from '" + csv_path + "' ...")
        id_list = list()
        with open(csv_path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                id = row[0]
                id_list.append(id)
        id_list = list(set(id_list))
        id_list.sort()
        print("-- found '" + str(len(id_list)) + "' ids.")
        return id_list