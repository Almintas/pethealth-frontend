import { useApolloClient } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router';
import * as authService from '../auth.service';
import { AuthFormField } from '../components/AuthFormField';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../useAuth';
import { getAuthErrorMessage } from '../utils/get-auth-error-message';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Landing page for the activation email sent to owners whose account was
 * created by their veterinary clinic. With a token: set the first password.
 * Without one (or after an expired link): request a fresh activation email.
 */
export function ActivateAccountPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [showRequestForm, setShowRequestForm] = useState(!token);

  return showRequestForm ? (
    <RequestActivationForm />
  ) : (
    <SetPasswordForm
      token={token}
      onRequestNewLink={() => setShowRequestForm(true)}
      title={t('activation.title')}
    />
  );
}

type SetPasswordFormProps = {
  token: string;
  title: string;
  onRequestNewLink: () => void;
};

function SetPasswordForm({ token, title, onRequestNewLink }: SetPasswordFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activateAccount, isAuthenticated, logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextPasswordError = !password
      ? 'validation.passwordRequired'
      : password.length < 8
        ? 'validation.passwordMin'
        : undefined;
    const nextConfirmError =
      !nextPasswordError && password !== confirmPassword
        ? 'validation.passwordsMismatch'
        : undefined;
    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);
    if (nextPasswordError || nextConfirmError) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Activation signs in as the activated owner; drop any other session.
      if (isAuthenticated) {
        await logout();
      }
      await activateAccount(token, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'auth'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title={title} subtitle={t('activation.subtitle')}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p className="auth-alert" role="alert">
            {formError}
          </p>
        ) : null}

        <AuthFormField
          id="activate-password"
          name="password"
          type="password"
          label={t('activation.newPassword')}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={passwordError ? t(passwordError) : undefined}
          disabled={isSubmitting}
        />

        <AuthFormField
          id="activate-confirm-password"
          name="confirmPassword"
          type="password"
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={confirmError ? t(confirmError) : undefined}
          disabled={isSubmitting}
        />

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('activation.activating') : t('activation.activate')}
        </button>
      </form>

      <p className="auth-switch">
        {t('activation.linkExpired')}{' '}
        <button
          type="button"
          className="auth-switch__button"
          onClick={onRequestNewLink}
        >
          {t('activation.requestNewLink')}
        </button>
      </p>
    </AuthShell>
  );
}

function RequestActivationForm() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const nextEmailError = !normalizedEmail
      ? 'validation.emailRequired'
      : !EMAIL_PATTERN.test(normalizedEmail)
        ? 'validation.emailInvalid'
        : undefined;
    setEmailError(nextEmailError);
    if (nextEmailError) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.requestAccountActivation(client, normalizedEmail);
      setIsSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'auth'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t('activation.requestTitle')}
      subtitle={t('activation.requestSubtitle')}
    >
      {isSent ? (
        <p className="auth-notice" role="status">
          {t('activation.requestSent')}
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {formError ? (
            <p className="auth-alert" role="alert">
              {formError}
            </p>
          ) : null}

          <AuthFormField
            id="activation-email"
            name="email"
            type="email"
            label={t('auth.email')}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={emailError ? t(emailError) : undefined}
            disabled={isSubmitting}
          />

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('activation.sending') : t('activation.sendLink')}
          </button>
        </form>
      )}

      <p className="auth-switch">
        {t('auth.haveAccount')}{' '}
        <Link className="auth-switch__button" to="/login">
          {t('auth.signInLink')}
        </Link>
      </p>
    </AuthShell>
  );
}
