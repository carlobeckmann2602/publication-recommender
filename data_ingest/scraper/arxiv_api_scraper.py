import re, csv, requests, json
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import urllib.request as libreq

from publications import ArxivPublication
from .pdf_scraper import PdfScraper

class ArxivApiScraper:
    root = "http://export.arxiv.org/api/" #{method_name}?{parameters}
    temp_path = "/scraper/data/temp/"
    dataset_path = "/scraper/data/arxiv_dataset/"
    id_patterns = {"current": r"\d{4}\.\d{4,5}","old": r"[a-z]+(?:-[a-z]+)?\/\d{7}"}
    interval = 10
    
    def __init__(self):
        self.pdf_scraper = PdfScraper(ArxivApiScraper.temp_path)

    def run(self):
        print("ArxivApiScraper.run()")
        update_list = list()
        
        # TODO: get publication ids in database
        id_list = self.get_db_entries() # TODO
        id_max = None
        id_min = None

        # TODO: unterschiedliches id pattern beachten bei alten und neuen ids??
        id_patterns = ArxivApiScraper.id_patterns
        id_max_is_old = False
        id_min_is_old = False
        
        # get newest and oldest ids
        if len(id_list) > 0:
            id_list.sort() # TODO: richtige sortierung beachten bei alten und neuen ids??
            id_max = id_list[-1]
            id_min = id_list[0]
            # find gaps?
        
        # TODO: unterschiedliches id pattern beachten bei alten und neuen ids??
        if id_max is not None:
            yy_max = int(id_max[:2])
            mm_max = int(id_max[2:4])
            id_max_num = int(id_max[5:])
            #match_current = re.search(id_patterns["current"], id_max)
            #if bool(match_current):
            #match_old = re.search(id_patterns["current"], id_max)
        if id_min is not None:
            yy_min = int(id_min[:2])
            mm_min = int(id_min[2:4])
            id_min_num = int(id_min[5:])
            #match_current = re.search(id_patterns["current"], id_min)
            #match_old = re.search(id_patterns["current"], id_min)

        # get newer publications
        id_new = self.scrape_newest_id() # '2311.17055'
        if id_new is not None:
            yy_new = int(id_new[:2])
            mm_new = int(id_new[2:4])
            id_new_num = int(id_new[5:])
        else:
            return

        if id_max is not None and id_new is not None:
            if id_max != id_new:
                # get distance from newest id
                if yy_max == yy_new and mm_max == mm_new:
                    distance = id_new_num - id_max_num
                    update_list += self.scrape_publications(start_at=0, max_results=distance, descending=True)
                else:
                    update_list += self.scrape_publications(start_at=0, max_results=ArxivApiScraper.interval, descending=True)

        # get the next x publications after publication count in db
        update_list += self.scrape_publications(start_at=len(id_list), max_results=ArxivApiScraper.interval, descending=True)
        
        # TODO: update database
        self.update_db_entries(update_list)
    
    def run_alt(self):
        # get publications in database
        # scrape x publications start at number of pub in database
        # for each publication
            # if in database skip
            # else create new entry
        pass
    
    # TODO
    def get_db_entries(self):
        #print("ArxivApiScraper.get_db_entries()")
        self.db_entries = self.read_csv(ArxivApiScraper.dataset_path+"publications.csv")
        return self.db_entries
    
    # TODO
    def update_db_entries(self, update_list):
        #print("ArxivApiScraper.update_db_entries(update_list)")
        return self.write_csv(ArxivApiScraper.dataset_path+"publications.csv", update_list)
    
    def scrape_newest_id(self):
        root = ArxivApiScraper.root
        method = "query"
        search_query = "all"
        sort_by = "submittedDate"
        sort_order = "descending" 
        url = root+method+"?search_query="+search_query+"&sortBy="+sort_by+"&sortOrder="+sort_order+"&start="+str(0)+"&max_results="+str(1)
        print("- scraping '" + root + "' for newest arxiv publication ...")

        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        arxiv_id = None
        try:
            with libreq.urlopen(url) as self.response:
                if self.response.status == 200:
                    content = self.response.read()
                    xml_root = ET.fromstring(content)
                    for entry in xml_root.findall(xml_tag_prefix+'entry'):
                        arxiv_id = entry.find(xml_tag_prefix+'id').text
                        arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
                        if "v" in arxiv_id:
                            arxiv_id = arxiv_id[:-2]
                else:
                    print(f"-- failed to retrieve data. status code: {self.response.status}")
                    return arxiv_id
        except ConnectionResetError as e:
            print(f"-- failed to retrieve data. error: {e.args}")
            return arxiv_id
        except requests.exceptions.ConnectionError as e:
            print(f"-- failed to retrieve data. error: {e.args}")
            return arxiv_id
        print("-- found newest publication with id '" + arxiv_id + "'.")
        return arxiv_id

    def scrape_publications(self, start_at=0, max_results=25, descending=True, csv_path=None):
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
                        pub_date = entry.find(xml_tag_prefix+'published').text
                        upd_date = entry.find(xml_tag_prefix+'updated').text
                        # find title
                        title = entry.find(xml_tag_prefix+'title').text.strip()
                        title = title.replace("\n", " ")
                        # find abstract
                        abstract = entry.find(xml_tag_prefix+'summary').text.strip()
                        abstract = abstract.replace("\n", " ")
                        # find author/s
                        author = ""
                        for author_tag in entry.findall(xml_tag_prefix+'author'):
                            author += author_tag.find(xml_tag_prefix+'name').text + ", "
                        author = author[:-2]
                        # find pdf link and doi link
                        doi = "10.48550/arXiv."+arxiv_id
                        for link_tag in entry.findall(xml_tag_prefix+'link'):
                            if link_tag.get('title') is not None:
                                if "pdf" in link_tag.get('title'):
                                    pdf_url = link_tag.get('href')
                                elif "doi" in link_tag.get('title'):
                                    doi_url = link_tag.get('href')
                                    doi_2 = doi_url.replace("http://dx.doi.org/", "")
                                    doi += ", "+doi_2
                        # find arxiv categories
                        #category = ""
                        #for category_tag in entry.findall(xml_tag_prefix+'category'):
                        #    category += category_tag.get('term') + ", "
                        #category = category[:-2]

                        # scrape pdf contents and calculate vectors
                        print("-- collect pdf content of publication id '" + str(arxiv_id) + "' ...")
                        pdf_content = self.read_pdf(pdf_url, arxiv_id)
                        if pdf_content is not None:
                            pdf_content = pdf_content.strip()
                            pdf_content = pdf_content.replace("\n", " ")
                        else:
                            return pub_list
                        
                        # calculate vectors with ai backend
                        print("-- calculate vectors for publication id '" + str(arxiv_id) + "' ...")
                        vector_dict = None
                        #'''
                        file_param = {"file": open("/scraper/data/temp/"+arxiv_id+".txt", "rb")}
                        res_ai_api = requests.post("http://ai_backend:8000/summarize?tokenize=true&amount=5", files=file_param)
                        if res_ai_api.status_code == 200:
                            vector_dict = json.loads(res_ai_api.text)
                            #print("-- response: "+str(vector_dict["0"]["token"]))
                        else:
                            print("-- vector calculation for publication id '" + str(arxiv_id) + "' failed.")
                            return pub_list
                        #'''
                        
                        pub = ArxivPublication(
                            arxiv_id=arxiv_id, 
                            title=title, 
                            author=author, 
                            src="https://arxiv.org/",
                            url=pdf_url,
                            pub_date=pub_date,
                            upd_date=upd_date,
                            doi=doi,
                            abstract=abstract,
                            vector_dict=vector_dict
                            #category=category
                        )
                        pub_list.append(pub)
                        self.pdf_scraper.delete()
                else:
                    print(f"-- failed to retrieve data. status code: {self.response.status}")
                    return pub_list
        except ConnectionResetError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return pub_list
        except requests.exceptions.ConnectionError as e:
                print(f"-- failed to retrieve data. error: {e.args}")
                return pub_list
        
        print("-- successfully collected and stored " + str(len(pub_list)) + " arxiv publications.")
        return pub_list

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
    
    def read_pdf(self, url, filename):
        if self.pdf_scraper.pull(url, filename):
            full_text = self.pdf_scraper.read()
        else: full_text = None

        return full_text

    def write_csv(self, csv_path, pub_list):
        print("writing " + str(len(pub_list)) + " entries to '" + csv_path + "' ...")
        with open(csv_path, 'a', newline='') as file:
            writer = csv.writer(file)
            for pub in pub_list:
                writer.writerow([pub.arxiv_id, pub.title, pub.author, pub.src, pub.url, pub.pub_date, pub.upd_date, pub.doi, pub.abstract, pub.vector_data])
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