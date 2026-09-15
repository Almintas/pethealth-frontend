export function formatPetAge(birthDate?: string | null): string | null {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    years -= 1;
  }

  if (years < 1) {
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    const adjustedMonths = months <= 0 ? 1 : months;
    return `${adjustedMonths} mo`;
  }

  return years === 1 ? '1 year' : `${years} years`;
}
