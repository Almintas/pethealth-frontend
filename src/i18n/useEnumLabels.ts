import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { APPOINTMENT_TYPE_OPTIONS } from '../features/appointments/constants/appointment-types';
import type { ReminderType } from '../features/reminders/types';

export function useEnumLabels() {
  const { t } = useTranslation();

  const appointmentStatus = useCallback(
    (status: string) =>
      t(`enums.appointmentStatus.${status}`, {
        defaultValue: status,
      }),
    [t],
  );

  const reminderStatus = useCallback(
    (status: string) =>
      t(`enums.reminderStatus.${status}`, {
        defaultValue: status,
      }),
    [t],
  );

  const appointmentType = useCallback(
    (type: string) =>
      t(`enums.appointmentType.${type}`, {
        defaultValue: type,
      }),
    [t],
  );

  const reminderType = useCallback(
    (type: ReminderType | string) =>
      t(`enums.reminderType.${type}`, {
        defaultValue: String(type),
      }),
    [t],
  );

  const appointmentTypeOptions = useCallback(
    () =>
      APPOINTMENT_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: appointmentType(option.value),
      })),
    [appointmentType],
  );

  return {
    appointmentStatus,
    reminderStatus,
    appointmentType,
    reminderType,
    appointmentTypeOptions,
  };
}
