import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import type { CreateMedicalRecordInput } from '../types';
import './medical-record-form.css';

export type MedicalRecordFormValues = {
  date: string;
  type: string;
  title: string;
  description: string;
  diagnosis: string;
  veterinarianName: string;
  clinicName: string;
  notes: string;
};

type MedicalRecordFormField =
  | 'date'
  | 'type'
  | 'title'
  | 'description'
  | 'diagnosis'
  | 'veterinarianName'
  | 'clinicName'
  | 'notes';

type MedicalRecordFieldErrors = Partial<Record<MedicalRecordFormField, string>>;

const emptyMedicalRecordFormValues: MedicalRecordFormValues = {
  date: '',
  type: '',
  title: '',
  description: '',
  diagnosis: '',
  veterinarianName: '',
  clinicName: '',
  notes: '',
};

function validateMedicalRecordForm(
  values: MedicalRecordFormValues,
): MedicalRecordFieldErrors {
  const errors: MedicalRecordFieldErrors = {};

  if (!values.date) {
    errors.date = 'Date is required.';
  }
  if (!values.type.trim()) {
    errors.type = 'Type is required.';
  }
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }

  return errors;
}

function hasFieldErrors(errors: MedicalRecordFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildCreateMedicalRecordInput(
  petId: string,
  values: MedicalRecordFormValues,
): CreateMedicalRecordInput {
  const input: CreateMedicalRecordInput = {
    petId,
    date: new Date(`${values.date}T00:00:00`).toISOString(),
    type: values.type.trim(),
    title: values.title.trim(),
  };

  const description = values.description.trim();
  if (description) {
    input.description = description;
  }

  const diagnosis = values.diagnosis.trim();
  if (diagnosis) {
    input.diagnosis = diagnosis;
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

type MedicalRecordFormProps = {
  petId: string;
  onSubmit: (input: CreateMedicalRecordInput) => Promise<void>;
  onCancel: () => void;
};

export function MedicalRecordForm({
  petId,
  onSubmit,
  onCancel,
}: MedicalRecordFormProps) {
  const [values, setValues] = useState<MedicalRecordFormValues>(
    emptyMedicalRecordFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<MedicalRecordFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof MedicalRecordFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateMedicalRecordForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildCreateMedicalRecordInput(petId, values));
      setValues(emptyMedicalRecordFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="medical-record-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="medical-record-form-title"
    >
      <h3 id="medical-record-form-title" className="medical-record-form__title">
        Add medical record
      </h3>

      {formError ? (
        <p className="medical-record-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="medical-record-form__fields">
        <div className="medical-record-form__row medical-record-form__row--split">
          <div className="medical-record-form__field">
            <label className="medical-record-form__label" htmlFor="medical-record-date">
              Date <span className="medical-record-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medical-record-date"
              name="date"
              type="date"
              className={[
                'medical-record-form__input',
                fieldErrors.date ? 'medical-record-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.date}
              onChange={updateField('date')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.date)}
            />
            {fieldErrors.date ? (
              <p className="medical-record-form__error" role="alert">{fieldErrors.date}</p>
            ) : null}
          </div>

          <div className="medical-record-form__field">
            <label className="medical-record-form__label" htmlFor="medical-record-type">
              Type <span className="medical-record-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="medical-record-type"
              name="type"
              className={[
                'medical-record-form__input',
                fieldErrors.type ? 'medical-record-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.type}
              onChange={updateField('type')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.type)}
            />
            {fieldErrors.type ? (
              <p className="medical-record-form__error" role="alert">{fieldErrors.type}</p>
            ) : null}
          </div>
        </div>

        <div className="medical-record-form__field">
          <label className="medical-record-form__label" htmlFor="medical-record-title">
            Title <span className="medical-record-form__required" aria-hidden="true">*</span>
          </label>
          <input
            id="medical-record-title"
            name="title"
            className={[
              'medical-record-form__input',
              fieldErrors.title ? 'medical-record-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.title}
            onChange={updateField('title')}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(fieldErrors.title)}
          />
          {fieldErrors.title ? (
            <p className="medical-record-form__error" role="alert">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="medical-record-form__field">
          <label className="medical-record-form__label" htmlFor="medical-record-description">
            Description
          </label>
          <textarea
            id="medical-record-description"
            name="description"
            className="medical-record-form__textarea"
            value={values.description}
            onChange={updateField('description')}
            disabled={isSubmitting}
          />
        </div>

        <div className="medical-record-form__row medical-record-form__row--split">
          <div className="medical-record-form__field">
            <label className="medical-record-form__label" htmlFor="medical-record-diagnosis">
              Diagnosis
            </label>
            <input
              id="medical-record-diagnosis"
              name="diagnosis"
              className="medical-record-form__input"
              value={values.diagnosis}
              onChange={updateField('diagnosis')}
              disabled={isSubmitting}
            />
          </div>

          <div className="medical-record-form__field">
            <label className="medical-record-form__label" htmlFor="medical-record-veterinarian">
              Veterinarian name
            </label>
            <input
              id="medical-record-veterinarian"
              name="veterinarianName"
              className="medical-record-form__input"
              value={values.veterinarianName}
              onChange={updateField('veterinarianName')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="medical-record-form__field">
          <label className="medical-record-form__label" htmlFor="medical-record-clinic">
            Clinic name
          </label>
          <input
            id="medical-record-clinic"
            name="clinicName"
            className="medical-record-form__input"
            value={values.clinicName}
            onChange={updateField('clinicName')}
            disabled={isSubmitting}
          />
        </div>

        <div className="medical-record-form__field">
          <label className="medical-record-form__label" htmlFor="medical-record-notes">
            Notes
          </label>
          <textarea
            id="medical-record-notes"
            name="notes"
            className="medical-record-form__textarea"
            value={values.notes}
            onChange={updateField('notes')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="medical-record-form__actions">
        <button
          type="submit"
          className="medical-record-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Create record'}
        </button>
        <button
          type="button"
          className="medical-record-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
