import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from gql.transport.exceptions import TransportQueryError

_url = 'http://nest:3000/graphql'  # Replace with the actual URL of your GraphQL API

_transport = RequestsHTTPTransport(
    url=_url,
    use_json=True,
)

client = Client(
    transport=_transport,
    fetch_schema_from_transport=True,
)

# GraphQL mutation string
mutation = gql("""
mutation savePublication($query: CreatePublicationDto!) {
  savePublication(createPublication: $query) {
    id
    title
  }
}
""")

params = {"query": {"exId":"abcde73892","source":"arxiv", "title": "das ist einrandom titel", "descriptor": {"sentences": [{"value":"wuff","vector":[7.1]}]}}}

try:
  # Execute the query on the transport
  result = client.execute(mutation, variable_values=params)
  print(result)
except TransportQueryError as e:
  print(e)