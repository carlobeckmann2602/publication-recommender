# Literature Recommender System
---
## Team Split
I propose to split the team into 4 sub-teams
* Database & Server Backend 
* Front-End
* Machine Learning Backend
* Data Ingest

## Database & Server Backend
A database (e.g. [MongoDB](https://www.mongodb.com/developer/languages/python/python-quickstart-fastapi/)) is needed to store known literature and the respective machine learning signatures used to match new papers to known ones. A publication references one or more authors and (likely) one publisher. Publications are split into paragraphs (by any suitable algorithm yet to be determined) and a (short) preview for the respective paragraph is stored within the database document. This preview shall later be used in the Front-End to present the user with a snippet from the publication. This shall allow him to decide whether he wants to download the respective publication or not. 
The publication itself shall contain all the information needed to find (or directly download) the publication, e.g. it shall contain an URL linking to the respective paper or index page from the HSD BIB. Also, for publications indexed by the BIB, the document shall contain the respective information to find (our request) the publication from the BIB. 

A Server shall expose a REST or (better) GraphQL API (e.g. using [Python Strawberry](https://strawberry.rocks/)) allowing the FrontEnd, Data and Machine Learning Team to work with the database. The FrontEnd will require mostly read access to provide an overview of existing literature and allow to show search results from the machine learning backend. The machine learning backend will require read access to identify new publications not yet indexed that require to be processed. The data ingestion team will require mostly write access to make new publications known and schedule processing of it by the machine learning backend. 

## Front-End
A Front-End (e.g. using [React](https://react.dev/) shall be developed. The Front-End shall present the user with either a text-based query or the option to select one or more publications from the known set of publications (e.g. by text search). Ideally, the database server implements regular expression based matching for, at least, the publication title and authors. The Front-End shall then allow to query for additional (similar) publications. Such a query needs to be send to the machine learning backend which processes it and answers with matches (represented by UUIDs). The front-end can then resolve the UUIs with the database backend server to nicely present the publications and matched paragraphs. 

## Machine Learning Backend
The ML-Backend has multiple responsibilities. New publications (those who have not yet been processed) are to be indexed, meaning the document needs to be split into paragraphs and signatures need to be calculated for each paragraph. This can be done by using [Sentence Transformer](https://www.sbert.net/docs/installation.html). A paragrah can be summarized by the transformer and then a single signature can be stored per paragraph. Furthermore, the machine learning backend shall provide an option to query for matches/proposals based on existing (indexed) literature. Signatures can be stored using an approximate nearest neighbor database (e.g. [Annoy](https://github.com/spotify/annoy))

## Data Ingestion
A scheduled background task needs to constantly monitor websites (e.g. Arxiv) for new publications. In Python, this can be achieved by using [Celery](https://docs.celeryq.dev/en/stable/), especially [periodic tasks](https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html). A [RabbitMQ](https://www.rabbitmq.com/) is needed to operate Celery. This can easily be spawn up by using Docker. 

Once a new publication is identifed it needs to be made known to both the database backend and the machine learning backend. The ML-backend can also run a Celery Queue to forward the job of indexing the publication to the backend. In that case, data ingestion would mean to create the respective Publication Document on the server, propably also create the Author and Publisher document and then pass that to the ML-Backend using Celery. 

## First Tasks
The **database backend team** shall setup a simple server application which exposes a REST (better GraphQL) API. The API shall allow CRUD Operations for at least the publication, paragraph and signature document types. Signatures will likely be NUMPY arrays that could be stored as JSON or PICKEL. It could make sense to allow upload and download of signatures via the API but store the respective data directly on disk rather than within the database. 

The **frontend team** shall setup a first prototype for the frontend. The frontend shall allow to view all known publications and, ideally allow to filter for publications by title. Ideally, the database provides the capability to filter for publications by regular expressions. 

The **machine learining** team shall start with the [arXiv Paper Abstracts](https://www.kaggle.com/datasets/spsayakpaul/arxiv-paper-abstracts) dataset and calculate summarizations and signatures for every single paper. Setup an [Annoy](https://github.com/spotify/annoy) database and fill it with your signatures. Use it to lookup nearest neighbours. Provide a simple REST-API accepting match requests, resolve them using Annoy and return matches. NOTE: You will need to align with the database team because ANNOY only stores integer indices which will need to be mapped to the respective DB documents and vice versa. 

The **data ingestion** team shall contant Stefanie Söhnitz from the BIB to understand what data the University could provide to this project. You should also investigate automated crawling of arXiv papers, develop a python script to decompose a .PDF document into .TXT [e.g. PyPDF2](https://pypdf2.readthedocs.io/en/latest/user/extract-text.html) or [Tesseract](https://github.com/tesseract-ocr/tesseract)

