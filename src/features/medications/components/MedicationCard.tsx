import { useState } from 'react';
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
  onDelete: () => void;
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const treatmentStatus = getMedicationTreatmentStatus(medication);
  const statusLabel = getMedicationTreatmentStatusLabel(treatmentStatus);
  const isHistory = isMedicationHistoryStatus(treatmentStatus);
  const notes = medication.notes?.trim() ?? '';
  const notesAreLong = notes.length > LONG_NOTES_THRESHOLD;

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
            <span className="medications-section__date-label">Started</span>
            <time dateTime={medication.startDate}>
              {formatPetDate(medication.startDate)}
            </time>
          </div>
          <div className="medications-section__date-block">
            <span className="medications-section__date-label">Ends</span>
            {medication.endDate ? (
              <time dateTime={medication.endDate}>
                {formatPetDate(medication.endDate)}
              </time>
            ) : (
              <span className="medications-section__ongoing-label">Ongoing</span>
            )}
          </div>
        </div>

        <dl className="medications-section__record-facts">
          {medication.veterinarianName ? (
            <div>
              <dt>Veterinarian</dt>
              <dd>{medication.veterinarianName}</dd>
            </div>
          ) : null}
          {medication.clinicName ? (
            <div>
              <dt>Clinic</dt>
              <dd>{medication.clinicName}</dd>
            </div>
          ) : null}
        </dl>

        {notes ? (
          notesAreLong ? (
            <details className="medications-section__record-details">
              <summary>Notes</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="medications-section__record-snippet">
              <span className="medications-section__record-snippet-label">
                Notes:
              </span>{' '}
              {notes}
            </p>
          )
        ) : null}

        <div className="medications-section__record-actions">
          {confirmDelete ? (
            <div className="medications-section__delete-confirm" role="status">
              <span>Delete this medication?</span>
              <button
                type="button"
                className="medications-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                className="medications-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="medications-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Delete medication
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
