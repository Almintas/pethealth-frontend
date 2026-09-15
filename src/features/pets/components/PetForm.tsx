import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import type { CreatePetInput, Pet } from '../types';
import './pet-form.css';

export type PetFormValues = {
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  microchipNumber: string;
};

type PetFormField =
  | 'name'
  | 'species'
  | 'breed'
  | 'gender'
  | 'birthDate'
  | 'microchipNumber';

type PetFormFieldErrors = Partial<Record<PetFormField, string>>;

export const emptyPetFormValues: PetFormValues = {
  name: '',
  species: '',
  breed: '',
  gender: '',
  birthDate: '',
  microchipNumber: '',
};

function petToFormValues(pet: Pet): PetFormValues {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    gender: pet.gender ?? '',
    birthDate: pet.birthDate ? pet.birthDate.slice(0, 10) : '',
    microchipNumber: pet.microchipNumber ?? '',
  };
}

export function buildCreatePetInput(values: PetFormValues): CreatePetInput {
  const input: CreatePetInput = {
    name: values.name.trim(),
    species: values.species.trim(),
  };

  const breed = values.breed.trim();
  if (breed) {
    input.breed = breed;
  }

  const gender = values.gender.trim();
  if (gender) {
    input.gender = gender;
  }

  if (values.birthDate) {
    input.birthDate = new Date(`${values.birthDate}T00:00:00`).toISOString();
  }

  const microchipNumber = values.microchipNumber.trim();
  if (microchipNumber) {
    input.microchipNumber = microchipNumber;
  }

  return input;
}

function validatePetForm(values: PetFormValues): PetFormFieldErrors {
  const errors: PetFormFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!values.species.trim()) {
    errors.species = 'Species is required.';
  }

  return errors;
}

function hasFieldErrors(errors: PetFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

type PetFormProps = {
  mode: 'create' | 'edit';
  title: string;
  submitLabel: string;
  initialPet?: Pet;
  onSubmit: (input: CreatePetInput) => Promise<void>;
  onCancel: () => void;
};

export function PetForm({
  mode,
  title,
  submitLabel,
  initialPet,
  onSubmit,
  onCancel,
}: PetFormProps) {
  const [values, setValues] = useState<PetFormValues>(() =>
    initialPet ? petToFormValues(initialPet) : emptyPetFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<PetFormFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof PetFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validatePetForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildCreatePetInput(values));
      setValues(emptyPetFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="pet-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="pet-form-title"
      data-form-mode={mode}
    >
      <h2 id="pet-form-title" className="pet-form__title">{title}</h2>

      {formError ? (
        <p className="pet-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="pet-form__fields">
        <div className="pet-form__row pet-form__row--split">
          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-name">
              Name <span className="pet-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="pet-name"
              name="name"
              className={[
                'pet-form__input',
                fieldErrors.name ? 'pet-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.name}
              onChange={updateField('name')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.name)}
              autoComplete="off"
            />
            {fieldErrors.name ? (
              <p className="pet-form__error" role="alert">{fieldErrors.name}</p>
            ) : null}
          </div>

          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-species">
              Species <span className="pet-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="pet-species"
              name="species"
              className={[
                'pet-form__input',
                fieldErrors.species ? 'pet-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.species}
              onChange={updateField('species')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.species)}
              autoComplete="off"
            />
            {fieldErrors.species ? (
              <p className="pet-form__error" role="alert">{fieldErrors.species}</p>
            ) : null}
          </div>
        </div>

        <div className="pet-form__row pet-form__row--split">
          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-breed">Breed</label>
            <input
              id="pet-breed"
              name="breed"
              className="pet-form__input"
              value={values.breed}
              onChange={updateField('breed')}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-gender">Gender</label>
            <input
              id="pet-gender"
              name="gender"
              className="pet-form__input"
              value={values.gender}
              onChange={updateField('gender')}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="pet-form__row pet-form__row--split">
          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-birth-date">
              Birth date
            </label>
            <input
              id="pet-birth-date"
              name="birthDate"
              type="date"
              className="pet-form__input"
              value={values.birthDate}
              onChange={updateField('birthDate')}
              disabled={isSubmitting}
            />
          </div>

          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor="pet-microchip">
              Microchip number
            </label>
            <input
              id="pet-microchip"
              name="microchipNumber"
              className="pet-form__input"
              value={values.microchipNumber}
              onChange={updateField('microchipNumber')}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="pet-form__actions">
        <button
          type="submit"
          className="pet-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          className="pet-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>

    </form>
  );
}
