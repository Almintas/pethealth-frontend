import { useQuery } from '@apollo/client/react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { MY_PETS_QUERY } from '../graphql';
import type { MyPetsQueryResult } from '../types';
import './pets-page.css';

export function PetsPage() {
  const { data, loading, error } = useQuery<MyPetsQueryResult>(MY_PETS_QUERY, {
    fetchPolicy: 'network-only',
  });

  const pets = data?.myPets ?? [];

  return (
    <section className="pets-page" aria-labelledby="pets-page-title">
      <div className="pets-page__container">
        <header className="pets-page__header">
          <h1 id="pets-page-title">My Pets</h1>
          <p className="pets-page__subtitle">
            Pets linked to your account.
          </p>
        </header>

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
              <li key={pet.id} className="pets-page__card">
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
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
