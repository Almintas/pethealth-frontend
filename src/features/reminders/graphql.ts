import { gql } from '@apollo/client';

export const REMINDER_FIELDS = gql`
  fragment ReminderFields on ReminderModel {
    id
    petId
    type
    title
    message
    dueAt
    status
    sourceType
    sourceId
    createdAt
    updatedAt
  }
`;

export const REMINDERS_QUERY = gql`
  query Reminders($petId: ID!) {
    reminders(petId: $petId) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const REMINDER_QUERY = gql`
  query Reminder($id: ID!) {
    reminder(id: $id) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const CREATE_REMINDER_MUTATION = gql`
  mutation CreateReminder($input: CreateReminderInput!) {
    createReminder(input: $input) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const UPDATE_REMINDER_MUTATION = gql`
  mutation UpdateReminder($id: ID!, $input: UpdateReminderInput!) {
    updateReminder(id: $id, input: $input) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const COMPLETE_REMINDER_MUTATION = gql`
  mutation CompleteReminder($id: ID!) {
    completeReminder(id: $id) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const DISMISS_REMINDER_MUTATION = gql`
  mutation DismissReminder($id: ID!) {
    dismissReminder(id: $id) {
      ...ReminderFields
    }
  }
  ${REMINDER_FIELDS}
`;

export const DELETE_REMINDER_MUTATION = gql`
  mutation DeleteReminder($id: ID!) {
    deleteReminder(id: $id)
  }
`;
