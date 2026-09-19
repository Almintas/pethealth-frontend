import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getAccessToken } from '../features/auth/token-storage';

function getGraphqlUrl(): string {
  const url = import.meta.env.VITE_GRAPHQL_URL;
  if (!url) {
    throw new Error(
      'VITE_GRAPHQL_URL is not defined. Copy .env.example to .env and set the GraphQL endpoint.',
    );
  }
  return url;
}

const authLink = new SetContextLink((prevContext) => {
  const token = getAccessToken();
  const headers = prevContext.headers ?? {};

  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const httpLink = new HttpLink({
  uri: getGraphqlUrl(),
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
