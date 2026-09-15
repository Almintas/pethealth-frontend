import type { ApolloClient } from '@apollo/client';
import {
  CREATE_PET_MUTATION,
  DELETE_PET_MUTATION,
  MY_PETS_QUERY,
  PET_QUERY,
  UPDATE_PET_MUTATION,
} from './graphql';
import type {
  CreatePetInput,
  CreatePetMutationResult,
  CreatePetMutationVariables,
  DeletePetMutationResult,
  DeletePetMutationVariables,
  MyPetsQueryResult,
  Pet,
  PetQueryResult,
  PetQueryVariables,
  UpdatePetInput,
  UpdatePetMutationResult,
  UpdatePetMutationVariables,
} from './types';

export async function fetchMyPets(client: ApolloClient): Promise<Pet[]> {
  const { data } = await client.query<MyPetsQueryResult>({
    query: MY_PETS_QUERY,
    fetchPolicy: 'network-only',
  });

  return data?.myPets ?? [];
}

export async function fetchPetById(
  client: ApolloClient,
  id: string,
): Promise<Pet> {
  const { data } = await client.query<PetQueryResult, PetQueryVariables>({
    query: PET_QUERY,
    variables: { id },
    fetchPolicy: 'network-only',
  });

  if (!data?.pet) {
    throw new Error('Pet not found.');
  }

  return data.pet;
}

export async function createPet(
  client: ApolloClient,
  input: CreatePetInput,
): Promise<Pet> {
  const { data } = await client.mutate<
    CreatePetMutationResult,
    CreatePetMutationVariables
  >({
    mutation: CREATE_PET_MUTATION,
    variables: { input },
  });

  if (!data?.createPet) {
    throw new Error('Failed to create pet.');
  }

  return data.createPet;
}

export async function updatePet(
  client: ApolloClient,
  id: string,
  input: UpdatePetInput,
): Promise<Pet> {
  const { data } = await client.mutate<
    UpdatePetMutationResult,
    UpdatePetMutationVariables
  >({
    mutation: UPDATE_PET_MUTATION,
    variables: { id, input },
  });

  if (!data?.updatePet) {
    throw new Error('Failed to update pet.');
  }

  return data.updatePet;
}

export async function deletePet(
  client: ApolloClient,
  id: string,
): Promise<boolean> {
  const { data } = await client.mutate<
    DeletePetMutationResult,
    DeletePetMutationVariables
  >({
    mutation: DELETE_PET_MUTATION,
    variables: { id },
  });

  return data?.deletePet ?? false;
}
