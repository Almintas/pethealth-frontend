import { i18n } from '../../../i18n';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginField = 'email' | 'password';
export type RegisterField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password';

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return i18n.t('validation.emailRequired');
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return i18n.t('validation.emailInvalid');
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return i18n.t('validation.passwordRequired');
  }
  if (password.length < 8) {
    return i18n.t('validation.passwordMin');
  }
  return undefined;
}

export function validateLoginForm(values: {
  email: string;
  password: string;
}): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  const emailError = validateEmail(values.email);
  const passwordError = validatePassword(values.password);

  if (emailError) {
    errors.email = emailError;
  }
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function validateRegisterForm(values: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): FieldErrors<RegisterField> {
  const errors: FieldErrors<RegisterField> = {};

  if (!values.firstName.trim()) {
    errors.firstName = i18n.t('validation.firstNameRequired');
  }
  if (!values.lastName.trim()) {
    errors.lastName = i18n.t('validation.lastNameRequired');
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const passwordError = validatePassword(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  return errors;
}

export function hasFieldErrors<T extends string>(
  errors: FieldErrors<T>,
): boolean {
  return Object.keys(errors).length > 0;
}
