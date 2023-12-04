import numpy as np
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
import os
import pandas as pd

transport = AIOHTTPTransport(url=os.environ["GRAPHQL_ENDPOINT"])

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True)

provide_vectors = gql(
    """
    mutation provideVectors($query: PublicationVectorsRequestDto!) {
        provideVectors(provideVectors: $query) {
            chunk,data{id, vectors}
        }
    }
    """
)


def get_vectors(index: int, size=5) -> pd.DataFrame:
    params = {"query": {"chunk": index, "chunkSize": size}}
    response = client.execute(provide_vectors, variable_values=params)["provideVectors"]
    data = response["data"]
    return pd.DataFrame.from_dict(data)


def get_all_vectors() -> pd.DataFrame:
    dataframe = None
    continue_requests = True
    index = 0
    while continue_requests:
        temp_dataframe = get_vectors(index, 100)
        print(f"{index} -> Received {len(temp_dataframe)} IDs from backend")
        if temp_dataframe.empty:
            continue_requests = False
        else:
            if dataframe is None:
                dataframe = temp_dataframe
            else:
                dataframe = pd.concat([dataframe, temp_dataframe], ignore_index=True)
            index += 1
    return dataframe
