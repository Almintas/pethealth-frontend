/**
 * Owner-managed reminders (pet-scoped). Notification channels and owner preferences
 * are documented in ../notification-future.types.ts — not implemented here.
 */
import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { REMINDERS_QUERY } from '../graphql';
import * as remindersService from '../reminders.service';
import type {
  CreateReminderInput,
  Reminder,
  RemindersQueryResult,
  RemindersQueryVariables,
  UpdateReminderInput,
} from '../types';
import { partitionReminders } from '../utils/reminder-list-utils';
import { ReminderCard, type ReminderCardAction } from './ReminderCard';
import { ReminderDialog } from './ReminderDialog';
import { ReminderForm } from './ReminderForm';
import './reminders-section.css';

type RemindersSectionProps = {
  petId: string;
};

type RunningReminderAction = {
  id: string;
  action: ReminderCardAction;
};

type ReminderDialogState =
  | { mode: 'create' }
  | { mode: 'edit'; reminder: Reminder };

export function RemindersSection({ petId }: RemindersSectionProps) {
  const client = useApolloClient();
  const [dialogState, setDialogState] = useState<ReminderDialogState | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [runningAction, setRunningAction] = useState<RunningReminderAction | null>(
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

  const { pending, history } = useMemo(
    () => partitionReminders(reminders),
    [reminders],
  );

  const pendingCount = pending.length;
  const historyDefaultOpen = history.length <= 4;

  const openCreateDialog = () => {
    setActionError(null);
    setDialogState({ mode: 'create' });
  };

  const openEditDialog = (reminder: Reminder) => {
    setActionError(null);
    setDialogState({ mode: 'edit', reminder });
  };

  const closeDialog = () => {
    setDialogState(null);
  };

  const handleCreateReminder = async (input: CreateReminderInput) => {
    await remindersService.createReminder(client, input);
    await refetch();
    closeDialog();
  };

  const handleUpdateReminder = async (
    id: string,
    input: UpdateReminderInput,
  ) => {
    await remindersService.updateReminder(client, id, input);
    await refetch();
    closeDialog();
  };

  const runReminderAction = async (
    reminderId: string,
    action: ReminderCardAction,
  ) => {
    setActionError(null);
    setRunningAction({ id: reminderId, action });

    try {
      if (action === 'complete') {
        await remindersService.completeReminder(client, reminderId);
      } else if (action === 'dismiss') {
        await remindersService.dismissReminder(client, reminderId);
      } else {
        await remindersService.deleteReminder(client, reminderId);
      }
      await refetch();
    } catch (actionFailure) {
      setActionError(getUserFacingErrorMessage(actionFailure, 'save-reminder'));
    } finally {
      setRunningAction(null);
    }
  };

  const countLabel =
    reminders.length === 1 ? '1 reminder' : `${reminders.length} reminders`;

  const pendingCountLabel =
    pendingCount === 0
      ? '0 pending'
      : pendingCount === 1
        ? '1 pending'
        : `${pendingCount} pending`;

  const getCardActionState = (reminderId: string) => {
    const isRunning = runningAction?.id === reminderId;
    return {
      pendingAction: isRunning ? runningAction.action : null,
      isActionRunning: runningAction !== null,
    };
  };

  return (
    <section className="reminders-section" aria-labelledby="reminders-title">
      <header className="reminders-section__header">
        <div className="reminders-section__heading">
          <h2 id="reminders-title">Reminders</h2>
          {!loading && !error ? (
            <p className="reminders-section__count" aria-live="polite">
              {countLabel}
              <span className="reminders-section__count-pending">
                {' '}
                · {pendingCountLabel}
              </span>
            </p>
          ) : null}
        </div>

        {!loading && !error ? (
          <button
            type="button"
            className="reminders-section__add-button"
            onClick={openCreateDialog}
          >
            + Add reminder
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message="Loading reminders…" skeleton />
      ) : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'load-reminders')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {actionError ? (
        <ErrorAlert message={actionError} compact />
      ) : null}

      {!loading && !error && reminders.length === 0 ? (
        <div className="reminders-section__empty">
          <h3 className="reminders-section__empty-title">No reminders yet</h3>
          <p className="reminders-section__empty-text">
            Set due dates for vaccines, medications and visits so nothing
            important slips through the cracks.
          </p>
        </div>
      ) : null}

      {!loading && !error && reminders.length > 0 ? (
        <div className="reminders-section__groups">
          <section
            className="reminders-section__group"
            aria-labelledby="reminders-pending-heading"
          >
            <h3
              id="reminders-pending-heading"
              className="reminders-section__group-title"
            >
              Pending
            </h3>

            {pending.length === 0 ? (
              <p className="reminders-section__pending-empty">
                No pending reminders. Completed and dismissed items are in
                history below.
              </p>
            ) : (
              <ol className="reminders-section__timeline">
                {pending.map((reminder, index) => {
                  const actionState = getCardActionState(reminder.id);
                  return (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      isLast={index === pending.length - 1}
                      isHistory={false}
                      pendingAction={actionState.pendingAction}
                      isActionRunning={actionState.isActionRunning}
                      onComplete={() =>
                        void runReminderAction(reminder.id, 'complete')
                      }
                      onDismiss={() =>
                        void runReminderAction(reminder.id, 'dismiss')
                      }
                      onEdit={() => openEditDialog(reminder)}
                      onDelete={() =>
                        void runReminderAction(reminder.id, 'delete')
                      }
                    />
                  );
                })}
              </ol>
            )}
          </section>

          {history.length > 0 ? (
            <details
              className="reminders-section__history"
              open={historyDefaultOpen}
            >
              <summary className="reminders-section__history-summary">
                History
                <span className="reminders-section__history-count">
                  {history.length}
                </span>
              </summary>
              <ol className="reminders-section__timeline reminders-section__timeline--history">
                {history.map((reminder, index) => {
                  const actionState = getCardActionState(reminder.id);
                  return (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      isLast={index === history.length - 1}
                      isHistory
                      pendingAction={actionState.pendingAction}
                      isActionRunning={actionState.isActionRunning}
                      onComplete={() =>
                        void runReminderAction(reminder.id, 'complete')
                      }
                      onDismiss={() =>
                        void runReminderAction(reminder.id, 'dismiss')
                      }
                      onEdit={() => openEditDialog(reminder)}
                      onDelete={() =>
                        void runReminderAction(reminder.id, 'delete')
                      }
                    />
                  );
                })}
              </ol>
            </details>
          ) : null}
        </div>
      ) : null}

      <ReminderDialog
        isOpen={dialogState !== null}
        title={dialogState?.mode === 'edit' ? 'Edit reminder' : 'Add reminder'}
        onClose={closeDialog}
      >
        {dialogState ? (
          <ReminderForm
            key={
              dialogState.mode === 'edit' ? dialogState.reminder.id : 'create'
            }
            petId={petId}
            mode={dialogState.mode}
            reminder={
              dialogState.mode === 'edit' ? dialogState.reminder : undefined
            }
            onCreate={handleCreateReminder}
            onUpdate={handleUpdateReminder}
            onCancel={closeDialog}
            variant="dialog"
          />
        ) : null}
      </ReminderDialog>
    </section>
  );
}
