export { AppointmentsSection } from './components/AppointmentsSection';
export * as appointmentsService from './appointments.service';
export { AppointmentStatus } from './types';
export {
  APPOINTMENT_QUERY,
  APPOINTMENTS_QUERY,
  CREATE_APPOINTMENT_MUTATION,
  DELETE_APPOINTMENT_MUTATION,
  UPDATE_APPOINTMENT_MUTATION,
} from './graphql';
export type {
  Appointment,
  AppointmentQueryResult,
  AppointmentQueryVariables,
  AppointmentsQueryResult,
  AppointmentsQueryVariables,
  CreateAppointmentInput,
  CreateAppointmentMutationResult,
  CreateAppointmentMutationVariables,
  DeleteAppointmentMutationResult,
  DeleteAppointmentMutationVariables,
  UpdateAppointmentInput,
  UpdateAppointmentMutationResult,
  UpdateAppointmentMutationVariables,
} from './types';
