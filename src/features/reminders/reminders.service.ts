import type { ApolloClient } from '@apollo/client';
import {
  COMPLETE_REMINDER_MUTATION,
  CREATE_REMINDER_MUTATION,
  DELETE_REMINDER_MUTATION,
  DISMISS_REMINDER_MUTATION,
  REMINDER_QUERY,
  REMINDERS_QUERY,
  UPDATE_REMINDER_MUTATION,
} from './graphql';
import type {
  CompleteReminderMutationResult,
  CompleteReminderMutationVariables,
  CreateReminderInput,
  CreateReminderMutationResult,
  CreateReminderMutationVariables,
  DeleteReminderMutationResult,
  DeleteReminderMutationVariables,
  DismissReminderMutationResult,
  DismissReminderMutationVariables,
  Reminder,
  ReminderQueryResult,
  ReminderQueryVariables,
  RemindersQueryResult,
  RemindersQueryVariables,
  UpdateReminderInput,
  UpdateReminderMutationResult,
  UpdateReminderMutationVariables,
} from './types';

export async function fetchRemindersForPet(
  client: ApolloClient,
  petId: string,
): Promise<Reminder[]> {
  const { data } = await client.query<
    RemindersQueryResult,
    RemindersQueryVariables
  >({
    query: REMINDERS_QUERY,
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  return data?.reminders ?? [];
}

export async function fetchReminderById(
  client: ApolloClient,
  id: string,
): Promise<Reminder> {
  const { data } = await client.query<ReminderQueryResult, ReminderQueryVariables>(
    {
      query: REMINDER_QUERY,
      variables: { id },
      fetchPolicy: 'network-only',
    },
  );

  if (!data?.reminder) {
    throw new Error('Reminder not found.');
  }

  return data.reminder;
}

export async function createReminder(
  client: ApolloClient,
  input: CreateReminderInput,
): Promise<Reminder> {
  const { data } = await client.mutate<
    CreateReminderMutationResult,
    CreateReminderMutationVariables
  >({
    mutation: CREATE_REMINDER_MUTATION,
    variables: { input },
  });

  if (!data?.createReminder) {
    throw new Error('Failed to create reminder.');
  }

  return data.createReminder;
}

export async function updateReminder(
  client: ApolloClient,
  id: string,
  input: UpdateReminderInput,
): Promise<Reminder> {
  const { data } = await client.mutate<
    UpdateReminderMutationResult,
    UpdateReminderMutationVariables
  >({
    mutation: UPDATE_REMINDER_MUTATION,
    variables: { id, input },
  });

  if (!data?.updateReminder) {
    throw new Error('Failed to update reminder.');
  }

  return data.updateReminder;
}

export async function completeReminder(
  client: ApolloClient,
  id: string,
): Promise<Reminder> {
  const { data } = await client.mutate<
    CompleteReminderMutationResult,
    CompleteReminderMutationVariables
  >({
    mutation: COMPLETE_REMINDER_MUTATION,
    variables: { id },
  });

  if (!data?.completeReminder) {
    throw new Error('Failed to complete reminder.');
  }

  return data.completeReminder;
}

export async function dismissReminder(
  client: ApolloClient,
  id: string,
): Promise<Reminder> {
  const { data } = await client.mutate<
    DismissReminderMutationResult,
    DismissReminderMutationVariables
  >({
    mutation: DISMISS_REMINDER_MUTATION,
    variables: { id },
  });

  if (!data?.dismissReminder) {
    throw new Error('Failed to dismiss reminder.');
  }

  return data.dismissReminder;
}

export async function deleteReminder(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeleteReminderMutationResult,
    DeleteReminderMutationVariables
  >({
    mutation: DELETE_REMINDER_MUTATION,
    variables: { id },
  });

  return data?.deleteReminder ?? false;
}
