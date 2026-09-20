import { useApolloClient } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router';
import { EmptyState, ErrorAlert, LoadingState } from '../../../components/feedback';
import { PetAvatar } from '../../../components/PetAvatar';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import { AppointmentsSection } from '../../appointments';
import { RemindersSection } from '../../reminders';
import { MedicalRecordsSection } from '../../medical-records';
import { MedicationsSection } from '../../medications';
import { VaccinationsSection } from '../../vaccinations';
import { PetForm } from '../components/PetForm';
import { PetProfilePhotoControls } from '../components/PetProfilePhotoControls';
import * as petsService from '../pets.service';
import type { PetFormSubmitPayload } from '../components/PetForm';
import type { Pet, UpdatePetInput } from '../types';
import { formatPetAge } from '../../../utils/format-pet-age';
import {
  translatePetBreed,
  translatePetGender,
  translatePetSpecies,
} from '../utils/pet-field-display';
import { formatPetDate } from '../utils/format-pet-date';
import './pet-details-page.css';

const sectionLinkIds = [
  'medical-records',
  'vaccinations',
  'medications',
  'appointments',
  'reminders',
] as const;

export function PetDetailsPage() {
  const { t } = useTranslation();
  const sectionLinks = sectionLinkIds.map((id) => ({
    id,
    label:
      id === 'medical-records'
        ? t('health.medicalRecords')
        : id === 'vaccinations'
          ? t('health.vaccinations')
          : id === 'medications'
            ? t('health.medications')
            : id === 'appointments'
              ? t('appointments.title')
              : t('reminders.title'),
  }));
  const { id } = useParams<{ id: string }>();
  const client = useApolloClient();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (!id) {
      setPet(null);
      setLoading(false);
      setErrorMessage(null);
      setNotFound(true);
      return;
    }

    let cancelled = false;

    const loadPet = async () => {
      setLoading(true);
      setErrorMessage(null);
      setNotFound(false);
      setPet(null);

      try {
        const result = await petsService.fetchPetById(client, id);
        if (!cancelled) {
          setPet(result);
        }
      } catch (error) {
        if (!cancelled) {
          const message = getUserFacingErrorMessage(error, 'load-pet');
          if (message.toLowerCase().includes('not found')) {
            setNotFound(true);
          } else {
            setErrorMessage(message);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPet();

    return () => {
      cancelled = true;
    };
  }, [client, id, retryNonce]);

  const handleUpdatePet = async ({
    input,
    photoIntent,
  }: PetFormSubmitPayload<UpdatePetInput>) => {
    if (!pet) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    await petsService.updatePet(client, pet.id, input);

    try {
      if (photoIntent.kind !== 'unchanged') {
        const photoUpdated = await petsService.applyPetPhotoIntent(
          client,
          pet.id,
          photoIntent,
        );
        if (photoUpdated) {
          setPet(photoUpdated);
        }
      }
    } catch (photoError) {
      const refreshedAfterFailedPhoto = await petsService.fetchPetById(
        client,
        pet.id,
      );
      setPet(refreshedAfterFailedPhoto);
      throw photoError;
    }

    const refreshedPet = await petsService.fetchPetById(client, pet.id);
    setPet(refreshedPet);
    setIsEditing(false);
    setSuccessMessage(
      photoIntent.kind === 'unchanged'
        ? t('pets.detailsUpdated')
        : t('pets.detailsAndPhotoUpdated'),
    );
  };

  const handleDelete = async () => {
    if (!pet) {
      return;
    }

    const confirmed = window.confirm(
      t('pets.deleteConfirm', { name: pet.name }),
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await petsService.deletePet(client, pet.id);
      void navigate('/pets', { replace: true });
    } catch (error) {
      setErrorMessage(getUserFacingErrorMessage(error, 'save-pet'));
    } finally {
      setIsDeleting(false);
    }
  };

  const age = pet ? formatPetAge(pet.birthDate) : null;
  const subtitleParts = pet
    ? [
        pet.breed
          ? translatePetBreed(pet.breed, t)
          : translatePetSpecies(pet.species, t),
        pet.gender ? translatePetGender(pet.gender, t) : null,
        age,
      ].filter(Boolean)
    : [];

  return (
    <section className="pet-details ph-page" aria-labelledby="pet-details-title">
      <div className="pet-details__toolbar">
        <Link className="ph-link ph-link--muted" to="/pets">{t('pets.backToPets')}</Link>
      </div>

      {loading ? (
        <LoadingState message={t('common.loading')} skeleton skeletonLines={5} />
      ) : null}

      {errorMessage ? (
        <ErrorAlert
          title={t('pets.loadErrorTitle')}
          message={errorMessage}
          onRetry={() => setRetryNonce((current) => current + 1)}
        />
      ) : null}

      {successMessage ? (
        <p className="pet-details__success" role="status">{successMessage}</p>
      ) : null}

      {!loading && !errorMessage && notFound ? (
        <EmptyState
          title={t('pets.notFoundTitle')}
          description={t('pets.notFoundDesc')}
          actionLabel={t('pets.backToPets')}
          actionHref="/pets"
        />
      ) : null}

      {!loading && !errorMessage && !notFound && pet ? (
        <>
          <header className="pet-details__hero ph-card ph-card--pad">
            <div className="pet-details__hero-main">
              {!isEditing ? (
                <PetProfilePhotoControls
                  pet={pet}
                  onPetUpdated={(updated) => {
                    setPet(updated);
                    setSuccessMessage(t('pets.photoUpdated'));
                  }}
                  disabled={isDeleting}
                />
              ) : (
                <PetAvatar
                  species={pet.species}
                  name={pet.name}
                  photoUrl={pet.photoUrl}
                  size="lg"
                />
              )}
              <div>
                <h1 id="pet-details-title">{pet.name}</h1>
                <p className="pet-details__subtitle">
                  {subtitleParts.join(' · ')}
                </p>
              </div>
            </div>

            <div className="pet-details__actions">
              {!isEditing ? (
                <button
                  type="button"
                  className="ph-btn ph-btn--secondary"
                  onClick={() => {
                    setSuccessMessage(null);
                    setIsEditing(true);
                  }}
                  aria-expanded={isEditing}
                  aria-controls="pet-edit-panel"
                >
                  {t('common.edit')}
                </button>
              ) : null}
              <button
                type="button"
                className="ph-btn ph-btn--danger-ghost"
                onClick={() => void handleDelete()}
                disabled={isDeleting || isEditing}
              >
                {isDeleting ? t('common.saving') : t('pets.deletePet')}
              </button>
            </div>
          </header>

          {isEditing ? (
            <div
              id="pet-edit-panel"
              className="pet-details__edit-panel ph-card ph-card--pad"
            >
              <PetForm
                key={`edit-${pet.id}`}
                mode="edit"
                title={t('pets.editPet')}
                submitLabel={t('profile.saveChanges')}
                initialPet={pet}
                onSubmit={handleUpdatePet}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : null}

          <section className="pet-details__overview ph-card ph-card--pad" aria-labelledby="health-overview-title">
            <h2 id="health-overview-title">{t('health.healthOverview')}</h2>
            <p className="pet-details__overview-copy">
              {t('health.healthOverviewCopy')}
            </p>
            <dl className="pet-details__facts">
              <div>
                <dt>{t('pets.species')}</dt>
                <dd>{translatePetSpecies(pet.species, t)}</dd>
              </div>
              <div>
                <dt>{t('pets.breed')}</dt>
                <dd>
                  {pet.breed
                    ? translatePetBreed(pet.breed, t)
                    : t('common.notProvided')}
                </dd>
              </div>
              <div>
                <dt>{t('pets.gender')}</dt>
                <dd>
                  {pet.gender
                    ? translatePetGender(pet.gender, t)
                    : t('common.notProvided')}
                </dd>
              </div>
              <div>
                <dt>{t('pets.dateOfBirth')}</dt>
                <dd>{formatPetDate(pet.birthDate)}</dd>
              </div>
              <div>
                <dt>{t('pets.microchip')}</dt>
                <dd>{pet.microchipNumber ?? t('common.notProvided')}</dd>
              </div>
            </dl>

            <nav
              className="pet-details__section-nav"
              aria-label={t('health.petHealthSectionsNav')}
            >
              {sectionLinks.map((link) => (
                <a key={link.id} className="pet-details__section-link" href={`#${link.id}`}>
                  {link.label}
                </a>
              ))}
            </nav>
          </section>

          <MedicalRecordsSection petId={pet.id} />
          <VaccinationsSection petId={pet.id} />
          <MedicationsSection petId={pet.id} />
          <AppointmentsSection petId={pet.id} />
          <RemindersSection petId={pet.id} />
        </>
      ) : null}
    </section>
  );
}
