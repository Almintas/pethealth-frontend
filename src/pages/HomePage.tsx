import { Link } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PetAvatar } from '../components/PetAvatar';
import { StatusBadge, appointmentStatusTone } from '../components/StatusBadge';
import { useAuth } from '../features/auth';
import { formatAppointmentDateTime } from '../features/appointments/utils/format-appointment-datetime';
import { formatReminderDateTime } from '../features/reminders/utils/format-reminder-datetime';
import { usePetHealthSummary } from '../hooks/use-pet-health-summary';
import { formatPetAge } from '../utils/format-pet-age';
import { getTimeGreeting } from '../utils/greeting';
import './home-page.css';

function StatIcon({ type }: { type: 'pets' | 'appointments' | 'reminders' | 'medications' }) {
  return (
    <span className="ph-stat-card__icon" aria-hidden="true">
      {type === 'pets' ? (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 13.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm14 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM7.2 16.8c1.2 2.2 3.1 3.2 4.8 3.2s3.6-1 4.8-3.2c.5-.9.2-2-.7-2.4-2.2-1-6 1-8.3 0-.9.4-1.2 1.5-.6 2.4Z" />
        </svg>
      ) : null}
      {type === 'appointments' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      ) : null}
      {type === 'reminders' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4a5 5 0 0 0-5 5v2.2c0 .8-.3 1.6-.9 2.2L5 15h14l-1.1-1.6c-.6-.6-.9-1.4-.9-2.2V9a5 5 0 0 0-5-5Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      ) : null}
      {type === 'medications' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 8l8 8M9.5 6.5 6.5 9.5a4 4 0 1 0 5.7 5.7l2.8-2.8a4 4 0 1 0-5.7-5.7Z" />
        </svg>
      ) : null}
    </span>
  );
}

export function HomePage() {
  const { user } = useAuth();
  const {
    pets,
    upcomingAppointments,
    pendingReminders,
    activeMedicationCount,
    loading,
    error,
  } = usePetHealthSummary();

  if (!user) {
    return null;
  }

  const greeting = getTimeGreeting();

  return (
    <section className="home-page ph-page" aria-labelledby="dashboard-title">
      <header className="home-page__welcome ph-card ph-card--pad">
        <div>
          <h1 id="dashboard-title" className="home-page__title">
            {greeting}, {user.firstName}
          </h1>
          <p className="home-page__subtitle">
            Keep your pets&apos; health information organized.
          </p>
        </div>
      </header>

      {loading ? <LoadingSkeleton lines={4} label="Loading dashboard" /> : null}
      {error ? <ErrorAlert message={error} /> : null}

      {!loading && !error ? (
        <>
          <div className="ph-stat-grid home-page__stats">
            <article className="ph-card ph-stat-card">
              <StatIcon type="pets" />
              <span className="ph-stat-card__label">My Pets</span>
              <span className="ph-stat-card__value">{pets.length}</span>
              <span className="ph-stat-card__hint">Profiles you manage</span>
            </article>
            <article className="ph-card ph-stat-card">
              <StatIcon type="appointments" />
              <span className="ph-stat-card__label">Upcoming Appointments</span>
              <span className="ph-stat-card__value">
                {upcomingAppointments.length}
              </span>
              <span className="ph-stat-card__hint">Scheduled visits ahead</span>
            </article>
            <article className="ph-card ph-stat-card">
              <StatIcon type="reminders" />
              <span className="ph-stat-card__label">Pending Reminders</span>
              <span className="ph-stat-card__value">
                {pendingReminders.length}
              </span>
              <span className="ph-stat-card__hint">Items needing attention</span>
            </article>
            <article className="ph-card ph-stat-card">
              <StatIcon type="medications" />
              <span className="ph-stat-card__label">Active Medications</span>
              <span className="ph-stat-card__value">{activeMedicationCount}</span>
              <span className="ph-stat-card__hint">Across all pets</span>
            </article>
          </div>

          <section className="home-page__section" aria-labelledby="your-pets-title">
            <div className="home-page__section-header">
              <h2 id="your-pets-title">Your Pets</h2>
              <Link className="ph-link" to="/pets">View all</Link>
            </div>

            {pets.length === 0 ? (
              <EmptyState
                title="No pets yet"
                description="Add your first pet to start keeping their health information organized."
                action={
                  <Link className="ph-btn ph-btn--primary" to="/pets">
                    Add a pet
                  </Link>
                }
              />
            ) : (
              <ul className="home-page__pet-grid">
                {pets.map((pet) => {
                  const age = formatPetAge(pet.birthDate);
                  const meta = [
                    pet.gender,
                    age,
                  ]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <li key={pet.id}>
                      <Link className="home-page__pet-card ph-card" to={`/pets/${pet.id}`}>
                        <PetAvatar species={pet.species} name={pet.name} size="md" />
                        <div className="home-page__pet-body">
                          <h3>{pet.name}</h3>
                          <p className="home-page__pet-species">
                            {pet.breed || pet.species}
                          </p>
                          {meta ? (
                            <p className="home-page__pet-meta">{meta}</p>
                          ) : null}
                          <span className="home-page__pet-cta">View profile →</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="home-page__section" aria-labelledby="upcoming-title">
            <div className="home-page__section-header">
              <h2 id="upcoming-title">Upcoming</h2>
            </div>

            <div className="home-page__upcoming-grid">
              <article className="ph-card ph-card--pad home-page__upcoming-panel">
                <h3>Appointments</h3>
                {upcomingAppointments.length === 0 ? (
                  <EmptyState
                    title="No upcoming appointments"
                    description="You're all caught up."
                  />
                ) : (
                  <ul className="home-page__timeline">
                    {upcomingAppointments.slice(0, 4).map((appointment) => (
                      <li key={appointment.id} className="home-page__timeline-item">
                        <div>
                          <strong>{appointment.type}</strong>
                          <p>
                            {appointment.petName} ·{' '}
                            {formatAppointmentDateTime(appointment.scheduledAt)}
                          </p>
                        </div>
                        <StatusBadge
                          label={appointment.status}
                          tone={appointmentStatusTone(appointment.status)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="ph-card ph-card--pad home-page__upcoming-panel">
                <h3>Reminders</h3>
                {pendingReminders.length === 0 ? (
                  <EmptyState
                    title="No pending reminders"
                    description="You're all caught up."
                  />
                ) : (
                  <ul className="home-page__timeline">
                    {pendingReminders.slice(0, 4).map((reminder) => (
                      <li key={reminder.id} className="home-page__timeline-item">
                        <div>
                          <strong>{reminder.title}</strong>
                          <p>
                            {reminder.petName} ·{' '}
                            {formatReminderDateTime(reminder.dueAt)}
                          </p>
                        </div>
                        <StatusBadge label={reminder.status} tone="pending" />
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
