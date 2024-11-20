# Next.js Frontend

## Overview

This frontend is a [Next.js application](https://nextjs.org/docs). It is the users interface of the project.

## Technologies

This is a concise list of technologies and concepts that are used. They are roughly sorted by their importance:

- [Next.js](https://nextjs.org/docs): React-based web framework that provides the underlying architecture for the frontend.
- [NextAuth.js](https://next-auth.js.org): An extension for [Next.js](https://nextjs.org/docs), used for user management, authentication and authorisation.
- [TypeScript](https://www.typescriptlang.org/docs/): Typed programming language (superset of JavaScript) used to implement the frontend
- [Apollo Client](https://www.apollographql.com/docs/react/) ([with Next.js](https://github.com/apollographql/apollo-client-nextjs)): State management library which is used to communicate with the backend-API via [GraphQL](https://graphql.org).
  - [GraphQL](https://graphql.org): Query Language used with [Apollo Client](https://www.apollographql.com/docs/react/) to fetch data from the backend and execute CRUD-operations via queries & mutations.
- [Zustand](https://github.com/pmndrs/zustand): Lightweight state management for caching data in the frontend (as opposed to e.g. [Redux](https://redux.js.org/))
- [Tailwind](https://tailwindcss.com/docs/installation): CSS framework used to style HMTL & react elements throughout the frontend
- [Shadcn/ui](https://ui.shadcn.com/): Component library for react. The library is based on [radix UI](https://www.radix-ui.com/), which therefore can be used aswell.
- [Lucide Icons](https://lucide.dev): Icon library for embedding symbols and icons.

## Development Guide (as of 01.09.2024)

Create an .env file in the root of the project and frontend folder based on .env.example.

### Getting started without Docker (Front-end only)

Install all dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Note that Next.js supports hot-reload. This means that any changes made to the code will automatically trigger a re-render and be displayed immediately. Note that both the browser and Next.js use caching mechanisms: Therefore, some changes may require an explicit reload of the page or clearing the cache (based on the `/.next` folder).

### Development Frontend with Docker

Information on development building of the entire project is available in the top level README.md.

## Build Guide (as of 01.09.2024)

### Build Frontend without Docker (Frontend only)

```bash
npm run build
```

### Build Frontend with Docker

Information on building of the entire project is available in the top level README.md.

## Project Structure

An understanding of the basic Next.js concepts is required to fully understand the project structure.

The entry point (homepage) is represented by the page.tsx in the app folder. The folders in the frontend are organized as follows:

### Pages Folder

All pages of the website are located in the "app" folder. The structure of the folders also corresponds to the website structure and the URL paths (file-based routing).

### Components Folder

Individual components used on different pages are located in the "components" folder. The sub-folder "components/ui" contains all the installed [Shadcn/ui](https://ui.shadcn.com/) components in auto-generated files. Therefore, these files should be modified with care. Newly installed [Shadcn/ui](https://ui.shadcn.com/) components (see the installation instructions in the documentation for each [Shadcn/ui](https://ui.shadcn.com/) component) are automatically added to this subdirectory.

### GraphQL Folder

All GraphQL queries and mutations are located in the "graphql" folder.

### Stores Folder

All state stores that are used in the frontend to hold data for the user are located in the "stores" folder.

### Context Folder

All React contexts that are used in the frontend are located in the "contexts" folder.

### Hook Folder

All React hooks that are used in the frontend are located in the "hooks" folder.

### Assets Folder

The "assets" folder contains all SVGs or other images used in the website.

### Lib Folder

The "lib" folder contains general functions that are used in several places and cannot be assigned to the other folders.

### Constants Folder

All constants used in the frontend are defined in files in the "constants" folder.

### Public Folder

Data and images that are to be embedded on the website must be in the public folder in order to be displayed on the website.

### Middleware.ts

The Middleware.ts file contains all paths that should only be accessible via [NextAuth.js](https://next-auth.js.org) as soon as the user is logged in.

## GraphQL Information

### Using Apollo Client

Generate Queries/Mutation:

- create .gql file with query/mutation in /graphql folder
- run

```bash
npm run codegen
```

Use Apollo Client on Server-side:

```typescript
import { getClient } from "@/lib/client";

export default async function Example() {
  //GraphQL Query
  const response = await getClient().query({
    query: QueryDocument,
    variables: {
      key: value,
    },
  });

  //GraphQL Mutation
  const response = await getClient().mutation({
    query: MutationDocument,
    variables: {
      key: value,
    },
  });
}
```

Use Apollo Client on Client-side:

```typescript
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useMutation } from "@apollo/client";
import { useLazyQuery } from "@apollo/client";

export default async function Example() {
  //GraphQL Query
  const { data } = useSuspenseQuery(QueryDocument, {
    variables: { key: value },
  });

  //GraphQL Query
  const [lazyQuery, { data }] = useLazyQuery(QueryDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  //GraphQL Mutation
  const [mutation, { error: mutationError }] = useMutation(MutationDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
```
