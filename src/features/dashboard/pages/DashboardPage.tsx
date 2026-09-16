import { Link } from 'react-router';
import { useAuth } from '../../auth';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatAppointmentDateTime } from '../../appointments/utils/format-appointment-datetime';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { formatReminderDateTime } from '../../reminders/utils/format-reminder-datetime';
import { useDashboardHealthData } from '../hooks/useDashboardHealthData';
import type { DashboardUpcomingItem } from '../types';
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

function upcomingKindLabel(kind: DashboardUpcomingItem['kind']): string {
  switch (kind) {
    case 'appointment':
      return 'Appointment';
    case 'reminder':
      return 'Reminder';
    case 'vaccination':
      return 'Vaccination';
    case 'medication':
      return 'Medication';
  }
}

function speciesInitial(species: string): string {
  const trimmed = species.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export function DashboardPage() {
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

  if (!user) {
    return null;
  }

  const isLoadingOverview = petsLoading || (pets.length > 0 && healthLoading);
  const petCountLabel =
    stats.petCount === 1 ? '1 pet in your care' : `${stats.petCount} pets in your care`;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">Pet health overview</p>
          <h1 id="dashboard-title" className="dashboard-page__title">
            Hello, {user.firstName}
          </h1>
          <p className="dashboard-page__subtitle">
            {petsLoading
              ? 'Loading your pets…'
              : pets.length === 0
                ? 'Add a pet to start tracking vaccines, visits, and daily care.'
                : `Here is what needs your attention and what is coming up for ${petCountLabel}.`}
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
          Some health details could not be loaded for every pet. Summaries may be
          incomplete.
        </p>
      ) : null}

      {healthError ? (
        <p className="dashboard-page__banner dashboard-page__banner--error" role="alert">
          {healthError}
        </p>
      ) : null}

      {!petsLoading && !petsError && pets.length === 0 ? (
        <section className="dashboard-page__empty" aria-labelledby="dashboard-empty-title">
          <h2 id="dashboard-empty-title">Welcome to PetHealth</h2>
          <p>
            Create a pet profile to log vaccinations, medications, appointments,
            and reminders in one place.
          </p>
          <Link className="dashboard-page__cta" to="/pets">
            Add your first pet
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
              At a glance
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
                  <span className="dashboard-page__stat-label">My pets</span>
                  <span className="dashboard-page__stat-value">{stats.petCount}</span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">Upcoming appointments</span>
                  <span className="dashboard-page__stat-value">
                    {stats.upcomingAppointments}
                  </span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">Pending reminders</span>
                  <span className="dashboard-page__stat-value">
                    {stats.pendingReminders}
                  </span>
                </Link>
                <Link className="dashboard-page__stat-card" to="/pets">
                  <span className="dashboard-page__stat-label">Active medications</span>
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
              Needs attention
            </h2>
            {isLoadingOverview ? (
              <div className="dashboard-page__skeleton dashboard-page__skeleton--block" />
            ) : attentionItems.length === 0 ? (
              <p className="dashboard-page__calm-empty" role="status">
                Nothing urgent right now — you are up to date on tracked items.
              </p>
            ) : (
              <ul className="dashboard-page__attention-list">
                {attentionItems.map((item) => (
                  <li key={item.id}>
                    <Link className="dashboard-page__attention-item" to={item.href}>
                      <span className="dashboard-page__attention-pet">{item.petName}</span>
                      <span className="dashboard-page__attention-label">{item.label}</span>
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
              Upcoming
            </h2>
            {isLoadingOverview ? (
              <div className="dashboard-page__skeleton dashboard-page__skeleton--block" />
            ) : upcomingItems.length === 0 ? (
              <p className="dashboard-page__calm-empty" role="status">
                No scheduled items in the next stretch. Add appointments or reminders
                from a pet profile when you are ready.
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
                          {item.title}
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
                Your pets
              </h2>
              <Link className="dashboard-page__text-link" to="/pets">
                Manage pets
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
                      `${summary.upcomingAppointments} upcoming visit${summary.upcomingAppointments === 1 ? '' : 's'}`,
                    );
                  }
                  if (summary.pendingReminders > 0) {
                    summaryParts.push(
                      `${summary.pendingReminders} pending reminder${summary.pendingReminders === 1 ? '' : 's'}`,
                    );
                  }
                  if (summary.activeMedications > 0) {
                    summaryParts.push(
                      `${summary.activeMedications} active medication${summary.activeMedications === 1 ? '' : 's'}`,
                    );
                  }
                  if (summary.overdueVaccinations > 0) {
                    summaryParts.push(
                      `${summary.overdueVaccinations} overdue vaccination${summary.overdueVaccinations === 1 ? '' : 's'}`,
                    );
                  }

                  const healthSummary =
                    summaryParts.length > 0
                      ? summaryParts.join(' · ')
                      : 'No active items tracked yet';

                  return (
                    <li key={summary.pet.id}>
                      <Link
                        className="dashboard-page__pet-card"
                        to={`/pets/${summary.pet.id}`}
                      >
                        <span
                          className="dashboard-page__pet-avatar"
                          aria-hidden="true"
                        >
                          {speciesInitial(summary.pet.species)}
                        </span>
                        <div className="dashboard-page__pet-body">
                          <h3 className="dashboard-page__pet-name">{summary.pet.name}</h3>
                          <p className="dashboard-page__pet-meta">
                            {summary.pet.species}
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
