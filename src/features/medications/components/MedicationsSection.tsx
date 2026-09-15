import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { MEDICATIONS_QUERY } from '../graphql';
import * as medicationsService from '../medications.service';
import type {
  CreateMedicationInput,
  MedicationsQueryResult,
  MedicationsQueryVariables,
} from '../types';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorAlert } from '../../../components/ErrorAlert';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import {
  StatusBadge,
  medicationStatusTone,
} from '../../../components/StatusBadge';
import { MedicationForm } from './MedicationForm';
import './medications-section.css';

type MedicationsSectionProps = {
  petId: string;
};

export function MedicationsSection({ petId }: MedicationsSectionProps) {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    MedicationsQueryResult,
    MedicationsQueryVariables
  >(MEDICATIONS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const medications = data?.medications ?? [];

  const handleCreateMedication = async (input: CreateMedicationInput) => {
    await medicationsService.createMedication(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  return (
    <section
      id="medications"
      className="medications-section"
      aria-labelledby="medications-title"
    >
      <div className="medications-section__header">
        <div>
          <h2 id="medications-title">Medications</h2>
          <p className="medications-section__description">
            Prescriptions and treatment plans for this pet.
            {!loading && !error ? ` (${medications.length})` : ''}
          </p>
        </div>
        {!loading && !error ? (
          <button
            type="button"
            className="medications-section__add-button"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="medication-form-panel"
          >
            {isFormOpen ? 'Close form' : 'Add Medication'}
          </button>
        ) : null}
      </div>

      {isFormOpen && !loading && !error ? (
        <div
          id="medication-form-panel"
          className="medications-section__form-panel"
        >
          <MedicationForm
            petId={petId}
            onSubmit={handleCreateMedication}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? <LoadingSkeleton lines={3} label="Loading medications" /> : null}

      {error ? <ErrorAlert message={getAuthErrorMessage(error)} /> : null}

      {!loading && !error && medications.length === 0 ? (
        <EmptyState
          title="No medications yet"
          description="Track active prescriptions and dosage details here."
        />
      ) : null}

      {!loading && !error && medications.length > 0 ? (
        <ul className="medications-section__list">
          {medications.map((medication) => (
            <li key={medication.id} className="medications-section__card">
              <div className="medications-section__card-header">
                <h3 className="medications-section__card-title">
                  {medication.name}
                </h3>
                <StatusBadge
                  label={medication.isActive ? 'ACTIVE' : 'INACTIVE'}
                  tone={medicationStatusTone(medication.isActive)}
                />
              </div>
              <dl className="medications-section__meta">
                <div>
                  <dt>Dosage</dt>
                  <dd>
                    {medication.dosage} {medication.dosageUnit}
                  </dd>
                </div>
                <div>
                  <dt>Frequency</dt>
                  <dd>{medication.frequency}</dd>
                </div>
                <div>
                  <dt>Start date</dt>
                  <dd>{formatPetDate(medication.startDate)}</dd>
                </div>
                {medication.endDate ? (
                  <div>
                    <dt>End date</dt>
                    <dd>{formatPetDate(medication.endDate)}</dd>
                  </div>
                ) : null}
              </dl>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
