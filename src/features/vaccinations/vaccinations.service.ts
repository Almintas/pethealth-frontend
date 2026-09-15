import type { ApolloClient } from '@apollo/client';
import {
  CREATE_VACCINATION_MUTATION,
  DELETE_VACCINATION_MUTATION,
  VACCINATION_QUERY,
  VACCINATIONS_QUERY,
  UPDATE_VACCINATION_MUTATION,
} from './graphql';
import type {
  CreateVaccinationInput,
  CreateVaccinationMutationResult,
  CreateVaccinationMutationVariables,
  DeleteVaccinationMutationResult,
  DeleteVaccinationMutationVariables,
  UpdateVaccinationInput,
  UpdateVaccinationMutationResult,
  UpdateVaccinationMutationVariables,
  Vaccination,
  VaccinationQueryResult,
  VaccinationQueryVariables,
  VaccinationsQueryResult,
  VaccinationsQueryVariables,
} from './types';

export async function fetchVaccinationsForPet(
  client: ApolloClient,
  petId: string,
): Promise<Vaccination[]> {
  const { data } = await client.query<
    VaccinationsQueryResult,
    VaccinationsQueryVariables
  >({
    query: VACCINATIONS_QUERY,
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  return data?.vaccinations ?? [];
}

export async function fetchVaccinationById(
  client: ApolloClient,
  id: string,
): Promise<Vaccination> {
  const { data } = await client.query<
    VaccinationQueryResult,
    VaccinationQueryVariables
  >({
    query: VACCINATION_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (!data?.vaccination) {
    throw new Error('Vaccination not found.');
  }

  return data.vaccination;
}

export async function createVaccination(
  client: ApolloClient,
  input: CreateVaccinationInput,
): Promise<Vaccination> {
  const { data } = await client.mutate<
    CreateVaccinationMutationResult,
    CreateVaccinationMutationVariables
  >({
    mutation: CREATE_VACCINATION_MUTATION,
    variables: { input },
  });

  if (!data?.createVaccination) {
    throw new Error('Failed to create vaccination.');
  }

  return data.createVaccination;
}

export async function updateVaccination(
  client: ApolloClient,
  id: string,
  input: UpdateVaccinationInput,
): Promise<Vaccination> {
  const { data } = await client.mutate<
    UpdateVaccinationMutationResult,
    UpdateVaccinationMutationVariables
  >({
    mutation: UPDATE_VACCINATION_MUTATION,
    variables: { id, input },
  });

  if (!data?.updateVaccination) {
    throw new Error('Failed to update vaccination.');
  }

  return data.updateVaccination;
}

export async function deleteVaccination(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeleteVaccinationMutationResult,
    DeleteVaccinationMutationVariables
  >({
    mutation: DELETE_VACCINATION_MUTATION,
    variables: { id },
  });

  return data?.deleteVaccination ?? false;
}
