function parseAppointmentInstant(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatAppointmentDateTime(value?: string | null): string {
  const date = parseAppointmentInstant(value);
  if (!date) {
    return 'Not provided';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatAppointmentDate(value?: string | null): string {
  const date = parseAppointmentInstant(value);
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatAppointmentTime(value?: string | null): string {
  const date = parseAppointmentInstant(value);
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
