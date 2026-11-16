import { useMutation } from '@apollo/client/react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { ErrorAlert } from '../../../components/feedback';
import { useAuth } from '../../auth';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { DELETE_MY_ACCOUNT_MUTATION } from '../account-data.graphql';
import { rememberAccountDeletedNotice } from '../utils/account-deleted-notice';

/**
 * Permanently deletes the owner's account. Asks for the password and an
 * explicit confirmation, and spells out what will be lost first.
 */
export function DeleteAccountSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteAccount, { loading }] = useMutation<{ deleteMyAccount: boolean }>(
    DELETE_MY_ACCOUNT_MUTATION,
  );

  const close = () => {
    setIsOpen(false);
    setPassword('');
    setConfirmed(false);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!password || !confirmed) {
      setError(t('settings.deleteNeedsConfirmation'));
      return;
    }
    try {
      await deleteAccount({ variables: { password } });
      rememberAccountDeletedNotice();
      await logout();
      void navigate('/login?accountDeleted=1', { replace: true });
    } catch (deleteError) {
      const message = getUserFacingErrorMessage(deleteError, 'generic-save');
      setError(
        /password is not correct/i.test(message) ? t('settings.deleteWrongPassword') : message,
      );
    }
  };

  return (
    <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-danger-heading">
      <h2 id="settings-danger-heading" className="account-danger__title">
        {t('settings.dangerZone')}
      </h2>
      <p className="account-danger__text">{t('settings.deleteAccountHint')}</p>

      {!isOpen ? (
        <div className="account-danger__actions">
          <button
            type="button"
            className="ph-btn ph-btn--danger-ghost"
            onClick={() => setIsOpen(true)}
          >
            {t('settings.deleteAccount')}
          </button>
        </div>
      ) : (
        <form className="account-danger__form" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <ul className="account-danger__list">
            <li>{t('settings.deleteConsequencePets')}</li>
            <li>{t('settings.deleteConsequenceClinics')}</li>
            <li>{t('settings.deleteConsequenceFinal')}</li>
          </ul>
          <p className="account-danger__text">{t('settings.deleteExportFirst')}</p>
          {error ? <ErrorAlert message={error} compact /> : null}
          <div className="ph-form__field">
            <label className="ph-form__label" htmlFor="delete-account-password">
              {t('settings.deletePasswordLabel')}
            </label>
            <input
              id="delete-account-password"
              className="ph-form__input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
          </div>
          <label className="account-danger__confirm">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={loading}
            />
            <span>{t('settings.deleteConfirmCheckbox')}</span>
          </label>
          <div className="account-danger__actions">
            <button type="button" className="ph-btn ph-btn--secondary" onClick={close} disabled={loading}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="ph-btn ph-btn--danger" disabled={loading}>
              {loading ? t('settings.deleting') : t('settings.deleteForever')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
