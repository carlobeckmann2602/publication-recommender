# Publikationsempfehlung AI-Backend Documentation

## Overview

The ai-backend is split between two main components: A [FastAPI](https://fastapi.tiangolo.com/) access point for other components of the overall system and one or multiple [Celery Workers](https://docs.celeryq.dev/en/stable/#), which do the required computation. It is responsible for compute intensive tasks. When generating recommendations, sentence transformer, support vector machines and other data science models are needed. The ai-backend provides these functions for other components (mainly the backend) in an easy way. Another important function of the ai-backend is to summarize a given body of work (e.g. scientifiy paper). The ai-backend is accesed by the backend and used web-scrapers.

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

The development version of the container always uses the CPU of the host machine. It is possible to also provide the hosts GPU (only nvidia GPU with Cuda support in first PCI-E slot) to the ai-backend worker. This will improve performance. To use this functionality start the production enviroment:

```bash
docker compose -f docker-compose.prod.yml up --profile gpu_worker up
```

### VAE Model for generate 3D Coordinates

In order to be able to use the generate 3D coordinate from embeddings function of the AI backend, a data folder with a models folder and a pre-trained vae model in it must be created parallel next to the app folder. The structure then looks like this:

```
ai_backend
└───app
│   │   ...
│
└───data
│   └───models
│       │   vae.pth
│
│   ...
```

In the event that a new vae model should be created based on the embeddings stored in the database, this can be triggered via build_tsne endpoint.

### Environment Guide

Depending on the setup configured in the .env file of the project the ai-backend will access different endpoints and will behave differently.

| Env-Variable                | Influence                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI_BACKEND_PORT             | The port of the FastAPI within the docker network                                                                                                                             |
| AI_BACKEND_HOST_PORT        | The port of the FastAPI outside of the docker network (WARNING: If the API does not have authentication methods enabled, do not publish the port outside of private networks) |
| AI_BACKEND_FLOWER_PORT      | The port of the Flower web-interface for monitoring celery workers                                                                                                            |
| AI_BACKEND_FLOWER_HOST_PORT | Same as AI_BACKEND_HOST_PORT but for Flower                                                                                                                                   |
| AI_BACKEND_BROKER           | The URL to the used message broker (probably RabbitMQ)                                                                                                                        |
| AI_BACKEND_RESULT_QUEUE     | The URL to the celery result backend (probably Redis)                                                                                                                         |
| AI_BACKEND_DATA_PATH        | The folder the FastAPI uses to store or look up data like saved uploaded files                                                                                                |
| FLOWER_AUTH_USER            | This username is used to authenticate when using the celery flower webui.                                                                                                     |
| FLOWER_AUTH_PASSWORD        | This password is used to authenticate when using the celery flower webui.                                                                                                     |

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
engine.py contains the summarizer class, which is used to summarize and encode text as well as the needed logical procedures.  
vae_model.py TODO  
graphql_backend.py and nns_request.py were used to fetch data from the backend. This is not neede anymore but because of backwards compatibility these file were not removed with then end of the semester (2024).

Within ./app there is a folder containing all the celery specific code:  
celery_worker.py is the code used to start and run the celery worker  
celeryconfig.py configures said worker  
errors.py defines all the possible errors a worker can output as a result  
flowerconfig.py configures the celery flower webui (currently just enables https authentification)

A detailed German description of how the overall system works can be found in the [introduction](./Einfuehrung.md).

## Generate 3D Coordinates

There is the endpoint "build_tsne" in the AI backend to generate coordinates for the 3D space. This can be called up when data is available in the backend database, with "amount" specifying how many data points are used as the basis for generating the coordinates. If ‘amount’ is not specified, all possible data from the backend is used. The ‘create_model’ flag allows a new VAE model to be trained and the ‘latent_loss’ parameter specifies how high the coordinate divergence loss is weighted. This value should be selected between 2 and 16 for ideal generation. The model created in this way is then located in the folder ./data/models
