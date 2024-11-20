from dagster import AssetExecutionContext, asset, Definitions, EnvVar, mem_io_manager
from dagster_azure.adls2.resources import ADLS2Resource, ADLS2Key
from dagster import  DynamicPartitionsDefinition

import pandas as pd
import datetime
from os import getenv
from io import BytesIO, StringIO
import requests

@asset(
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def raw_data(context: AssetExecutionContext, adls2: ADLS2Resource):
    """Read raw parquet from Azure ADLS2"""
    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="raw")
    file_client = file_system.get_file_client(file_path=f"{context.partition_key[:2]}/{context.partition_key}_raw_papers.parquet")
    file = file_client.download_file().readall()
    return pd.read_parquet(BytesIO(file))

@asset(
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def metadata(context: AssetExecutionContext, adls2: ADLS2Resource):
    """Read metadata parquet from Azure ADLS2"""
    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="processed")
    file_client = file_system.get_file_client(file_path=f"metadata/{context.partition_key}.metadata.parquet")
    file = file_client.download_file().readall()
    return pd.read_parquet(BytesIO(file))

@asset(
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def vectorized_paper_content(context: AssetExecutionContext, raw_data):
    """Transform the raw parquet data to vectorized data (embeddings)"""
    def summarize(text):
        path = f'{getenv("BACKEND_BASE_URL")}/summarize/?tokenize=true&amount=5'
        context.log.info(f"Summarizing text: {text[:10]}...")
        try:
            files = {'file': StringIO(text)}
            response = requests.post(url=path, files=files)
            return response.json()
        except Exception as e:
            print(f"Error summarizing text: {e}")
            return {}
    df = raw_data
    df['summary'] = df['content'].apply(lambda x: summarize(x))
    df.drop(columns=['content'], inplace=True)
    return df

@asset (
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def joined_data(context: AssetExecutionContext, vectorized_paper_content, metadata):
    """Join vectorized data with metadata"""
    def sanitize_text(text):
        return text.replace('"', '\'').replace('\\', '\\\\').replace("\n", " ").replace("\r", " ").replace("\t", " ")

    def clean_authors(authors):
        authors = authors.replace(" and ", ", ")
        authors = authors.split(", ")
        authors = [f'{{name: "{sanitize_text(author)}"}}' for author in authors]
        authors = ', '.join(authors)
        return authors

    def clean_metadata(df):
        df['url'] = df['id'].apply(lambda x: f"arxiv.org/pdf/{x}")
        df['publisher'] = df['submitter']
        df['created_at'] = datetime.datetime.utcnow()
        df['updated_at'] = datetime.datetime.utcnow()
        df['title'] = df['title'].apply(lambda x: sanitize_text(x))
        df['abstract'] = df['abstract'].apply(lambda x: sanitize_text(x))
        df['authors'] = df['authors'].apply(lambda x: clean_authors(x))
        df['source'] = 'ARXIV'
        return df

    metadata = clean_metadata(metadata)

    def clean_id(df):
        df['id'] = df['file_name'].apply(lambda x: x.split("/")[-1])
        df['id'] = df['id'].apply(lambda x: x.split("v")[0])
        df['version'] = df['file_name'].apply(lambda x: x.split("/")[-1].split("v")[-1].split(".")[0])
        #df.drop(columns=['file_name'], inplace=True)
        return df

    def clean_summary(summary):
        embeddings = []
        for _, data in summary.items():
            embedding = """
               {
                 text: "%s",
                 vector: %s
               }
               """ % (sanitize_text(data['token']), list(data['embedding']))
            embeddings.append(embedding)

        embeddings_str = ', '.join(embeddings)
        return embeddings_str

    vectorized_paper_content = clean_id(vectorized_paper_content)
    vectorized_paper_content['summary'] = vectorized_paper_content['summary'].apply(lambda x: clean_summary(x))

    return pd.merge(vectorized_paper_content, metadata, on="id")


@asset(
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def vectorized_papers_pg(context: AssetExecutionContext, adls2: ADLS2Resource, joined_data):
    """Write merged data to database via graph ql"""
    def build_query(
            title, authors, publisher, ex_id, source, doi, url, abstract, date, embeddings_str
    ):
        graphql_query = '''
                  mutation{savePublication(
                    createPublication: {
                      title: "%s",
                      authorsCreateDtos: [
                        %s
                      ],
                      publisher: "%s",
                      exId: "%s",
                      source: %s,
                      doi: "%s",
                      url: "%s",
                      abstract: "%s",
                      date: "%s"
                      embeddingsCreateDtos: [
                        %s
                      ]
                  }
                ){id}}
              ''' % (title, authors, publisher, ex_id, source, doi, url, abstract, date, embeddings_str)

        graphql_url = getenv("GRAPHQL_BASE_URL")
        response = requests.post(graphql_url, json={'query': graphql_query})
        json_response = response.json()
        print(json_response)

    for index, row in joined_data.iterrows():
        build_query(
            title=row['title'],
            authors=row['authors'],
            publisher=row['publisher'],
            ex_id=row['id'],
            source='ARXIV',
            doi=str(f"{row['doi']}"),
            url=row['url'],
            abstract=row['abstract'],
            date=row['created_at'],
            embeddings_str=row['summary'],
        )


@asset(
    partitions_def=DynamicPartitionsDefinition(name="monthly_partitions"),
    group_name="stream",
)
def vectorized_papers_az(context: AssetExecutionContext, adls2: ADLS2Resource, joined_data):
    """Write parquet to Azure ADLS2"""
    joined_data.drop_duplicates(subset=['file_name'], inplace=True)
    papers_parquet = joined_data.to_parquet(engine="pyarrow")

    client = adls2.adls2_client
    file_system = client.get_file_system_client(file_system="processed")

    file_client = file_system.get_file_client(file_path=f"{context.partition_key[:2]}/{context.partition_key}_processed_papers.parquet")
    file_client.upload_data(papers_parquet, overwrite=True)

defs = Definitions(
    assets=[raw_data],
    resources={
        "adls2": ADLS2Resource(
            storage_account=EnvVar("AZURE_ACCOUNT_NAME"),
            credential=ADLS2Key(key=EnvVar("AZURE_STORAGE_KEY"))
        ),
        "io_manager": mem_io_manager,
    }
)