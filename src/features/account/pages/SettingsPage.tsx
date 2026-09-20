import { useApolloClient } from '@apollo/client/react';
import { useQuery } from '@apollo/client/react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../../components/LanguageSelector';
import { ErrorAlert } from '../../../components/feedback';
import { useAuth } from '../../auth';
import * as authService from '../../auth/auth.service';
import { ME_QUERY } from '../../auth/graphql';
import type { AuthUser, NotificationPreferences } from '../../auth/types';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { useTheme, type ThemePreference } from '../../../theme';
import {
  formatSampleDate,
  formatSampleTime,
  loadUserPreferences,
  saveUserPreferences,
  type DateFormatPreference,
  type TimeFormatPreference,
  type UserPreferences,
} from '../utils/user-preferences';
import '../../../components/language-selector.css';
import './account-page.css';

type NotificationToggleKey = keyof NotificationPreferences;

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  emailAppointmentReminders: true,
  emailMedicationReminders: true,
  emailVaccinationReminders: true,
};

type MeQueryResult = {
  me: AuthUser;
};

export function SettingsPage() {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { theme, setTheme } = useTheme();
  const { user: authUser, isInitializing, updateSessionUser } = useAuth();
  const { data, loading } = useQuery<MeQueryResult>(ME_QUERY, {
    skip: isInitializing,
    fetchPolicy: 'cache-and-network',
  });

  const themeOptions = useMemo(
    (): { value: ThemePreference; label: string }[] => [
      { value: 'light', label: t('settings.themeLight') },
      { value: 'dark', label: t('settings.themeDark') },
      { value: 'system', label: t('settings.themeSystem') },
    ],
    [t],
  );

  const notificationItems = useMemo(
    (): { key: NotificationToggleKey; label: string }[] => [
      { key: 'emailAppointmentReminders', label: t('settings.appointmentReminders') },
      { key: 'emailMedicationReminders', label: t('settings.medicationReminders') },
      { key: 'emailVaccinationReminders', label: t('settings.vaccinationReminders') },
    ],
    [t],
  );

  const user = data?.me ?? authUser;

  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadUserPreferences(),
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [savingNotificationKey, setSavingNotificationKey] =
    useState<NotificationToggleKey | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.notificationPreferences) {
      return;
    }
    setNotificationPrefs(user.notificationPreferences);
  }, [user]);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }
    const timer = window.setTimeout(() => setSavedMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const updatePreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      saveUserPreferences(next);
      return next;
    });
    setSavedMessage(t('common.preferencesSavedDevice'));
  };

  const handleNotificationToggle = async (
    key: NotificationToggleKey,
    nextValue: boolean,
  ) => {
    const previous = notificationPrefs;
    setNotificationError(null);
    setNotificationPrefs((current) => ({ ...current, [key]: nextValue }));
    setSavingNotificationKey(key);

    try {
      const updatedUser = await authService.updateNotificationPreferences(client, {
        [key]: nextValue,
      });
      setNotificationPrefs(updatedUser.notificationPreferences);
      updateSessionUser(updatedUser);
      setSavedMessage(t('settings.notificationsSaved'));
    } catch (error) {
      setNotificationPrefs(previous);
      setNotificationError(getAuthErrorMessage(error, 'generic-save'));
    } finally {
      setSavingNotificationKey(null);
    }
  };

  const sampleDate = formatSampleDate(preferences);
  const sampleTime = formatSampleTime(preferences);
  const notificationsLoading = isInitializing || loading || !user;

  return (
    <div className="ph-page">
      <header className="ph-page-header">
        <div>
          <h1 className="ph-page-header__title">{t('settings.title')}</h1>
          <p className="ph-page-header__subtitle">{t('settings.subtitle')}</p>
        </div>
      </header>

      {savedMessage ? (
        <p className="ph-alert ph-alert--success" role="status">{savedMessage}</p>
      ) : null}

      {notificationError ? (
        <ErrorAlert message={notificationError} compact />
      ) : null}

      <div className="account-page__stack">
        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-appearance-heading">
          <div className="account-card__header">
            <h2 id="settings-appearance-heading" className="account-card__title">
              {t('settings.appearance')}
            </h2>
            <p className="account-card__hint">{t('settings.appearanceHint')}</p>
          </div>

          <div className="account-settings__section">
            <div className="account-settings__row">
              <div className="account-settings__row-text">
                <p className="account-settings__row-label">{t('settings.theme')}</p>
              </div>
              <div
                className="account-settings__theme-segment"
                role="group"
                aria-label={t('settings.theme')}
              >
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="account-settings__theme-segment-btn"
                    aria-pressed={theme === option.value}
                    onClick={() => setTheme(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-notifications-heading">
          <div className="account-card__header">
            <h2 id="settings-notifications-heading" className="account-card__title">
              {t('settings.notifications')}
            </h2>
            <p className="account-card__hint">{t('settings.notificationsHint')}</p>
          </div>

          <p className="account-settings__subsection-label">{t('common.emailNotifications')}</p>

          <div className="account-settings__section">
            {notificationItems.map((item) => {
              const isSaving = savingNotificationKey === item.key;
              const isDisabled =
                notificationsLoading ||
                isSaving ||
                savingNotificationKey !== null;

              return (
                <div key={item.key} className="account-settings__row">
                  <div className="account-settings__row-text">
                    <p className="account-settings__row-label">{item.label}</p>
                  </div>
                  <label className="account-toggle">
                    <input
                      type="checkbox"
                      checked={notificationPrefs[item.key]}
                      disabled={isDisabled}
                      aria-label={`${t('common.emailNotifications')} ${item.label}`}
                      onChange={(event) =>
                        void handleNotificationToggle(
                          item.key,
                          event.target.checked,
                        )
                      }
                    />
                    <span className="account-toggle__track">
                      <span className="account-toggle__thumb" />
                    </span>
                  </label>
                  {isSaving ? (
                    <span className="account-settings__row-saving">{t('common.savingLabel')}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-datetime-heading">
          <div className="account-card__header">
            <h2 id="settings-datetime-heading" className="account-card__title">
              {t('settings.dateTime')}
            </h2>
            <p className="account-card__hint">{t('settings.dateTimeHint')}</p>
          </div>

          <div className="account-settings__section">
            <div className="ph-form__row ph-form__row--split">
              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="settings-date-format">
                  {t('settings.dateFormat')}
                </label>
                <select
                  id="settings-date-format"
                  className="ph-form__select"
                  value={preferences.dateFormat}
                  onChange={(event) =>
                    updatePreferences({
                      dateFormat: event.target.value as DateFormatPreference,
                    })
                  }
                >
                  <option value="DMY">DD/MM/YYYY</option>
                  <option value="MDY">MM/DD/YYYY</option>
                  <option value="YMD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="settings-time-format">
                  {t('settings.timeFormat')}
                </label>
                <select
                  id="settings-time-format"
                  className="ph-form__select"
                  value={preferences.timeFormat}
                  onChange={(event) =>
                    updatePreferences({
                      timeFormat: event.target.value as TimeFormatPreference,
                    })
                  }
                >
                  <option value="24">{t('settings.time24')}</option>
                  <option value="12">{t('settings.time12')}</option>
                </select>
              </div>
            </div>

            <p className="account-settings__preview">
              {t('settings.preview', { date: sampleDate, time: sampleTime })}
            </p>
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-language-heading">
          <div className="account-card__header">
            <h2 id="settings-language-heading" className="account-card__title">
              {t('settings.language')}
            </h2>
            <p className="account-card__hint">{t('common.chooseLanguage')}</p>
          </div>

          <div className="ph-form__field">
            <label className="ph-form__label" htmlFor="settings-language">
              {t('settings.language')}
            </label>
            <LanguageSelector variant="settings" />
          </div>
        </section>

        <section
          className="ph-card ph-card--pad account-card"
          aria-labelledby="settings-danger-heading"
        >
          <h2 id="settings-danger-heading" className="account-danger__title">
            {t('settings.dangerZone')}
          </h2>
          <p className="account-danger__text">{t('settings.deleteAccountHint')}</p>
          <button
            type="button"
            className="ph-btn ph-btn--danger-ghost"
            disabled
            title={t('settings.comingSoon')}
          >
            {t('settings.deleteAccount')}
          </button>
        </section>
      </div>
    </div>
  );
}
