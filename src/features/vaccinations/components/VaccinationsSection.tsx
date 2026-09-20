import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isVeterinaryHealthDataReadOnly } from '../../../config/owner-portal';
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
  const { t } = useTranslation();
  const readOnly = isVeterinaryHealthDataReadOnly;
  const emptyTitle = readOnly
    ? t('health.clinicVaccinationsEmptyTitle')
    : t('health.emptyVaccinations');
  const emptyText = readOnly
    ? t('health.clinicVaccinationsEmptyText')
    : t('health.vaccinationsDesc');
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
      ? t('health.vaccinationCountOne')
      : t('health.vaccinationCountMany', { count: vaccinations.length });

  return (
    <section
      className="vaccinations-section"
      aria-labelledby="vaccinations-title"
    >
      <header className="vaccinations-section__header">
        <div className="vaccinations-section__heading">
          <h2 id="vaccinations-title">{t('health.vaccinations')}</h2>
          {!loading && !error ? (
            <p className="vaccinations-section__count" aria-live="polite">
              {countLabel}
              {readOnly ? (
                <span className="vaccinations-section__hint">
                  {' '}
                  · {t('health.clinicVaccinationsHint')}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        {!loading && !error && !readOnly ? (
          <button
            type="button"
            className="vaccinations-section__add-button"
            onClick={openDialog}
          >
            + {t('health.addVaccination')}
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message={t('common.loading')} skeleton />
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
        <div
          className={[
            'vaccinations-section__empty',
            readOnly ? 'ph-clinic-empty' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {readOnly ? (
            <span className="ph-clinic-badge">{t('health.managedByClinic')}</span>
          ) : null}
          <h3 className="vaccinations-section__empty-title">
            {emptyTitle}
          </h3>
          <p className="vaccinations-section__empty-text">
            {emptyText}
          </p>
          {!readOnly ? (
            <button
              type="button"
              className="vaccinations-section__empty-action"
              onClick={openDialog}
            >
              {t('health.addVaccination')}
            </button>
          ) : null}
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
              onDelete={
                readOnly
                  ? undefined
                  : () => void handleDeleteVaccination(vaccination.id)
              }
            />
          ))}
        </ol>
      ) : null}

      {!readOnly ? (
        <VaccinationDialog
          isOpen={isDialogOpen}
          title={t('health.addVaccination')}
          onClose={() => setIsDialogOpen(false)}
        >
          <VaccinationForm
            petId={petId}
            onSubmit={handleCreateVaccination}
            onCancel={() => setIsDialogOpen(false)}
            variant="dialog"
          />
        </VaccinationDialog>
      ) : null}
    </section>
  );
}
