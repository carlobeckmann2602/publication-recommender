# Publikationsempfehlungen

## Starting the Project



### Dev Mode

1. Create a .env.dev file in the backend folder based on .env.example
2. run 

```bash
docker compose --env-file ./backend/.env.dev  up --build

```

### Prodduction Mode
1. Create a .env.prod file in the backend folder based on .env.example
2. run
```bash
docker compose --env-file ./backend/.env.prod  -f docker-compose.prod.yml  up --build
```