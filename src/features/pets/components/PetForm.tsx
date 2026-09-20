import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { SearchableCombobox } from '../../../components/SearchableCombobox';
import { i18n } from '../../../i18n';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import {
  getBreedSuggestionsForSpecies,
  PET_GENDER_SUGGESTIONS,
  PET_SPECIES_SUGGESTIONS,
} from '../constants/pet-field-suggestions';
import {
  resolveCanonicalBreedFromInput,
  resolveCanonicalGenderFromInput,
  resolveCanonicalSpeciesFromInput,
  translatePetBreed,
  translatePetGender,
  translatePetSpecies,
} from '../utils/pet-field-display';
import type { PetPhotoIntent } from '../constants/pet-photo';
import { PetPhotoField } from './PetPhotoField';
import type { CreatePetInput, Pet, UpdatePetInput } from '../types';
import './pet-form.css';

export type PetFormSubmitPayload<TInput> = {
  input: TInput;
  photoIntent: PetPhotoIntent;
};

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

export function buildUpdatePetInput(values: PetFormValues): UpdatePetInput {
  return buildCreatePetInput(values);
}

function validatePetForm(values: PetFormValues): PetFormFieldErrors {
  const errors: PetFormFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = `${i18n.t('pets.name')}: ${i18n.t('common.required')}`;
  }

  if (!values.species.trim()) {
    errors.species = `${i18n.t('pets.species')}: ${i18n.t('common.required')}`;
  }

  return errors;
}

function hasFieldErrors(errors: PetFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

type PetFormBaseProps = {
  title: string;
  submitLabel: string;
  onCancel: () => void;
};

type PetFormProps =
  | (PetFormBaseProps & {
      mode: 'create';
      onSubmit: (payload: PetFormSubmitPayload<CreatePetInput>) => Promise<void>;
      initialPet?: never;
    })
  | (PetFormBaseProps & {
      mode: 'edit';
      initialPet: Pet;
      onSubmit: (payload: PetFormSubmitPayload<UpdatePetInput>) => Promise<void>;
    });

export function PetForm({
  mode,
  title,
  submitLabel,
  initialPet,
  onSubmit,
  onCancel,
}: PetFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<PetFormValues>(() =>
    initialPet ? petToFormValues(initialPet) : emptyPetFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<PetFormFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoIntent, setPhotoIntent] = useState<PetPhotoIntent>({
    kind: 'unchanged',
  });
  const photoIntentRef = useRef(photoIntent);
  photoIntentRef.current = photoIntent;

  const handlePhotoIntentChange = (intent: PetPhotoIntent) => {
    photoIntentRef.current = intent;
    setPhotoIntent(intent);
  };

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
    const intentForSubmit = photoIntentRef.current;
    try {
      if (mode === 'edit') {
        await onSubmit({
          input: buildUpdatePetInput(values),
          photoIntent: intentForSubmit,
        });
      } else {
        await onSubmit({
          input: buildCreatePetInput(values),
          photoIntent: intentForSubmit,
        });
      }
      if (mode === 'create') {
        setValues(emptyPetFormValues);
      }
      setPhotoIntent({ kind: 'unchanged' });
      photoIntentRef.current = { kind: 'unchanged' };
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'save-pet'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldId = (name: string) => `pet-${mode}-${name}`;

  const breedSuggestions = useMemo(
    () =>
      getBreedSuggestionsForSpecies(
        resolveCanonicalSpeciesFromInput(values.species, t),
      ),
    [values.species, t],
  );

  const speciesLabel = useMemo(
    () => (option: string) => translatePetSpecies(option, t),
    [t],
  );
  const genderLabel = useMemo(
    () => (option: string) => translatePetGender(option, t),
    [t],
  );
  const breedLabel = useMemo(
    () => (option: string) => translatePetBreed(option, t),
    [t],
  );
  const resolveSpecies = useMemo(
    () => (input: string) => resolveCanonicalSpeciesFromInput(input, t),
    [t],
  );
  const resolveGender = useMemo(
    () => (input: string) => resolveCanonicalGenderFromInput(input, t),
    [t],
  );
  const resolveBreed = useMemo(
    () => (input: string) =>
      resolveCanonicalBreedFromInput(input, breedSuggestions, t),
    [breedSuggestions, t],
  );

  const setFieldValue = (field: keyof PetFormValues, next: string) => {
    setValues((current) => ({ ...current, [field]: next }));
  };

  return (
    <form
      className="pet-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`pet-form-title-${mode}`}
      data-form-mode={mode}
    >
      <h2 id={`pet-form-title-${mode}`} className="pet-form__title">{title}</h2>

      {formError ? (
        <p className="pet-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="pet-form__fields">
        <PetPhotoField
          species={values.species || initialPet?.species || 'Pet'}
          name={values.name || initialPet?.name || 'Pet'}
          existingPhotoUrl={mode === 'edit' ? initialPet.photoUrl : null}
          disabled={isSubmitting}
          onIntentChange={handlePhotoIntentChange}
        />

        <div className="pet-form__row pet-form__row--split">
          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor={fieldId('name')}>
              {t('pets.name')}{' '}
              <span className="pet-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id={fieldId('name')}
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

          <SearchableCombobox
            id={fieldId('species')}
            label={t('pets.species')}
            value={values.species}
            onChange={(next) => setFieldValue('species', next)}
            options={PET_SPECIES_SUGGESTIONS}
            placeholder={t('pets.placeholderSpecies')}
            disabled={isSubmitting}
            required
            error={fieldErrors.species}
            allowCustom
            optionLabel={speciesLabel}
            resolveCanonicalValue={resolveSpecies}
          />
        </div>

        <div className="pet-form__row pet-form__row--split">
          <SearchableCombobox
            id={fieldId('breed')}
            label={t('pets.breed')}
            value={values.breed}
            onChange={(next) => setFieldValue('breed', next)}
            options={breedSuggestions}
            placeholder={t('pets.placeholderBreed')}
            disabled={isSubmitting}
            allowCustom
            optionLabel={breedLabel}
            resolveCanonicalValue={resolveBreed}
            hint={
              values.species.trim()
                ? t('pets.breedSuggestionsFor', {
                    species: translatePetSpecies(values.species.trim(), t),
                  })
                : t('pets.speciesHint')
            }
          />

          <SearchableCombobox
            id={fieldId('gender')}
            label={t('pets.gender')}
            value={values.gender}
            onChange={(next) => setFieldValue('gender', next)}
            options={PET_GENDER_SUGGESTIONS}
            placeholder={t('pets.placeholderGender')}
            disabled={isSubmitting}
            allowCustom
            optionLabel={genderLabel}
            resolveCanonicalValue={resolveGender}
          />
        </div>

        <div className="pet-form__row pet-form__row--split">
          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor={fieldId('birth-date')}>
              {t('pets.dateOfBirth')}
            </label>
            <input
              id={fieldId('birth-date')}
              name="birthDate"
              type="date"
              className="pet-form__input"
              value={values.birthDate}
              onChange={updateField('birthDate')}
              disabled={isSubmitting}
            />
          </div>

          <div className="pet-form__field">
            <label className="pet-form__label" htmlFor={fieldId('microchip')}>
              {t('pets.microchip')}
            </label>
            <input
              id={fieldId('microchip')}
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
          {isSubmitting
            ? t('common.saving')
            : submitLabel}
        </button>
        <button
          type="button"
          className="pet-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </button>
      </div>

    </form>
  );
}
