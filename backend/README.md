# Publikationsempfehlung Backend Documentation

## Overview

This backend is a [NestJS application](https://docs.nestjs.com/). It is the centerpiece of the project and its responsibility is to connect the different services and manage the [PostgreSQL database](https://www.postgresql.org/).

## Technologies

This is a concise list of technologies and concepts that are used. They are roughly sorted by their importance:

- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](ttps://docs.nestjs.com/)
- [Graphql (used via the NestJS GraphQL module)](https://docs.nestjs.com/graphql/quick-start)
- [TypeORM](https://typeorm.io/)
- SQL
- class-validator / class-transformer (TypeScript packages)
- [docker](https://www.docker.com/)
- JWTs

## Developement Guide (as of 2024.01.18)

Docker needs to be installed.
The GraphQL endpoint will be available at http://localhost:3001/graphql

Run this command in the root of the project

```bash
docker compose up
```

### Start with seeders

To start seed the database, run the following command

```bash
docker compose --profile seeders up
```

**IMPORTANT:** To make the seeder work, you have to change 1 line of code:

```
> ./src/modules/core/publication/entities/embedding.entity.ts

17   @Column('vector')
```
into
```
17   @Column()
```

After running the seeder make sure to change the line back. Otherwise the next migration will break things. More about this [here](https://projectbase.medien.hs-duesseldorf.de/ki/publikationsempfehlung/backend/-/issues/13).

### Reset Project

run the following command to delete everything docker related. This includes volumes!

```bash
docker compose down -v
```

## Project Structure

An understanding of basic NestJS concepts is necessary to fully understand the project structure.

The entry point is main.ts in the src folder. 

Configuration, migrations and seeders for the database are in the database folder.

The modules in the modules folder are separated in 3 folders.

1. database: Loads the database configuration
2. cron: Manages tasks that are supposed to run regularly
3. core: Business logic: Core functionality

### Core

It was decided to bundle multiple essential business logic domains into one module to minimize the otherwise necessary boilerplate code required by NestJS regarding modules.

#### auth

Manages user authorization and authentication by using a custom decorater that checks if a valid bearer token is present in the header for request that are user specific.

#### publication

Provides recommenations based on queries or publications. Provides favorites for logged-in users.   

#### user

Handles user registration, deletion and changes in the user data.

## Foldernames, Filenames and Conventions

GraphlQL queries and mutations are provided by resolvers.

The business logic lives in services. Resolvers call functions from services and return the results.

Exceptions are either HTTP exceptions or business logic exceptions. Resolvers map potentially occurring business logic exceptions to HTTP exceptions.

Data transfer objects (DTOs) are used to type, validate and transform data that is received or send.

Entities are code representations of the underlying data layer provided by typeORM. They are used to update the database and provide a certain amount of type safety.
For example, the publication entity in src/modules/core/publication/entities/publication.entity.ts represents the publication database table.

## Migrations

Migrations are used to update the database structure.
They can either be created manually or by running.

```bash
    npm run migration:generate 
```

They can be found in the folder src/database/migrations

Migrations are automatically run against the database on project startup because the command for it is included in the docker-compose.yml and docker-compose.prod.yml files. 

## Additional information

Additional information might be available in the top level README.md

Written by Robin Steil