import { gql } from '@apollo/client';

export const MEDICAL_RECORD_FIELDS = gql`
  fragment MedicalRecordFields on MedicalRecordModel {
    id
    petId
    date
    type
    title
    description
    diagnosis
    veterinarianName
    clinicName
    notes
    createdAt
    updatedAt
  }
`;

export const MEDICAL_RECORDS_QUERY = gql`
  query MedicalRecords($petId: ID!) {
    medicalRecords(petId: $petId) {
      ...MedicalRecordFields
    }
  }
  ${MEDICAL_RECORD_FIELDS}
`;

export const MEDICAL_RECORD_QUERY = gql`
  query MedicalRecord($id: ID!) {
    medicalRecord(id: $id) {
      ...MedicalRecordFields
    }
  }
  ${MEDICAL_RECORD_FIELDS}
`;

export const CREATE_MEDICAL_RECORD_MUTATION = gql`
  mutation CreateMedicalRecord($input: CreateMedicalRecordInput!) {
    createMedicalRecord(input: $input) {
      ...MedicalRecordFields
    }
  }
  ${MEDICAL_RECORD_FIELDS}
`;

export const UPDATE_MEDICAL_RECORD_MUTATION = gql`
  mutation UpdateMedicalRecord($id: ID!, $input: UpdateMedicalRecordInput!) {
    updateMedicalRecord(id: $id, input: $input) {
      ...MedicalRecordFields
    }
  }
  ${MEDICAL_RECORD_FIELDS}
`;

export const DELETE_MEDICAL_RECORD_MUTATION = gql`
  mutation DeleteMedicalRecord($id: ID!) {
    deleteMedicalRecord(id: $id)
  }
`;
