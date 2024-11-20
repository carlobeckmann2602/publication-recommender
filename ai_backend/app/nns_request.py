import abc
import asyncio
import logging
import math
import time
import types
from typing import Dict, List

from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

import numpy as np
from numpy import random
import pandas as pd
import nest_asyncio
from sklearn.decomposition import PCA

nest_asyncio.apply()

request_logger = logging.getLogger(__name__)


class VectorDatabase(abc.ABC):
    EMBEDDING_KEY: str = "embedding"
    PUBLICATION_ID_KEY: str = "publication_id"
    SENTENCE_ID_KEY: str = "sentence_id"
    DISTANCE_KEY: str = "distance"
    COORDINATE_KEY: str = "coordinate"

    @abc.abstractmethod
    def get_nns(
        self, embedding: np.ndarray, amount: int, include_distance: bool = True
    ) -> pd.DataFrame:
        """
        Returns a dataframe with:
            PUBLICATION_ID_KEY: str
               SENTENCE_ID_KEY: str
                  DISTANCE_KEY: float
        """

    @abc.abstractmethod
    def get_embedding(self, pub_id: str) -> pd.DataFrame:
        """
        Returns a dataframe with:
            PUBLICATION_ID_KEY: str (static)
               SENTENCE_ID_KEY: str
                 EMBEDDING_KEY: Iterable[float]
        """

    @abc.abstractmethod
    def get_max_sentence_amount(self) -> int:
        """
        Returns the max amount of sentences per publication in database as an int
        """

    @abc.abstractmethod
    def get_embeddings(self, amount: int, do_pca: bool) -> pd.DataFrame:
        """
        Returns a dataframe with:
            PUBLICATION_ID_KEY: str
               SENTENCE_ID_KEY: str
                 EMBEDDING_KEY: Iterable[float]
        """


