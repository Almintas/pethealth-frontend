import type { ApolloClient } from '@apollo/client';
import {
  CHANGE_PASSWORD_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
  REGISTER_MUTATION,
  UPDATE_NOTIFICATION_PREFERENCES_MUTATION,
  UPDATE_PROFILE_MUTATION,
} from './graphql';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './token-storage';
import type {
  AuthPayload,
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateNotificationPreferencesInput,
  UpdateProfileInput,
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

type UpdateProfileMutationResult = {
  updateProfile: AuthUser;
};

type ChangePasswordMutationResult = {
  changePassword: boolean;
};

type UpdateNotificationPreferencesMutationResult = {
  updateNotificationPreferences: AuthUser;
};

export function syncAuthUserCache(
  client: ApolloClient,
  user: AuthUser,
): void {
  client.writeQuery<MeQueryResult>({
    query: ME_QUERY,
    data: { me: user },
  });
}

export async function updateProfile(
  client: ApolloClient,
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const { data } = await client.mutate<UpdateProfileMutationResult>({
    mutation: UPDATE_PROFILE_MUTATION,
    variables: { input },
  });

  const user = data?.updateProfile;
  if (!user) {
    throw new Error('Failed to update profile.');
  }

  syncAuthUserCache(client, user);
  return user;
}

export async function changePassword(
  client: ApolloClient,
  input: ChangePasswordInput,
): Promise<boolean> {
  const { data } = await client.mutate<ChangePasswordMutationResult>({
    mutation: CHANGE_PASSWORD_MUTATION,
    variables: { input },
  });

  if (!data?.changePassword) {
    throw new Error('Failed to change password.');
  }

  return true;
}

export async function updateNotificationPreferences(
  client: ApolloClient,
  input: UpdateNotificationPreferencesInput,
): Promise<AuthUser> {
  const { data } = await client.mutate<UpdateNotificationPreferencesMutationResult>({
    mutation: UPDATE_NOTIFICATION_PREFERENCES_MUTATION,
    variables: { input },
  });

  const user = data?.updateNotificationPreferences;
  if (!user) {
    throw new Error('Failed to update notification preferences.');
  }

  syncAuthUserCache(client, user);
  return user;
}
