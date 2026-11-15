export { VaccinationsSection } from './components/VaccinationsSection';
export * as vaccinationsService from './vaccinations.service';
export {
  CREATE_VACCINATION_MUTATION,
  DELETE_VACCINATION_MUTATION,
  UPDATE_VACCINATION_MUTATION,
  VACCINATION_QUERY,
  VACCINATIONS_QUERY,
} from './graphql';
export type {
  CreateVaccinationInput,
  CreateVaccinationMutationResult,
  CreateVaccinationMutationVariables,
  DeleteVaccinationMutationResult,
  DeleteVaccinationMutationVariables,
  UpdateVaccinationInput,
  UpdateVaccinationMutationResult,
  UpdateVaccinationMutationVariables,
  Vaccination,
  VaccinationQueryResult,
  VaccinationQueryVariables,
  VaccinationsQueryResult,
  VaccinationsQueryVariables,
} from './types';
