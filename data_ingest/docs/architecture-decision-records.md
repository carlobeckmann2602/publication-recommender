# Architecture Decision Records

## Table of Contents
1. [Use Dagster to orchestrate the ETL process](#use-dagster-to-orchestrate-the-etl-process)

## Use Dagster to orchestrate the ETL process

### Context and Problem Statement
* Old web-scraper code is not maintainable and does not scale well.
* Missing visibility into existing cron jobs and their status.
* Hard to debug and monitor the existing cron jobs.
* Long Term Goal: Ingest data from multiple sources and store it in multiple sinks.

### Considered Options

* Dagster
* Databricks
* Apache Airflow

### Decision Outcome

**Chosen option:** Dagster because it is easy to use, open source, uses vanilla Python and 
has a high-level API for defining data pipelines. There are also several native integrations for Google Cloud, 
Azure, and postgres.