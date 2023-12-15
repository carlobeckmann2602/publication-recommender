class Publication:
    def __init__(self, title:str, authors:str, src:str, url:str, pub_date:str, upd_date:str=None, doi:str=None, abstract:str=None, vector_dict=None):
        self.src:str = src
        self.pub_date:str = pub_date
        self.upd_date:str = upd_date
        self.title:str = title
        self.abstract = abstract
        self.authors:list = authors
        self.doi:str = doi
        self.url:str = url
        self.vector_dict = vector_dict