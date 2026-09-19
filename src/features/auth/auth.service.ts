import type { ApolloClient } from '@apollo/client';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION } from './graphql';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './token-storage';
import type {
  AuthPayload,
  AuthUser,
  LoginInput,
  RegisterInput,
} from './types';

type LoginMutationResult = {
  login: AuthPayload;
};

type RegisterMutationResult = {
  register: AuthUser;
};

type MeQueryResult = {
  me: AuthUser;
};

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

export { getAccessToken };

export async function login(
  client: ApolloClient,
  input: LoginInput,
): Promise<AuthUser> {
  const { data } = await client.mutate<LoginMutationResult>({
    mutation: LOGIN_MUTATION,
    variables: { input },
  });

  const payload = data?.login;
  if (!payload?.accessToken || !payload.user) {
    throw new Error('Login failed: missing authentication payload.');
  }

  setAccessToken(payload.accessToken);
  return payload.user;
}

export async function register(
  client: ApolloClient,
  input: RegisterInput,
): Promise<AuthUser> {
  const { data } = await client.mutate<RegisterMutationResult>({
    mutation: REGISTER_MUTATION,
    variables: { input },
  });

  const user = data?.register;
  if (!user) {
    throw new Error('Registration failed: missing user data.');
  }

  return user;
}

export async function fetchCurrentUser(
  client: ApolloClient,
): Promise<AuthUser | null> {
  if (!getAccessToken()) {
    return null;
  }

  try {
    const { data, error } = await client.query<MeQueryResult>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });

    if (error || !data?.me) {
      clearAccessToken();
      return null;
    }

    return data.me;
  } catch {
    clearAccessToken();
    return null;
  }
}

export async function logout(client: ApolloClient): Promise<void> {
  clearAccessToken();
  await client.clearStore();
}
