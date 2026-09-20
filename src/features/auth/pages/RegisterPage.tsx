import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AuthFormField } from '../components/AuthFormField';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../useAuth';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';
import {
  hasFieldErrors,
  validateRegisterForm,
  type FieldErrors,
  type RegisterField,
} from '../utils/validation';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RegisterField>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateRegisterForm({
      firstName,
      lastName,
      email,
      password,
    });
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'auth'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t('auth.createAccount')}
      subtitle={t('auth.registerSubtitle')}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="auth-form__row auth-form__row--split">
          <AuthFormField
            id="register-first-name"
            name="firstName"
            type="text"
            label={t('auth.firstName')}
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            error={fieldErrors.firstName}
            disabled={isSubmitting}
          />

          <AuthFormField
            id="register-last-name"
            name="lastName"
            type="text"
            label={t('auth.lastName')}
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            error={fieldErrors.lastName}
            disabled={isSubmitting}
          />
        </div>

        <AuthFormField
          id="register-email"
          name="email"
          type="email"
          label={t('auth.email')}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={isSubmitting}
        />

        <AuthFormField
          id="register-password"
          name="password"
          type="password"
          label={t('auth.password')}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('auth.signingUp') : t('auth.signUp')}
        </button>
      </form>

      <p className="auth-switch">
        {t('auth.haveAccount')}{' '}
        <Link className="auth-switch__button" to="/login">
          {t('auth.signInLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
