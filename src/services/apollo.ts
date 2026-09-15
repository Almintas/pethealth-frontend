import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

function getGraphqlUrl(): string {
  const url = import.meta.env.VITE_GRAPHQL_URL;
  if (!url) {
    throw new Error(
      'VITE_GRAPHQL_URL is not defined. Copy .env.example to .env and set the GraphQL endpoint.',
    );
  }
  return url;
}

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: getGraphqlUrl(),
  }),
  cache: new InMemoryCache(),
});
