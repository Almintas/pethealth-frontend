import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import type { CreateMedicationInput } from '../types';
import './medication-form.css';

export type MedicationFormValues = {
  name: string;
  dosage: string;
  dosageUnit: string;
  frequency: string;
  startDate: string;
  endDate: string;
  veterinarianName: string;
  clinicName: string;
  notes: string;
  isActive: boolean;
};

type MedicationFormField =
  | 'name'
  | 'dosage'
  | 'dosageUnit'
  | 'frequency'
  | 'startDate'
  | 'endDate'
  | 'veterinarianName'
  | 'clinicName'
  | 'notes';

type MedicationFieldErrors = Partial<Record<MedicationFormField, string>>;

const emptyMedicationFormValues: MedicationFormValues = {
  name: '',
  dosage: '',
  dosageUnit: '',
  frequency: '',
  startDate: '',
  endDate: '',
  veterinarianName: '',
  clinicName: '',
  notes: '',
  isActive: true,
};

function toIsoDateTime(dateValue: string): string {
  return new Date(`${dateValue}T00:00:00`).toISOString();
}

function validateMedicationForm(
  values: MedicationFormValues,
): MedicationFieldErrors {
  const errors: MedicationFieldErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Medication name is required.';
  }

  if (!values.dosage.trim()) {
    errors.dosage = 'Dosage is required.';
  } else {
    const dosage = Number(values.dosage);
    if (Number.isNaN(dosage) || dosage < 0) {
      errors.dosage = 'Dosage must be a number greater than or equal to 0.';
    }
  }

  if (!values.dosageUnit.trim()) {
    errors.dosageUnit = 'Dosage unit is required.';
  }

  if (!values.frequency.trim()) {
    errors.frequency = 'Frequency is required.';
  }

  if (!values.startDate) {
    errors.startDate = 'Start date is required.';
  }

  return errors;
}

