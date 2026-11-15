export { MedicalRecordsSection } from './components/MedicalRecordsSection';
export * as medicalRecordsService from './medical-records.service';
export {
  CREATE_MEDICAL_RECORD_MUTATION,
  DELETE_MEDICAL_RECORD_MUTATION,
  MEDICAL_RECORD_QUERY,
  MEDICAL_RECORDS_QUERY,
  UPDATE_MEDICAL_RECORD_MUTATION,
} from './graphql';
export type {
  CreateMedicalRecordInput,
  CreateMedicalRecordMutationResult,
  CreateMedicalRecordMutationVariables,
  DeleteMedicalRecordMutationResult,
  DeleteMedicalRecordMutationVariables,
  MedicalRecord,
  MedicalRecordQueryResult,
  MedicalRecordQueryVariables,
  MedicalRecordsQueryResult,
  MedicalRecordsQueryVariables,
  UpdateMedicalRecordInput,
  UpdateMedicalRecordMutationResult,
  UpdateMedicalRecordMutationVariables,
} from './types';
