# Papermatcher

## Overview

Papermatcher is a web application that enables the user to search for publications and allows the user to search for similar publications or receive similar recommendations based on selected publications. The system is structured into four different parts: the frontend, which is a [Next.js](https://nextjs.org/docs) application, the backend, which is a [NestJS application](https://docs.nestjs.com/), the AI backend, which analyzes the publications with a Sentence-Transformer and enables the search/recommendation through an Annoy database of all publications and the scrappers, which collect publications from Arxiv using Python scripts.

## Technologies

This is a concise list of technologies and concepts that are used. They are roughly sorted by their importance:

- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com/)
- [Celery](https://docs.celeryq.dev/en/stable/#)
- [PyTorch](https://pytorch.org/)
- [Scikit-Learn](https://scikit-learn.org/stable/)
- [RabbitMQ](https://rabbitmq.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)

## Starting the Project

### Developement

The "deployment", "frontend" and "backend" repositories contain individual `.env.example` files that define environment variables for the respective subprojects. Before starting the subprojects (or building Docker containers), create an `.env` file in each subproject by copying the corresponding `.env.example` file (fill in missing values for Google and Nextauth if necessary). Ensure that the created `.env` files are located in the same folder as the corresponding `.env.example` file.

The following commands are possible ways to create and launch Docker-containers for each subproject. For development, you will most likely want to use the first or second option. After pulling and building all docker containers (and images), you should see the following containers (names may vary):

**AI-Backend**

- _ai_backend_worker_: Starts a celery-worker for computing embeddings. Mandatory for using the ai-backend.
- _ai_backend-1_: General container for ai-backend-tasks. Mandatory for using the ai-backend.
- _rabbitmq-1_: Message broker for coordinating the ai_backend_worker. Mandatory for using the ai-backend.
- _redis_: In-memory-database used by the ai-backend. Mandatory for using the ai-backend.
- _ai_backend_flowers_: Monitoring of active ai_backend_workers. Running this container is not required to use the application.

**Backend**

- _nest-1_: General container for the nestJS backend. Provides the API endpoints for the frontend, accesses the postgres database etc. Mandatory for using the backend, needs a running postgres-container to work properly.
- _postgres-1_: Manages the postgreSQL-database containing data for users, publications etc. Mandatory for using the backend.
- _adminer-1_: Enables monitoring and CRUD-operations on (running) database via a web-ui. Running this container is not required to use the application, needs a running postgres-container to work properly.

**Frontend**

- _next-1_: Launches the NextJS-frontend. Caution: The startup and first rendering of each page can take a while.

**Data Ingest/Scraper**

- _seeders-1_: Provides initial data for the application. Running this container is not required to use the application and may be classified as deprecated.

Detailed information on the construction and use of each container can be found in the documentation for the specific repositories.

#### Start

```bash
docker compose up
```

Watch out: The first startup can take a while (up to a few minutes, depending on your hardware configuration)!

#### Start with database seeding

Currently this only works if you adjust the source code (see [corresponding issue](https://projectbase.medien.hs-duesseldorf.de/ki/publikationsempfehlung/backend/-/issues/13)). Alternatively you can use the backend API to insert publications (you can find a python script and a link to a CSV containing some publications in the Discord-Channel).

```bash
docker compose --profile seeders up
```

### Production

Create one `.env` file in the "deployment" repository and one in the "frontend" repository, each based on the respective `.env.example`.

#### Start

```bash
docker compose -f docker-compose.prod.yml up
```

#### Start with Scraper

```bash
docker compose -f docker-compose.prod.yml --profile with_scraping up
```

#### Start with Monotoring (Adminer, Flower)

```bash
docker compose -f docker-compose.prod.yml --profile monitoring up
```

## Further Information

Further information about the individual parts of the system can be found in the respective READMEs in the component folders. \
Further documentation regarding architecture, technologies, way of work, etc. can be found in the [Wiki](https://projectbase.medien.hs-duesseldorf.de/ki/publikationsempfehlung/deployment/-/wikis/home).
