import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { PetAvatar } from '../../../components/PetAvatar';
import {
  PET_PHOTO_ACCEPT,
  validatePetPhotoFile,
} from '../constants/pet-photo';
import type { PetPhotoIntent } from '../constants/pet-photo';
import './pet-photo-field.css';

type PetPhotoFieldProps = {
  species: string;
  name: string;
  existingPhotoUrl?: string | null;
  disabled?: boolean;
  onIntentChange: (intent: PetPhotoIntent) => void;
};

export function PetPhotoField({
  species,
  name,
  existingPhotoUrl,
  disabled = false,
  onIntentChange,
}: PetPhotoFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPhotoUrl = removed
    ? null
    : previewUrl ?? existingPhotoUrl ?? null;

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const emitIntent = (intent: PetPhotoIntent) => {
    onIntentChange(intent);
  };

  const handlePickClick = () => {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    setRemoved(false);

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    emitIntent({ kind: 'upload', file });
  };

  const handleRemove = () => {
    if (disabled) {
      return;
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setRemoved(true);
    setError(null);

    if (existingPhotoUrl) {
      emitIntent({ kind: 'remove' });
    } else {
      emitIntent({ kind: 'unchanged' });
    }
  };

  const handleClearNewSelection = () => {
    if (disabled) {
      return;
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setRemoved(false);
    setError(null);
    emitIntent({ kind: 'unchanged' });
  };

  const hasExistingOnly = Boolean(existingPhotoUrl && !previewUrl && !removed);
  const hasNewSelection = Boolean(previewUrl);
  const showRemove = Boolean(displayPhotoUrl);

  return (
    <div className="pet-photo-field">
      <span className="pet-photo-field__label" id={`${inputId}-label`}>
        Profile photo
      </span>
      <p className="pet-photo-field__hint">
        Optional. JPEG, PNG, or WebP up to 5&nbsp;MB.
      </p>

      <div className="pet-photo-field__row">
        <div className="pet-photo-field__preview" aria-labelledby={`${inputId}-label`}>
          <PetAvatar
            species={species}
            name={name || 'Pet'}
            photoUrl={displayPhotoUrl}
            size="lg"
          />
        </div>

        <div className="pet-photo-field__actions">
          <button
            type="button"
            className="pet-photo-field__action pet-photo-field__action--primary"
            onClick={handlePickClick}
            disabled={disabled}
          >
            {displayPhotoUrl ? 'Change photo' : 'Add photo'}
          </button>

          {hasNewSelection ? (
            <button
              type="button"
              className="pet-photo-field__action"
              onClick={handleClearNewSelection}
              disabled={disabled}
            >
              Clear selection
            </button>
          ) : null}

          {showRemove ? (
            <button
              type="button"
              className="pet-photo-field__action pet-photo-field__action--danger"
              onClick={handleRemove}
              disabled={disabled}
            >
              {hasExistingOnly ? 'Remove photo' : 'Remove'}
            </button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        className="pet-photo-field__input"
        type="file"
        accept={PET_PHOTO_ACCEPT}
        onChange={handleFileChange}
        disabled={disabled}
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
