# Publication Recommender

## Overview

The Publications Recommender is a web application that enables the user to search for publications and allows the user to search for similar publications or receive similar recommendations based on selected publications. The system is structured into four different parts: the frontend, which is a [Next.js](https://nextjs.org/docs) application, the backend, which is a [NestJS application](https://docs.nestjs.com/), the AI backend, which analyzes the publications with a Sentence-Transformer and enables the search/recommendation through an Annoy database of all publications and the scrappers, which collect publications from Arxiv using Python scripts.

## Technologies

This is a concise list of technologies and concepts that are used. They are roughly sorted by their importance:

- [Next.js](https://nextjs.org/docs)
- [NestJS](ttps://docs.nestjs.com/)
- [Celery](https://docs.celeryq.dev/en/stable/#)
- [PyTorch](https://pytorch.org/)
- [Scikit-Learn](https://scikit-learn.org/stable/)
- [RabbitMQ](https://rabbitmq.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)

## Starting the Project

### Developement

Create .env file in the root of the project and frontend folder based on .env.example

#### Start

```bash
docker compose up
```

#### Start with seeders
```bash
docker compose --profile seeders up
```

### Production

Create .env file in the root of the project and frontend folder based on .env.example

#### Start

```bash
docker compose -f docker-compose.prod.yml up
```

#### Start with Scraper

```bash
docker compose --profile with_scraping up
```

#### Start with Monotoring (Adminer, Flower)

```bash
docker compose --profile monitoring up
```

## Further Information

Further information about the individual parts of the system can be found in the respective READMEs in the component folders.