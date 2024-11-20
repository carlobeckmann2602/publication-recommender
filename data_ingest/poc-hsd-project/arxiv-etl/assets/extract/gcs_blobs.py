import dagster
from dagster import AssetExecutionContext, asset, Definitions, EnvVar, mem_io_manager
from dagster_gcp.gcs.resources import GCSResource
from dagster_azure.adls2.resources import ADLS2Resource, ADLS2Key
from dagster import  DynamicPartitionsDefinition

import dask
import dask.dataframe as dd
import pandas as pd
import pymupdf
from io import BytesIO

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ),
    group_name="extract",
)
def selected_papers(context: AssetExecutionContext, gcs: GCSResource):
    """Read GCP blobs"""
    partition_key = context.partition_key

    client = gcs.get_client()
    bucket = client.bucket("arxiv-dataset")
    blobs = bucket.list_blobs(prefix=f"arxiv/arxiv/pdf/{partition_key}")

    selected_blobs = []
    for blob in blobs:
        selected_blobs.append(blob.name)

    return selected_blobs

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ),
    group_name="extract",
)
def raw_papers(context: AssetExecutionContext, selected_papers, gcs: GCSResource):
    """For each selected paper, download the content in a delayed dask task"""
    def parse_pdf(pdf_bytes):
        # TO DO: Put this function in a separate file
        try:
            pdf = pymupdf.open(stream=BytesIO(pdf_bytes))
            text = chr(12).join([page.get_text() for page in pdf])
            pdf.close()
            return text
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return ""
    
    def create_dataframe_from_bytes(blob):    
        context.log.info(f"=== Processing {blob.name} ===")
        return pd.DataFrame({
            "file_name": [blob.name],
            "content": [parse_pdf(blob.download_as_bytes())]
        })
    
    bucket = gcs.get_client().bucket("arxiv-dataset")
    papers = []
    for paper in selected_papers:
        blob = bucket.blob(paper)
        delayed_blob = dask.delayed(create_dataframe_from_bytes)(blob)
        papers.append(delayed_blob)

    ddf = dd.from_delayed(papers, meta={'file_name': 'object', 'content': 'object'})
    return ddf.persist()

@asset(
    partitions_def=DynamicPartitionsDefinition(
        name="monthly_partitions",
    ),
    group_name="extract",
)
def papers_parquet(context: AssetExecutionContext, raw_papers, adls2: ADLS2Resource):
    """Write parquet to Azure ADLS2"""
    papers_parquet = raw_papers.compute().to_parquet(engine="pyarrow")

    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="raw")

    file_client = file_system.get_file_client(file_path=f"{context.partition_key[:2]}/{context.partition_key}_raw_papers.parquet")
    file_client.upload_data(papers_parquet, overwrite=True)


defs = Definitions(
    assets=[selected_papers, raw_papers, papers_parquet],
    resources={
        "gcs": GCSResource(project=EnvVar("GOOGLE_APPLICATION_CREDENTIALS")),
        "adls2": ADLS2Resource(
            storage_account=EnvVar("AZURE_ACCOUNT_NAME"),
            credential=ADLS2Key(key=EnvVar("AZURE_STORAGE_KEY"))
        ),
        "io_manager": mem_io_manager,
    }
)