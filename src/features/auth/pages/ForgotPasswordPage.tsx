import { useApolloClient } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { requestPasswordReset } from '../auth.service';
import { AuthFormField } from '../components/AuthFormField';
import { AuthShell } from '../components/AuthShell';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';
import {
  hasFieldErrors,
  validateForgotPasswordForm,
  type FieldErrors,
} from '../utils/validation';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<'email'>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateForgotPasswordForm({ email });
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    try {
      await requestPasswordReset(client, normalizedEmail);
      setSentTo(normalizedEmail);
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'auth'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentTo) {
    return (
      <AuthShell
        title={t('auth.checkInboxTitle')}
        subtitle={t('auth.checkInboxSubtitle', { email: sentTo })}
      >
        <p className="auth-notice" role="status">
          {t('auth.checkInboxHint')}
        </p>
        <p className="auth-switch">
          <button
            type="button"
            className="auth-switch__button auth-switch__button--plain"
            onClick={() => setSentTo(null)}
          >
            {t('auth.useDifferentEmail')}
          </button>
        </p>
        <p className="auth-switch">
          <Link className="auth-switch__button" to="/login">
            {t('auth.backToSignIn')}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={t('auth.forgotPasswordTitle')}
      subtitle={t('auth.forgotPasswordSubtitle')}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        ) : null}

        <AuthFormField
          id="forgot-email"
          name="email"
          type="email"
          label={t('auth.email')}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          disabled={isSubmitting}
          autoFocus
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('auth.sendingLink') : t('auth.sendLink')}
        </button>
      </form>

      <p className="auth-switch">
        {t('auth.rememberedPassword')}{' '}
        <Link className="auth-switch__button" to="/login">
          {t('auth.signInLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
