export type Vaccination = {
  id: string;
  petId: string;
  vaccineName: string;
  administeredAt: string;
  nextDueAt?: string | null;
  veterinarianName?: string | null;
  clinicName?: string | null;
  batchNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateVaccinationInput = {
  petId: string;
  vaccineName: string;
  administeredAt: string;
  nextDueAt?: string;
  veterinarianName?: string;
  clinicName?: string;
  batchNumber?: string;
  notes?: string;
};

export type UpdateVaccinationInput = {
  vaccineName?: string;
  administeredAt?: string;
  nextDueAt?: string;
  veterinarianName?: string;
  clinicName?: string;
  batchNumber?: string;
  notes?: string;
};

export type VaccinationsQueryResult = {
  vaccinations: Vaccination[];
};

export type VaccinationsQueryVariables = {
  petId: string;
};

export type VaccinationQueryResult = {
  vaccination: Vaccination;
};

export type VaccinationQueryVariables = {
  id: string;
};

export type CreateVaccinationMutationResult = {
  createVaccination: Vaccination;
};

export type CreateVaccinationMutationVariables = {
  input: CreateVaccinationInput;
};

export type UpdateVaccinationMutationResult = {
  updateVaccination: Vaccination;
};

export type UpdateVaccinationMutationVariables = {
  id: string;
  input: UpdateVaccinationInput;
};

export type DeleteVaccinationMutationResult = {
  deleteVaccination: boolean;
};

export type DeleteVaccinationMutationVariables = {
  id: string;
};
