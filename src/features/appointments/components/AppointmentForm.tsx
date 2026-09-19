import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import {
  AppointmentStatus,
  type AppointmentStatus as AppointmentStatusType,
  type CreateAppointmentInput,
} from '../types';
import './appointment-form.css';

export type AppointmentFormValues = {
  scheduledAt: string;
  type: string;
  clinicName: string;
  veterinarianName: string;
  reason: string;
  notes: string;
  status: AppointmentStatusType;
};

type AppointmentFormField =
  | 'scheduledAt'
  | 'type'
  | 'clinicName'
  | 'veterinarianName'
  | 'reason'
  | 'notes'
  | 'status';

type AppointmentFieldErrors = Partial<Record<AppointmentFormField, string>>;

const emptyAppointmentFormValues: AppointmentFormValues = {
  scheduledAt: '',
  type: '',
  clinicName: '',
  veterinarianName: '',
  reason: '',
  notes: '',
  status: AppointmentStatus.Scheduled,
};

const APPOINTMENT_STATUS_OPTIONS = Object.values(AppointmentStatus);

function validateAppointmentForm(
  values: AppointmentFormValues,
): AppointmentFieldErrors {
  const errors: AppointmentFieldErrors = {};

  if (!values.scheduledAt) {
    errors.scheduledAt = 'Scheduled date and time is required.';
  }

  if (!values.type.trim()) {
    errors.type = 'Appointment type is required.';
  }

  return errors;
}

function hasFieldErrors(errors: AppointmentFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildCreateAppointmentInput(
  petId: string,
  values: AppointmentFormValues,
): CreateAppointmentInput {
  const input: CreateAppointmentInput = {
    petId,
    scheduledAt: new Date(values.scheduledAt).toISOString(),
    type: values.type.trim(),
    status: values.status,
  };

  const clinicName = values.clinicName.trim();
  if (clinicName) {
    input.clinicName = clinicName;
  }

  const veterinarianName = values.veterinarianName.trim();
  if (veterinarianName) {
    input.veterinarianName = veterinarianName;
  }

  const reason = values.reason.trim();
  if (reason) {
    input.reason = reason;
  }

  const notes = values.notes.trim();
  if (notes) {
    input.notes = notes;
  }

  return input;
}

type AppointmentFormProps = {
  petId: string;
  onSubmit: (input: CreateAppointmentInput) => Promise<void>;
  onCancel: () => void;
  variant?: 'inline' | 'dialog';
};

export function AppointmentForm({
  petId,
  onSubmit,
  onCancel,
  variant = 'inline',
}: AppointmentFormProps) {
  const isDialog = variant === 'dialog';
  const [values, setValues] = useState<AppointmentFormValues>(
    emptyAppointmentFormValues,
  );
  const [fieldErrors, setFieldErrors] = useState<AppointmentFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof AppointmentFormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validateAppointmentForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildCreateAppointmentInput(petId, values));
      setValues(emptyAppointmentFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'save-appointment'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={[
        'appointment-form',
        isDialog ? 'appointment-form--dialog' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={isDialog ? undefined : 'appointment-form-title'}
    >
      {!isDialog ? (
        <h3 id="appointment-form-title" className="appointment-form__title">
          Add appointment
        </h3>
      ) : null}

      {formError ? (
        <p className="appointment-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="appointment-form__fields">
        <div className="appointment-form__row appointment-form__row--split">
          <div className="appointment-form__field">
            <label
              className="appointment-form__label"
              htmlFor="appointment-scheduled-at"
            >
              Scheduled date &amp; time{' '}
              <span className="appointment-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="appointment-scheduled-at"
              name="scheduledAt"
              type="datetime-local"
              className={[
                'appointment-form__input',
                fieldErrors.scheduledAt ? 'appointment-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.scheduledAt}
              onChange={updateField('scheduledAt')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.scheduledAt)}
            />
            {fieldErrors.scheduledAt ? (
              <p className="appointment-form__error" role="alert">
                {fieldErrors.scheduledAt}
              </p>
            ) : null}
          </div>

          <div className="appointment-form__field">
            <label className="appointment-form__label" htmlFor="appointment-type">
              Appointment type{' '}
              <span className="appointment-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="appointment-type"
              name="type"
              className={[
                'appointment-form__input',
                fieldErrors.type ? 'appointment-form__input--error' : '',
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
              <p className="appointment-form__error" role="alert">{fieldErrors.type}</p>
            ) : null}
          </div>
        </div>

        <div className="appointment-form__field">
          <label className="appointment-form__label" htmlFor="appointment-status">
            Status
          </label>
          <select
            id="appointment-status"
            name="status"
            className="appointment-form__select"
            value={values.status}
            onChange={updateField('status')}
            disabled={isSubmitting}
          >
            {APPOINTMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="appointment-form__row appointment-form__row--split">
          <div className="appointment-form__field">
            <label className="appointment-form__label" htmlFor="appointment-clinic">
              Clinic
            </label>
            <input
              id="appointment-clinic"
              name="clinicName"
              className="appointment-form__input"
              value={values.clinicName}
              onChange={updateField('clinicName')}
              disabled={isSubmitting}
            />
          </div>

          <div className="appointment-form__field">
            <label
              className="appointment-form__label"
              htmlFor="appointment-veterinarian"
            >
              Veterinarian
            </label>
            <input
              id="appointment-veterinarian"
              name="veterinarianName"
              className="appointment-form__input"
              value={values.veterinarianName}
              onChange={updateField('veterinarianName')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="appointment-form__field">
          <label className="appointment-form__label" htmlFor="appointment-reason">
            Reason
          </label>
          <input
            id="appointment-reason"
            name="reason"
            className="appointment-form__input"
            value={values.reason}
            onChange={updateField('reason')}
            disabled={isSubmitting}
          />
        </div>

        <div className="appointment-form__field">
          <label className="appointment-form__label" htmlFor="appointment-notes">
            Notes
          </label>
          <textarea
            id="appointment-notes"
            name="notes"
            className="appointment-form__textarea"
            value={values.notes}
            onChange={updateField('notes')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="appointment-form__actions">
        <button
          type="submit"
          className="appointment-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Create appointment'}
        </button>
        <button
          type="button"
          className="appointment-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
