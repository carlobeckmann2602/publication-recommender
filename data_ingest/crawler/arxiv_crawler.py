import os, re, csv
import requests
from bs4 import BeautifulSoup

class ArxivCrawler:
    url = "https://arxiv.org"
    output_path = os.getcwd() + "/data_ingest/_data/urls/"
    r_pdf_dir = r"^/pdf/\d{4}\.\d{5}$" # have pattern /pdf/XXXX.XXXXX where X describes a number 0-9 
    
    def __init__(self):
        self.pdf_links = list()
    
    def crawl_target_dir_pdf_links(self, target_dir, filename):
        dir_links = self._crawl_new_dir_links(target_dir)
        if len(dir_links) > 0:
            self.pdf_links = self._crawl_pdf_links(dir_links)
        if len(self.pdf_links) > 0:
            filepath = ArxivCrawler.output_path + filename
            ret = self._write_to_csv(filepath, self.pdf_links)
            if ret:
                print("Data successfully written to '" + filepath + "'")
    
    def _crawl_new_dir_links(self, target_dir):
        if "new" in target_dir:
            target = "new"
        elif "recent" in target_dir:
            target = "recent"
        print("Crawling for " + target + " papers in all categories ...")
        
        dir_links = list()
        self.response = requests.get(ArxivCrawler.url)
        
        if self.response.status_code == 200:
            soup = BeautifulSoup(self.response.text, 'html.parser')
            a_tags = soup.find_all('a')

            for a in a_tags:
                link = a.get('href')
                if link is not None and re.match(target_dir, link):
                        dir_links.append(ArxivCrawler.url + link)
        else:
            print(f"Failed to retrieve the web page. Status code: {self.response.status_code}")
        
        return dir_links
    
    def _crawl_pdf_links(self, dir_links):
        print("Crawling for pdf links ...")
        pdf_links = list()
        for url in dir_links:
            self.response = requests.get(url)

            if self.response.status_code == 200:
                soup = BeautifulSoup(self.response.text, 'html.parser')
                a_tags = soup.find_all('a')

                for a in a_tags:
                    link = a.get('href')
                    if link is not None and re.match(ArxivCrawler.r_pdf_dir, link):
                        pdf_links.append(ArxivCrawler.url + link)
            else:
                print(f"Failed to retrieve the web page. Status code: {self.response.status_code}")
        return pdf_links
    
    def _write_to_csv(self, filepath, links):
        print("Writing " + str(len(links)) + " links to '" + filepath + "' ...")
        with open(filepath, 'w', newline='') as file:
            writer = csv.writer(file)
            for link in links:
                writer.writerow([link])
        return True
