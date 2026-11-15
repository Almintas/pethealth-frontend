import type { ApolloClient } from '@apollo/client';
import {
  CREATE_MEDICAL_RECORD_MUTATION,
  DELETE_MEDICAL_RECORD_MUTATION,
  MEDICAL_RECORD_QUERY,
  MEDICAL_RECORDS_QUERY,
  UPDATE_MEDICAL_RECORD_MUTATION,
} from './graphql';
import type {
  CreateMedicalRecordInput,
  CreateMedicalRecordMutationResult,
  CreateMedicalRecordMutationVariables,
  DeleteMedicalRecordMutationResult,
  DeleteMedicalRecordMutationVariables,
  MedicalRecord,
  MedicalRecordQueryResult,
  MedicalRecordQueryVariables,
  MedicalRecordsQueryResult,
  MedicalRecordsQueryVariables,
  UpdateMedicalRecordInput,
  UpdateMedicalRecordMutationResult,
  UpdateMedicalRecordMutationVariables,
} from './types';

export async function fetchMedicalRecordsForPet(
  client: ApolloClient,
  petId: string,
): Promise<MedicalRecord[]> {
  const { data } = await client.query<
    MedicalRecordsQueryResult,
    MedicalRecordsQueryVariables
  >({
    query: MEDICAL_RECORDS_QUERY,
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  return data?.medicalRecords ?? [];
}

export async function fetchMedicalRecordById(
  client: ApolloClient,
  id: string,
): Promise<MedicalRecord> {
  const { data } = await client.query<
    MedicalRecordQueryResult,
    MedicalRecordQueryVariables
  >({
    query: MEDICAL_RECORD_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (!data?.medicalRecord) {
    throw new Error('Medical record not found.');
  }

  return data.medicalRecord;
}

export async function createMedicalRecord(
  client: ApolloClient,
  input: CreateMedicalRecordInput,
): Promise<MedicalRecord> {
  const { data } = await client.mutate<
    CreateMedicalRecordMutationResult,
    CreateMedicalRecordMutationVariables
  >({
    mutation: CREATE_MEDICAL_RECORD_MUTATION,
    variables: { input },
  });

  if (!data?.createMedicalRecord) {
    throw new Error('Failed to create medical record.');
  }

  return data.createMedicalRecord;
}

export async function updateMedicalRecord(
  client: ApolloClient,
  id: string,
  input: UpdateMedicalRecordInput,
): Promise<MedicalRecord> {
  const { data } = await client.mutate<
    UpdateMedicalRecordMutationResult,
    UpdateMedicalRecordMutationVariables
  >({
    mutation: UPDATE_MEDICAL_RECORD_MUTATION,
    variables: { id, input },
  });

  if (!data?.updateMedicalRecord) {
    throw new Error('Failed to update medical record.');
  }

  return data.updateMedicalRecord;
}

export async function deleteMedicalRecord(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeleteMedicalRecordMutationResult,
    DeleteMedicalRecordMutationVariables
  >({
    mutation: DELETE_MEDICAL_RECORD_MUTATION,
    variables: { id },
  });

  return data?.deleteMedicalRecord ?? false;
}
