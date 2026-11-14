import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import {
  getAccessToken,
  notifySessionExpired,
} from '../features/auth/token-storage';

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

/*
 * The JWT guard rejects expired or invalid tokens with a bare "Unauthorized"
 * error. Credential failures (wrong password) use other messages and are
 * handled by the forms themselves, so they must not end the session.
 */
const sessionErrorLink = new ErrorLink(({ error }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return;
  }
  const tokenRejected = error.errors.some(
    (graphQLError) =>
      graphQLError.extensions?.code === 'UNAUTHENTICATED' &&
      graphQLError.message.trim().toLowerCase() === 'unauthorized',
  );
  if (tokenRejected) {
    notifySessionExpired();
  }
});

const httpLink = new HttpLink({
  uri: getGraphqlUrl(),
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([sessionErrorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
