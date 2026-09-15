export function formatReminderDateTime(value?: string | null): string {
  if (!value) {
    return 'Not provided';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
