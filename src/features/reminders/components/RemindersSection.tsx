import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { REMINDERS_QUERY } from '../graphql';
import * as remindersService from '../reminders.service';
import {
  ReminderStatus,
  type CreateReminderInput,
  type RemindersQueryResult,
  type RemindersQueryVariables,
} from '../types';
import { formatReminderDateTime } from '../utils/format-reminder-datetime';
import { ReminderForm } from './ReminderForm';
import './reminders-section.css';

type RemindersSectionProps = {
  petId: string;
};

type PendingReminderAction = {
  id: string;
  type: 'complete' | 'dismiss';
};

export function RemindersSection({ petId }: RemindersSectionProps) {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingReminderAction | null>(
    null,
  );
  const { data, loading, error, refetch } = useQuery<
    RemindersQueryResult,
    RemindersQueryVariables
  >(REMINDERS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const reminders = data?.reminders ?? [];

  const handleCreateReminder = async (input: CreateReminderInput) => {
    await remindersService.createReminder(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  const handleReminderAction = async (
    reminderId: string,
    action: 'complete' | 'dismiss',
  ) => {
    setActionError(null);
    setPendingAction({ id: reminderId, type: action });

    try {
      if (action === 'complete') {
        await remindersService.completeReminder(client, reminderId);
      } else {
        await remindersService.dismissReminder(client, reminderId);
      }
      await refetch();
    } catch (actionFailure) {
      setActionError(getAuthErrorMessage(actionFailure));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="reminders-section" aria-labelledby="reminders-title">
      <div className="reminders-section__header">
        <h2 id="reminders-title">Reminders</h2>
        {!loading && !error ? (
          <button
            type="button"
            className="reminders-section__add-button"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="reminder-form-panel"
          >
            {isFormOpen ? 'Close form' : 'Add Reminder'}
          </button>
        ) : null}
      </div>

      {isFormOpen && !loading && !error ? (
        <div id="reminder-form-panel" className="reminders-section__form-panel">
          <ReminderForm
            petId={petId}
            onSubmit={handleCreateReminder}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? (
        <p className="reminders-section__status" role="status">Loading reminders…</p>
      ) : null}

      {error ? (
        <p className="reminders-section__error" role="alert">
          {getAuthErrorMessage(error)}
        </p>
      ) : null}

      {actionError ? (
        <p className="reminders-section__error" role="alert">{actionError}</p>
      ) : null}

      {!loading && !error && reminders.length === 0 ? (
        <p className="reminders-section__empty">
          No reminders yet for this pet.
        </p>
      ) : null}

      {!loading && !error && reminders.length > 0 ? (
        <ul className="reminders-section__list">
          {reminders.map((reminder) => {
            const isActionPending = pendingAction?.id === reminder.id;
            const isCompleting =
              isActionPending && pendingAction?.type === 'complete';
            const isDismissing =
              isActionPending && pendingAction?.type === 'dismiss';

            return (
              <li key={reminder.id} className="reminders-section__card">
                <div className="reminders-section__card-header">
                  <h3 className="reminders-section__card-title">
                    {reminder.title}
                  </h3>
                  <span className="reminders-section__status-badge">
                    {reminder.status}
                  </span>
                </div>

                <dl className="reminders-section__meta">
                  <div>
                    <dt>Type</dt>
                    <dd>{reminder.type}</dd>
                  </div>
                  <div>
                    <dt>Due</dt>
                    <dd>{formatReminderDateTime(reminder.dueAt)}</dd>
                  </div>
                  {reminder.message ? (
                    <div>
                      <dt>Description</dt>
                      <dd>{reminder.message}</dd>
                    </div>
                  ) : null}
                  {reminder.sourceType ? (
                    <div>
                      <dt>Source type</dt>
                      <dd>{reminder.sourceType}</dd>
                    </div>
                  ) : null}
                  {reminder.sourceId ? (
                    <div>
                      <dt>Source id</dt>
                      <dd>{reminder.sourceId}</dd>
                    </div>
                  ) : null}
                </dl>

                {reminder.status === ReminderStatus.Pending ? (
                  <div className="reminders-section__actions">
                    <button
                      type="button"
                      className="reminders-section__action reminders-section__action--complete"
                      onClick={() => void handleReminderAction(reminder.id, 'complete')}
                      disabled={pendingAction !== null}
                    >
                      {isCompleting ? 'Completing…' : 'Complete'}
                    </button>
                    <button
                      type="button"
                      className="reminders-section__action reminders-section__action--dismiss"
                      onClick={() => void handleReminderAction(reminder.id, 'dismiss')}
                      disabled={pendingAction !== null}
                    >
                      {isDismissing ? 'Dismissing…' : 'Dismiss'}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
