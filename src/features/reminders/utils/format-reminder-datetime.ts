import { i18n } from '../../../i18n';
import { toIntlLocale } from '../../../i18n/app-locale';

function parseReminderInstant(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getLocale(): string {
  return toIntlLocale(i18n.language);
}

export function formatReminderDateTime(value?: string | null): string {
  const date = parseReminderInstant(value);
  if (!date) {
    return i18n.t('common.notProvided');
  }

  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatReminderDate(value?: string | null): string {
  const date = parseReminderInstant(value);
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(getLocale(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatReminderTime(value?: string | null): string {
  const date = parseReminderInstant(value);
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(getLocale(), {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
