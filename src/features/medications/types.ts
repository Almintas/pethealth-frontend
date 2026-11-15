export type Medication = {
  id: string;
  petId: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  veterinarianName?: string | null;
  clinicName?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMedicationInput = {
  petId: string;
  name: string;
  dosage: number;
  dosageUnit: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
  isActive?: boolean;
};

export type UpdateMedicationInput = {
  name?: string;
  dosage?: number;
  dosageUnit?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
  isActive?: boolean;
};

export type MedicationsQueryResult = {
  medications: Medication[];
};

export type MedicationsQueryVariables = {
  petId: string;
};

export type MedicationQueryResult = {
  medication: Medication;
};

export type MedicationQueryVariables = {
  id: string;
};

export type CreateMedicationMutationResult = {
  createMedication: Medication;
};

export type CreateMedicationMutationVariables = {
  input: CreateMedicationInput;
};

export type UpdateMedicationMutationResult = {
  updateMedication: Medication;
};

export type UpdateMedicationMutationVariables = {
  id: string;
  input: UpdateMedicationInput;
};

export type DeleteMedicationMutationResult = {
  deleteMedication: boolean;
};

export type DeleteMedicationMutationVariables = {
  id: string;
};
