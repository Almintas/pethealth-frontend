import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
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
    records.length === 1 ? '1 record' : `${records.length} records`;

  return (
    <section
      className="medical-records-section"
      aria-labelledby="medical-records-title"
    >
      <header className="medical-records-section__header">
        <div className="medical-records-section__heading">
          <h2 id="medical-records-title">Medical Records</h2>
          {!loading && !error ? (
            <p className="medical-records-section__count" aria-live="polite">
              {recordCountLabel}
            </p>
          ) : null}
        </div>

        {!loading && !error ? (
          <button
            type="button"
            className="medical-records-section__add-button"
            onClick={openDialog}
          >
            + Add record
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message="Loading medical records…" skeleton />
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
        <div className="medical-records-section__empty">
          <h3 className="medical-records-section__empty-title">
            No medical records yet
          </h3>
          <p className="medical-records-section__empty-text">
            Track visits, diagnoses, and treatment notes in one place so you and
            your vet have a clear health history for this pet.
          </p>
          <button
            type="button"
            className="medical-records-section__empty-action"
            onClick={openDialog}
          >
            Add medical record
          </button>
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
              onDelete={() => void handleDeleteRecord(record.id)}
            />
          ))}
        </ol>
      ) : null}

      <MedicalRecordDialog
        isOpen={isDialogOpen}
        title="Add medical record"
        onClose={() => setIsDialogOpen(false)}
      >
        <MedicalRecordForm
          petId={petId}
          onSubmit={handleCreateRecord}
          onCancel={() => setIsDialogOpen(false)}
          variant="dialog"
        />
      </MedicalRecordDialog>
    </section>
  );
}
