import { useState } from 'react';
import { ReminderStatus, type Reminder } from '../types';
import {
  formatReminderDate,
  formatReminderTime,
} from '../utils/format-reminder-datetime';
import {
  formatReminderSource,
  getReminderDueUrgency,
  getReminderDueUrgencyLabel,
  getReminderStatusLabel,
  getReminderTypeLabel,
} from '../utils/reminder-list-utils';

const LONG_MESSAGE_THRESHOLD = 140;

export type ReminderCardAction = 'complete' | 'dismiss' | 'delete';

type ReminderCardProps = {
  reminder: Reminder;
  isLast: boolean;
  isHistory: boolean;
  pendingAction: ReminderCardAction | null;
  isActionRunning: boolean;
  onComplete: () => void;
  onDismiss: () => void;
  onDelete: () => void;
};

function statusModifier(status: Reminder['status']): string {
  switch (status) {
    case ReminderStatus.Pending:
      return 'pending';
    case ReminderStatus.Completed:
      return 'completed';
    case ReminderStatus.Dismissed:
      return 'dismissed';
    default:
      return 'pending';
  }
}

export function ReminderCard({
  reminder,
  isLast,
  isHistory,
  pendingAction,
  isActionRunning,
  onComplete,
  onDismiss,
  onDelete,
}: ReminderCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const message = reminder.message?.trim() ?? '';
  const messageIsLong = message.length > LONG_MESSAGE_THRESHOLD;
  const dueUrgency = getReminderDueUrgency(reminder.dueAt);
  const dueUrgencyLabel = getReminderDueUrgencyLabel(dueUrgency);
  const sourceLabel = formatReminderSource(reminder);
  const isPending = reminder.status === ReminderStatus.Pending;

  const isCompleting = isActionRunning && pendingAction === 'complete';
  const isDismissing = isActionRunning && pendingAction === 'dismiss';
  const isDeleting = isActionRunning && pendingAction === 'delete';

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete();
    setConfirmDelete(false);
  };

  return (
    <li
      className={[
        'reminders-section__timeline-item',
        isHistory ? 'reminders-section__timeline-item--history' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="reminders-section__timeline-rail" aria-hidden="true">
        <span
          className={[
            'reminders-section__timeline-dot',
            isHistory ? 'reminders-section__timeline-dot--muted' : '',
            isPending && dueUrgency === 'overdue'
              ? 'reminders-section__timeline-dot--overdue'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {!isLast ? <span className="reminders-section__timeline-line" /> : null}
      </div>

      <article
        className={[
          'reminders-section__record-card',
          isHistory ? 'reminders-section__record-card--history' : '',
          isPending && dueUrgency === 'overdue'
            ? 'reminders-section__record-card--overdue'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="reminders-section__record-top">
          <h3 className="reminders-section__record-title">{reminder.title}</h3>
          <span
            className={[
              'reminders-section__status-badge',
              `reminders-section__status-badge--${statusModifier(reminder.status)}`,
            ].join(' ')}
          >
            {getReminderStatusLabel(reminder.status)}
          </span>
        </div>

        <div className="reminders-section__meta-row">
          <span className="reminders-section__type-chip">
            {getReminderTypeLabel(reminder.type)}
          </span>
          {sourceLabel ? (
            <span className="reminders-section__source-chip">{sourceLabel}</span>
          ) : null}
        </div>

        <div
          className={[
            'reminders-section__due-hero',
            `reminders-section__due-hero--${dueUrgency}`,
          ].join(' ')}
        >
          <span className="reminders-section__due-hero-label">
            {dueUrgencyLabel}
          </span>
          {reminder.dueAt ? (
            <div className="reminders-section__due-hero-datetime">
              <time
                className="reminders-section__due-date"
                dateTime={reminder.dueAt}
              >
                {formatReminderDate(reminder.dueAt)}
              </time>
              <time
                className="reminders-section__due-time"
                dateTime={reminder.dueAt}
              >
                {formatReminderTime(reminder.dueAt)}
              </time>
            </div>
          ) : (
            <span className="reminders-section__due-none">No due date set</span>
          )}
        </div>

        {message ? (
          messageIsLong ? (
            <details className="reminders-section__record-details">
              <summary>Notes</summary>
              <p>{message}</p>
            </details>
          ) : (
            <p className="reminders-section__record-snippet">
              <span className="reminders-section__record-snippet-label">
                Notes:
              </span>{' '}
              {message}
            </p>
          )
        ) : null}

        {isPending ? (
          <div className="reminders-section__record-actions">
            <button
              type="button"
              className="reminders-section__action reminders-section__action--complete"
              onClick={onComplete}
              disabled={isActionRunning}
            >
              {isCompleting ? 'Completing…' : 'Complete'}
            </button>
            <button
              type="button"
              className="reminders-section__action reminders-section__action--dismiss"
              onClick={onDismiss}
              disabled={isActionRunning}
            >
              {isDismissing ? 'Dismissing…' : 'Dismiss'}
            </button>
            {confirmDelete ? (
              <div className="reminders-section__delete-confirm" role="status">
                <span>Delete?</span>
                <button
                  type="button"
                  className="reminders-section__delete-confirm-yes"
                  onClick={handleDeleteClick}
                  disabled={isActionRunning}
                >
                  {isDeleting ? 'Deleting…' : 'Yes'}
                </button>
                <button
                  type="button"
                  className="reminders-section__delete-confirm-no"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isActionRunning}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="reminders-section__delete"
                onClick={handleDeleteClick}
                disabled={isActionRunning}
              >
                Delete
              </button>
            )}
          </div>
        ) : (
          <div className="reminders-section__record-actions">
            {confirmDelete ? (
              <div className="reminders-section__delete-confirm" role="status">
                <span>Delete this reminder?</span>
                <button
                  type="button"
                  className="reminders-section__delete-confirm-yes"
                  onClick={handleDeleteClick}
                  disabled={isActionRunning}
                >
                  {isDeleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  className="reminders-section__delete-confirm-no"
                  onClick={() => setConfirmDelete(false)}
                  disabled={isActionRunning}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="reminders-section__delete"
                onClick={handleDeleteClick}
                disabled={isActionRunning}
              >
                Delete reminder
              </button>
            )}
          </div>
        )}
      </article>
    </li>
  );
}
