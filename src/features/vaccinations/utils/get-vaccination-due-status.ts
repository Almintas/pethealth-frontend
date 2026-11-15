import { i18n } from '../../../i18n';

export type VaccinationDueStatus = 'none' | 'valid' | 'overdue';

function startOfLocalDay(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

export function getVaccinationDueStatus(
  nextDueAt?: string | null,
): VaccinationDueStatus {
  if (!nextDueAt) {
    return 'none';
  }

  const dueMs = startOfLocalDay(new Date(nextDueAt));
  const todayMs = startOfLocalDay(new Date());

  if (dueMs < todayMs) {
    return 'overdue';
  }

  return 'valid';
}

export function getVaccinationDueStatusLabel(status: VaccinationDueStatus): string {
  return i18n.t(`enums.vaccinationDue.${status}`);
}
