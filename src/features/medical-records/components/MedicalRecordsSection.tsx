import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isVeterinaryHealthDataReadOnly } from '../../../config/owner-portal';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { MEDICAL_RECORDS_QUERY } from '../graphql';
import * as medicalRecordsService from '../medical-records.service';
import type {
  CreateMedicalRecordInput,
  MedicalRecord,
  MedicalRecordsQueryResult,
  MedicalRecordsQueryVariables,
} from '../types';
import { MedicalRecordCard } from './MedicalRecordCard';
import { MedicalRecordDialog } from './MedicalRecordDialog';
import { MedicalRecordForm } from './MedicalRecordForm';
import './medical-records-section.css';

type MedicalRecordsSectionProps = {
  petId: string;
};

function sortRecordsByDate(records: MedicalRecord[]): MedicalRecord[] {
  return [...records].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export function MedicalRecordsSection({ petId }: MedicalRecordsSectionProps) {
  const { t } = useTranslation();
  const readOnly = isVeterinaryHealthDataReadOnly;
  const emptyTitle = readOnly
    ? t('health.clinicMedicalEmptyTitle')
    : t('health.emptyMedical');
  const emptyText = readOnly
    ? t('health.clinicMedicalEmptyText')
    : t('health.medicalRecordsDesc');
  const client = useApolloClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    MedicalRecordsQueryResult,
    MedicalRecordsQueryVariables
  >(MEDICAL_RECORDS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const records = useMemo(
    () => sortRecordsByDate(data?.medicalRecords ?? []),
    [data?.medicalRecords],
  );

  const openDialog = () => {
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleCreateRecord = async (input: CreateMedicalRecordInput) => {
    await medicalRecordsService.createMedicalRecord(client, input);
    await refetch();
    setIsDialogOpen(false);
  };

  const handleDeleteRecord = async (recordId: string) => {
    setActionError(null);
    setDeletingRecordId(recordId);
    try {
      await medicalRecordsService.deleteMedicalRecord(client, recordId);
      await refetch();
    } catch (deleteError) {
      setActionError(getUserFacingErrorMessage(deleteError, 'save-medical-record'));
    } finally {
      setDeletingRecordId(null);
    }
  };

  const recordCountLabel =
    records.length === 1
      ? t('health.recordCountOne')
      : t('health.recordCountMany', { count: records.length });

  return (
    <section
      className="medical-records-section"
      aria-labelledby="medical-records-title"
    >
      <header className="medical-records-section__header">
        <div className="medical-records-section__heading">
          <h2 id="medical-records-title">{t('health.medicalRecords')}</h2>
          {!loading && !error ? (
            <p className="medical-records-section__count" aria-live="polite">
              {recordCountLabel}
              {readOnly ? (
                <span className="medical-records-section__hint">
                  {' '}
                  · {t('health.clinicMedicalRecordsHint')}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        {!loading && !error && !readOnly ? (
          <button
            type="button"
            className="medical-records-section__add-button"
            onClick={openDialog}
          >
            + {t('health.addMedicalRecord')}
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message={t('common.loading')} skeleton />
      ) : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'load-medical-records')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {actionError ? (
        <ErrorAlert message={actionError} compact />
      ) : null}

      {!loading && !error && records.length === 0 ? (
        <div
          className={[
            'medical-records-section__empty',
            readOnly ? 'ph-clinic-empty' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {readOnly ? (
            <span className="ph-clinic-badge">{t('health.managedByClinic')}</span>
          ) : null}
          <h3 className="medical-records-section__empty-title">
            {emptyTitle}
          </h3>
          <p className="medical-records-section__empty-text">
            {emptyText}
          </p>
          {!readOnly ? (
            <button
              type="button"
              className="medical-records-section__empty-action"
              onClick={openDialog}
            >
              {t('health.addMedicalRecord')}
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && records.length > 0 ? (
        <ol className="medical-records-section__timeline">
          {records.map((record, index) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              isLast={index === records.length - 1}
              isDeleting={deletingRecordId === record.id}
              onDelete={
                readOnly
                  ? undefined
                  : () => void handleDeleteRecord(record.id)
              }
            />
          ))}
        </ol>
      ) : null}

      {!readOnly ? (
        <MedicalRecordDialog
          isOpen={isDialogOpen}
          title={t('health.addMedicalRecord')}
          onClose={() => setIsDialogOpen(false)}
        >
          <MedicalRecordForm
            petId={petId}
            onSubmit={handleCreateRecord}
            onCancel={() => setIsDialogOpen(false)}
            variant="dialog"
          />
        </MedicalRecordDialog>
      ) : null}
    </section>
  );
}
