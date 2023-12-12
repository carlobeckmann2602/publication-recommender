from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.exceptions import TransportQueryError

# Select your transport with a defined url endpoint
transport = AIOHTTPTransport(url="http://nest:3000/graphql")

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)

# Provide a GraphQL query
mutation = gql("""
mutation savePublication($query: CreatePublicationDto!) {
  savePublication(createPublication: $query) {
    id
    title
  }
}
""")

params = {"query": {"exId":"12345678","source":"arxiv", "title": "test1234567", "descriptor": {"sentences": [{"value":"blablubb","vector":[3.1]}]}}}

try:
  # Execute the query on the transport
  result = client.execute(mutation, variable_values=params)
  print(result)
except TransportQueryError as e:
  print(e)