import type { ApolloClient } from '@apollo/client';
import {
  CREATE_MEDICATION_MUTATION,
  DELETE_MEDICATION_MUTATION,
  MEDICATION_QUERY,
  MEDICATIONS_QUERY,
  UPDATE_MEDICATION_MUTATION,
} from './graphql';
import type {
  CreateMedicationInput,
  CreateMedicationMutationResult,
  CreateMedicationMutationVariables,
  DeleteMedicationMutationResult,
  DeleteMedicationMutationVariables,
  Medication,
  MedicationQueryResult,
  MedicationQueryVariables,
  MedicationsQueryResult,
  MedicationsQueryVariables,
  UpdateMedicationInput,
  UpdateMedicationMutationResult,
  UpdateMedicationMutationVariables,
} from './types';

export async function fetchMedicationsForPet(
  client: ApolloClient,
  petId: string,
): Promise<Medication[]> {
  const { data } = await client.query<
    MedicationsQueryResult,
    MedicationsQueryVariables
  >({
    query: MEDICATIONS_QUERY,
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  return data?.medications ?? [];
}

export async function fetchMedicationById(
  client: ApolloClient,
  id: string,
): Promise<Medication> {
  const { data } = await client.query<
    MedicationQueryResult,
    MedicationQueryVariables
  >({
    query: MEDICATION_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (!data?.medication) {
    throw new Error('Medication not found.');
  }

  return data.medication;
}

export async function createMedication(
  client: ApolloClient,
  input: CreateMedicationInput,
): Promise<Medication> {
  const { data } = await client.mutate<
    CreateMedicationMutationResult,
    CreateMedicationMutationVariables
  >({
    mutation: CREATE_MEDICATION_MUTATION,
    variables: { input },
  });

  if (!data?.createMedication) {
    throw new Error('Failed to create medication.');
  }

  return data.createMedication;
}

export async function updateMedication(
  client: ApolloClient,
  id: string,
  input: UpdateMedicationInput,
): Promise<Medication> {
  const { data } = await client.mutate<
    UpdateMedicationMutationResult,
    UpdateMedicationMutationVariables
  >({
    mutation: UPDATE_MEDICATION_MUTATION,
    variables: { id, input },
  });

  if (!data?.updateMedication) {
    throw new Error('Failed to update medication.');
  }

  return data.updateMedication;
}

export async function deleteMedication(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeleteMedicationMutationResult,
    DeleteMedicationMutationVariables
  >({
    mutation: DELETE_MEDICATION_MUTATION,
    variables: { id },
  });

  return data?.deleteMedication ?? false;
}
