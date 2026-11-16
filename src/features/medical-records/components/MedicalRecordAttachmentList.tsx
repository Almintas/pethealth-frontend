import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { downloadAttachment, formatFileSize } from '../attachments.service';
import type { MedicalRecordAttachment } from '../types';

type MedicalRecordAttachmentListProps = {
  recordId: string;
  attachments: MedicalRecordAttachment[];
};

/** Files a clinic attached to the record (lab results, X-rays…). */
export function MedicalRecordAttachmentList({
  recordId,
  attachments,
}: MedicalRecordAttachmentListProps) {
  const { t, i18n } = useTranslation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  const handleDownload = async (attachment: MedicalRecordAttachment) => {
    setError(null);
    setBusyId(attachment.id);
    try {
      await downloadAttachment(recordId, attachment);
    } catch {
      setError(t('health.attachmentDownloadFailed'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="medical-records-section__attachments">
      <p className="medical-records-section__attachments-title">
        {t('health.attachmentsTitle', { count: attachments.length })}
      </p>
      <ul className="medical-records-section__attachments-list">
        {attachments.map((attachment) => (
          <li key={attachment.id} className="medical-records-section__attachment">
            <button
              type="button"
              className="medical-records-section__attachment-button"
              onClick={() => void handleDownload(attachment)}
              disabled={busyId === attachment.id}
              aria-label={t('health.downloadAttachment', { name: attachment.fileName })}
            >
              <span className="medical-records-section__attachment-name">
                {attachment.fileName}
              </span>
              <span className="medical-records-section__attachment-meta">
                {[
                  formatFileSize(attachment.size, i18n.language),
                  attachment.clinicName,
                  formatPetDate(attachment.createdAt),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="medical-records-section__attachments-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
