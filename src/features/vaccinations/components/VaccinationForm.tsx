import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { i18n } from '../../../i18n';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import type { CreateVaccinationInput } from '../types';
import './vaccination-form.css';

export type VaccinationFormValues = {
  vaccineName: string;
  administeredAt: string;
  nextDueAt: string;
  veterinarianName: string;
  clinicName: string;
  batchNumber: string;
  notes: string;
};

type VaccinationFormField =
  | 'vaccineName'
  | 'administeredAt'
  | 'nextDueAt'
  | 'veterinarianName'
  | 'clinicName'
  | 'batchNumber'
  | 'notes';

type VaccinationFieldErrors = Partial<Record<VaccinationFormField, string>>;

const emptyVaccinationFormValues: VaccinationFormValues = {
  vaccineName: '',
  administeredAt: '',
  nextDueAt: '',
  veterinarianName: '',
  clinicName: '',
  batchNumber: '',
  notes: '',
};

function validateVaccinationForm(
  values: VaccinationFormValues,
): VaccinationFieldErrors {
  const errors: VaccinationFieldErrors = {};

  if (!values.vaccineName.trim()) {
    errors.vaccineName = i18n.t('health.vaccineNameRequired');
  }
  if (!values.administeredAt) {
    errors.administeredAt = i18n.t('health.administeredRequired');
  }

  return errors;
}

function hasFieldErrors(errors: VaccinationFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

function toIsoDateTime(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

export function buildCreateVaccinationInput(
  petId: string,
  values: VaccinationFormValues,
): CreateVaccinationInput {
  const input: CreateVaccinationInput = {
    petId,
    vaccineName: values.vaccineName.trim(),
    administeredAt: toIsoDateTime(values.administeredAt),
  };

  if (values.nextDueAt) {
    input.nextDueAt = toIsoDateTime(values.nextDueAt);
  }

  const veterinarianName = values.veterinarianName.trim();
  if (veterinarianName) {
    input.veterinarianName = veterinarianName;
  }

  const clinicName = values.clinicName.trim();
  if (clinicName) {
    input.clinicName = clinicName;
  }

  const batchNumber = values.batchNumber.trim();
  if (batchNumber) {
    input.batchNumber = batchNumber;
  }

  const notes = values.notes.trim();
  if (notes) {
    input.notes = notes;
  }

  return input;
}

type VaccinationFormProps = {
  petId: string;
  onSubmit: (input: CreateVaccinationInput) => Promise<void>;
  onCancel: () => void;
  variant?: 'inline' | 'dialog';
};

export function VaccinationForm({
  petId,
  onSubmit,
  onCancel,
  variant = 'inline',
}: VaccinationFormProps) {
  const { t } = useTranslation();
  const isDialog = variant === 'dialog';
  const [values, setValues] = useState<VaccinationFormValues>(
    emptyVaccinationFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<VaccinationFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof VaccinationFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateVaccinationForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildCreateVaccinationInput(petId, values));
      setValues(emptyVaccinationFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'save-vaccination'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={[
        'vaccination-form',
        isDialog ? 'vaccination-form--dialog' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={isDialog ? undefined : 'vaccination-form-title'}
    >
      {!isDialog ? (
        <h3 id="vaccination-form-title" className="vaccination-form__title">
          {t('health.addVaccination')}
        </h3>
      ) : null}

      {formError ? (
        <p className="vaccination-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="vaccination-form__fields">
        <div className="vaccination-form__field">
          <label className="vaccination-form__label" htmlFor="vaccination-name">
            {t('health.vaccineName')}{' '}
            <span className="vaccination-form__required" aria-hidden="true">*</span>
          </label>
          <input
            id="vaccination-name"
            name="vaccineName"
            className={[
              'vaccination-form__input',
              fieldErrors.vaccineName ? 'vaccination-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.vaccineName}
            onChange={updateField('vaccineName')}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(fieldErrors.vaccineName)}
          />
          {fieldErrors.vaccineName ? (
            <p className="vaccination-form__error" role="alert">
              {fieldErrors.vaccineName}
            </p>
          ) : null}
        </div>

        <div className="vaccination-form__row vaccination-form__row--split">
          <div className="vaccination-form__field">
            <label
              className="vaccination-form__label"
              htmlFor="vaccination-administered-at"
            >
              {t('health.administeredDate')}{' '}
              <span className="vaccination-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="vaccination-administered-at"
              name="administeredAt"
              type="date"
              className={[
                'vaccination-form__input',
                fieldErrors.administeredAt ? 'vaccination-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.administeredAt}
              onChange={updateField('administeredAt')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.administeredAt)}
            />
            {fieldErrors.administeredAt ? (
              <p className="vaccination-form__error" role="alert">
                {fieldErrors.administeredAt}
              </p>
            ) : null}
          </div>

          <div className="vaccination-form__field">
            <label className="vaccination-form__label" htmlFor="vaccination-next-due">
              {t('health.nextDueDate')}
            </label>
            <input
              id="vaccination-next-due"
              name="nextDueAt"
              type="date"
              className="vaccination-form__input"
              value={values.nextDueAt}
              onChange={updateField('nextDueAt')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="vaccination-form__row vaccination-form__row--split">
          <div className="vaccination-form__field">
            <label
              className="vaccination-form__label"
              htmlFor="vaccination-veterinarian"
            >
              {t('appointments.veterinarian')}
            </label>
            <input
              id="vaccination-veterinarian"
              name="veterinarianName"
              className="vaccination-form__input"
              value={values.veterinarianName}
              onChange={updateField('veterinarianName')}
              disabled={isSubmitting}
            />
          </div>

          <div className="vaccination-form__field">
            <label className="vaccination-form__label" htmlFor="vaccination-clinic">
              {t('appointments.clinic')}
            </label>
            <input
              id="vaccination-clinic"
              name="clinicName"
              className="vaccination-form__input"
              value={values.clinicName}
              onChange={updateField('clinicName')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="vaccination-form__field">
          <label className="vaccination-form__label" htmlFor="vaccination-batch">
            {t('health.batchNumber')}
          </label>
          <input
            id="vaccination-batch"
            name="batchNumber"
            className="vaccination-form__input"
            value={values.batchNumber}
            onChange={updateField('batchNumber')}
            disabled={isSubmitting}
          />
        </div>

        <div className="vaccination-form__field">
          <label className="vaccination-form__label" htmlFor="vaccination-notes">
            {t('pets.notes')}
          </label>
          <textarea
            id="vaccination-notes"
            name="notes"
            className="vaccination-form__textarea"
            value={values.notes}
            onChange={updateField('notes')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="vaccination-form__actions">
        <button
          type="submit"
          className="vaccination-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('common.saving') : t('health.addVaccination')}
        </button>
        <button
          type="button"
          className="vaccination-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
