import type { ApolloClient } from '@apollo/client';
import { getApiBaseUrl } from '../../config/api-base-url';
import { getAccessToken } from '../auth/token-storage';
import type { PetPhotoIntent } from './constants/pet-photo';
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

async function parsePetPhotoError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore
  }

  if (response.status === 503) {
    return 'Pet photo uploads are not available right now. Check that Cloudinary is configured on the server, then try again.';
  }

  if (response.status === 413 || response.status === 400) {
    return 'That photo could not be uploaded. Use a JPEG, PNG, or WebP image up to 5 MB.';
  }

  return 'Failed to update pet photo. Please try again.';
}

function mapRestPet(payload: Pet): Pet {
  return payload;
}

function syncPetPhotoInApolloCache(client: ApolloClient, pet: Pet): void {
  try {
    client.writeQuery<PetQueryResult, PetQueryVariables>({
      query: PET_QUERY,
      variables: { id: pet.id },
      data: { pet },
    });
  } catch {
    // Pet query may not be in cache yet.
  }

  try {
    const existing = client.readQuery<MyPetsQueryResult>({
      query: MY_PETS_QUERY,
    });
    if (!existing?.myPets) {
      return;
    }

    client.writeQuery<MyPetsQueryResult>({
      query: MY_PETS_QUERY,
      data: {
        myPets: existing.myPets.map((entry) =>
          entry.id === pet.id ? { ...entry, photoUrl: pet.photoUrl } : entry,
        ),
      },
    });
  } catch {
    // Pets list may not be in cache.
  }
}

export async function uploadPetPhoto(
  client: ApolloClient,
  petId: string,
  file: File,
): Promise<Pet> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('photo', file);

  const response = await fetch(`${getApiBaseUrl()}/pets/${petId}/photo`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parsePetPhotoError(response));
  }

  const json = (await response.json()) as Pet;
  const pet = mapRestPet(json);
  syncPetPhotoInApolloCache(client, pet);
  return pet;
}

export async function removePetPhoto(
  client: ApolloClient,
  petId: string,
): Promise<Pet> {
  const token = getAccessToken();

  const response = await fetch(`${getApiBaseUrl()}/pets/${petId}/photo`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parsePetPhotoError(response));
  }

  const json = (await response.json()) as Pet;
  const pet = mapRestPet(json);
  syncPetPhotoInApolloCache(client, pet);
  return pet;
}

export async function applyPetPhotoIntent(
  client: ApolloClient,
  petId: string,
  intent: PetPhotoIntent,
): Promise<Pet | undefined> {
  if (intent.kind === 'unchanged') {
    return undefined;
  }

  if (intent.kind === 'upload') {
    return uploadPetPhoto(client, petId, intent.file);
  }

  return removePetPhoto(client, petId);
}
