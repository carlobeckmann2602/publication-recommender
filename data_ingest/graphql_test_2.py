from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError
from db import DatabaseApi
# Select your transport with a defined url endpoint
transport = AIOHTTPTransport(url="http://nest:3000/graphql")

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)

# Provide a GraphQL query
#query = gql("""
#query publicationCount($query: PublicationSource) {
#    publicationCount(source: $query)
#}
#""")


#params = {"query": {"source": "ARVIX"}}
##try:
#    result = client.execute(query, variable_values=params)
 #   print("--- saving ..." + str(result))
#except TransportQueryError as e:
#    print(e)

db_api = DatabaseApi()
print(db_api.get_arxiv_pub_by_id("2312.16793"))