import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { APPOINTMENTS_QUERY } from '../graphql';
import * as appointmentsService from '../appointments.service';
import type {
  Appointment,
  AppointmentsQueryResult,
  AppointmentsQueryVariables,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types';
import { partitionAppointments } from '../utils/appointment-list-utils';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentDialog } from './AppointmentDialog';
import { AppointmentForm } from './AppointmentForm';
import './appointments-section.css';

type AppointmentsSectionProps = {
  petId: string;
};

type AppointmentDialogState =
  | { mode: 'create' }
  | { mode: 'edit'; appointment: Appointment };

export function AppointmentsSection({ petId }: AppointmentsSectionProps) {
  const client = useApolloClient();
  const [dialogState, setDialogState] = useState<AppointmentDialogState | null>(
    null,
  );
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<
    string | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    AppointmentsQueryResult,
    AppointmentsQueryVariables
  >(APPOINTMENTS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const appointments = data?.appointments ?? [];

  const { upcoming, history } = useMemo(
    () => partitionAppointments(appointments),
    [appointments],
  );

  const openCreateDialog = () => {
    setActionError(null);
    setDialogState({ mode: 'create' });
  };

  const openEditDialog = (appointment: Appointment) => {
    setActionError(null);
    setDialogState({ mode: 'edit', appointment });
  };

  const closeDialog = () => {
    setDialogState(null);
  };

  const handleCreateAppointment = async (input: CreateAppointmentInput) => {
    await appointmentsService.createAppointment(client, input);
    await refetch();
    closeDialog();
  };

  const handleUpdateAppointment = async (
    id: string,
    input: UpdateAppointmentInput,
  ) => {
    await appointmentsService.updateAppointment(client, id, input);
    await refetch();
    closeDialog();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    setActionError(null);
    setDeletingAppointmentId(appointmentId);
    try {
      await appointmentsService.deleteAppointment(client, appointmentId);
      await refetch();
    } catch (deleteError) {
      setActionError(getUserFacingErrorMessage(deleteError, 'save-appointment'));
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const countLabel =
    appointments.length === 1
      ? '1 appointment'
      : `${appointments.length} appointments`;

  const upcomingCountLabel =
    upcoming.length === 0
      ? null
      : upcoming.length === 1
        ? '1 upcoming'
        : `${upcoming.length} upcoming`;

  const historyDefaultOpen = history.length <= 4;

  return (
    <section
      className="appointments-section"
      aria-labelledby="appointments-title"
    >
      <header className="appointments-section__header">
        <div className="appointments-section__heading">
          <h2 id="appointments-title">Appointments</h2>
          {!loading && !error ? (
            <p className="appointments-section__count" aria-live="polite">
              {countLabel}
              {upcomingCountLabel ? (
                <span className="appointments-section__count-upcoming">
                  {' '}
                  · {upcomingCountLabel}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        {!loading && !error ? (
          <button
            type="button"
            className="appointments-section__add-button"
            onClick={openCreateDialog}
          >
            + Add appointment
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message="Loading appointments…" skeleton />
      ) : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'load-appointments')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {actionError ? (
        <ErrorAlert message={actionError} compact />
      ) : null}

      {!loading && !error && appointments.length === 0 ? (
        <div className="appointments-section__empty">
          <h3 className="appointments-section__empty-title">
            No appointments yet
          </h3>
          <p className="appointments-section__empty-text">
            Schedule vet visits and checkups here so you always know what is
            coming up for this pet.
          </p>
        </div>
      ) : null}

      {!loading && !error && appointments.length > 0 ? (
        <div className="appointments-section__groups">
          <section
            className="appointments-section__group"
            aria-labelledby="appointments-upcoming-heading"
          >
            <h3
              id="appointments-upcoming-heading"
              className="appointments-section__group-title"
            >
              Upcoming
            </h3>

            {upcoming.length === 0 ? (
              <p className="appointments-section__upcoming-empty">
                No upcoming appointments scheduled. Past visits are listed in
                history below.
              </p>
            ) : (
              <ol className="appointments-section__timeline">
                {upcoming.map((appointment, index) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isLast={index === upcoming.length - 1}
                    isHistory={false}
                    isDeleting={deletingAppointmentId === appointment.id}
                    onEdit={() => openEditDialog(appointment)}
                    onDelete={() => void handleDeleteAppointment(appointment.id)}
                  />
                ))}
              </ol>
            )}
          </section>

          {history.length > 0 ? (
            <details
              className="appointments-section__history"
              open={historyDefaultOpen}
            >
              <summary className="appointments-section__history-summary">
                History
                <span className="appointments-section__history-count">
                  {history.length}
                </span>
              </summary>
              <ol className="appointments-section__timeline appointments-section__timeline--history">
                {history.map((appointment, index) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    isLast={index === history.length - 1}
                    isHistory
                    isDeleting={deletingAppointmentId === appointment.id}
                    onEdit={() => openEditDialog(appointment)}
                    onDelete={() => void handleDeleteAppointment(appointment.id)}
                  />
                ))}
              </ol>
            </details>
          ) : null}
        </div>
      ) : null}

      <AppointmentDialog
        isOpen={dialogState !== null}
        title={
          dialogState?.mode === 'edit' ? 'Edit appointment' : 'Add appointment'
        }
        onClose={closeDialog}
      >
        {dialogState ? (
          <AppointmentForm
            key={
              dialogState.mode === 'edit'
                ? dialogState.appointment.id
                : 'create'
            }
            petId={petId}
            mode={dialogState.mode}
            appointment={
              dialogState.mode === 'edit' ? dialogState.appointment : undefined
            }
            onCreate={handleCreateAppointment}
            onUpdate={handleUpdateAppointment}
            onCancel={closeDialog}
            variant="dialog"
          />
        ) : null}
      </AppointmentDialog>
    </section>
  );
}
