import os, re, io, csv, PyPDF2, fitz
import requests
from bs4 import BeautifulSoup

class ArxivCrawler:
    root = "https://arxiv.org"
    first_dir = {"list": r"/list/", "archive": r"/archive/", "year": r"/year/", "pdf": r"/pdf/", "abstract": r"/abs/"}
    category_dir = r"[a-z]+(?:-[a-z]+)?"
    sub_category_dir = r"[a-zA-Z]+(?:-[a-zA-Z]+)?"
    new_dir = r"/new"
    recent_dir = r"/recent"
    id_dir = r"\d{4}\.\d{4,5}"
    old_id_dir = r"\d{7}" # vor 2008
    year_pat = r"\d{2}$"
    entry_pat = r"\[ total of (\d{1,6}) entries:"

    ids_path = os.getcwd() + "/data_ingest/_data/ids/"
    dataset_path = os.getcwd() + "/data_ingest/_data/arxiv_dataset/"
    temp_path = os.getcwd() + "/data_ingest/_data/temp/"
    
    def __init__(self):
        self.main_categories = list()
        self.sub_categories = list()
        self.pdf_links = list()
        self.publications = list()
        self.arxiv_id = None
        self.id = 0

    def crawl_publications(self, csv_path):
        root = ArxivCrawler.root
        abstract_dir = ArxivCrawler.first_dir["abstract"]
        pdf_dir = ArxivCrawler.first_dir["pdf"]
        self.publications.append(["id", "src", "src_id", "doi", "url", "author", "title", "abstract", "full_text", "subm_time"])
        ids = self._read_ids_from_csv(csv_path)

        for id in ids:
            self.arxiv_id = id
            self.id += 1
            if self.id == 4: break
            try:
                self.response = requests.get(root+abstract_dir+id)
                if self.response.status_code == 200:
                    soup = BeautifulSoup(self.response.text, 'html.parser')
                    date = self._find_submission_date(soup)
                    doi = self._find_doi(soup)
                    url = "https://doi.org/"+doi if doi is not None else root+pdf_dir+id
                    author = self._find_author(soup)
                    title = self._find_title(soup)
                    abstract = self._find_abstract(soup)
                    full_text = self._crawl_pdf(root+pdf_dir+id)
                    self.publications.append([self.id, root, self.arxiv_id, doi, url, author, title, abstract, full_text, date])
                else:
                    print(f"- failed to retrieve the web page. Status code: {self.response.status_code}")
            except ConnectionResetError as e:
                print(f"- failed to retrieve data. Error: {e.args}")
            except requests.exceptions.ConnectionError as e:
                print(f"- failed to retrieve data. Error: {e.args}")
        
        csv_pat = r"\d{4}.csv$"
        match = re.search(csv_pat, csv_path)
        self._write_to_csv(ArxivCrawler.dataset_path+match.group(), self.publications)
        return True

    
    def _find_doi(self, soup):
        doi_pat = r"https://doi.org/"
        doi = None
        a_tags = soup.find_all('a')
        for a in a_tags:
            href = a.get('href')
            if href is not None and re.match(r"^"+doi_pat, href):
                doi = href.replace(doi_pat, "")
        return doi
    
    def _find_author(self, soup):
        author_pat = r"authors"
        authors = ""
        div_tags = soup.find_all('div')
        for div in div_tags:
            class_att = div.get('class')
            if class_att is not None and re.match(r"^"+author_pat, class_att[0]):
                a_tags = div.find_all('a')
                for a in a_tags:
                    authors += a.text + ", "
                authors = authors[:-2]
        return authors
    
    def _find_title(self, soup):
        title_pat = r"title"
        title = None
        h1_tags = soup.find_all('h1')
        for h1 in h1_tags:
            class_att = h1.get('class')
            if class_att is not None and re.match(r"^"+title_pat, class_att[0]):
                title = h1.text
                title = title.replace("Title:", "")
        return title

    def _find_abstract(self, soup):
        abstract_pat = r"abstract"
        abstract = None
        bq_tags = soup.find_all('blockquote')
        for bq in bq_tags:
            class_att = bq.get('class')
            if class_att is not None and re.match(r"^"+abstract_pat, class_att[0]):
                abstract = bq.text
                abstract = abstract.replace("<br>", " ")
                abstract = abstract.replace("Abstract:", "")
                abstract = abstract.strip()
                abstract = abstract.replace("\n", " ")
        return abstract
    
    def _find_submission_date(self, soup):
        date_pat = r"([A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]+ \d{4} \d{2}:\d{2}:\d{2} UTC)"
        date = None
        div_tags = soup.find_all('div')
        for div in div_tags:
            class_att = div.get('class')
            if class_att is not None and re.match(r"^submission-history", class_att[0]):
                match = re.search(date_pat, div.text)
                date = match.group()
        return date
    
    def _crawl_pdf(self, url):
        pdf_path = ArxivCrawler.temp_path+'downloaded.pdf'
        full_text = b""
        try:
            self.response = requests.get(url)

            if self.response.status_code == 200:
                full_text = self.response.content
                '''
                with open(pdf_path, 'wb') as pdf_file:
                    pdf_content = self.response.content #io.BytesIO(self.response.content)
                    pdf_file.write(pdf_content)
                
                pdf_document = fitz.open(pdf_path)
                outline = pdf_document.outline # wie iterieren
                title_list = list()
                section_list = list()
                word_count = 0
                font_sizes = list()
                current_page = list()
            
                for page_num in range(pdf_document.page_count):
                    page = pdf_document[page_num]
                    blocks = page.get_text("blocks")
                    words = page.get_text("words")
                    word_count += len(words)
                    dict = page.get_text("dict")

                    last_font_size = None
                    current_font_size = None
                    last_block = list()
                    last_is_title = False

                    for block in dict["blocks"]:
                        current_block = ""
                        if block.get("lines") is not None:
                            for line in block["lines"]:
                                spans = line["spans"][0]
                                current_font_size = spans["size"]
                                if not current_font_size in font_sizes:
                                    font_sizes.append(current_font_size)
                                    font_sizes.sort()
                                text_line = spans["text"]

                                current_block += text_line + "\n"

                            current_page.append((current_font_size, current_block.strip()))
                '''
            else:
                print(f"- failed to retrieve the pdf. Status code: {self.response.status_code}")
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        return full_text
    
    def crawl_ids(self, year, months:list=None, main_cat=None):
        list_dir = ArxivCrawler.first_dir["list"]
        pdf_dir = ArxivCrawler.first_dir["pdf"]
        if year >= 2008:
            id_dir = ArxivCrawler.id_dir
        else:
            id_dir = ArxivCrawler.old_id_dir
        cat_list = list()

        if months is None:
            months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]

        if main_cat is None:
            cat_list = self._crawl_main_categories()
        else: 
            cat_list.append(main_cat)
        
        for cat in cat_list:
            if not self._valid_year(year, cat):
                continue

            current_cat_links = list()
            for month in months:
                match = re.search(ArxivCrawler.year_pat, str(year))
                url = ArxivCrawler.root + list_dir + cat + "/" + match.group() + month
                print("- crawling ids for " + str(year) + "." + str(month) + " in the '" + cat + "' category ...")
                current_month_links = list()
                try:
                    self.response = requests.get(url)
            
                    if self.response.status_code == 200:
                        soup = BeautifulSoup(self.response.text, 'html.parser')
                        # find entry number
                        small_tag = soup.find('small')
                        if small_tag is not None:
                            small_str = small_tag.text
                            if re.match(ArxivCrawler.entry_pat, small_str):
                                small_str = small_str.replace("[ total of ", "")
                                match = re.search(r"^\d{1,6}", small_str)
                                id_count = int(match.group())
                                print("-- found " + str(id_count) + " ids.")

                                if id_count > 25:
                                    self.response = requests.get(url + "?show=" + str(id_count))
                                    soup = BeautifulSoup(self.response.text, 'html.parser')
                        else:
                            print("-- found " + str(0) + " ids.") 
                            continue
                        
                        a_tags = soup.find_all('a')
                        for a in a_tags:
                            href = a.get('href')
                            if href is not None and re.match(pdf_dir, href):
                                match = re.search(id_dir+r"$", href)
                                if match is not None:
                                    current_month_links.append(match.group())
                        current_cat_links.extend(current_month_links)
                        current_cat_links = list(set(current_cat_links))
                    else:
                        print(f"-- failed to retrieve the web page. Status code: {self.response.status_code}")
                except ConnectionResetError as e:
                    print(f"- failed to retrieve data. Error: {e.args}")
                except requests.exceptions.ConnectionError as e:
                    print(f"- failed to retrieve data. Error: {e.args}")

            self.pdf_links.extend(current_cat_links)
        
        self.pdf_links = list(set(self.pdf_links))
        path = ArxivCrawler.ids_path + str(year)
        if months is None:
            path += "_"
            for month in months:
                path += month
        if main_cat is not None:
            path += "_" + main_cat
        path += ".csv"
        self._write_to_csv(path, self.pdf_links, True)
        return self.pdf_links
    
    def crawl_new(self, main_cat=None):
        first_dir = ArxivCrawler.first_dir
        new_dir = ArxivCrawler.new_dir
        pdf_dir =  ArxivCrawler.first_dir["pdf"]
        id_dir = ArxivCrawler.id_dir
        cat_list = list()
        if main_cat is None:
            cat_list = self._crawl_main_categories()
        else: 
            cat_list.append(main_cat)
        
        for cat in cat_list:
            url = ArxivCrawler.root + first_dir["list"] + cat + new_dir
            
            try:
                self.response = requests.get(url)
            
                if self.response.status_code == 200:
                    soup = BeautifulSoup(self.response.text, 'html.parser')
                    a_tags = soup.find_all('a')

                    for a in a_tags:
                        href = a.get('href')
                        if href is not None and re.match(pdf_dir, href):
                            match = re.search(id_dir+r"$", href)
                            if match is not None:
                                self.pdf_links.append(match.group())
                else:
                    print(f"- failed to retrieve the web page. Status code: {self.response.status_code}")
            except ConnectionResetError as e:
                print(f"- failed to retrieve data. Error: {e.args}\n")
            except requests.exceptions.ConnectionError as e:
                print(f"- failed to retrieve data. Error: {e.args}\n")
        
        self.pdf_links = list(set(self.pdf_links))
        return self.pdf_links
    
    def crawl_recent(self, main_cat=None): # nimmt immer nur die ersten 25 weil nur 25 angezeigt werden
        first_dir = ArxivCrawler.first_dir
        recent_dir = ArxivCrawler.recent_dir
        pdf_dir = ArxivCrawler.first_dir["pdf"]
        id_dir = ArxivCrawler.id_dir
        cat_list = list()
        if main_cat is None:
            cat_list = self._crawl_main_categories()
        else: 
            cat_list.append(main_cat)
        
        for cat in cat_list:
            url = ArxivCrawler.root + first_dir["list"] + cat + recent_dir

            try:
                self.response = requests.get(url)
            
                if self.response.status_code == 200:
                    soup = BeautifulSoup(self.response.text, 'html.parser')
                    a_tags = soup.find_all('a')

                    for a in a_tags:
                        href = a.get('href')
                        if href is not None and re.match(pdf_dir, href):
                            match = re.search(id_dir+r"$", href)
                            if match is not None:
                                self.pdf_links.append(match.group())
                else:
                    print(f"Failed to retrieve the web page. Status code: {self.response.status_code}")
            except ConnectionResetError as e:
                print(f"- failed to retrieve data. Error: {e.args}\n")
            except requests.exceptions.ConnectionError as e:
                print(f"- failed to retrieve data. Error: {e.args}\n")
        
        self.pdf_links = list(set(self.pdf_links))
        return self.pdf_links
    
    def _crawl_main_categories(self):
        print("crawling '" + ArxivCrawler.root + "' for categories ...")

        try:
            self.response = requests.get(ArxivCrawler.root)
            first_dir = ArxivCrawler.first_dir
            category_dir = ArxivCrawler.category_dir
            
            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                a_tags = soup.find_all('a')

                for a in a_tags:
                    href = a.get('href')
                    if href is not None and re.match(first_dir["list"], href):
                        href = href.replace(first_dir["list"], "")
                        match = re.search(r"^" + category_dir, href)
                        self.main_categories.append(match.group())
            else:
                print(f"- failed to retrieve the web page. Status code: {self.response.status_code}")
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        
        self.main_categories = list(set(self.main_categories))
        self.main_categories.sort()
        print("- found " + str(len(self.main_categories)) + " categories: " + str(self.main_categories))
        return self.main_categories
    
    def _crawl_sub_categories(self, main_cat=None):
        try:
            self.response = requests.get(ArxivCrawler.root)
            first_dir = ArxivCrawler.first_dir
            category_dir = ArxivCrawler.category_dir if main_cat is None else main_cat
            sub_category_dir = ArxivCrawler.sub_category_dir
            
            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                a_tags = soup.find_all('a')

                for a in a_tags:
                    href = a.get('href')
                    if href is not None and re.match(first_dir["list"], href):
                        href = href.replace(first_dir["list"], "")
                        match = re.search(r"^" + category_dir + r"\." + sub_category_dir, href)
                        if match is not None:
                            self.sub_categories.append(match.group())
            else:
                print(f"- failed to retrieve the web page. Status code: {self.response.status_code}")
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}")
        
        self.sub_categories = list(set(self.sub_categories))
        return self.sub_categories
    
    def _valid_year(self, year, cat):
        match = re.search(ArxivCrawler.year_pat, str(year))
        url = ArxivCrawler.root + ArxivCrawler.first_dir["year"] + cat + "/" + match.group()
        print("checking if year " + str(year) + " exists in '" + cat + "' category ...")
        try:
            self.response = requests.get(url)
            
            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                title_tags = soup.find_all('title')
                for title in title_tags:
                    if "ERROR" in title.string:
                        print("- year " + str(year) + " DOES NOT exist in the '" + cat + "' category. skipping '" + cat + "' ...")
                        return False
        except ConnectionResetError as e:
            print(f"- failed to retrieve data. Error: {e.args}\n")
        except requests.exceptions.ConnectionError as e:
            print(f"- failed to retrieve data. Error: {e.args}\n")
        
        print("- year " + str(year) + " DOES exist in the '" + cat + "' category. crawling '" + cat + "' ...")
        return True
    
    def _write_to_csv(self, filepath, data, is_id=False):
        print("writing " + str(len(data)) + " entries to '" + filepath + "' ...")
        if is_id:
            data.sort()
        with open(filepath, 'w', newline='') as file:
            writer = csv.writer(file)
            for row in data:
                if is_id:
                    writer.writerow([row])
                else:
                    writer.writerow(row)
        return True
    
    def _read_ids_from_csv(self, csv_path):
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
    
    def clean_duplicates(self, csv_path):
        print("cleaning '" + csv_path + "' from duplicates ...")
        id_list = list()
        with open(csv_path, 'r') as csv_file:
            csv_reader = csv.reader(csv_file)
            for row in csv_reader:
                id = row[0]
                id_list.append(id)
        pre_len = len(id_list)
        id_list = list(set(id_list))
        id_list.sort()
        post_len = len(id_list)
        print("- found '" + str(pre_len) + "' entries.")
        print("- removed '" + str(pre_len-post_len) + "' duplicates.")
        #print("writing " + str(post_len) + " ids to '" + csv_path + "' ...")
        self._write_to_csv(csv_path, id_list, True)
