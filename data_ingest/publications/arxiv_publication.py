from publications import Publication

class ArxivPublication(Publication):
    def __init__(self, arxiv_id:str, title:str, authors:list, src:str, url:str, pub_date:str, upd_date:str=None, doi:list=None, abstract:str=None, vector_dict=None, category:str=None):
        super().__init__(title, authors, src, url, pub_date, upd_date, doi, abstract, vector_dict)
        self.arxiv_id:str = arxiv_id
        self.category:str = category