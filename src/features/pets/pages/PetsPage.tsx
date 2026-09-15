import { useApolloClient, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { PetForm } from '../components/PetForm';
import { MY_PETS_QUERY } from '../graphql';
import * as petsService from '../pets.service';
import type { CreatePetInput, MyPetsQueryResult } from '../types';
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
    <section className="pets-page" aria-labelledby="pets-page-title">
      <div className="pets-page__container">
        <header className="pets-page__header">
          <div>
            <h1 id="pets-page-title">My Pets</h1>
            <p className="pets-page__subtitle">
              Pets linked to your account.
            </p>
          </div>
          {!loading && !error ? (
            <button
              type="button"
              className="pets-page__add-button"
              onClick={() => setIsFormOpen((open) => !open)}
              aria-expanded={isFormOpen}
              aria-controls="add-pet-form"
            >
              {isFormOpen ? 'Close form' : 'Add Pet'}
            </button>
          ) : null}
        </header>

        {isFormOpen && !loading && !error ? (
          <div id="add-pet-form" className="pets-page__form-panel">
            <PetForm
              mode="create"
              title="Add a new pet"
              submitLabel="Create pet"
              onSubmit={handleCreatePet}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        ) : null}

        {loading ? (
          <p className="pets-page__status" role="status">Loading pets…</p>
        ) : null}

        {error ? (
          <p className="pets-page__error" role="alert">
            {getAuthErrorMessage(error)}
          </p>
        ) : null}

        {!loading && !error && pets.length === 0 ? (
          <p className="pets-page__empty">
            You don&apos;t have any pets yet.
          </p>
        ) : null}

        {!loading && !error && pets.length > 0 ? (
          <ul className="pets-page__list">
            {pets.map((pet) => (
              <li key={pet.id}>
                <Link className="pets-page__card" to={`/pets/${pet.id}`}>
                  <h2 className="pets-page__name">{pet.name}</h2>
                  <dl className="pets-page__meta">
                    <div>
                      <dt>Species</dt>
                      <dd>{pet.species}</dd>
                    </div>
                    {pet.breed ? (
                      <div>
                        <dt>Breed</dt>
                        <dd>{pet.breed}</dd>
                      </div>
                    ) : null}
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
