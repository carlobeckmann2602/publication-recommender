import dagster
from dagster import AssetExecutionContext, asset, Definitions, EnvVar, mem_io_manager
from dagster_azure.adls2.resources import ADLS2Resource, ADLS2Key
from dagster import  DynamicPartitionsDefinition

import dask
import dask.dataframe as dd
import pandas as pd

from os import getenv
from io import BytesIO, StringIO
import requests

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ), 
    group_name="transformed",
)
def raw_parquet(context: AssetExecutionContext, adls2: ADLS2Resource):
    """Read parquet from Azure ADLS2"""
    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="raw")
    file_client = file_system.get_file_client(file_path=f"{context.partition_key[:2]}/{context.partition_key}_raw_papers.parquet")
    return file_client.download_file().readall()

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ),
    group_name="transformed",
)
def vectorized_content(context: AssetExecutionContext, raw_parquet):
    """Transform the raw parquet data"""
    def summarize(text):
        path = f'{getenv("BACKEND_BASE_URL")}/summarize/?tokenize=true&amount=5'
        context.log.info(f"Summarizing text: {text[:10]}...")
        try:
            files = {'file': StringIO(text)}
            response = requests.post(url=path, files=files)
            return response.text
        except Exception as e:
            print(f"Error summarizing text: {e}")
            return ""

    df = pd.read_parquet(BytesIO(raw_parquet))
    df['summary'] = df['content'].apply(lambda x: summarize(x))
    df = df.drop(columns=['content'], inplace=True)
    return df

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ),
    group_name="transformed",
)
def vectorized_papers_parquet(context: AssetExecutionContext, vectorized_content, adls2: ADLS2Resource):
    """Write parquet to Azure ADLS2"""
    papers_parquet = vectorized_content.to_parquet(engine="pyarrow")

    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="vectorized")

    file_client = file_system.get_file_client(file_path=f"{context.partition_key[:2]}/{context.partition_key}_vectorized_papers.parquet")
    file_client.upload_data(papers_parquet, overwrite=True)

defs = Definitions(
    assets=[raw_parquet],
    resources={
        "adls2": ADLS2Resource(
            storage_account=EnvVar("AZURE_ACCOUNT_NAME"),
            credential=ADLS2Key(key=EnvVar("AZURE_STORAGE_KEY"))
        ),
        "io_manager": mem_io_manager,
    }
)