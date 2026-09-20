import { useApolloClient } from '@apollo/client/react';
import { useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { UserInitialsAvatar } from '../../../components/UserInitialsAvatar';
import { useAuth } from '../../auth';
import * as authService from '../../auth/auth.service';
import { ME_QUERY } from '../../auth/graphql';
import type { AuthUser } from '../../auth/types';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { ChangePasswordDialog } from '../components/ChangePasswordDialog';
import { formatFullName, parseFullName } from '../utils/profile-name';
import './account-page.css';

type MeQueryResult = {
  me: AuthUser;
};

type ProfileFormState = {
  fullName: string;
  email: string;
};

function getInitials(user: AuthUser): string {
  return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.trim() || 'U';
}

function toFormState(user: AuthUser): ProfileFormState {
  return {
    fullName: formatFullName(user),
    email: user.email,
  };
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ProfilePage() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { user: authUser, isInitializing, updateSessionUser } = useAuth();
  const { data, loading, error, refetch } = useQuery<MeQueryResult>(ME_QUERY, {
    skip: isInitializing,
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me ?? authUser;

  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [baseline, setBaseline] = useState<ProfileFormState | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const next = toFormState(user);
    setForm(next);
    setBaseline(next);
    setFieldError(null);
    setSaveError(null);
  }, [user]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSuccessMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!passwordSuccessMessage) {
      return;
    }

    const timer = window.setTimeout(() => setPasswordSuccessMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [passwordSuccessMessage]);

  const isDirty = useMemo(() => {
    if (!form || !baseline) {
      return false;
    }

    return (
      form.fullName.trim() !== baseline.fullName.trim() ||
      form.email.trim().toLowerCase() !== baseline.email.trim().toLowerCase()
    );
  }, [baseline, form]);

  if (isInitializing || loading || !form || !user) {
    if (error && !user) {
      return (
        <div className="ph-page">
          <header className="ph-page-header">
            <div>
              <h1 className="ph-page-header__title">{t('profile.title')}</h1>
              <p className="ph-page-header__subtitle">
                {t('profile.subtitle')}
              </p>
            </div>
          </header>
          <ErrorAlert
            message={getAuthErrorMessage(error, 'generic-load')}
            onRetry={() => void refetch()}
          />
        </div>
      );
    }

    return (
      <div className="ph-page">
        <LoadingState message={t('profile.loading')} skeleton />
      </div>
    );
  }

  const handleCancel = () => {
    if (!baseline) {
      return;
    }

    setForm(baseline);
    setFieldError(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!user || !baseline) {
      return;
    }

    setSaveError(null);
    setFieldError(null);
    setSuccessMessage(null);

    const trimmedEmail = form.email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      setFieldError(t('validation.emailInvalid'));
      return;
    }

    let parsedName: { firstName: string; lastName: string };
    try {
      parsedName = parseFullName(form.fullName);
    } catch (nameError) {
      setFieldError(
        nameError instanceof Error ? nameError.message : t('validation.fullNameRequired'),
      );
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile(client, {
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        email: trimmedEmail,
      });

      const nextForm = toFormState(updatedUser);
      setBaseline(nextForm);
      setForm(nextForm);
      updateSessionUser(updatedUser);
      setSuccessMessage(t('profile.updatedSuccess'));
    } catch (saveFailure) {
      setSaveError(getAuthErrorMessage(saveFailure, 'generic-save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setIsChangingPassword(true);
    try {
      await authService.changePassword(client, {
        currentPassword,
        newPassword,
      });
      setIsPasswordDialogOpen(false);
      setPasswordSuccessMessage(t('profile.passwordUpdatedSuccess'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const heroName = form.fullName.trim() || formatFullName(user) || t('common.account');
  const heroEmail = form.email.trim() || user.email;

  return (
    <div className="ph-page">
      <header className="ph-page-header">
        <div>
          <h1 className="ph-page-header__title">{t('profile.title')}</h1>
          <p className="ph-page-header__subtitle">
            {t('profile.subtitle')}
          </p>
        </div>
      </header>

      {successMessage ? (
        <p className="ph-alert ph-alert--success account-profile__banner" role="status">
          {successMessage}
        </p>
      ) : null}

      {passwordSuccessMessage ? (
        <p className="ph-alert ph-alert--success account-profile__banner" role="status">
          {passwordSuccessMessage}
        </p>
      ) : null}

      {saveError ? (
        <ErrorAlert message={saveError} compact />
      ) : null}

      <div className="account-page__stack">
        <section className="ph-card ph-card--pad account-card" aria-labelledby="profile-info-heading">
          <div className="account-card__header">
            <h2 id="profile-info-heading" className="account-card__title">
              {t('profile.userInfo')}
            </h2>
          </div>

          <div className="account-profile__hero">
            <UserInitialsAvatar initials={getInitials(user)} size="lg" />
            <div className="account-profile__hero-text">
              <p className="account-profile__hero-name">{heroName}</p>
              <p className="account-profile__hero-email">{heroEmail}</p>
            </div>
          </div>

          <div className="ph-form__fields">
            <div className="ph-form__field">
              <label className="ph-form__label" htmlFor="profile-full-name">
                {t('profile.fullName')}
              </label>
              <input
                id="profile-full-name"
                className={[
                  'ph-form__input',
                  fieldError ? 'ph-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, fullName: event.target.value } : current,
                  )
                }
                disabled={isSaving}
                autoComplete="name"
                required
                aria-invalid={Boolean(fieldError)}
              />
            </div>

            <div className="ph-form__field">
              <label className="ph-form__label" htmlFor="profile-email">
                {t('profile.email')}
              </label>
              <input
                id="profile-email"
                type="email"
                className={[
                  'ph-form__input',
                  fieldError ? 'ph-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                value={form.email}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, email: event.target.value } : current,
                  )
                }
                disabled={isSaving}
                autoComplete="email"
                required
                aria-invalid={Boolean(fieldError)}
              />
            </div>

            {fieldError ? (
              <p className="ph-form__error" role="alert">{fieldError}</p>
            ) : null}

            <div className="ph-form__field account-profile__password-block">
              <span className="ph-form__label" id="profile-password-label">
                {t('profile.password')}
              </span>
              <p className="account-card__hint account-profile__password-copy">
                {t('profile.passwordSecure')}
              </p>
              <button
                type="button"
                className="ph-btn ph-btn--secondary"
                onClick={() => setIsPasswordDialogOpen(true)}
                disabled={isSaving}
              >
                {t('profile.changePassword')}
              </button>
            </div>
          </div>

          <div className="ph-form__actions account-profile__actions">
            <button
              type="button"
              className="ph-form__cancel"
              onClick={handleCancel}
              disabled={!isDirty || isSaving}
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              className="ph-form__submit"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? t('common.saving') : t('profile.saveChanges')}
            </button>
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="profile-account-heading">
          <div className="account-card__header">
            <h2 id="profile-account-heading" className="account-card__title">
              {t('profile.account')}
            </h2>
          </div>
          <dl className="account-profile__meta">
            <div>
              <dt>{t('profile.created')}</dt>
              <dd>{formatPetDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt>{t('profile.lastUpdated')}</dt>
              <dd>{formatPetDate(user.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <ChangePasswordDialog
        isOpen={isPasswordDialogOpen}
        isSubmitting={isChangingPassword}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
}
