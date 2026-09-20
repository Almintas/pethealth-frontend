import { i18n } from '../../../i18n';

export function formatFullName(parts: {
  firstName: string;
  lastName: string;
}): string {
  return [parts.firstName, parts.lastName].filter(Boolean).join(' ').trim();
}

export function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');

  if (trimmed.length < 2) {
    throw new Error(i18n.t('validation.fullNameMinLength'));
  }

  const segments = trimmed.split(' ');
  if (segments.length < 2) {
    throw new Error(i18n.t('validation.fullNameFirstLast'));
  }

  const firstName = segments[0];
  const lastName = segments.slice(1).join(' ');

  if (firstName.length < 1 || lastName.length < 1) {
    throw new Error(i18n.t('validation.fullNameFirstLast'));
  }

  return { firstName, lastName };
}
