import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorAlert } from '../../../components/ErrorAlert';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { PetAvatar } from '../../../components/PetAvatar';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { PetForm } from '../components/PetForm';
import { MY_PETS_QUERY } from '../graphql';
import * as petsService from '../pets.service';
import type { CreatePetInput, MyPetsQueryResult } from '../types';
import { formatPetAge } from '../../../utils/format-pet-age';
import './pets-page.css';

export function PetsPage() {
  const client = useApolloClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery<MyPetsQueryResult>(
    MY_PETS_QUERY,
    {
      fetchPolicy: 'network-only',
    },
  );

  const pets = data?.myPets ?? [];

  const handleCreatePet = async (input: CreatePetInput) => {
    await petsService.createPet(client, input);
    await refetch();
    setIsFormOpen(false);
  };

  return (
    <section className="pets-page ph-page" aria-labelledby="pets-page-title">
      <header className="ph-page-header pets-page__header">
        <div>
          <h1 id="pets-page-title" className="ph-page-header__title">My Pets</h1>
          <p className="ph-page-header__subtitle">
            Manage your pets and keep their health history in one place.
          </p>
        </div>
        {!loading && !error ? (
          <button
            type="button"
            className="ph-btn ph-btn--primary"
            onClick={() => setIsFormOpen((open) => !open)}
            aria-expanded={isFormOpen}
            aria-controls="add-pet-form"
          >
            {isFormOpen ? 'Close form' : '+ Add Pet'}
          </button>
        ) : null}
      </header>

      {isFormOpen && !loading && !error ? (
        <div id="add-pet-form" className="pets-page__form-panel ph-card ph-card--pad">
          <PetForm
            mode="create"
            title="Add a new pet"
            submitLabel="Create pet"
            onSubmit={handleCreatePet}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      ) : null}

      {loading ? <LoadingSkeleton lines={4} label="Loading pets" /> : null}
      {error ? <ErrorAlert message={getAuthErrorMessage(error)} /> : null}

      {!loading && !error && pets.length === 0 ? (
        <EmptyState
          title="No pets yet"
          description="Add your first pet to start keeping their health information organized."
          action={
            <button
              type="button"
              className="ph-btn ph-btn--primary"
              onClick={() => setIsFormOpen(true)}
            >
              + Add Pet
            </button>
          }
        />
      ) : null}

      {!loading && !error && pets.length > 0 ? (
        <ul className="pets-page__grid">
          {pets.map((pet) => {
            const age = formatPetAge(pet.birthDate);
            const meta = [pet.gender, age].filter(Boolean).join(' · ');

            return (
              <li key={pet.id}>
                <Link className="pets-page__card ph-card" to={`/pets/${pet.id}`}>
                  <PetAvatar species={pet.species} name={pet.name} size="lg" />
                  <div className="pets-page__card-body">
                    <h2 className="pets-page__name">{pet.name}</h2>
                    <p className="pets-page__breed">{pet.breed || pet.species}</p>
                    {meta ? <p className="pets-page__meta">{meta}</p> : null}
                    <span className="pets-page__cta">View profile →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
