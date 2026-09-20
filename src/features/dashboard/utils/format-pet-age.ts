import { i18n } from '../../../i18n';

export function formatPetAge(birthDate?: string | null): string | null {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return null;
  }

  if (years === 0) {
    if (months <= 0) {
      return i18n.t('pets.ageLessThanMonth');
    }
    return months === 1
      ? i18n.t('pets.ageOneMonth')
      : i18n.t('pets.ageMonths', { count: months });
  }

  if (months === 0) {
    return years === 1
      ? i18n.t('pets.ageOneYear')
      : i18n.t('pets.ageYears', { count: years });
  }

  const yearLabel =
    years === 1
      ? i18n.t('pets.ageOneYear')
      : i18n.t('pets.ageYears', { count: years });
  const monthLabel =
    months === 1
      ? i18n.t('pets.ageOneMonth')
      : i18n.t('pets.ageMonths', { count: months });
  return `${yearLabel}, ${monthLabel}`;
}
