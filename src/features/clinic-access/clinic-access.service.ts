import type { ApolloClient } from '@apollo/client';
import {
  CREATE_PET_SHARE_CODE_MUTATION,
  REVOKE_PET_CLINIC_ACCESS_MUTATION,
} from './graphql';
import type {
  CreatePetShareCodeMutationResult,
  PetShareCode,
  RevokePetClinicAccessMutationResult,
} from './types';

export async function createPetShareCode(
  client: ApolloClient,
  petId: string,
): Promise<PetShareCode> {
  const { data } = await client.mutate<CreatePetShareCodeMutationResult>({
    mutation: CREATE_PET_SHARE_CODE_MUTATION,
    variables: { petId },
  });

  const shareCode = data?.createPetShareCode;
  if (!shareCode) {
    throw new Error('Failed to create a share code.');
  }
  return shareCode;
}

export async function revokePetClinicAccess(
  client: ApolloClient,
  petId: string,
  clinicId: string,
): Promise<void> {
  const { data } = await client.mutate<RevokePetClinicAccessMutationResult>({
    mutation: REVOKE_PET_CLINIC_ACCESS_MUTATION,
    variables: { petId, clinicId },
  });

  if (!data?.revokePetClinicAccess) {
    throw new Error('Failed to revoke clinic access.');
  }
}
