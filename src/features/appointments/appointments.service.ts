import type { ApolloClient } from '@apollo/client';
import {
  APPOINTMENT_QUERY,
  APPOINTMENTS_QUERY,
  CREATE_APPOINTMENT_MUTATION,
  DELETE_APPOINTMENT_MUTATION,
  UPDATE_APPOINTMENT_MUTATION,
} from './graphql';
import type {
  Appointment,
  AppointmentQueryResult,
  AppointmentQueryVariables,
  AppointmentsQueryResult,
  AppointmentsQueryVariables,
  CreateAppointmentInput,
  CreateAppointmentMutationResult,
  CreateAppointmentMutationVariables,
  DeleteAppointmentMutationResult,
  DeleteAppointmentMutationVariables,
  UpdateAppointmentInput,
  UpdateAppointmentMutationResult,
  UpdateAppointmentMutationVariables,
} from './types';

export async function fetchAppointmentsForPet(
  client: ApolloClient,
  petId: string,
): Promise<Appointment[]> {
  const { data } = await client.query<
    AppointmentsQueryResult,
    AppointmentsQueryVariables
  >({
    query: APPOINTMENTS_QUERY,
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  return data?.appointments ?? [];
}

export async function fetchAppointmentById(
  client: ApolloClient,
  id: string,
): Promise<Appointment> {
  const { data } = await client.query<
    AppointmentQueryResult,
    AppointmentQueryVariables
  >({
    query: APPOINTMENT_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (!data?.appointment) {
    throw new Error('Appointment not found.');
  }

  return data.appointment;
}

export async function createAppointment(
  client: ApolloClient,
  input: CreateAppointmentInput,
): Promise<Appointment> {
  const { data } = await client.mutate<
    CreateAppointmentMutationResult,
    CreateAppointmentMutationVariables
  >({
    mutation: CREATE_APPOINTMENT_MUTATION,
    variables: { input },
  });

  if (!data?.createAppointment) {
    throw new Error('Failed to create appointment.');
  }

  return data.createAppointment;
}

export async function updateAppointment(
  client: ApolloClient,
  id: string,
  input: UpdateAppointmentInput,
): Promise<Appointment> {
  const { data } = await client.mutate<
    UpdateAppointmentMutationResult,
    UpdateAppointmentMutationVariables
  >({
    mutation: UPDATE_APPOINTMENT_MUTATION,
    variables: { id, input },
  });

  if (!data?.updateAppointment) {
    throw new Error('Failed to update appointment.');
  }

  return data.updateAppointment;
}

export async function deleteAppointment(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeleteAppointmentMutationResult,
    DeleteAppointmentMutationVariables
  >({
    mutation: DELETE_APPOINTMENT_MUTATION,
    variables: { id },
  });

  return data?.deleteAppointment ?? false;
}
