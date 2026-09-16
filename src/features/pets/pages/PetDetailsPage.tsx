import { useApolloClient } from '@apollo/client/react';
import { useEffect, useState } from 'react';
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
import * as petsService from '../pets.service';
import type { Pet, UpdatePetInput } from '../types';
import { formatPetAge } from '../../../utils/format-pet-age';
import { formatPetDate } from '../utils/format-pet-date';
import './pet-details-page.css';

const sectionLinks = [
  { id: 'medical-records', label: 'Medical Records' },
  { id: 'vaccinations', label: 'Vaccinations' },
  { id: 'medications', label: 'Medications' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'reminders', label: 'Reminders' },
] as const;

export function PetDetailsPage() {
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

  const handleUpdatePet = async (input: UpdatePetInput) => {
    if (!pet) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const updatedPet = await petsService.updatePet(client, pet.id, input);
    setPet(updatedPet);
    setIsEditing(false);
    setSuccessMessage('Pet details updated.');
  };

  const handleDelete = async () => {
    if (!pet) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${pet.name}? This cannot be undone.`,
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
    ? [pet.breed || pet.species, pet.gender, age].filter(Boolean)
    : [];

  return (
    <section className="pet-details ph-page" aria-labelledby="pet-details-title">
      <div className="pet-details__toolbar">
        <Link className="ph-link ph-link--muted" to="/pets">← Back to Pets</Link>
      </div>

      {loading ? (
        <LoadingState message="Loading pet profile…" skeleton skeletonLines={5} />
      ) : null}

      {errorMessage ? (
        <ErrorAlert
          title="Could not load pet"
          message={errorMessage}
          onRetry={() => setRetryNonce((current) => current + 1)}
        />
      ) : null}

      {successMessage ? (
        <p className="pet-details__success" role="status">{successMessage}</p>
      ) : null}

      {!loading && !errorMessage && notFound ? (
        <EmptyState
          title="Pet not found"
          description="This pet may have been removed or you may not have access to it."
          actionLabel="Back to pets"
          actionHref="/pets"
        />
      ) : null}

      {!loading && !errorMessage && !notFound && pet ? (
        <>
          <header className="pet-details__hero ph-card ph-card--pad">
            <div className="pet-details__hero-main">
              <PetAvatar species={pet.species} name={pet.name} size="lg" />
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
                  Edit
                </button>
              ) : null}
              <button
                type="button"
                className="ph-btn ph-btn--danger-ghost"
                onClick={() => void handleDelete()}
                disabled={isDeleting || isEditing}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </header>

          {isEditing ? (
            <div
              id="pet-edit-panel"
              className="pet-details__edit-panel ph-card ph-card--pad"
            >
              <PetForm
                key={pet.updatedAt}
                mode="edit"
                title="Edit pet"
                submitLabel="Save changes"
                initialPet={pet}
                onSubmit={handleUpdatePet}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : null}

          <section className="pet-details__overview ph-card ph-card--pad" aria-labelledby="health-overview-title">
            <h2 id="health-overview-title">Health overview</h2>
            <p className="pet-details__overview-copy">
              Key details and quick links to this pet&apos;s health records.
            </p>
            <dl className="pet-details__facts">
              <div>
                <dt>Species</dt>
                <dd>{pet.species}</dd>
              </div>
              <div>
                <dt>Breed</dt>
                <dd>{pet.breed ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Gender</dt>
                <dd>{pet.gender ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Birth date</dt>
                <dd>{formatPetDate(pet.birthDate)}</dd>
              </div>
              <div>
                <dt>Microchip</dt>
                <dd>{pet.microchipNumber ?? 'Not provided'}</dd>
              </div>
            </dl>

            <nav className="pet-details__section-nav" aria-label="Pet health sections">
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
