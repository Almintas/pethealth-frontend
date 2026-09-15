import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import { VACCINATIONS_QUERY } from '../graphql';
import type {
  CreateVaccinationInput,
  VaccinationsQueryResult,
  VaccinationsQueryVariables,
} from '../types';
import * as vaccinationsService from '../vaccinations.service';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorAlert } from '../../../components/ErrorAlert';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { VaccinationForm } from './VaccinationForm';
import './vaccinations-section.css';

type VaccinationsSectionProps = {
  petId: string;
};

export function VaccinationsSection({ petId }: VaccinationsSectionProps) {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<
    VaccinationsQueryResult,
    VaccinationsQueryVariables
  >(VACCINATIONS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const vaccinations = data?.vaccinations ?? [];

  const handleCreateVaccination = async (input: CreateVaccinationInput) => {
    await vaccinationsService.createVaccination(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  return (
    <section
      id="vaccinations"
      className="vaccinations-section"
      aria-labelledby="vaccinations-title"
    >
      <div className="vaccinations-section__header">
        <div>
          <h2 id="vaccinations-title">Vaccinations</h2>
          <p className="vaccinations-section__description">
            Immunization history and booster schedules.
            {!loading && !error ? ` (${vaccinations.length})` : ''}
          </p>
        </div>
        {!loading && !error ? (
          <button
            type="button"
            className="vaccinations-section__add-button"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="vaccination-form-panel"
          >
            {isFormOpen ? 'Close form' : 'Add Vaccination'}
          </button>
        ) : null}
      </div>

      {isFormOpen && !loading && !error ? (
        <div
          id="vaccination-form-panel"
          className="vaccinations-section__form-panel"
        >
          <VaccinationForm
            petId={petId}
            onSubmit={handleCreateVaccination}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? <LoadingSkeleton lines={3} label="Loading vaccinations" /> : null}

      {error ? <ErrorAlert message={getAuthErrorMessage(error)} /> : null}

      {!loading && !error && vaccinations.length === 0 ? (
        <EmptyState
          title="No vaccinations yet"
          description="Record vaccines and upcoming boosters for this pet."
        />
      ) : null}

      {!loading && !error && vaccinations.length > 0 ? (
        <ul className="vaccinations-section__list">
          {vaccinations.map((vaccination) => (
            <li key={vaccination.id} className="vaccinations-section__card">
              <h3 className="vaccinations-section__card-title">
                {vaccination.vaccineName}
              </h3>
              <dl className="vaccinations-section__meta">
                <div>
                  <dt>Administered</dt>
                  <dd>{formatPetDate(vaccination.administeredAt)}</dd>
                </div>
                {vaccination.nextDueAt ? (
                  <div>
                    <dt>Next due</dt>
                    <dd>{formatPetDate(vaccination.nextDueAt)}</dd>
                  </div>
                ) : null}
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
                {vaccination.notes ? (
                  <div>
                    <dt>Notes</dt>
                    <dd>{vaccination.notes}</dd>
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
