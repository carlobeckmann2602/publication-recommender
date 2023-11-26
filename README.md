# Publikationsempfehlungen

## Starting the Project

### Dev Mode

Create .env file in the root of the project based on .env.example

#### Start

```bash
docker compose up
```

#### Start with seeders
```bash
docker compose --profile seeders up
```

#### SSH into a started container
```bash
docker exec -it <container> /bin/sh
```

#### RabbitMQ Management

host:RABBITMQ_MANAGEMENT_PORT

Example: localhost:15672
