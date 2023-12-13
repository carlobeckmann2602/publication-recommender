import requests, json
from enum import Enum
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from gql.transport.exceptions import TransportQueryError

_url = 'http://nest:3000/graphql'  # Replace with the actual URL of your GraphQL API

_transport = RequestsHTTPTransport(
    url=_url,
    use_json=True
)

client = Client(
    transport=_transport,
    fetch_schema_from_transport=True,
)

# GraphQL mutation string
query = gql("""
query publicationCount($query: PublicationSource) {
    publicationCount(source: $query)
}
""")

dict_params = {"query": "ARXIV"}
try:
  # Execute the query on the transport
  result = client.execute(query, variable_values=dict_params)
  print(result)
except TransportQueryError as e:
  print(e)