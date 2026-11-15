import { useApolloClient } from '@apollo/client/react';
import { useId, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PetAvatar } from '../../../components/PetAvatar';
import { getUserFacingErrorMessage } from '../../auth/utils/get-auth-error-message';
import {
  PET_PHOTO_ACCEPT,
  validatePetPhotoFile,
} from '../constants/pet-photo';
import * as petsService from '../pets.service';
import type { Pet } from '../types';
import './pet-photo-field.css';

type PetProfilePhotoControlsProps = {
  pet: Pet;
  onPetUpdated: (pet: Pet) => void;
  disabled?: boolean;
};

export function PetProfilePhotoControls({
  pet,
  onPetUpdated,
  disabled = false,
}: PetProfilePhotoControlsProps) {
  const { t } = useTranslation();
  const client = useApolloClient();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = disabled || busy;

  const handlePickClick = () => {
    if (isDisabled) {
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = validatePetPhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const updated = await petsService.uploadPetPhoto(client, pet.id, file);
      onPetUpdated(updated);
    } catch (uploadError) {
      setError(getUserFacingErrorMessage(uploadError, 'save-pet'));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (isDisabled || !pet.photoUrl) {
      return;
    }

    const confirmed = window.confirm(t('pets.removePhotoConfirm'));
    if (!confirmed) {
      return;
    }

    setError(null);
    setBusy(true);

    try {
      const updated = await petsService.removePetPhoto(client, pet.id);
      onPetUpdated(updated);
    } catch (removeError) {
      setError(getUserFacingErrorMessage(removeError, 'save-pet'));
    } finally {
      setBusy(false);
    }
  };

  const hasPhoto = Boolean(pet.photoUrl?.trim());

  return (
    <div className="pet-photo-field pet-photo-field--hero">
      <span className="pet-photo-field__label" id={`${inputId}-label`}>
        {t('pets.profilePhotoLabel')}
      </span>

      <div className="pet-photo-field__row">
        <div
          className="pet-photo-field__preview"
          aria-labelledby={`${inputId}-label`}
          aria-busy={busy}
        >
          <PetAvatar
            species={pet.species}
            name={pet.name}
            photoUrl={pet.photoUrl}
            size="lg"
          />
        </div>

        <div className="pet-photo-field__actions">
          <button
            type="button"
            className="pet-photo-field__action pet-photo-field__action--primary"
            onClick={handlePickClick}
            disabled={isDisabled}
            aria-describedby={busy ? `${inputId}-busy` : undefined}
          >
            {busy
              ? t('pets.savingPhoto')
              : hasPhoto
                ? t('pets.changePhoto')
                : t('pets.addPhoto')}
          </button>

          {hasPhoto ? (
            <button
              type="button"
              className="pet-photo-field__action pet-photo-field__action--danger"
              onClick={() => void handleRemove()}
              disabled={isDisabled}
            >
              {t('pets.removePhoto')}
            </button>
          ) : null}
        </div>
      </div>

      {busy ? (
        <p className="pet-photo-field__hint" id={`${inputId}-busy`} role="status">
          {t('pets.uploadingPhoto')}
        </p>
      ) : (
        <p className="pet-photo-field__hint">
          {t('pets.photoHint')}
        </p>
      )}

      <input
        ref={inputRef}
        id={inputId}
        className="pet-photo-field__input"
        type="file"
        accept={PET_PHOTO_ACCEPT}
        onChange={(event) => void handleFileChange(event)}
        disabled={isDisabled}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {error ? (
        <p className="pet-photo-field__error" id={`${inputId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
