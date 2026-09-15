import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { MEDICAL_RECORDS_QUERY } from '../graphql';
import * as medicalRecordsService from '../medical-records.service';
import type {
  CreateMedicalRecordInput,
  MedicalRecordsQueryResult,
  MedicalRecordsQueryVariables,
} from '../types';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorAlert } from '../../../components/ErrorAlert';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { MedicalRecordForm } from './MedicalRecordForm';
import './medical-records-section.css';

type MedicalRecordsSectionProps = {
  petId: string;
};

export function MedicalRecordsSection({ petId }: MedicalRecordsSectionProps) {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    MedicalRecordsQueryResult,
    MedicalRecordsQueryVariables
  >(MEDICAL_RECORDS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const records = data?.medicalRecords ?? [];

  const handleCreateRecord = async (input: CreateMedicalRecordInput) => {
    await medicalRecordsService.createMedicalRecord(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  return (
    <section
      id="medical-records"
      className="medical-records-section"
      aria-labelledby="medical-records-title"
    >
      <div className="medical-records-section__header">
        <div>
          <h2 id="medical-records-title">Medical Records</h2>
          <p className="medical-records-section__description">
            Visit notes, diagnoses, and clinical history.
            {!loading && !error ? ` (${records.length})` : ''}
          </p>
        </div>
        {!loading && !error ? (
          <button
            type="button"
            className="medical-records-section__add-button"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="medical-record-form-panel"
          >
            {isFormOpen ? 'Close form' : 'Add Medical Record'}
          </button>
        ) : null}
      </div>

      {isFormOpen && !loading && !error ? (
        <div
          id="medical-record-form-panel"
          className="medical-records-section__form-panel"
        >
          <MedicalRecordForm
            petId={petId}
            onSubmit={handleCreateRecord}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? (
        <LoadingSkeleton lines={3} label="Loading medical records" />
      ) : null}

      {error ? <ErrorAlert message={getAuthErrorMessage(error)} /> : null}

      {!loading && !error && records.length === 0 ? (
        <EmptyState
          title="No medical records yet"
          description="Add records after vet visits or procedures."
        />
      ) : null}

      {!loading && !error && records.length > 0 ? (
        <ul className="medical-records-section__list">
          {records.map((record) => (
            <li key={record.id} className="medical-records-section__card">
              <div className="medical-records-section__card-header">
                <h3 className="medical-records-section__card-title">
                  {record.title}
                </h3>
                <span className="medical-records-section__card-date">
                  {formatPetDate(record.date)}
                </span>
              </div>
              <p className="medical-records-section__card-type">{record.type}</p>
              {record.description ? (
                <p className="medical-records-section__card-text">
                  {record.description}
                </p>
              ) : null}
              {!record.description && record.notes ? (
                <p className="medical-records-section__card-text">
                  {record.notes}
                </p>
              ) : null}
              {record.description && record.notes ? (
                <p className="medical-records-section__card-text">
                  <strong>Notes:</strong> {record.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
