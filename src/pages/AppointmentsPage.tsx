import { Link } from 'react-router';
import { EmptyState } from '../components/EmptyState';
import { ErrorAlert } from '../components/ErrorAlert';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  StatusBadge,
  appointmentStatusTone,
} from '../components/StatusBadge';
import { formatAppointmentDateTime } from '../features/appointments/utils/format-appointment-datetime';
import { usePetHealthSummary } from '../hooks/use-pet-health-summary';
import './appointments-page.css';

export function AppointmentsPage() {
  const { appointments, loading, error } = usePetHealthSummary();

  const sortedAppointments = [...appointments].sort(
    (left, right) =>
      new Date(right.scheduledAt).getTime() -
      new Date(left.scheduledAt).getTime(),
  );

  return (
    <section className="appointments-page ph-page" aria-labelledby="appointments-page-title">
      <header className="ph-page-header">
        <div>
          <h1 id="appointments-page-title" className="ph-page-header__title">
            Appointments
          </h1>
          <p className="ph-page-header__subtitle">
            Scheduled visits and clinic appointments across all your pets.
          </p>
        </div>
        <Link className="ph-btn ph-btn--secondary" to="/pets">
          Manage pets
        </Link>
      </header>

      {loading ? <LoadingSkeleton lines={5} label="Loading appointments" /> : null}
      {error ? <ErrorAlert message={error} /> : null}

      {!loading && !error && sortedAppointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Create an appointment from a pet profile when you schedule a visit."
          action={
            <Link className="ph-btn ph-btn--primary" to="/pets">
              Go to My Pets
            </Link>
          }
        />
      ) : null}

      {!loading && !error && sortedAppointments.length > 0 ? (
        <ul className="appointments-page__list">
          {sortedAppointments.map((appointment) => (
            <li key={appointment.id} className="ph-card appointments-page__item">
              <div className="appointments-page__item-header">
                <div>
                  <h2>{appointment.type}</h2>
                  <p>
                    <Link className="ph-link" to={`/pets/${appointment.petId}`}>
                      {appointment.petName}
                    </Link>
                    {' · '}
                    {formatAppointmentDateTime(appointment.scheduledAt)}
                  </p>
                </div>
                <StatusBadge
                  label={appointment.status}
                  tone={appointmentStatusTone(appointment.status)}
                />
              </div>
              {appointment.clinicName ? (
                <p className="appointments-page__detail">
                  Clinic: {appointment.clinicName}
                </p>
              ) : null}
              {appointment.reason ? (
                <p className="appointments-page__detail">
                  Reason: {appointment.reason}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
