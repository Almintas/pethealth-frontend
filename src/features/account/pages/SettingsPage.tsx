import { useEffect, useState } from 'react';
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
import './account-page.css';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const NOTIFICATION_ITEMS = [
  { id: 'appointments', label: 'Appointment reminders' },
  { id: 'medications', label: 'Medication reminders' },
  { id: 'vaccinations', label: 'Vaccination reminders' },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadUserPreferences(),
  );
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

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
    setSavedMessage('Preferences saved on this device.');
  };

  const sampleDate = formatSampleDate(preferences);
  const sampleTime = formatSampleTime(preferences);

  return (
    <div className="ph-page">
      <header className="ph-page-header">
        <div>
          <h1 className="ph-page-header__title">Settings</h1>
          <p className="ph-page-header__subtitle">
            Manage your PetHealth preferences.
          </p>
        </div>
      </header>

      {savedMessage ? (
        <p className="ph-alert ph-alert--success" role="status">{savedMessage}</p>
      ) : null}

      <div className="account-page__stack">
        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-appearance-heading">
          <div className="account-card__header">
            <h2 id="settings-appearance-heading" className="account-card__title">
              Appearance
            </h2>
            <p className="account-card__hint">
              Choose how PetHealth looks on your device.
            </p>
          </div>

          <div className="account-settings__section">
            <div className="account-settings__row">
              <div className="account-settings__row-text">
                <p className="account-settings__row-label">Theme</p>
              </div>
              <div
                className="account-settings__theme-segment"
                role="group"
                aria-label="Theme"
              >
                {THEME_OPTIONS.map((option) => (
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
              Notifications
            </h2>
            <p className="account-card__hint">
              Notification delivery preferences are coming soon. These controls
              are not connected to alerts yet.
            </p>
          </div>

          <div className="account-settings__section">
            {NOTIFICATION_ITEMS.map((item) => (
              <div key={item.id} className="account-settings__row">
                <div className="account-settings__row-text">
                  <p className="account-settings__row-label">{item.label}</p>
                </div>
                <label className="account-toggle">
                  <input type="checkbox" disabled aria-label={item.label} />
                  <span className="account-toggle__track">
                    <span className="account-toggle__thumb" />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-datetime-heading">
          <div className="account-card__header">
            <h2 id="settings-datetime-heading" className="account-card__title">
              Date &amp; Time
            </h2>
            <p className="account-card__hint">
              Saved on this device. Broader app formatting will adopt these
              preferences in a future update.
            </p>
          </div>

          <div className="account-settings__section">
            <div className="ph-form__row ph-form__row--split">
              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="settings-date-format">
                  Date format
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
                  Time format
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
                  <option value="24">24-hour</option>
                  <option value="12">12-hour</option>
                </select>
              </div>
            </div>

            <p className="account-settings__preview">
              Preview: {sampleDate} · {sampleTime}
            </p>
          </div>
        </section>

        <section className="ph-card ph-card--pad account-card" aria-labelledby="settings-language-heading">
          <div className="account-card__header">
            <h2 id="settings-language-heading" className="account-card__title">
              Language
            </h2>
            <p className="account-card__hint">More languages coming soon.</p>
          </div>

          <div className="ph-form__field">
            <label className="ph-form__label" htmlFor="settings-language">
              Language
            </label>
            <select
              id="settings-language"
              className="ph-form__select account-field--readonly"
              value="en"
              disabled
              aria-disabled="true"
            >
              <option value="en">English</option>
            </select>
          </div>
        </section>

        <section
          className="ph-card ph-card--pad account-card"
          aria-labelledby="settings-danger-heading"
        >
          <h2 id="settings-danger-heading" className="account-danger__title">
            Danger zone
          </h2>
          <p className="account-danger__text">
            Permanently delete your PetHealth account and associated data.
          </p>
          <button
            type="button"
            className="ph-btn ph-btn--danger-ghost"
            disabled
            title="Coming soon"
          >
            Delete account
          </button>
        </section>
      </div>
    </div>
  );
}
