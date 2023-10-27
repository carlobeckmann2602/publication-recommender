# Publikationsempfehlungen

## Starting the Project

1. run 

```bash 
npm install
 ```

in ./frontend and ./backend

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