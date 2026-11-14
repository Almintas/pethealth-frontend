import { useApolloClient } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router';
import { resetPassword } from '../auth.service';
import { AuthFormField } from '../components/AuthFormField';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../useAuth';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';
import {
  hasFieldErrors,
  PASSWORD_MAX_LENGTH,
  validateResetPasswordForm,
  type FieldErrors,
  type ResetPasswordField,
} from '../utils/validation';

/** Matches the API message for unknown, used, or expired tokens. */
function isExpiredLinkError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('invalid or has expired');
}

/**
 * Landing page for links in password reset and account activation emails:
 * /reset-password?token=...
 */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<ResetPasswordField>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [linkExpired, setLinkExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateResetPasswordForm({
      newPassword,
      confirmPassword,
    });
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(client, { token, newPassword });
      // Resetting revokes every existing session, including one in this browser.
      if (isAuthenticated) {
        await logout();
      }
      setIsDone(true);
    } catch (error) {
      const message = getAuthErrorMessage(error, 'auth');
      if (isExpiredLinkError(message)) {
        setLinkExpired(true);
      } else {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <AuthShell
        title={t('auth.passwordSetTitle')}
        subtitle={t('auth.passwordSetSubtitle')}
      >
        <Link className="auth-submit auth-submit--link" to="/login">
          {t('auth.signIn')}
        </Link>
      </AuthShell>
    );
  }

  if (!token || linkExpired) {
    return (
      <AuthShell
        title={t('auth.linkInvalidTitle')}
        subtitle={t('auth.linkInvalidSubtitle')}
      >
        <Link className="auth-submit auth-submit--link" to="/forgot-password">
          {t('auth.requestNewLink')}
        </Link>
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
      title={t('auth.resetPasswordTitle')}
      subtitle={t('auth.resetPasswordSubtitle')}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        ) : null}

        <AuthFormField
          id="reset-new-password"
          name="newPassword"
          type="password"
          label={t('auth.newPassword')}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          error={fieldErrors.newPassword}
          disabled={isSubmitting}
          autoFocus
        />

        <AuthFormField
          id="reset-confirm-password"
          name="confirmPassword"
          type="password"
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('auth.savingPassword') : t('auth.savePassword')}
        </button>
      </form>

      <p className="auth-switch">
        <Link className="auth-switch__button" to="/login">
          {t('auth.backToSignIn')}
        </Link>
      </p>
    </AuthShell>
  );
}
