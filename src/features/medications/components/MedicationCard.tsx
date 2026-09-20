import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import type { Medication } from '../types';
import {
  getMedicationTreatmentStatus,
  getMedicationTreatmentStatusLabel,
  isMedicationHistoryStatus,
} from '../utils/get-medication-treatment-status';

const LONG_NOTES_THRESHOLD = 140;

type MedicationCardProps = {
  medication: Medication;
  isLast: boolean;
  isDeleting: boolean;
  onDelete?: () => void;
};

function formatDosageSummary(medication: Medication): string {
  return `${medication.dosage} ${medication.dosageUnit} · ${medication.frequency}`;
}

export function MedicationCard({
  medication,
  isLast,
  isDeleting,
  onDelete,
}: MedicationCardProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const treatmentStatus = getMedicationTreatmentStatus(medication);
  const statusLabel = getMedicationTreatmentStatusLabel(treatmentStatus);
  const isHistory = isMedicationHistoryStatus(treatmentStatus);
  const notes = medication.notes?.trim() ?? '';
  const notesAreLong = notes.length > LONG_NOTES_THRESHOLD;

  const handleDeleteClick = () => {
    if (!onDelete) {
      return;
    }
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
        'medications-section__timeline-item',
        isHistory ? 'medications-section__timeline-item--history' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="medications-section__timeline-rail" aria-hidden="true">
        <span
          className={[
            'medications-section__timeline-dot',
            isHistory ? 'medications-section__timeline-dot--muted' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {!isLast ? <span className="medications-section__timeline-line" /> : null}
      </div>

      <article
        className={[
          'medications-section__record-card',
          isHistory ? 'medications-section__record-card--history' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="medications-section__record-top">
          <h3 className="medications-section__record-title">{medication.name}</h3>
          <span
            className={[
              'medications-section__status-badge',
              `medications-section__status-badge--${treatmentStatus}`,
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>

        <p className="medications-section__treatment-summary">
          {formatDosageSummary(medication)}
        </p>

        <div className="medications-section__date-row">
          <div className="medications-section__date-block">
            <span className="medications-section__date-label">{t('health.started')}</span>
            <time dateTime={medication.startDate}>
              {formatPetDate(medication.startDate)}
            </time>
          </div>
          <div className="medications-section__date-block">
            <span className="medications-section__date-label">{t('health.ends')}</span>
            {medication.endDate ? (
              <time dateTime={medication.endDate}>
                {formatPetDate(medication.endDate)}
              </time>
            ) : (
              <span className="medications-section__ongoing-label">
                {t('health.ongoingLabel')}
              </span>
            )}
          </div>
        </div>

        <dl className="medications-section__record-facts">
          {medication.veterinarianName ? (
            <div>
              <dt>{t('appointments.veterinarian')}</dt>
              <dd>{medication.veterinarianName}</dd>
            </div>
          ) : null}
          {medication.clinicName ? (
            <div>
              <dt>{t('appointments.clinic')}</dt>
              <dd>{medication.clinicName}</dd>
            </div>
          ) : null}
        </dl>

        {notes ? (
          notesAreLong ? (
            <details className="medications-section__record-details">
              <summary>{t('pets.notes')}</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="medications-section__record-snippet">
              <span className="medications-section__record-snippet-label">
                {t('pets.notes')}:
              </span>{' '}
              {notes}
            </p>
          )
        ) : null}

        {onDelete ? (
        <div className="medications-section__record-actions">
          {confirmDelete ? (
            <div className="medications-section__delete-confirm" role="status">
              <span>{t('health.deleteMedicationConfirm')}</span>
              <button
                type="button"
                className="medications-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? t('common.saving') : `${t('common.yes')}, ${t('common.delete').toLowerCase()}`}
              </button>
              <button
                type="button"
                className="medications-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="medications-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {t('health.deleteMedication')}
            </button>
          )}
        </div>
        ) : null}
      </article>
    </li>
  );
}
