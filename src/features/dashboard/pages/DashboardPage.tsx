import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PetAvatar } from '../../../components/PetAvatar';
import { useAuth } from '../../auth';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatAppointmentDateTime } from '../../appointments/utils/format-appointment-datetime';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { formatReminderDateTime } from '../../reminders/utils/format-reminder-datetime';
import { useDashboardHealthData } from '../hooks/useDashboardHealthData';
import { normalizeAppointmentTypeValue } from '../../appointments/constants/appointment-types';
import { translatePetSpecies } from '../../pets/utils/pet-field-display';
import { useEnumLabels } from '../../../i18n/useEnumLabels';
import type {
  DashboardAttentionItem,
  DashboardUpcomingItem,
} from '../types';
import { formatPetAge } from '../utils/format-pet-age';
import './dashboard-page.css';

function formatUpcomingWhen(item: DashboardUpcomingItem): string {
  if (item.kind === 'appointment') {
    return formatAppointmentDateTime(item.at);
  }
  if (item.kind === 'reminder') {
    return formatReminderDateTime(item.at);
  }
  return formatPetDate(item.at);
}

function upcomingItemTitle(
  item: DashboardUpcomingItem,
  t: ReturnType<typeof useTranslation>['t'],
  appointmentTypeLabel: (type: string) => string,
): string {
  switch (item.kind) {
    case 'appointment':
      return appointmentTypeLabel(
        normalizeAppointmentTypeValue(item.appointmentType ?? item.title),
      );
    case 'reminder':
      return item.title;
    case 'vaccination':
      return t('dashboard.upcomingVaccinationDue', {
        name: item.vaccineName ?? item.title,
      });
    case 'medication':
      return t('dashboard.upcomingMedicationEnds', {
        name: item.medicationName ?? item.title,
      });
  }
}

