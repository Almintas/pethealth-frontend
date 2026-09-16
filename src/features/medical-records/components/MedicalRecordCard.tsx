import { useState } from 'react';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import type { MedicalRecord } from '../types';

const LONG_TEXT_THRESHOLD = 140;

type MedicalRecordCardProps = {
  record: MedicalRecord;
  isLast: boolean;
  isDeleting: boolean;
  onDelete: () => void;
};

export function MedicalRecordCard({
  record,
  isLast,
  isDeleting,
  onDelete,
}: MedicalRecordCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const description = record.description?.trim() ?? '';
  const notes = record.notes?.trim() ?? '';
  const descriptionIsLong = description.length > LONG_TEXT_THRESHOLD;
  const notesIsLong = notes.length > LONG_TEXT_THRESHOLD;

  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete();
    setConfirmDelete(false);
  };

  return (
    <li className="medical-records-section__timeline-item">
      <div className="medical-records-section__timeline-rail" aria-hidden="true">
        <span className="medical-records-section__timeline-dot" />
        {!isLast ? <span className="medical-records-section__timeline-line" /> : null}
      </div>

      <article className="medical-records-section__record-card">
        <div className="medical-records-section__record-meta">
          <time
            className="medical-records-section__record-date"
            dateTime={record.date}
          >
            {formatPetDate(record.date)}
          </time>
          <span className="medical-records-section__record-type">{record.type}</span>
        </div>

        <h3 className="medical-records-section__record-title">{record.title}</h3>

        <dl className="medical-records-section__record-facts">
          {record.diagnosis ? (
            <div>
              <dt>Diagnosis</dt>
              <dd>{record.diagnosis}</dd>
            </div>
          ) : null}
          {record.veterinarianName ? (
            <div>
              <dt>Veterinarian</dt>
              <dd>{record.veterinarianName}</dd>
            </div>
          ) : null}
          {record.clinicName ? (
            <div>
              <dt>Clinic</dt>
              <dd>{record.clinicName}</dd>
            </div>
          ) : null}
        </dl>

        {description ? (
          descriptionIsLong ? (
            <details className="medical-records-section__record-details">
              <summary>Description</summary>
              <p>{description}</p>
            </details>
          ) : (
            <p className="medical-records-section__record-snippet">{description}</p>
          )
        ) : null}

        {notes ? (
          notesIsLong ? (
            <details className="medical-records-section__record-details">
              <summary>Notes</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="medical-records-section__record-snippet">
              <span className="medical-records-section__record-snippet-label">Notes:</span>{' '}
              {notes}
            </p>
          )
        ) : null}

        <div className="medical-records-section__record-actions">
          {confirmDelete ? (
            <div className="medical-records-section__delete-confirm" role="status">
              <span>Delete this record?</span>
              <button
                type="button"
                className="medical-records-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                type="button"
                className="medical-records-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="medical-records-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Delete record
            </button>
          )}
        </div>
      </article>
    </li>
  );
}
