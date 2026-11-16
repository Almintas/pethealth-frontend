import { useApolloClient } from '@apollo/client/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth';
import type { Pet } from '../../pets/types';
import { createPetPassport, saveFile } from '../create-pet-passport';

type PetPassportButtonProps = {
  pet: Pet;
  disabled?: boolean;
  /** Called with a user-facing message on failure, null when starting. */
  onError: (message: string | null) => void;
};

/** Downloads the pet's health passport (vaccinations, treatments, clinics) as a PDF. */
export function PetPassportButton({ pet, disabled, onError }: PetPassportButtonProps) {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const handleClick = async () => {
    onError(null);
    setIsCreating(true);
    try {
      const owner = user
        ? { firstName: user.firstName, lastName: user.lastName, email: user.email }
        : null;
      saveFile(await createPetPassport(client, pet, owner, t));
    } catch {
      onError(t('passport.failed'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      type="button"
      className="ph-btn ph-btn--primary"
      onClick={() => void handleClick()}
      disabled={disabled || isCreating}
      aria-busy={isCreating}
    >
      {isCreating ? t('passport.preparing') : t('passport.download')}
    </button>
  );
}
