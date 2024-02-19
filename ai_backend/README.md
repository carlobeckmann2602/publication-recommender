# Publikationsempfehlung AI-Backend Documentation

## Overview

The ai-backend is split between two components: A [FastAPI](https://fastapi.tiangolo.com/) access point for other components of the overall system and one or multiple [Celery Workers](https://docs.celeryq.dev/en/stable/#), which do the required computation. It is responsible for generating recommendations, the [Annoy Index](https://github.com/spotify/annoy) and summarizing text inputs. It communicates with web-scraper instances and the "normal" backend.

## Technologies

This is a concise list of technologies and concepts that are used. They are roughly sorted by their importance:

- [Celery](https://docs.celeryq.dev/en/stable/#)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PyTorch](https://pytorch.org/)
- [Scikit-Learn](https://scikit-learn.org/stable/)
- [RabbitMQ](https://rabbitmq.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [Celery Flower](https://flower.readthedocs.io/en/latest/)

## Development Guide (as of 2024.02.19)

Docker needs to be installed.  
Run this command in the root of the project

```bash
docker compose up
```

### Environment Guide

Depending on the setup configured in the .env file of the project the ai-backend will access different endpoints and will behave differently.  

| Env-Variable                  | Influence |
| ----------------------------- | ------- |
| AI_BACKEND_PORT               | The port of the FastAPI within the docker network    |
| AI_BACKEND_HOST_PORT          | The port of the FastAPI outside of the docker network (WARNING: If the API does not have authentication methods enabled, do not publish the port outside of private networks)     |
| AI_BACKEND_FLOWER_PORT        | The port of the Flower web-interface for monitoring celery workers    |
| AI_BACKEND_FLOWER_HOST_PORT   | Same as AI_BACKEND_HOST_PORT but for Flower   |
| AI_BACKEND_BROKER             | The URL to the used message broker (probably RabbitMQ)   |
| AI_BACKEND_RESULT_QUEUE       | The URL to the celery result backend (probably Redis)    |
| AI_BACKEND_DATA_PATH          | The folder the FastAPI uses to store or look up data like recommendation engines   |
| AI_BACKEDN_INITIAL_MODEL      | The name of the file of the initial model for the system. If left empty the system will build a new model based on the backend data on startup.    |

You can access:  
FastAPI via http://localhost:8000  
FastAPI ui via http://localhost:8000/docs  
Flower ui via http://localhost:5555/  
RabbitMQ ui via http://localhost:15672/

### Reset Project

run the following command to delete everything docker related. This includes volumes!

```bash
docker compose down -v
```

## Project Structure

All the code necessary to run the ai-backend is located within ai_backend/app/:  

main.py contains all the code for the API  
engine.py contains two classes used to generate and facilitate recommendations  
graphql_backend.py uses a GraphQL client to communicate with the "normal" backend  

Within ./app there is a folder containing all the celery specific code:  
celery_worker.py is the code used to start and run the celery worker  
celeryconfig.py configures said worker  
errors.py defines all the possible errors a worker can output as a result  
flowerconfig.py does currently nothing but can be used to configure the Flower web-monitor

A detailed German description of how the overall system works can be found in the [introduction](./Einfuehrung.md).