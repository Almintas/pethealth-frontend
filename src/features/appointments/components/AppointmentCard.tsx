import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEnumLabels } from '../../../i18n/useEnumLabels';
import { AppointmentStatus, type Appointment } from '../types';
import {
  formatAppointmentDate,
  formatAppointmentTime,
} from '../utils/format-appointment-datetime';
import { normalizeAppointmentTypeValue } from '../constants/appointment-types';

const LONG_TEXT_THRESHOLD = 140;

type AppointmentCardProps = {
  appointment: Appointment;
  isLast: boolean;
  isHistory: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function statusModifier(status: Appointment['status']): string {
  switch (status) {
    case AppointmentStatus.Scheduled:
      return 'scheduled';
    case AppointmentStatus.Completed:
      return 'completed';
    case AppointmentStatus.Cancelled:
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

export function AppointmentCard({
  appointment,
  isLast,
  isHistory,
  isDeleting,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  const { t } = useTranslation();
  const { appointmentStatus, appointmentType } = useEnumLabels();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reason = appointment.reason?.trim() ?? '';
  const notes = appointment.notes?.trim() ?? '';
  const reasonIsLong = reason.length > LONG_TEXT_THRESHOLD;
  const notesAreLong = notes.length > LONG_TEXT_THRESHOLD;
  const statusKey = statusModifier(appointment.status);
  const typeLabel = appointmentType(normalizeAppointmentTypeValue(appointment.type));

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
        'appointments-section__timeline-item',
        isHistory ? 'appointments-section__timeline-item--history' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="appointments-section__timeline-rail" aria-hidden="true">
        <span
          className={[
            'appointments-section__timeline-dot',
            isHistory ? 'appointments-section__timeline-dot--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {!isLast ? <span className="appointments-section__timeline-line" /> : null}
      </div>

      <article
        className={[
          'appointments-section__record-card',
          isHistory ? 'appointments-section__record-card--history' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="appointments-section__datetime-hero">
          <time
            className="appointments-section__datetime-date"
            dateTime={appointment.scheduledAt}
          >
            {formatAppointmentDate(appointment.scheduledAt)}
          </time>
          <time
            className="appointments-section__datetime-time"
            dateTime={appointment.scheduledAt}
          >
            {formatAppointmentTime(appointment.scheduledAt)}
          </time>
        </div>

        <div className="appointments-section__record-top">
          <h3 className="appointments-section__record-title">{typeLabel}</h3>
          <span
            className={[
              'appointments-section__status-badge',
              `appointments-section__status-badge--${statusKey}`,
            ].join(' ')}
          >
            {appointmentStatus(appointment.status)}
          </span>
        </div>

        <dl className="appointments-section__record-facts">
          {appointment.clinicName ? (
            <div>
              <dt>{t('appointments.clinic')}</dt>
              <dd>{appointment.clinicName}</dd>
            </div>
          ) : null}
          {appointment.veterinarianName ? (
            <div>
              <dt>{t('appointments.veterinarian')}</dt>
              <dd>{appointment.veterinarianName}</dd>
            </div>
          ) : null}
        </dl>

        {reason ? (
          reasonIsLong ? (
            <details className="appointments-section__record-details">
              <summary>{t('appointments.reason')}</summary>
              <p>{reason}</p>
            </details>
          ) : (
            <p className="appointments-section__record-snippet">
              <span className="appointments-section__record-snippet-label">
                {t('appointments.reason')}:
              </span>{' '}
              {reason}
            </p>
          )
        ) : null}

        {notes ? (
          notesAreLong ? (
            <details className="appointments-section__record-details">
              <summary>{t('appointments.notes')}</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="appointments-section__record-snippet">
              <span className="appointments-section__record-snippet-label">
                {t('appointments.notes')}:
              </span>{' '}
              {notes}
            </p>
          )
        ) : null}

        <div className="appointments-section__record-actions">
          <button
            type="button"
            className="appointments-section__edit ph-btn ph-btn--secondary"
            onClick={onEdit}
            disabled={isDeleting}
          >
            {t('common.edit')}
          </button>
          {confirmDelete ? (
            <div className="appointments-section__delete-confirm" role="status">
              <span>{t('appointments.deleteConfirm')}</span>
              <button
                type="button"
                className="appointments-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? t('common.saving') : `${t('common.yes')}, ${t('common.delete').toLowerCase()}`}
              </button>
              <button
                type="button"
                className="appointments-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="appointments-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {t('common.delete')}
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
