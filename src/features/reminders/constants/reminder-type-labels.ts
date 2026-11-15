import { ReminderType } from '../types';

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  [ReminderType.Vaccination]: 'Vaccination',
  [ReminderType.Medication]: 'Medication',
  [ReminderType.Appointment]: 'Appointment',
  [ReminderType.General]: 'General',
};
