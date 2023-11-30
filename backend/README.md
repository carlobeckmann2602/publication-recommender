## Description

Publication Recommender

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrations

```bash
# create migration
$ npm run migration:create -name=<migration_name>

# generate migration based on changes in the entities
$ npm run migration:generate -name=<migration_name>

# run migrations
$ npm run migration:run

# revert migration
$ npm run migration:revert
```

## Seeds

```bash
# create seed
$ npm run seed:create -name=<seed_name>

# run seeds
$ npm run seed:run
```

## Drop all tables:

```bash
$ npm run db:drop
```

## License

Nest is [MIT licensed](LICENSE).
