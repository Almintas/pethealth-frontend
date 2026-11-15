import { gql } from '@apollo/client';

export const APPOINTMENT_FIELDS = gql`
  fragment AppointmentFields on AppointmentModel {
    id
    petId
    scheduledAt
    type
    clinicName
    veterinarianName
    reason
    notes
    status
    createdAt
    updatedAt
  }
`;

export const APPOINTMENTS_QUERY = gql`
  query Appointments($petId: ID!) {
    appointments(petId: $petId) {
      ...AppointmentFields
    }
  }
  ${APPOINTMENT_FIELDS}
`;

export const APPOINTMENT_QUERY = gql`
  query Appointment($id: ID!) {
    appointment(id: $id) {
      ...AppointmentFields
    }
  }
  ${APPOINTMENT_FIELDS}
`;

export const CREATE_APPOINTMENT_MUTATION = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      ...AppointmentFields
    }
  }
  ${APPOINTMENT_FIELDS}
`;

export const UPDATE_APPOINTMENT_MUTATION = gql`
  mutation UpdateAppointment($id: ID!, $input: UpdateAppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      ...AppointmentFields
    }
  }
  ${APPOINTMENT_FIELDS}
`;

export const DELETE_APPOINTMENT_MUTATION = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;
