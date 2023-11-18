import os, re, io, csv, PyPDF2, fitz
import requests
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import urllib.request as libreq

class ArxivApiCrawler:
    root = "http://export.arxiv.org/api/" #{method_name}?{parameters}

    dataset_path = os.getcwd() + "/data_ingest/_data/arxiv_dataset/"
    temp_path = os.getcwd() + "/data_ingest/_data/temp/"
    
    def __init__(self):
        self.main_categories = list()
        self.sub_categories = list()
        self.pdf_links = list()
        self.publications = list()
        self.arxiv_id = None
        self.id = None

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
                        self.id = arxiv_id
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
                        full_text = self._crawl_pdf(pdf_url)
                        self.publications.append([self.arxiv_id, "https://arxiv.org/", pub_date, upd_date, title, abstract, author, doi, pdf_url, category, full_text])
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
    
    def _crawl_pdf(self, url):
        pdf_path = ArxivApiCrawler.temp_path+'downloaded.pdf'
        word_len_threshold = 25
        full_text = b""
        font_size_counter = {}
        try:
            self.response = requests.get(url)

            if self.response.status_code == 200:
                full_text = self.response.content
                '''
                with open(pdf_path, 'wb') as pdf_file:
                    pdf_content = self.response.content 
                    pdf_file.write(pdf_content)
                
                pdf_document = fitz.open(pdf_path)
                word_count = 0
                current_pdf = list()
            
                for page_num in range(pdf_document.page_count):
                    current_page = list()
                    page = pdf_document[page_num]
                    words = page.get_text("words")
                    word_count += len(words)
                    dict = page.get_text("dict")

                    for block in dict["blocks"]:
                        current_block = ""
                        if block.get("lines") is not None:
                            for line in block["lines"]:
                                spans = line["spans"]
                                font_size = spans[0]["size"]
                                text_line = ""
                                for span in spans:
                                    text_line += span["text"]
                                
                                if font_size_counter.get(str(font_size)) is None:
                                    font_size_counter.update({str(font_size): 1}) 
                                else:
                                    counter = font_size_counter.get(str(font_size))
                                    counter += 1
                                    font_size_counter.update({str(font_size): counter}) 

                                current_block += text_line + "\n"
                            
                            current_block = current_block.strip()
                            current_block = current_block.replace("\n", " ")
                            #if len(current_block) > word_len_threshold:
                            current_page.append((font_size, current_block.strip()))

                    current_pdf.extend(current_page)
                '''
            else:
                print(f"- failed to retrieve the pdf. Status code: {self.response.status_code}")
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}")

        '''
        fs = (0, 0)
        for x, y in font_size_counter.items():
            if y > fs[1]:
                fs = (float(x),y)

        current_pdf = [(num, text) for num, text in current_pdf if num >= fs[0]]
        current_pdf = [(num, text) for num, text in current_pdf if num < 20]
        current_pdf = [(num, text) for num, text in current_pdf if (num == fs[0] and len(text) > word_len_threshold) or num > fs[0]]
        '''
        return full_text
    
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

