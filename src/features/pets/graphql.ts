import { gql } from '@apollo/client';

export const PET_FIELDS = gql`
  fragment PetFields on PetModel {
    id
    ownerId
    name
    species
    breed
    gender
    birthDate
    microchipNumber
    createdAt
    updatedAt
  }
`;

export const MY_PETS_QUERY = gql`
  query MyPets {
    myPets {
      ...PetFields
    }
  }
  ${PET_FIELDS}
`;

export const PET_QUERY = gql`
  query Pet($id: ID!) {
    pet(id: $id) {
      ...PetFields
    }
  }
  ${PET_FIELDS}
`;

export const CREATE_PET_MUTATION = gql`
  mutation CreatePet($input: CreatePetInput!) {
    createPet(input: $input) {
      ...PetFields
    }
  }
  ${PET_FIELDS}
`;

export const UPDATE_PET_MUTATION = gql`
  mutation UpdatePet($id: ID!, $input: UpdatePetInput!) {
    updatePet(id: $id, input: $input) {
      ...PetFields
    }
  }
  ${PET_FIELDS}
`;

export const DELETE_PET_MUTATION = gql`
  mutation DeletePet($id: ID!) {
    deletePet(id: $id)
  }
`;
