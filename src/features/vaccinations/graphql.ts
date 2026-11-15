import { gql } from '@apollo/client';

export const VACCINATION_FIELDS = gql`
  fragment VaccinationFields on VaccinationModel {
    id
    petId
    vaccineName
    administeredAt
    nextDueAt
    veterinarianName
    clinicName
    batchNumber
    notes
    createdAt
    updatedAt
  }
`;

export const VACCINATIONS_QUERY = gql`
  query Vaccinations($petId: ID!) {
    vaccinations(petId: $petId) {
      ...VaccinationFields
    }
  }
  ${VACCINATION_FIELDS}
`;

export const VACCINATION_QUERY = gql`
  query Vaccination($id: ID!) {
    vaccination(id: $id) {
      ...VaccinationFields
    }
  }
  ${VACCINATION_FIELDS}
`;

export const CREATE_VACCINATION_MUTATION = gql`
  mutation CreateVaccination($input: CreateVaccinationInput!) {
    createVaccination(input: $input) {
      ...VaccinationFields
    }
  }
  ${VACCINATION_FIELDS}
`;

export const UPDATE_VACCINATION_MUTATION = gql`
  mutation UpdateVaccination($id: ID!, $input: UpdateVaccinationInput!) {
    updateVaccination(id: $id, input: $input) {
      ...VaccinationFields
    }
  }
  ${VACCINATION_FIELDS}
`;

export const DELETE_VACCINATION_MUTATION = gql`
  mutation DeleteVaccination($id: ID!) {
    deleteVaccination(id: $id)
  }
`;
