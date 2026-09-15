import { Link } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  StatusBadge,
  reminderStatusTone,
} from '../components/StatusBadge';
import { formatReminderDateTime } from '../features/reminders/utils/format-reminder-datetime';
import { usePetHealthSummary } from '../hooks/use-pet-health-summary';
import './reminders-page.css';

export function RemindersPage() {
  const { reminders, loading, error } = usePetHealthSummary();

  const sortedReminders = [...reminders].sort(
    (left, right) =>
      new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
  );

  return (
    <section className="reminders-page ph-page" aria-labelledby="reminders-page-title">
      <header className="ph-page-header">
        <div>
          <h1 id="reminders-page-title" className="ph-page-header__title">
            Reminders
          </h1>
          <p className="ph-page-header__subtitle">
            Vaccination, medication, and general reminders for your pets.
          </p>
        </div>
        <Link className="ph-btn ph-btn--secondary" to="/pets">
          Manage pets
        </Link>
      </header>

      {loading ? <LoadingSkeleton lines={5} label="Loading reminders" /> : null}
      {error ? <ErrorAlert message={error} /> : null}

      {!loading && !error && sortedReminders.length === 0 ? (
        <EmptyState
          title="No reminders yet"
          description="Add reminders from a pet profile to stay on top of care tasks."
          action={
            <Link className="ph-btn ph-btn--primary" to="/pets">
              Go to My Pets
            </Link>
          }
        />
      ) : null}

      {!loading && !error && sortedReminders.length > 0 ? (
        <ul className="reminders-page__list">
          {sortedReminders.map((reminder) => (
            <li key={reminder.id} className="ph-card reminders-page__item">
              <div className="reminders-page__item-header">
                <div>
                  <h2>{reminder.title}</h2>
                  <p>
                    <Link className="ph-link" to={`/pets/${reminder.petId}`}>
                      {reminder.petName}
                    </Link>
                    {' · '}
                    {formatReminderDateTime(reminder.dueAt)}
                  </p>
                </div>
                <StatusBadge
                  label={reminder.status}
                  tone={reminderStatusTone(reminder.status)}
                />
              </div>
              {reminder.message ? (
                <p className="reminders-page__detail">{reminder.message}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
