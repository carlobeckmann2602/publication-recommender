import csv, re
from dataclasses import dataclass
from crawler import ArxivCrawler, PdfCrawler

@dataclass
class ArxivConfig:
    # recent submissions
    output_file_recent = "recent_papers.csv"
    dir_recent         = r"^/list/[a-z]+(?:-[a-z]+)?/recent$" # have pattern /list/<category>/recent -> recent submissions of current week (mo-fr)
    dir_past_week      = r"^/list/[a-z]+(?:-[a-z]+)?/pastweek#item\d+$" # have pattern pastweek#item[1:x] -> recent submissions of current week (mo-fr) <a name="itemX">
    # new submissions, cross-lists and replacements
    output_file_new    = "new_papers.csv"
    dir_new            = r"^/list/[a-z]+(?:-[a-z]+)?/new$" # have pattern /list/<category>/new -> new submissions, cross-lists and replacements
    dir_type           = r"^/list/[a-z]+(?:-[a-z]+)?/new#item\d+$" # index has to be crawled to determine which submission type is listed

if __name__ == '__main__':
    arxiv_crawler = ArxivCrawler()
    #arxiv_crawler.crawl_target_dir_pdf_links(ArxivConfig.dir_new, ArxivConfig.output_file_new)
    #arxiv_crawler.crawl_target_dir_pdf_links(ArxivConfig.dir_recent, ArxivConfig.output_file_recent)
    
    pdf_crawler = PdfCrawler()
    file_path = "/home/julian/devel/publikationsempfehlung/data_ingest/_data/urls/recent_papers.csv"
    id_pattern = r"\d{4}\.\d{5}$"
    with open(file_path, 'r', newline='') as file:
        csv_reader = csv.reader(file)
        for row in csv_reader:
            pdf_link = row[0]
            
            id_part = re.search(id_pattern, pdf_link)
            if id_part:
                file_id = id_part.group()
            
                if pdf_crawler.pull(url=pdf_link, filename=file_id):
                    pdf_crawler.read()
                    #pdf_crawler.delete()