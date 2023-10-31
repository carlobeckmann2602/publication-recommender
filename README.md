# Publikationsempfehlungen



## Starting the Project

### Dev Mode

1. Create a .env.dev file in the backend folder based on .env.example.
2. Create a .env file in the frontend folder based on .env.example
3. Run 

```bash 
npm install
 ```

in ./frontend and ./backend. If you don't do this some folders will be crated through docker and their owner will be root instead of you. 

4. Run 

```bash
docker compose --env-file ./backend/.env.dev  up --build
```

### Prodduction Mode
1. Create a .env.prod file in the backend folder based on .env.example
2. Create a .env.prod file in the frontend folder based on .env.example
3. run
```bash
docker compose --env-file ./backend/.env.prod  -f docker-compose.prod.yml  up --build
```