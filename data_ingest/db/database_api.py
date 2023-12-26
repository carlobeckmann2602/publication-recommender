import re
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError

class DatabaseApi:
    def __init__(self):
        self.gql_transport = AIOHTTPTransport(url="http://nest:3000/graphql")
        self.gql_client = Client(transport=self.gql_transport, fetch_schema_from_transport=True)
    
    def get_arxiv_pub_count(self):
        query = gql("""
        query publicationCount {
            publicationCount(source: ARXIV)
        }
        """)
        try:
            print("- requesting db api for arxiv publication count ...")
            result = self.gql_client.execute(query)
            print("-- found " + str(result["publicationCount"]) + " entries.")
            return result["publicationCount"]
        except TransportQueryError as e:
            print(e)
            return None
    
    def get_arxiv_pub_by_id(self, arxiv_id):
        query = gql("""
        query searchPublicationBySourceAndSourceId($query:PublicationSourceWithSourceIdDto!) {
            searchPublicationBySourceAndSourceId(publicationSourceAndSourceId:$query) {
                exId
            }
        }
        """)
        params = {"query": {"exId": str(arxiv_id), "source": "ARXIV"}}
        try:
            print("-- requesting db api if "+str(arxiv_id)+" is already in database ...")
            result = self.gql_client.execute(query, variable_values=params)
            if result["searchPublicationBySourceAndSourceId"] is not None:
                if result["searchPublicationBySourceAndSourceId"]["exId"] == arxiv_id:
                    print("--- requested "+str(arxiv_id)+" is already in database. skipping ...")
                    return True
            else:
                print("--- requested "+str(arxiv_id)+" is not in database. proceeding ...")
                return False
        except TransportQueryError as e:
            print(e)
            return False
    
    def get_oldest_arxiv_pub(self):
        query = gql("""
        query timing {
            oldest(source: ARXIV) {
                exId
                publicationDate
            }
        }
        """)
        try:
            print("- requesting db api for oldest arxiv publication ...")
            result = self.gql_client.execute(query)
            print("-- found arxiv id " + str(result["oldest"]["exId"]) + ", published " + str(result["oldest"]["publicationDate"])+".")
            return result["oldest"]["exId"]
        except TransportQueryError as e:
            print(e)
            return None
    
    def get_newest_arxiv_pub(self):
        query = gql("""
        query timing {
            newest(source: ARXIV) {
                exId
                publicationDate
            }
        }
        """)
        try:
            print("- requesting db api for newest arxiv publication ...")
            result = self.gql_client.execute(query)
            print("-- found arxiv id " + str(result["newest"]["exId"]) + ", published " + str(result["newest"]["publicationDate"])+".")
            return result["newest"]["exId"]
        except TransportQueryError as e:
            print(e)
            return None
    
    def add_arxiv_pub(self, pub):
        #print("ArxivApiScraper.update_db_entries(update_list)")
        print("-- saving "+str(pub.arxiv_id)+" to database ...")
        mutation = gql("""
        mutation savePublication($query: CreatePublicationDto!) {
            savePublication(createPublication: $query) {
                exId
                title
            }
        }
        """)
        sentences = list()
        for key in pub.vector_dict:
            #text = self.clean(pub.vector_dict[key]["token"])
            sentences.append({"value": pub.vector_dict[key]["token"], "vector": pub.vector_dict[key]["embedding"]})
        
        params = {
            "query": {
                "title": str(pub.title), 
                "exId": str(pub.arxiv_id),
                "source":str(pub.src),
                "doi": pub.doi,
                "url": str(pub.url),
                "abstract": str(pub.abstract),
                "authors": pub.authors,
                "date": pub.pub_date,
                "descriptor": {
                    "sentences": sentences
                }
        }}

        try:
            result = self.gql_client.execute(mutation, variable_values=params)
            print("--- successfully saved " + str(pub.arxiv_id) + " to database.")
            return True
        except TransportQueryError as e:
            print(e)
            return False

    def add_arxiv_pub_list(self, pub_list):
        #print("ArxivApiScraper.update_db_entries(update_list)")
        print("- saving publications to database ...")
        mutation = gql("""
        mutation savePublication($query: CreatePublicationDto!) {
            savePublication(createPublication: $query) {
                id
                title
            }
        }
        """)
        for pub in pub_list:
            sentences = list()
            for key in pub.vector_dict:
                text = self.clean(pub.vector_dict[key]["token"])
                sentences.append({"value": text, "vector": pub.vector_dict[key]["embedding"]})
            params = {
                "query": {
                    "title": str(pub.title), 
                    "exId": str(pub.arxiv_id),
                    "source":str(pub.src),
                    "doi": str(pub.doi),
                    "url": str(pub.url),
                    "abstract": str(pub.abstract),
                    "authors": pub.authors,
                    "date": pub.pub_date,
                    "descriptor": {
                        "sentences": sentences
                     }
            }}
            """  
            {
                '0': {
                    'token': 'blabla', 
                    'embedding': [-0.07583089172840118, -0.07275690138339996, ...]
                }
            }
            """
            try:
                result = self.gql_client.execute(mutation, variable_values=params)
                print("-- successfully saved " + str(result) + " to database.")
            except TransportQueryError as e:
                print(e)
    
    def clean(self, text):
        text = text.strip()
        text = text.replace("\n", " ")
        text = text.replace('´´', '"')
        text = text.replace('``', '"')
        text = text.replace("\'\'", '"')
        text = text.replace("- ", '')
        text = re.sub(r" +", " ", text)
        text = re.sub(r"\\x[0-9a-fA-F]{2}", " ", text)
        return text