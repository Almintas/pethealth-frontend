import { useApolloClient } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import * as petsService from '../pets.service';
import type { Pet } from '../types';
import { formatPetDate } from '../utils/format-pet-date';
import './pet-details-page.css';

const FUTURE_SECTIONS = [
  'Medical Records',
  'Vaccinations',
  'Medications',
  'Appointments',
  'Reminders',
] as const;

export function PetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const client = useApolloClient();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

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
          const message = getAuthErrorMessage(error);
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
  }, [client, id]);

  return (
    <section className="pet-details" aria-labelledby="pet-details-title">
      <div className="pet-details__container">
        <div className="pet-details__toolbar">
          <Link className="pet-details__back" to="/pets">Back to Pets</Link>
          <button
            type="button"
            className="pet-details__edit"
            disabled
            title="Edit pet — coming soon"
          >
            Edit Pet
          </button>
        </div>

        {loading ? (
          <p className="pet-details__status" role="status">Loading pet…</p>
        ) : null}

        {errorMessage ? (
          <p className="pet-details__error" role="alert">{errorMessage}</p>
        ) : null}

        {!loading && !errorMessage && notFound ? (
          <p className="pet-details__error" role="alert">Pet not found.</p>
        ) : null}

        {!loading && !errorMessage && !notFound && pet ? (
          <>
            <header className="pet-details__header">
              <h1 id="pet-details-title">{pet.name}</h1>
              <p className="pet-details__subtitle">{pet.species}</p>
            </header>

            <dl className="pet-details__facts">
              <div>
                <dt>Name</dt>
                <dd>{pet.name}</dd>
              </div>
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
                <dt>Microchip number</dt>
                <dd>{pet.microchipNumber ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt>Created date</dt>
                <dd>{formatPetDate(pet.createdAt)}</dd>
              </div>
            </dl>

            <div className="pet-details__future">
              <h2>Health &amp; care</h2>
              <div className="pet-details__future-grid">
                {FUTURE_SECTIONS.map((section) => (
                  <section
                    key={section}
                    className="pet-details__future-card"
                    aria-label={`${section} coming soon`}
                  >
                    <h3>{section}</h3>
                    <p>Coming soon — this feature will be available in a future update.</p>
                  </section>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
