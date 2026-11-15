export const ReminderType = {
  Vaccination: 'VACCINATION',
  Medication: 'MEDICATION',
  Appointment: 'APPOINTMENT',
  General: 'GENERAL',
} as const;

export type ReminderType = (typeof ReminderType)[keyof typeof ReminderType];

export const ReminderStatus = {
  Pending: 'PENDING',
  Completed: 'COMPLETED',
  Dismissed: 'DISMISSED',
} as const;

export type ReminderStatus = (typeof ReminderStatus)[keyof typeof ReminderStatus];

export const SourceType = {
  Vaccination: 'VACCINATION',
  Medication: 'MEDICATION',
  Appointment: 'APPOINTMENT',
} as const;

export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export type Reminder = {
  id: string;
  petId: string;
  type: ReminderType;
  title: string;
  message?: string | null;
  dueAt: string;
  status: ReminderStatus;
  sourceType?: SourceType | null;
  sourceId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReminderInput = {
  petId: string;
  type: ReminderType;
  title: string;
  message?: string;
  dueAt: string;
  sourceType?: SourceType;
  sourceId?: string;
};

export type UpdateReminderInput = {
  type?: ReminderType;
  title?: string;
  message?: string;
  dueAt?: string;
};

export type RemindersQueryResult = {
  reminders: Reminder[];
};

export type RemindersQueryVariables = {
  petId: string;
};

export type ReminderQueryResult = {
  reminder: Reminder;
};

export type ReminderQueryVariables = {
  id: string;
};

export type CreateReminderMutationResult = {
  createReminder: Reminder;
};

export type CreateReminderMutationVariables = {
  input: CreateReminderInput;
};

export type UpdateReminderMutationResult = {
  updateReminder: Reminder;
};

export type UpdateReminderMutationVariables = {
  id: string;
  input: UpdateReminderInput;
};

export type CompleteReminderMutationResult = {
  completeReminder: Reminder;
};

export type CompleteReminderMutationVariables = {
  id: string;
};

export type DismissReminderMutationResult = {
  dismissReminder: Reminder;
};

export type DismissReminderMutationVariables = {
  id: string;
};

export type DeleteReminderMutationResult = {
  deleteReminder: boolean;
};

export type DeleteReminderMutationVariables = {
  id: string;
};