function hasFieldErrors(errors: MedicationFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildCreateMedicationInput(
  petId: string,
  values: MedicationFormValues,
): CreateMedicationInput {
  const input: CreateMedicationInput = {
    petId,
    name: values.name.trim(),
    dosage: Number(values.dosage),
    dosageUnit: values.dosageUnit.trim(),
    frequency: values.frequency.trim(),
    startDate: toIsoDateTime(values.startDate),
    isActive: values.isActive,
  };

  if (values.endDate) {
    input.endDate = toIsoDateTime(values.endDate);
  }

  const veterinarianName = values.veterinarianName.trim();
  if (veterinarianName) {
    input.veterinarianName = veterinarianName;
  }

  const clinicName = values.clinicName.trim();
  if (clinicName) {
    input.clinicName = clinicName;
  }

  const notes = values.notes.trim();
  if (notes) {
    input.notes = notes;
  }

  return input;
}

type MedicationFormProps = {
  petId: string;
  onSubmit: (input: CreateMedicationInput) => Promise<void>;
  onCancel: () => void;
};

export function MedicationForm({
  petId,
  onSubmit,
  onCancel,
}: MedicationFormProps) {
  const [values, setValues] = useState<MedicationFormValues>(
    emptyMedicationFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<MedicationFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof MedicationFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue =
        event.target.type === 'checkbox'
          ? (event.target as HTMLInputElement).checked
          : event.target.value;
      setValues((current) => ({ ...current, [field]: nextValue }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateMedicationForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildCreateMedicationInput(petId, values));
      setValues(emptyMedicationFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="medication-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="medication-form-title"
    >
      <h3 id="medication-form-title" className="medication-form__title">
        Add medication
      </h3>

      {formError ? (
        <p className="medication-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="medication-form__fields">
        <div className="medication-form__field">
          <label className="medication-form__label" htmlFor="medication-name">
            Medication name{' '}
            <span className="medication-form__required" aria-hidden="true">*</span>
          </label>
          <input
            id="medication-name"
            name="name"
            className={[
              'medication-form__input',
              fieldErrors.name ? 'medication-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.name}
            onChange={updateField('name')}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name ? (
            <p className="medication-form__error" role="alert">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div className="medication-form__row medication-form__row--dosage">
          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-dosage">
              Dosage{' '}
              <span className="medication-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medication-dosage"
              name="dosage"
              type="number"
              min="0"
              step="any"
              className={[
                'medication-form__input',
                fieldErrors.dosage ? 'medication-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.dosage}
              onChange={updateField('dosage')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.dosage)}
            />
            {fieldErrors.dosage ? (
              <p className="medication-form__error" role="alert">{fieldErrors.dosage}</p>
            ) : null}
          </div>

          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-dosage-unit">
              Dosage unit{' '}
              <span className="medication-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medication-dosage-unit"
              name="dosageUnit"
              className={[
                'medication-form__input',
                fieldErrors.dosageUnit ? 'medication-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.dosageUnit}
              onChange={updateField('dosageUnit')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.dosageUnit)}
            />
            {fieldErrors.dosageUnit ? (
              <p className="medication-form__error" role="alert">
                {fieldErrors.dosageUnit}
              </p>
            ) : null}
          </div>

          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-frequency">
              Frequency{' '}
              <span className="medication-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medication-frequency"
              name="frequency"
              className={[
                'medication-form__input',
                fieldErrors.frequency ? 'medication-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.frequency}
              onChange={updateField('frequency')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.frequency)}
            />
            {fieldErrors.frequency ? (
              <p className="medication-form__error" role="alert">
                {fieldErrors.frequency}
              </p>
            ) : null}
          </div>
        </div>

        <div className="medication-form__row medication-form__row--split">
          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-start-date">
              Start date{' '}
              <span className="medication-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medication-start-date"
              name="startDate"
              type="date"
              className={[
                'medication-form__input',
                fieldErrors.startDate ? 'medication-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.startDate}
              onChange={updateField('startDate')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.startDate)}
            />
            {fieldErrors.startDate ? (
              <p className="medication-form__error" role="alert">
                {fieldErrors.startDate}
              </p>
            ) : null}
          </div>

          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-end-date">
              End date
            </label>
            <input
              id="medication-end-date"
              name="endDate"
              type="date"
              className="medication-form__input"
              value={values.endDate}
              onChange={updateField('endDate')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="medication-form__row medication-form__row--split">
          <div className="medication-form__field">
            <label
              className="medication-form__label"
              htmlFor="medication-veterinarian"
            >
              Veterinarian name
            </label>
            <input
              id="medication-veterinarian"
              name="veterinarianName"
              className="medication-form__input"
              value={values.veterinarianName}
              onChange={updateField('veterinarianName')}
              disabled={isSubmitting}
            />
          </div>

          <div className="medication-form__field">
            <label className="medication-form__label" htmlFor="medication-clinic">
              Clinic name
            </label>
            <input
              id="medication-clinic"
              name="clinicName"
              className="medication-form__input"
              value={values.clinicName}
              onChange={updateField('clinicName')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="medication-form__field">
          <label className="medication-form__label" htmlFor="medication-notes">
            Notes
          </label>
          <textarea
            id="medication-notes"
            name="notes"
            className="medication-form__textarea"
            value={values.notes}
            onChange={updateField('notes')}
            disabled={isSubmitting}
          />
        </div>

        <div className="medication-form__checkbox-row">
          <input
            id="medication-is-active"
            name="isActive"
            type="checkbox"
            checked={values.isActive}
            onChange={updateField('isActive')}
            disabled={isSubmitting}
          />
          <label className="medication-form__label" htmlFor="medication-is-active">
            Active medication
          </label>
        </div>
      </div>

      <div className="medication-form__actions">
        <button
          type="submit"
          className="medication-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Create medication'}
        </button>
        <button
          type="button"
          className="medication-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
