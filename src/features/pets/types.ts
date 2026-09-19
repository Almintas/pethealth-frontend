export type Pet = {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  microchipNumber?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePetInput = {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  microchipNumber?: string;
};

export type UpdatePetInput = {
  name?: string;
  species?: string;
  breed?: string;
  gender?: string;
  birthDate?: string;
  microchipNumber?: string;
};

export type MyPetsQueryResult = {
  myPets: Pet[];
};

export type PetQueryResult = {
  pet: Pet;
};

export type PetQueryVariables = {
  id: string;
};

export type CreatePetMutationResult = {
  createPet: Pet;
};

export type CreatePetMutationVariables = {
  input: CreatePetInput;
};

export type UpdatePetMutationResult = {
  updatePet: Pet;
};

export type UpdatePetMutationVariables = {
  id: string;
  input: UpdatePetInput;
};

export type DeletePetMutationResult = {
  deletePet: boolean;
};

export type DeletePetMutationVariables = {
  id: string;
};
