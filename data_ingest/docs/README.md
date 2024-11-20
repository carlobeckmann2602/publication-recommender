# HSD Publications Project: data_ingest

This repository contains the code for the data_ingest module of the HSD Publications Project.
The data_ingest module is responsible for ingesting data from the HSD Publications Project's data sources
and storing it in the project's postgres database and Data Lake Storage.

## Core Concepts

### TL;DR: Data Engineering vocab

- **Data Source**: A data source is a location where data is stored and can be accessed from.
- **Data Sink**: A data sink is a location where data can be stored.
- **Data Pipeline**: A data pipeline is a series of steps that data goes through to be processed.
- **Data Asset**: A data asset is a piece of data that is used in a data pipeline.
- **Data Orchestration**: Data orchestration is the process of automating the ETL process.
- **ETL**: Extract, Transform, Load (ETL) is a paradigm in data engineering that describes the process of moving data from one or more sources to one or more sinks.
- **Software-defined Asset**: A software-defined asset is a building block of a data pipeline that can be used to define the inputs, outputs, and dependencies of the pipeline.
- **Dagster**: Dagster is a data orchestrator that allows for the creation, monitoring and scheduling of data pipelines.

### Extract, Transform, Load (ETL)

Extract, Transform, Load (ETL) is a paradigm in data engineering that describes the process of moving data from one or more sources to one or more sinks.

- **Extract**: Data is extracted from the data sources.
- **Transform**: Data is transformed into a format that can be loaded into the data sinks.
- **Load**: Data is loaded into the data sinks.

### Data Orchestration

Data orchestration is the process of automating the ETL process.
This involves scheduling the ETL process, monitoring the ETL process,
and handling errors that occur during the ETL process.

We use `dagster` to orchestrate the ETL process. `dagster` is a data orchestrator that allows for the creation,
monitoring and scheduling of data pipelines. It provides a high-level API for defining data pipelines and so called "Software-defined Assets".
These assets are the building blocks of the data pipeline and can be used to define the inputs, outputs, and dependencies of the pipeline.

## Installation & usage

### 1. Clone Repo

```
git clone git@projectbase.medien.hs-duesseldorf.de:ki/publikationsempfehlung/data_ingest.git
```

### 2. Create Virtual Env

```
python3 -m virtualenv venv
```

### 3. Activate

#### Linux and MacOS

```
source venv/bin/activate
```

#### Windows

In cmd.exe

```
venv\Scripts\activate.bat
```

In PowerShell

```
venv\Scripts\Activate.ps1
```

### 4. Install dependencies in

```
cd poc-hsd-project
pip install -e ".[dev]"
```

### 5. Set environment variables

```
ENVIRONMENT=development
GOOGLE_APPLICATION_CREDENTIALS="REPLACE_WITH_YOUR_KEY"
AZURE_ACCOUNT_NAME=literaturprojekt
AZURE_STORAGE_KEY="REPLACE_WITH_YOUR_KEY"
BACKEND_BASE_URL=http://localhost:8000
GRAPHQL_BASE_URL=http://localhost:3001/graphql
```

### 6. Start dagster

```
dagster dev
```

### 6. Go to `http://localhost:3000/locations/arxiv-etl/asset-groups/stream/lineage/`

### 7. Click "Materialize all"

### 8. Add partitions:

For example:

```
1801
1802
1803
1901
1902
1903
2001
2002
2003
```

### 9. Launch backfill

## Pipeline

### Software-defined Assets

### Data Sources

The data_ingest module currently supports the following data sources:

- Arxiv via a publicly available [Google Cloud Storage Bucket](https://console.cloud.google.com/storage/browser/arxiv-dataset).

### Data Sinks

The data_ingest module currently supports the following data sinks:

- Azure Data Lake
- Postgres database via REST API