function attentionItemLabel(
  item: DashboardAttentionItem,
  t: ReturnType<typeof useTranslation>['t'],
): string {
  switch (item.attentionKind) {
    case 'reminder-overdue':
      return t('dashboard.attentionReminderOverdue', {
        title: item.reminderTitle ?? item.label,
      });
    case 'vaccination-overdue':
      return t('dashboard.attentionVaccinationOverdue', {
        name: item.vaccineName ?? item.label,
      });
    case 'medication-ended-active':
      return t('dashboard.attentionMedicationEndedActive', {
        name: item.medicationName ?? item.label,
      });
    default:
      return item.label;
  }
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { appointmentType } = useEnumLabels();
  const { user } = useAuth();
  const {
    pets,
    petsLoading,
    petsError,
    healthLoading,
    healthError,
    partialHealthErrors,
    stats,
    attentionItems,
    upcomingItems,
    petSummaries,
  } = useDashboardHealthData();

  const upcomingKindLabel = (kind: DashboardUpcomingItem['kind']): string => {
    switch (kind) {
      case 'appointment':
        return t('dashboard.kindAppointment');
      case 'reminder':
        return t('dashboard.kindReminder');
      case 'vaccination':
        return t('dashboard.kindVaccination');
      case 'medication':
        return t('dashboard.kindMedication');
    }
  };

  if (!user) {
    return null;
  }

  const isLoadingOverview = petsLoading || (pets.length > 0 && healthLoading);
  const petCountLabel =
    stats.petCount === 1
      ? t('dashboard.petCountOne')
      : t('dashboard.petCountMany', { count: stats.petCount });

  return (
    <div className="dashboard-page ph-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">{t('dashboard.eyebrow')}</p>
          <h1 id="dashboard-title" className="dashboard-page__title">
            {t('dashboard.hello', { name: user.firstName })}
          </h1>
          <p className="dashboard-page__subtitle">
            {petsLoading
              ? t('dashboard.loadingPets')
              : pets.length === 0
                ? t('dashboard.emptySubtitle')
                : t('dashboard.overviewSubtitle', { petCountLabel })}
          </p>
        </div>
      </header>

      {petsError ? (
        <p className="dashboard-page__banner dashboard-page__banner--error" role="alert">
          {getUserFacingErrorMessage(petsError, 'load-pets')}
        </p>
      ) : null}

      {partialHealthErrors > 0 && !healthError ? (
        <p className="dashboard-page__banner dashboard-page__banner--warn" role="status">
          {t('dashboard.partialHealthWarning')}
        </p>
      ) : null}

      {healthError ? (
        <p className="dashboard-page__banner dashboard-page__banner--error" role="alert">
          {healthError}
        </p>
      ) : null}

      {!petsLoading && !petsError && pets.length === 0 ? (
        <section className="dashboard-page__empty" aria-labelledby="dashboard-empty-title">
          <h2 id="dashboard-empty-title">{t('dashboard.noPets')}</h2>
          <p>{t('dashboard.noPetsCta')}</p>
          <Link className="dashboard-page__cta" to="/pets">
            {t('dashboard.addPet')}
          </Link>
        </section>
      ) : null}

      {pets.length > 0 ? (
        <>
          <section
            className="dashboard-page__stats"
            aria-labelledby="dashboard-stats-title"
          >
            <h2 id="dashboard-stats-title" className="dashboard-page__section-title">
              {t('dashboard.eyebrow')}
            </h2>
            {isLoadingOverview ? (
              <div className="dashboard-page__stats-grid dashboard-page__skeleton-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="dashboard-page__stat-card dashboard-page__skeleton"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : (
              <div className="dashboard-page__stats-grid">
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">{t('dashboard.statsPets')}</span>
                  <span className="dashboard-page__stat-value">{stats.petCount}</span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">{t('dashboard.statsUpcoming')}</span>
                  <span className="dashboard-page__stat-value">
                    {stats.upcomingAppointments}
                  </span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">{t('reminders.title')}</span>
                  <span className="dashboard-page__stat-value">
                    {stats.pendingReminders}
                  </span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">{t('health.medications')}</span>
                  <span className="dashboard-page__stat-value">
                    {stats.activeMedications}
                  </span>
                </Link>
              </div>
            )}
          </section>

          <section
            className="dashboard-page__panel"
            aria-labelledby="dashboard-attention-title"
          >
            <h2 id="dashboard-attention-title" className="dashboard-page__section-title">
              {t('dashboard.sectionAttention')}
            </h2>
            {isLoadingOverview ? (
              <div className="dashboard-page__skeleton dashboard-page__skeleton--block" />
            ) : attentionItems.length === 0 ? (
              <p className="dashboard-page__calm-empty" role="status">
                {t('dashboard.noAttention')}
              </p>
            ) : (
              <ul className="dashboard-page__attention-list">
                {attentionItems.map((item) => (
                  <li key={item.id}>
                    <Link className="dashboard-page__attention-item" to={item.href}>
                      <span className="dashboard-page__attention-pet">{item.petName}</span>
                      <span className="dashboard-page__attention-label">
                        {attentionItemLabel(item, t)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="dashboard-page__panel"
            aria-labelledby="dashboard-upcoming-title"
          >
            <h2 id="dashboard-upcoming-title" className="dashboard-page__section-title">
              {t('dashboard.sectionUpcoming')}
            </h2>
            {isLoadingOverview ? (
              <div className="dashboard-page__skeleton dashboard-page__skeleton--block" />
            ) : upcomingItems.length === 0 ? (
              <p className="dashboard-page__calm-empty" role="status">
                {t('dashboard.noUpcoming')}
              </p>
            ) : (
              <ul className="dashboard-page__upcoming-list">
                {upcomingItems.map((item) => (
                  <li key={item.id}>
                    <Link className="dashboard-page__upcoming-item" to={item.href}>
                      <div className="dashboard-page__upcoming-main">
                        <span className="dashboard-page__upcoming-kind">
                          {upcomingKindLabel(item.kind)}
                        </span>
                        <span className="dashboard-page__upcoming-title">
                          {upcomingItemTitle(item, t, appointmentType)}
                        </span>
                        <span className="dashboard-page__upcoming-pet">
                          {item.petName}
                        </span>
                      </div>
                      <time
                        className="dashboard-page__upcoming-when"
                        dateTime={item.at}
                      >
                        {formatUpcomingWhen(item)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className="dashboard-page__panel"
            aria-labelledby="dashboard-pets-title"
          >
            <div className="dashboard-page__pets-header">
              <h2 id="dashboard-pets-title" className="dashboard-page__section-title">
                {t('dashboard.sectionYourPets')}
              </h2>
              <Link className="dashboard-page__text-link" to="/pets">
                {t('dashboard.viewAllPets')}
              </Link>
            </div>

            {isLoadingOverview ? (
              <div className="dashboard-page__pets-grid dashboard-page__skeleton-grid">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="dashboard-page__pet-card dashboard-page__skeleton"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : (
              <ul className="dashboard-page__pets-grid">
                {petSummaries.map((summary) => {
                  const age = formatPetAge(summary.pet.birthDate);
                  const summaryParts: string[] = [];
                  if (summary.upcomingAppointments > 0) {
                    summaryParts.push(
                      summary.upcomingAppointments === 1
                        ? t('appointments.upcomingCountOne')
                        : t('appointments.upcomingCountMany', {
                            count: summary.upcomingAppointments,
                          }),
                    );
                  }
                  if (summary.pendingReminders > 0) {
                    summaryParts.push(
                      summary.pendingReminders === 1
                        ? t('reminders.countOne')
                        : t('reminders.countMany', { count: summary.pendingReminders }),
                    );
                  }
                  if (summary.activeMedications > 0) {
                    summaryParts.push(
                      `${summary.activeMedications} ${t('health.medications').toLowerCase()}`,
                    );
                  }
                  if (summary.overdueVaccinations > 0) {
                    summaryParts.push(
                      `${summary.overdueVaccinations} ${t('enums.vaccinationDue.overdue').toLowerCase()}`,
                    );
                  }

                  const healthSummary =
                    summaryParts.length > 0
                      ? summaryParts.join(' · ')
                      : t('dashboard.noAttention');

                  return (
                    <li key={summary.pet.id}>
                      <Link
                        className="dashboard-page__pet-card"
                        to={`/pets/${summary.pet.id}`}
                      >
                        <span className="dashboard-page__pet-avatar">
                          <PetAvatar
                            species={summary.pet.species}
                            name={summary.pet.name}
                            photoUrl={summary.pet.photoUrl}
                            size="md"
                          />
                        </span>
                        <div className="dashboard-page__pet-body">
                          <h3 className="dashboard-page__pet-name">{summary.pet.name}</h3>
                          <p className="dashboard-page__pet-meta">
                            {translatePetSpecies(summary.pet.species, t)}
                            {age ? ` · ${age}` : ''}
                          </p>
                          <p className="dashboard-page__pet-summary">{healthSummary}</p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
