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
    #arxiv_crawler.crawl_target_dir_pdf_links(r_new_dir, new_csv_name)
    #arxiv_crawler.crawl_target_dir_pdf_links(ArxivConfig.dir_recent, ArxivConfig.output_file_recent)

    pdf_crawler = PdfCrawler()
    if pdf_crawler.pull(url="https://arxiv.org/pdf/2310.10764", filename="2310.10764"):
        pdf_crawler.read()
        #pdf_crawler.delete()