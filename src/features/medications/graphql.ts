import { gql } from '@apollo/client';

export const MEDICATION_FIELDS = gql`
  fragment MedicationFields on MedicationModel {
    id
    petId
    name
    dosage
    dosageUnit
    frequency
    startDate
    endDate
    veterinarianName
    clinicName
    notes
    isActive
    createdAt
    updatedAt
  }
`;

export const MEDICATIONS_QUERY = gql`
  query Medications($petId: ID!) {
    medications(petId: $petId) {
      ...MedicationFields
    }
  }
  ${MEDICATION_FIELDS}
`;

export const MEDICATION_QUERY = gql`
  query Medication($id: ID!) {
    medication(id: $id) {
      ...MedicationFields
    }
  }
  ${MEDICATION_FIELDS}
`;

export const CREATE_MEDICATION_MUTATION = gql`
  mutation CreateMedication($input: CreateMedicationInput!) {
    createMedication(input: $input) {
      ...MedicationFields
    }
  }
  ${MEDICATION_FIELDS}
`;

export const UPDATE_MEDICATION_MUTATION = gql`
  mutation UpdateMedication($id: ID!, $input: UpdateMedicationInput!) {
    updateMedication(id: $id, input: $input) {
      ...MedicationFields
    }
  }
  ${MEDICATION_FIELDS}
`;

export const DELETE_MEDICATION_MUTATION = gql`
  mutation DeleteMedication($id: ID!) {
    deleteMedication(id: $id)
  }
`;
