import type { Medication } from '../types';

export type MedicationTreatmentStatus =
  | 'active'
  | 'ongoing'
  | 'completed'
  | 'inactive';

function startOfLocalDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function getMedicationTreatmentStatus(
  medication: Pick<Medication, 'isActive' | 'startDate' | 'endDate'>,
): MedicationTreatmentStatus {
  if (!medication.isActive) {
    return 'inactive';
  }

  const todayMs = startOfLocalDay(new Date());
  const endMs = medication.endDate
    ? startOfLocalDay(new Date(medication.endDate))
    : null;

  if (endMs !== null && endMs < todayMs) {
    return 'completed';
  }

  if (endMs === null) {
    return 'ongoing';
  }

  return 'active';
}

export function getMedicationTreatmentStatusLabel(
  status: MedicationTreatmentStatus,
): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'ongoing':
      return 'Ongoing';
    case 'completed':
      return 'Completed';
    case 'inactive':
      return 'Inactive';
  }
}

export function isMedicationHistoryStatus(
  status: MedicationTreatmentStatus,
): boolean {
  return status === 'completed' || status === 'inactive';
}
