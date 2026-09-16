import { useState } from 'react';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import type { Vaccination } from '../types';
import {
  getVaccinationDueStatus,
  getVaccinationDueStatusLabel,
} from '../utils/get-vaccination-due-status';

const LONG_NOTES_THRESHOLD = 140;

type VaccinationCardProps = {
  vaccination: Vaccination;
  isLast: boolean;
  isDeleting: boolean;
  onDelete: () => void;
};

export function VaccinationCard({
  vaccination,
  isLast,
  isDeleting,
  onDelete,
}: VaccinationCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dueStatus = getVaccinationDueStatus(vaccination.nextDueAt);
  const statusLabel = getVaccinationDueStatusLabel(dueStatus);
  const notes = vaccination.notes?.trim() ?? '';
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
    <li className="vaccinations-section__timeline-item">
      <div className="vaccinations-section__timeline-rail" aria-hidden="true">
        <span className="vaccinations-section__timeline-dot" />
        {!isLast ? <span className="vaccinations-section__timeline-line" /> : null}
      </div>

      <article className="vaccinations-section__record-card">
        <div className="vaccinations-section__record-top">
          <h3 className="vaccinations-section__record-title">
            {vaccination.vaccineName}
          </h3>
          <span
            className={[
              'vaccinations-section__status-badge',
              `vaccinations-section__status-badge--${dueStatus}`,
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>

        <div className="vaccinations-section__due-row">
          <span className="vaccinations-section__due-label">Next due</span>
          {vaccination.nextDueAt ? (
            <time
              className={[
                'vaccinations-section__due-date',
                dueStatus === 'overdue'
                  ? 'vaccinations-section__due-date--overdue'
                  : '',
                dueStatus === 'valid'
                  ? 'vaccinations-section__due-date--valid'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              dateTime={vaccination.nextDueAt}
            >
              {formatPetDate(vaccination.nextDueAt)}
            </time>
          ) : (
            <span className="vaccinations-section__due-none">Not set</span>
          )}
        </div>

        <p className="vaccinations-section__administered">
          <span className="vaccinations-section__administered-label">
            Administered
          </span>
          <time dateTime={vaccination.administeredAt}>
            {formatPetDate(vaccination.administeredAt)}
          </time>
        </p>

        <dl className="vaccinations-section__record-facts">
          {vaccination.veterinarianName ? (
            <div>
              <dt>Veterinarian</dt>
              <dd>{vaccination.veterinarianName}</dd>
            </div>
          ) : null}
          {vaccination.clinicName ? (
            <div>
              <dt>Clinic</dt>
              <dd>{vaccination.clinicName}</dd>
            </div>
          ) : null}
          {vaccination.batchNumber ? (
            <div>
              <dt>Batch number</dt>
              <dd>{vaccination.batchNumber}</dd>
            </div>
          ) : null}
        </dl>

        {notes ? (
          notesAreLong ? (
            <details className="vaccinations-section__record-details">
              <summary>Notes</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="vaccinations-section__record-snippet">
              <span className="vaccinations-section__record-snippet-label">
                Notes:
              </span>{' '}
              {notes}
            </p>
          )
        ) : null}

        <div className="vaccinations-section__record-actions">
          {confirmDelete ? (
            <div className="vaccinations-section__delete-confirm" role="status">
              <span>Delete this vaccination?</span>
              <button
                type="button"
                className="vaccinations-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                className="vaccinations-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="vaccinations-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Delete vaccination
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
