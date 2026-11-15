/** Owner-facing appointment type values (stored as-is on the API). */
export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'CHECKUP', label: 'Check-up' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'ILLNESS', label: 'Illness' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'DENTAL', label: 'Dental' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type AppointmentTypeValue =
  (typeof APPOINTMENT_TYPE_OPTIONS)[number]['value'];

export const DEFAULT_APPOINTMENT_TYPE: AppointmentTypeValue = 'CHECKUP';

export function normalizeAppointmentTypeValue(raw: string): AppointmentTypeValue {
  const normalized = raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
  const match = APPOINTMENT_TYPE_OPTIONS.find((option) => option.value === normalized);
  if (match) {
    return match.value;
  }

  return 'OTHER';
}
