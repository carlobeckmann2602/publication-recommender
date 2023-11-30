from publications import Publication

class ArxivPublication(Publication):
    def __init__(self, id, arxiv_id:str, title:str, author:str, src:str, url:str, pub_date:str, upd_date:str=None, doi:str=None, abstract:str=None, vector_data=None, category:str=None):
        super().__init__(id, title, author, src, url, pub_date, upd_date, doi, abstract, vector_data)
        self.arxiv_id:str = arxiv_id
        self.category:str = category