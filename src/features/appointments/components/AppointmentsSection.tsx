import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { APPOINTMENTS_QUERY } from '../graphql';
import * as appointmentsService from '../appointments.service';
import type {
  AppointmentsQueryResult,
  AppointmentsQueryVariables,
  CreateAppointmentInput,
} from '../types';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorAlert } from '../../../components/ErrorAlert';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import {
  StatusBadge,
  appointmentStatusTone,
} from '../../../components/StatusBadge';
import { formatAppointmentDateTime } from '../utils/format-appointment-datetime';
import { AppointmentForm } from './AppointmentForm';
import './appointments-section.css';

type AppointmentsSectionProps = {
  petId: string;
};

export function AppointmentsSection({ petId }: AppointmentsSectionProps) {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    AppointmentsQueryResult,
    AppointmentsQueryVariables
  >(APPOINTMENTS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const appointments = data?.appointments ?? [];

  const handleCreateAppointment = async (input: CreateAppointmentInput) => {
    await appointmentsService.createAppointment(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  return (
    <section
      id="appointments"
      className="appointments-section"
      aria-labelledby="appointments-title"
    >
      <div className="appointments-section__header">
        <div>
          <h2 id="appointments-title">Appointments</h2>
          <p className="appointments-section__description">
            Scheduled visits and follow-ups for this pet.
            {!loading && !error ? ` (${appointments.length})` : ''}
          </p>
        </div>
        {!loading && !error ? (
          <button
            type="button"
            className="appointments-section__add-button"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="appointment-form-panel"
          >
            {isFormOpen ? 'Close form' : 'Add Appointment'}
          </button>
        ) : null}
      </div>

      {isFormOpen && !loading && !error ? (
        <div
          id="appointment-form-panel"
          className="appointments-section__form-panel"
        >
          <AppointmentForm
            petId={petId}
            onSubmit={handleCreateAppointment}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? (
        <LoadingSkeleton lines={3} label="Loading appointments" />
      ) : null}

      {error ? <ErrorAlert message={getAuthErrorMessage(error)} /> : null}

      {!loading && !error && appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Add an appointment when you schedule a visit or check-up."
        />
      ) : null}

      {!loading && !error && appointments.length > 0 ? (
        <ul className="appointments-section__list">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="appointments-section__card">
              <div className="appointments-section__card-header">
                <h3 className="appointments-section__card-title">
                  {appointment.type}
                </h3>
                <StatusBadge
                  label={appointment.status}
                  tone={appointmentStatusTone(appointment.status)}
                />
              </div>
              <dl className="appointments-section__meta">
                <div>
                  <dt>Scheduled</dt>
                  <dd>{formatAppointmentDateTime(appointment.scheduledAt)}</dd>
                </div>
                {appointment.clinicName ? (
                  <div>
                    <dt>Clinic</dt>
                    <dd>{appointment.clinicName}</dd>
                  </div>
                ) : null}
                {appointment.veterinarianName ? (
                  <div>
                    <dt>Veterinarian</dt>
                    <dd>{appointment.veterinarianName}</dd>
                  </div>
                ) : null}
                {appointment.reason ? (
                  <div>
                    <dt>Reason</dt>
                    <dd>{appointment.reason}</dd>
                  </div>
                ) : null}
                {appointment.notes ? (
                  <div>
                    <dt>Notes</dt>
                    <dd>{appointment.notes}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
