# Next.js Frontend

## Technologies

- [Next.js](https://nextjs.org/docs)
    - [Typescript](https://www.typescriptlang.org/docs/)
    - [Tailwind](https://tailwindcss.com/docs/installation)
    - [shadcn/ui](https://tailwindcss.com/docs/installation)
    - [Lucide Icons](https://lucide.dev)
    - [NextAuth.js](https://next-auth.js.org)
    - [Zustand](https://github.com/pmndrs/zustand)
    - [Apollo Client](https://www.apollographql.com/docs/react/) ([with Next.js](https://github.com/apollographql/apollo-client-nextjs))
        - [GraphQL](https://graphql.org)

## Getting started without Docker

Install all dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build Frontend without Docker

```bash
npm run build
```

## Using Apollo Client

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
        key: value
      },
    });

	//GraphQL Mutation
	const response = await getClient().mutation({
      query: MutationDocument,
      variables: {
        key: value
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
	const [lazyQuery, { data }] = useLazyQuery(QueryDocument, 
		{
	    context: {
	      headers: {
	        Authorization: `Bearer ${token}`,
	      },
	    },
	  });

	//GraphQL Mutation
	const [mutation, { error: mutationError }] = useMutation(
    MutationDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    }
  );
}
```