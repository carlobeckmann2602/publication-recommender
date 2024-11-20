import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  InMemoryCache,
  ApolloClient,
} from "@apollo/experimental-nextjs-app-support";

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.SERVER_BACKEND_GRAPHQL_ENDPOINT,
    }),
  });
});
