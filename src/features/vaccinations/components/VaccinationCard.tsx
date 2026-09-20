import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  onDelete?: () => void;
};

export function VaccinationCard({
  vaccination,
  isLast,
  isDeleting,
  onDelete,
}: VaccinationCardProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dueStatus = getVaccinationDueStatus(vaccination.nextDueAt);
  const statusLabel = getVaccinationDueStatusLabel(dueStatus);
  const notes = vaccination.notes?.trim() ?? '';
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
          <span className="vaccinations-section__due-label">{t('health.nextDue')}</span>
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
            <span className="vaccinations-section__due-none">{t('health.notSet')}</span>
          )}
        </div>

        <p className="vaccinations-section__administered">
          <span className="vaccinations-section__administered-label">
            {t('health.administered')}
          </span>
          <time dateTime={vaccination.administeredAt}>
            {formatPetDate(vaccination.administeredAt)}
          </time>
        </p>

        <dl className="vaccinations-section__record-facts">
          {vaccination.veterinarianName ? (
            <div>
              <dt>{t('appointments.veterinarian')}</dt>
              <dd>{vaccination.veterinarianName}</dd>
            </div>
          ) : null}
          {vaccination.clinicName ? (
            <div>
              <dt>{t('appointments.clinic')}</dt>
              <dd>{vaccination.clinicName}</dd>
            </div>
          ) : null}
          {vaccination.batchNumber ? (
            <div>
              <dt>{t('health.batchNumber')}</dt>
              <dd>{vaccination.batchNumber}</dd>
            </div>
          ) : null}
        </dl>

        {notes ? (
          notesAreLong ? (
            <details className="vaccinations-section__record-details">
              <summary>{t('pets.notes')}</summary>
              <p>{notes}</p>
            </details>
          ) : (
            <p className="vaccinations-section__record-snippet">
              <span className="vaccinations-section__record-snippet-label">
                {t('pets.notes')}:
              </span>{' '}
              {notes}
            </p>
          )
        ) : null}

        {onDelete ? (
        <div className="vaccinations-section__record-actions">
          {confirmDelete ? (
            <div className="vaccinations-section__delete-confirm" role="status">
              <span>{t('health.deleteVaccinationConfirm')}</span>
              <button
                type="button"
                className="vaccinations-section__delete-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? t('common.saving') : `${t('common.yes')}, ${t('common.delete').toLowerCase()}`}
              </button>
              <button
                type="button"
                className="vaccinations-section__delete-confirm-no"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="vaccinations-section__delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {t('health.deleteVaccination')}
            </button>
          )}
        </div>
        ) : null}
      </article>
    </li>
  );
}
