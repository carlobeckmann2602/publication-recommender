import asyncio
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport
import os
import logging
import pandas as pd

transport = AIOHTTPTransport(url=os.environ["GRAPHQL_ENDPOINT"])

# Create a GraphQL client using the defined transport
client = Client(transport=transport, fetch_schema_from_transport=True, execute_timeout=15000)
logger = logging.getLogger(__name__)

provide_vectors = gql(
    """
    query provideVectors($query: PublicationVectorsRequestDto!) {
        provideVectors(provideVectors: $query) {
            chunk,data{id, vectors}
        }
    }
    """
)


async def get_vectors(index: int, size=5) -> pd.DataFrame:
    params = {"query": {"chunk": index, "chunkSize": size}}
    try:
        response = await client.execute_async(provide_vectors, variable_values=params)
        response = response["provideVectors"]
        data = response["data"]
        return pd.DataFrame.from_dict(data)
    except Exception as e:
        logger.warning("Could not connect to graphql server because:" + "\n" + str(e))
        return pd.DataFrame()


async def get_all_vectors() -> pd.DataFrame:
    dataframe = None
    continue_requests = True
    index = 0
    while continue_requests:
        temp_dataframe = await get_vectors(index, 200)
        logger.info(f"{index} -> Received {len(temp_dataframe)} IDs from backend")
        if temp_dataframe.empty:
            continue_requests = False
        else:
            if dataframe is None:
                dataframe = temp_dataframe
            else:
                dataframe = pd.concat([dataframe, temp_dataframe], ignore_index=True)
            index += 1
    return dataframe


update_coordinates = gql(
    """
    mutation saveCoordinates($coordinates: [CoordinatesDto!]!) {
        savePublicationsCoordinates(savePublicationsCoordinatesDto: { coordinates: $coordinates }) {
            id
        }
    }
    """
)


async def update_tsne_coordinates(coordinates: pd.DataFrame) -> dict:
    params = {
        "coordinates": coordinates.to_dict('records')
        }
    try:
        async with client as session:
            response = await session.execute(update_coordinates, variable_values=params)
            response = response["savePublicationsCoordinates"]
            return response
    except asyncio.exceptions.TimeoutError as te:
        logger.warning("TimeoutError because:" + "\n" + str(te))
    except Exception as e:
        logger.warning("Could not connect to graphql server because:" + "\n" + str(e))
    return {}
