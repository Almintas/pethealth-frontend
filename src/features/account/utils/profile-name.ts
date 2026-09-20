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
    throw new Error('Full name must be at least 2 characters.');
  }

  const segments = trimmed.split(' ');
  if (segments.length < 2) {
    throw new Error('Enter your first and last name.');
  }

  const firstName = segments[0];
  const lastName = segments.slice(1).join(' ');

  if (firstName.length < 1 || lastName.length < 1) {
    throw new Error('Enter your first and last name.');
  }

  return { firstName, lastName };
}
