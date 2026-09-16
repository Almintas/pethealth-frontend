import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { VACCINATIONS_QUERY } from '../graphql';
import type {
  CreateVaccinationInput,
  Vaccination,
  VaccinationsQueryResult,
  VaccinationsQueryVariables,
} from '../types';
import * as vaccinationsService from '../vaccinations.service';
import { VaccinationCard } from './VaccinationCard';
import { VaccinationDialog } from './VaccinationDialog';
import { VaccinationForm } from './VaccinationForm';
import './vaccinations-section.css';

type VaccinationsSectionProps = {
  petId: string;
};

function sortVaccinationsByAdministered(
  vaccinations: Vaccination[],
): Vaccination[] {
  return [...vaccinations].sort(
    (left, right) =>
      new Date(right.administeredAt).getTime() -
      new Date(left.administeredAt).getTime(),
  );
}

export function VaccinationsSection({ petId }: VaccinationsSectionProps) {
  const client = useApolloClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingVaccinationId, setDeletingVaccinationId] = useState<
    string | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    VaccinationsQueryResult,
    VaccinationsQueryVariables
  >(VACCINATIONS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const vaccinations = useMemo(
    () => sortVaccinationsByAdministered(data?.vaccinations ?? []),
    [data?.vaccinations],
  );

  const openDialog = () => {
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleCreateVaccination = async (input: CreateVaccinationInput) => {
    await vaccinationsService.createVaccination(client, input);
    await refetch();
    setIsDialogOpen(false);
  };

  const handleDeleteVaccination = async (vaccinationId: string) => {
    setActionError(null);
    setDeletingVaccinationId(vaccinationId);
    try {
      await vaccinationsService.deleteVaccination(client, vaccinationId);
      await refetch();
    } catch (deleteError) {
      setActionError(getUserFacingErrorMessage(deleteError, 'save-vaccination'));
    } finally {
      setDeletingVaccinationId(null);
    }
  };

  const countLabel =
    vaccinations.length === 1
      ? '1 vaccination'
      : `${vaccinations.length} vaccinations`;

  return (
    <section
      className="vaccinations-section"
      aria-labelledby="vaccinations-title"
    >
      <header className="vaccinations-section__header">
        <div className="vaccinations-section__heading">
          <h2 id="vaccinations-title">Vaccinations</h2>
          {!loading && !error ? (
            <p className="vaccinations-section__count" aria-live="polite">
              {countLabel}
            </p>
          ) : null}
        </div>

        {!loading && !error ? (
          <button
            type="button"
            className="vaccinations-section__add-button"
            onClick={openDialog}
          >
            + Add vaccination
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message="Loading vaccinations…" skeleton />
      ) : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'load-vaccinations')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {actionError ? (
        <ErrorAlert message={actionError} compact />
      ) : null}

      {!loading && !error && vaccinations.length === 0 ? (
        <div className="vaccinations-section__empty">
          <h3 className="vaccinations-section__empty-title">
            No vaccinations yet
          </h3>
          <p className="vaccinations-section__empty-text">
            Keep shot history and upcoming due dates in one place so boosters
            stay on schedule and you have records handy for travel or boarding.
          </p>
          <button
            type="button"
            className="vaccinations-section__empty-action"
            onClick={openDialog}
          >
            Add vaccination
          </button>
        </div>
      ) : null}

      {!loading && !error && vaccinations.length > 0 ? (
        <ol className="vaccinations-section__timeline">
          {vaccinations.map((vaccination, index) => (
            <VaccinationCard
              key={vaccination.id}
              vaccination={vaccination}
              isLast={index === vaccinations.length - 1}
              isDeleting={deletingVaccinationId === vaccination.id}
              onDelete={() => void handleDeleteVaccination(vaccination.id)}
            />
          ))}
        </ol>
      ) : null}

      <VaccinationDialog
        isOpen={isDialogOpen}
        title="Add vaccination"
        onClose={() => setIsDialogOpen(false)}
      >
        <VaccinationForm
          petId={petId}
          onSubmit={handleCreateVaccination}
          onCancel={() => setIsDialogOpen(false)}
          variant="dialog"
        />
      </VaccinationDialog>
    </section>
  );
}