class RemoteDatabase(VectorDatabase):
    endpoint: str = None

    GET_PUBLICATION_INFO = """
        query($id: String!) {
            publication(id: $id) {
                embeddings {
                    id
                    vector
                }
            }
        }
        """

    GET_MAX_SENTENCE_AMOUNT = """
        query{maximumAmountOfSentencesForPublication{amount}}
        """

    GET_NNS_RESULT = """
        query($vector: [Float!]!, $amount: Int!) {
            getNearestNeighbors(
                nearestNeighborRequestDto: { vector: $vector, amount: $amount}
            ) {
                publication {
                    id
                }
                embeddingId
                distance
            }
        }
        """

    GET_EMBEDDING_CHUNK = """
        query providePublicationChunk($query: PublicationChunkRequestDto!) {
            providePublicationChunk(providePublicationChunk: $query) {
                id
                embeddings {
                    id
                    vector
                }
            }
        }
        """

    def __init__(self, endpoint: str, event_loop: asyncio.AbstractEventLoop):
        self.loop = event_loop
        self.endpoint = endpoint

    def __fetch_data__(self, query, params=None):
        async def execute_query(query_str, query_params) -> Dict:
            transport = AIOHTTPTransport(url=self.endpoint)
            async with Client(
                transport=transport, fetch_schema_from_transport=True
            ) as session:
                response = await session.execute(
                    document=gql(query_str), variable_values=query_params
                )
                return response

        while self.loop.is_running():
            time.sleep(1)
        result = self.loop.run_until_complete(execute_query(query, params))
        return result

    def get_nns(
        self, embedding: np.ndarray, amount: int, include_distance: bool = True
    ) -> pd.DataFrame:
        query = self.GET_NNS_RESULT
        result: Dict = self.__fetch_data__(
            query=query, params={"vector": embedding, "amount": amount}
        )
        result: List[Dict] = result["getNearestNeighbors"]
        converted = []
        for matching in result:
            publication_id = matching["publication"]["id"]
            sentence_id = matching["embeddingId"]
            distance = matching["distance"]
            entry = {
                self.PUBLICATION_ID_KEY: publication_id,
                self.SENTENCE_ID_KEY: sentence_id,
                self.DISTANCE_KEY: distance,
            }
            converted.append(entry)
        result_df = pd.DataFrame.from_records(converted)
        return result_df

    def get_embedding(self, pub_id: str) -> pd.DataFrame:
        query = self.GET_PUBLICATION_INFO
        result = self.__fetch_data__(query=query, params={"id": pub_id})
        result = result["publication"]["embeddings"]
        result_df = pd.DataFrame.from_records(result)
        result_df.rename(
            columns={"vector": self.EMBEDDING_KEY, "id": self.SENTENCE_ID_KEY},
            inplace=True,
        )
        result_df[self.PUBLICATION_ID_KEY] = np.full(len(result_df), pub_id)
        return result_df

    def get_embeddings_chunk(self, index: int, chunk_size=5) -> pd.DataFrame:
        query = self.GET_EMBEDDING_CHUNK
        params = {"query": {"chunk": index, "chunkSize": chunk_size}}
        try:
            result = self.__fetch_data__(query=query, params=params)
            result = result["providePublicationChunk"]
            data = pd.DataFrame(
                columns=[
                    self.PUBLICATION_ID_KEY,
                    self.SENTENCE_ID_KEY,
                    self.EMBEDDING_KEY,
                ]
            )
            for publication in result:
                for sentence in publication["embeddings"]:
                    data = data._append(
                        {
                            self.PUBLICATION_ID_KEY: publication["id"],
                            self.SENTENCE_ID_KEY: sentence["id"],
                            self.EMBEDDING_KEY: sentence["vector"],
                        },
                        ignore_index=True,
                    )
            return data
        except Exception as e:
            request_logger.error(
                "Could not connect to graphql server because:" + "\n" + str(e)
            )
            return pd.DataFrame()

    def get_embeddings(
        self, amount: int = None, perform_pca: types.FunctionType = None
    ) -> pd.DataFrame:
        dataframe = None
        continue_requests = True
        index = 0
        max_index = -1
        chunk_size = 1000
        overflow = 0
        if amount is not None:
            max_index = math.floor(amount / chunk_size)
            overflow = amount % chunk_size
        while continue_requests:
            if index == max_index:
                chunk_size = overflow
                continue_requests = False
            if chunk_size is 0:
                request_logger.info(f"{index} -> Amount of embeddings reached")
                break
            temp_dataframe = self.get_embeddings_chunk(index, chunk_size)
            request_logger.info(
                f"{index} -> Received {len(temp_dataframe)} IDs from backend"
            )
            if temp_dataframe.empty:
                continue_requests = False
            else:
                if (
                    isinstance(perform_pca, types.FunctionType)
                    and not temp_dataframe.empty
                ):
                    request_logger.info(
                        f"{index} -> Start Performed PCA for {len(temp_dataframe[self.PUBLICATION_ID_KEY].unique())} publications"
                    )
                    temp_publication_dataframe = pd.DataFrame(
                        columns=[self.PUBLICATION_ID_KEY, self.EMBEDDING_KEY]
                    )
                    for publication in temp_dataframe[self.PUBLICATION_ID_KEY].unique():
                        embeddings_pca = perform_pca(
                            np.array(
                                temp_dataframe.loc[
                                    temp_dataframe[self.PUBLICATION_ID_KEY]
                                    == publication
                                ][self.EMBEDDING_KEY].tolist()
                            ),
                            3,
                        )
                        temp_publication_dataframe.loc[
                            len(temp_publication_dataframe)
                        ] = (
                            publication,
                            embeddings_pca,
                        )
                    temp_dataframe = temp_publication_dataframe
                    request_logger.info(
                        f"{index} -> Done PCA for {len(temp_dataframe)} publications"
                    )
                if dataframe is None:
                    dataframe = temp_dataframe
                else:
                    dataframe = pd.concat(
                        [dataframe, temp_dataframe], ignore_index=True
                    )
                index += 1
        request_logger.info(
            f"Done recieving all {len(dataframe)} embeddings from backend"
        )
        return dataframe

    def get_max_sentence_amount(self) -> int:
        query = self.GET_MAX_SENTENCE_AMOUNT
        result = self.__fetch_data__(query=query)
        result = result["maximumAmountOfSentencesForPublication"]["amount"]
        int(result)
        return result
