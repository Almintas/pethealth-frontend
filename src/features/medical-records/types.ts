export type MedicalRecordAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  clinicName?: string | null;
  createdAt: string;
};

export type MedicalRecord = {
  id: string;
  petId: string;
  date: string;
  type: string;
  title: string;
  description?: string | null;
  diagnosis?: string | null;
  veterinarianName?: string | null;
  clinicName?: string | null;
  notes?: string | null;
  /** Files a clinic attached (lab results, X-rays…). */
  attachments?: MedicalRecordAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type CreateMedicalRecordInput = {
  petId: string;
  date: string;
  type: string;
  title: string;
  description?: string;
  diagnosis?: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
};

export type UpdateMedicalRecordInput = {
  date?: string;
  type?: string;
  title?: string;
  description?: string;
  diagnosis?: string;
  veterinarianName?: string;
  clinicName?: string;
  notes?: string;
};

export type MedicalRecordsQueryResult = {
  medicalRecords: MedicalRecord[];
};

export type MedicalRecordsQueryVariables = {
  petId: string;
};

export type MedicalRecordQueryResult = {
  medicalRecord: MedicalRecord;
};

export type MedicalRecordQueryVariables = {
  id: string;
};

export type CreateMedicalRecordMutationResult = {
  createMedicalRecord: MedicalRecord;
};

export type CreateMedicalRecordMutationVariables = {
  input: CreateMedicalRecordInput;
};

export type UpdateMedicalRecordMutationResult = {
  updateMedicalRecord: MedicalRecord;
};

export type UpdateMedicalRecordMutationVariables = {
  id: string;
  input: UpdateMedicalRecordInput;
};

export type DeleteMedicalRecordMutationResult = {
  deleteMedicalRecord: boolean;
};

export type DeleteMedicalRecordMutationVariables = {
  id: string;
};
