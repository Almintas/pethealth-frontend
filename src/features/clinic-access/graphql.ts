import { gql } from '@apollo/client';

export const PET_CLINIC_ACCESS_QUERY = gql`
  query PetClinicAccess($petId: ID!) {
    petClinicAccess(petId: $petId) {
      clinicId
      clinicName
      clinicPhone
      clinicAddress
      grantedAt
    }
  }
`;

export const CREATE_PET_SHARE_CODE_MUTATION = gql`
  mutation CreatePetShareCode($petId: ID!) {
    createPetShareCode(petId: $petId) {
      code
      expiresAt
    }
  }
`;

export const REVOKE_PET_CLINIC_ACCESS_MUTATION = gql`
  mutation RevokePetClinicAccess($petId: ID!, $clinicId: ID!) {
    revokePetClinicAccess(petId: $petId, clinicId: $clinicId)
  }
`;

export const PET_ACTIVITY_LOG_QUERY = gql`
  query PetActivityLog($petId: ID!, $limit: Int) {
    petActivityLog(petId: $petId, limit: $limit) {
      id
      action
      entityType
      actorType
      actorName
      clinicName
      summary
      createdAt
    }
  }
`;
