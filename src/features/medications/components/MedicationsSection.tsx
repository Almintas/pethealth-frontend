import { useApolloClient, useQuery } from '@apollo/client/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isVeterinaryHealthDataReadOnly } from '../../../config/owner-portal';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { MEDICATIONS_QUERY } from '../graphql';
import * as medicationsService from '../medications.service';
import type {
  CreateMedicationInput,
  Medication,
  MedicationsQueryResult,
  MedicationsQueryVariables,
} from '../types';
import {
  getMedicationTreatmentStatus,
  isMedicationHistoryStatus,
} from '../utils/get-medication-treatment-status';
import { MedicationCard } from './MedicationCard';
import { MedicationDialog } from './MedicationDialog';
import { MedicationForm } from './MedicationForm';
import './medications-section.css';

type MedicationsSectionProps = {
  petId: string;
};

function sortMedications(medications: Medication[]): Medication[] {
  const sortPriority = (medication: Medication): number => {
    const status = getMedicationTreatmentStatus(medication);
    if (status === 'ongoing' || status === 'active') {
      return 0;
    }
    if (status === 'completed') {
      return 1;
    }
    return 2;
  };

  return [...medications].sort((left, right) => {
    const priorityDelta = sortPriority(left) - sortPriority(right);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    return (
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime()
    );
  });
}

export function MedicationsSection({ petId }: MedicationsSectionProps) {
  const { t } = useTranslation();
  const readOnly = isVeterinaryHealthDataReadOnly;
  const emptyTitle = readOnly
    ? t('health.clinicMedicationsEmptyTitle')
    : t('health.emptyMedications');
  const emptyText = readOnly
    ? t('health.clinicMedicationsEmptyText')
    : t('health.medicationsDesc');
  const client = useApolloClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingMedicationId, setDeletingMedicationId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    MedicationsQueryResult,
    MedicationsQueryVariables
  >(MEDICATIONS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });

  const medications = useMemo(
    () => sortMedications(data?.medications ?? []),
    [data?.medications],
  );

  const activeCount = useMemo(
    () =>
      medications.filter(
        (medication) => !isMedicationHistoryStatus(
          getMedicationTreatmentStatus(medication),
        ),
      ).length,
    [medications],
  );

  const openDialog = () => {
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleCreateMedication = async (input: CreateMedicationInput) => {
    await medicationsService.createMedication(client, input);
    await refetch();
    setIsDialogOpen(false);
  };

  const handleDeleteMedication = async (medicationId: string) => {
    setActionError(null);
    setDeletingMedicationId(medicationId);
    try {
      await medicationsService.deleteMedication(client, medicationId);
      await refetch();
    } catch (deleteError) {
      setActionError(getUserFacingErrorMessage(deleteError, 'save-medication'));
    } finally {
      setDeletingMedicationId(null);
    }
  };

  const countLabel =
    medications.length === 1
      ? t('health.medicationCountOne')
      : t('health.medicationCountMany', { count: medications.length });

  const activeCountLabel =
    activeCount === 0
      ? null
      : activeCount === 1
        ? t('health.activeMedicationCountOne')
        : t('health.activeMedicationCountMany', { count: activeCount });

  return (
    <section
      className="medications-section"
      aria-labelledby="medications-title"
    >
      <header className="medications-section__header">
        <div className="medications-section__heading">
          <h2 id="medications-title">{t('health.medications')}</h2>
          {!loading && !error ? (
            <p className="medications-section__count" aria-live="polite">
              {countLabel}
              {activeCountLabel ? (
                <span className="medications-section__count-active">
                  {' '}
                  · {activeCountLabel}
                </span>
              ) : null}
              {readOnly ? (
                <span className="medications-section__hint">
                  {' '}
                  · {t('health.clinicMedicationsHint')}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>

        {!loading && !error && !readOnly ? (
          <button
            type="button"
            className="medications-section__add-button"
            onClick={openDialog}
          >
            + {t('health.addMedication')}
          </button>
        ) : null}
      </header>

      {loading ? (
        <LoadingState message={t('common.loading')} skeleton />
      ) : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'load-medications')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {actionError ? (
        <ErrorAlert message={actionError} compact />
      ) : null}

      {!loading && !error && medications.length === 0 ? (
        <div
          className={[
            'medications-section__empty',
            readOnly ? 'ph-clinic-empty' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {readOnly ? (
            <span className="ph-clinic-badge">{t('health.managedByClinic')}</span>
          ) : null}
          <h3 className="medications-section__empty-title">
            {emptyTitle}
          </h3>
          <p className="medications-section__empty-text">
            {emptyText}
          </p>
          {!readOnly ? (
            <button
              type="button"
              className="medications-section__empty-action"
              onClick={openDialog}
            >
              {t('health.addMedication')}
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && medications.length > 0 ? (
        <ol className="medications-section__timeline">
          {medications.map((medication, index) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              isLast={index === medications.length - 1}
              isDeleting={deletingMedicationId === medication.id}
              onDelete={
                readOnly
                  ? undefined
                  : () => void handleDeleteMedication(medication.id)
              }
            />
          ))}
        </ol>
      ) : null}

      {!readOnly ? (
        <MedicationDialog
          isOpen={isDialogOpen}
          title={t('health.addMedication')}
          onClose={() => setIsDialogOpen(false)}
        >
          <MedicationForm
            petId={petId}
            onSubmit={handleCreateMedication}
            onCancel={() => setIsDialogOpen(false)}
            variant="dialog"
          />
        </MedicationDialog>
      ) : null}
    </section>
  );
}
