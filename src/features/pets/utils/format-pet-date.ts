import { i18n } from '../../../i18n';
import { toIntlLocale } from '../../../i18n/app-locale';

export function formatPetDate(value?: string | null): string {
  if (!value) {
    return i18n.t('common.notProvided');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return i18n.t('common.notProvided');
  }

  return new Intl.DateTimeFormat(toIntlLocale(i18n.language), {
    dateStyle: 'medium',
  }).format(date);
}
