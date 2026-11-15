import { useApolloClient, useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorAlert, LoadingState } from '../../../components/feedback';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { formatPetDate } from '../../pets/utils/format-pet-date';
import * as clinicAccessService from '../clinic-access.service';
import { PET_CLINIC_ACCESS_QUERY } from '../graphql';
import type {
  PetClinicAccessQueryResult,
  PetClinicAccessQueryVariables,
  PetShareCode,
} from '../types';
import './clinic-access-section.css';

type ClinicAccessSectionProps = {
  petId: string;
  petName: string;
};

function useSecondsLeft(expiresAt: string | null): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) {
    return 0;
  }
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Owner-controlled clinic access (e-sveikata style consent): the owner shows a
 * one-time code at the clinic, sees which clinics can access the pet, and can
 * revoke access at any time.
 */
export function ClinicAccessSection({ petId, petName }: ClinicAccessSectionProps) {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [shareCode, setShareCode] = useState<PetShareCode | null>(null);
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [revokingClinicId, setRevokingClinicId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const secondsLeft = useSecondsLeft(shareCode?.expiresAt ?? null);
  const isCodeActive = shareCode !== null && secondsLeft > 0;

  const { data, loading, error, refetch } = useQuery<
    PetClinicAccessQueryResult,
    PetClinicAccessQueryVariables
  >(PET_CLINIC_ACCESS_QUERY, {
    variables: { petId },
    fetchPolicy: 'network-only',
  });
  const clinics = data?.petClinicAccess ?? [];

  const handleCreateCode = async () => {
    setActionError(null);
    setIsCreatingCode(true);
    try {
      setShareCode(await clinicAccessService.createPetShareCode(client, petId));
    } catch (createError) {
      setActionError(getUserFacingErrorMessage(createError, 'generic-save'));
    } finally {
      setIsCreatingCode(false);
    }
  };

  const handleRevoke = async (clinicId: string, clinicName: string) => {
    if (!window.confirm(t('clinicAccess.revokeConfirm', { clinic: clinicName, pet: petName }))) {
      return;
    }
    setActionError(null);
    setRevokingClinicId(clinicId);
    try {
      await clinicAccessService.revokePetClinicAccess(client, petId, clinicId);
      await refetch();
    } catch (revokeError) {
      setActionError(getUserFacingErrorMessage(revokeError, 'generic-save'));
    } finally {
      setRevokingClinicId(null);
    }
  };

  return (
    <section
      id="clinic-access"
      className="clinic-access-section"
      aria-labelledby="clinic-access-title"
    >
      <header className="clinic-access-section__header">
        <div>
          <h2 id="clinic-access-title">{t('clinicAccess.title')}</h2>
          <p className="clinic-access-section__intro">{t('clinicAccess.intro')}</p>
        </div>
        {!isCodeActive ? (
          <button
            type="button"
            className="clinic-access-section__primary"
            onClick={() => void handleCreateCode()}
            disabled={isCreatingCode}
          >
            {isCreatingCode
              ? t('clinicAccess.creatingCode')
              : shareCode
                ? t('clinicAccess.newCode')
                : t('clinicAccess.createCode')}
          </button>
        ) : null}
      </header>

      {actionError ? <ErrorAlert message={actionError} compact /> : null}

      {shareCode ? (
        <div
          className={[
            'clinic-access-section__code-card',
            isCodeActive ? '' : 'clinic-access-section__code-card--expired',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-live="polite"
        >
          <p className="clinic-access-section__code-label">
            {t('clinicAccess.codeLabel')}
          </p>
          <p className="clinic-access-section__code">{shareCode.code}</p>
          <p className="clinic-access-section__code-meta">
            {isCodeActive
              ? t('clinicAccess.codeExpiresIn', { time: formatCountdown(secondsLeft) })
              : t('clinicAccess.codeExpired')}
          </p>
          <p className="clinic-access-section__code-hint">{t('clinicAccess.codeHint')}</p>
          {isCodeActive ? (
            <button
              type="button"
              className="clinic-access-section__link"
              onClick={() => void refetch()}
            >
              {t('clinicAccess.refreshList')}
            </button>
          ) : null}
        </div>
      ) : null}

      <h3 className="clinic-access-section__subtitle">{t('clinicAccess.clinicsTitle')}</h3>

      {loading ? <LoadingState message={t('common.loading')} skeleton /> : null}

      {error ? (
        <ErrorAlert
          message={getUserFacingErrorMessage(error, 'generic-load')}
          onRetry={() => void refetch()}
          compact
        />
      ) : null}

      {!loading && !error && clinics.length === 0 ? (
        <p className="clinic-access-section__empty">{t('clinicAccess.noClinics')}</p>
      ) : null}

      {!loading && !error && clinics.length > 0 ? (
        <ul className="clinic-access-section__list">
          {clinics.map((clinic) => (
            <li key={clinic.clinicId} className="clinic-access-section__item">
              <div className="clinic-access-section__item-main">
                <p className="clinic-access-section__clinic-name">{clinic.clinicName}</p>
                <p className="clinic-access-section__clinic-meta">
                  {[clinic.clinicAddress, clinic.clinicPhone].filter(Boolean).join(' · ')}
                </p>
                <p className="clinic-access-section__clinic-meta">
                  {t('clinicAccess.grantedOn', { date: formatPetDate(clinic.grantedAt) })}
                </p>
              </div>
              <button
                type="button"
                className="clinic-access-section__revoke"
                onClick={() => void handleRevoke(clinic.clinicId, clinic.clinicName)}
                disabled={revokingClinicId === clinic.clinicId}
              >
                {revokingClinicId === clinic.clinicId
                  ? t('clinicAccess.revoking')
                  : t('clinicAccess.revoke')}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
