import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  datetimeLocalInputToIso,
  isoToDatetimeLocalInput,
} from '../../../utils/datetime-local-input';
import { useEnumLabels } from '../../../i18n/useEnumLabels';
import { i18n } from '../../../i18n';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import {
  DEFAULT_APPOINTMENT_TYPE,
  normalizeAppointmentTypeValue,
  type AppointmentTypeValue,
} from '../constants/appointment-types';
import {
  AppointmentStatus,
  type Appointment,
  type AppointmentStatus as AppointmentStatusType,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from '../types';
import './appointment-form.css';

export type AppointmentFormValues = {
  scheduledAt: string;
  type: AppointmentTypeValue;
  clinicName: string;
  veterinarianName: string;
  reason: string;
  status: AppointmentStatusType;
};

type AppointmentFormField =
  | 'scheduledAt'
  | 'type'
  | 'clinicName'
  | 'veterinarianName'
  | 'reason'
  | 'status';

type AppointmentFieldErrors = Partial<Record<AppointmentFormField, string>>;

const emptyAppointmentFormValues: AppointmentFormValues = {
  scheduledAt: '',
  type: DEFAULT_APPOINTMENT_TYPE,
  clinicName: '',
  veterinarianName: '',
  reason: '',
  status: AppointmentStatus.Scheduled,
};

const APPOINTMENT_STATUS_OPTIONS = Object.values(AppointmentStatus);

function validateAppointmentForm(
  values: AppointmentFormValues,
): AppointmentFieldErrors {
  const errors: AppointmentFieldErrors = {};

  if (!values.scheduledAt) {
    errors.scheduledAt = `${i18n.t('appointments.dateTime')}: ${i18n.t('common.required')}`;
  }

  if (!values.type) {
    errors.type = `${i18n.t('appointments.type')}: ${i18n.t('common.required')}`;
  }

  if (!values.reason.trim()) {
    errors.reason = `${i18n.t('appointments.reason')}: ${i18n.t('common.required')}`;
  }

  return errors;
}

function hasFieldErrors(errors: AppointmentFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function appointmentToFormValues(appointment: Appointment): AppointmentFormValues {
  return {
    scheduledAt: isoToDatetimeLocalInput(appointment.scheduledAt),
    type: normalizeAppointmentTypeValue(appointment.type),
    clinicName: appointment.clinicName ?? '',
    veterinarianName: appointment.veterinarianName ?? '',
    reason: appointment.reason ?? '',
    status: appointment.status,
  };
}

export function buildCreateAppointmentInput(
  petId: string,
  values: AppointmentFormValues,
): CreateAppointmentInput {
  const input: CreateAppointmentInput = {
    petId,
    scheduledAt: datetimeLocalInputToIso(values.scheduledAt),
    type: values.type,
    reason: values.reason.trim(),
  };

  const clinicName = values.clinicName.trim();
  if (clinicName) {
    input.clinicName = clinicName;
  }

  const veterinarianName = values.veterinarianName.trim();
  if (veterinarianName) {
    input.veterinarianName = veterinarianName;
  }

  return input;
}

export function buildUpdateAppointmentInput(
  values: AppointmentFormValues,
): UpdateAppointmentInput {
  return {
    scheduledAt: datetimeLocalInputToIso(values.scheduledAt),
    type: values.type,
    status: values.status,
    clinicName: values.clinicName.trim(),
    veterinarianName: values.veterinarianName.trim(),
    reason: values.reason.trim(),
  };
}

export type AppointmentFormMode = 'create' | 'edit';

type AppointmentFormProps = {
  petId: string;
  mode: AppointmentFormMode;
  appointment?: Appointment;
  onCreate: (input: CreateAppointmentInput) => Promise<void>;
  onUpdate?: (id: string, input: UpdateAppointmentInput) => Promise<void>;
  onCancel: () => void;
  variant?: 'inline' | 'dialog';
};

function getInitialAppointmentFormValues(
  mode: AppointmentFormMode,
  appointment?: Appointment,
): AppointmentFormValues {
  if (mode === 'edit' && appointment) {
    return appointmentToFormValues(appointment);
  }

  return emptyAppointmentFormValues;
}

export function AppointmentForm({
  petId,
  mode,
  appointment,
  onCreate,
  onUpdate,
  onCancel,
  variant = 'inline',
}: AppointmentFormProps) {
  const { t } = useTranslation();
  const { appointmentStatus, appointmentTypeOptions } = useEnumLabels();
  const isDialog = variant === 'dialog';
  const isEdit = mode === 'edit';
  const [values, setValues] = useState<AppointmentFormValues>(() =>
    getInitialAppointmentFormValues(mode, appointment),
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
      if (isEdit) {
        if (!appointment?.id || !onUpdate) {
          throw new Error('Appointment is missing.');
        }
        await onUpdate(appointment.id, buildUpdateAppointmentInput(values));
      } else {
        await onCreate(buildCreateAppointmentInput(petId, values));
        setValues(emptyAppointmentFormValues);
      }
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
          {isEdit ? t('appointments.editTitle') : t('appointments.createTitle')}
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
              {t('appointments.dateTime')}{' '}
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
              {t('appointments.type')}{' '}
              <span className="appointment-form__required" aria-hidden="true">*</span>
            </label>
            <select
              id="appointment-type"
              name="type"
              className={[
                'appointment-form__select',
                fieldErrors.type ? 'appointment-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.type}
              onChange={updateField('type')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.type)}
            >
              {appointmentTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.type ? (
              <p className="appointment-form__error" role="alert">{fieldErrors.type}</p>
            ) : null}
          </div>
        </div>

        {isEdit ? (
          <div className="appointment-form__field">
            <label className="appointment-form__label" htmlFor="appointment-status">
              {t('appointments.status')}
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
                <option key={status} value={status}>
                  {appointmentStatus(status)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="appointment-form__row appointment-form__row--split">
          <div className="appointment-form__field">
            <label className="appointment-form__label" htmlFor="appointment-clinic">
              {t('appointments.clinic')}
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
              {t('appointments.veterinarian')}
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
            {t('appointments.reason')}{' '}
            <span className="appointment-form__required" aria-hidden="true">*</span>
          </label>
          <input
            id="appointment-reason"
            name="reason"
            className={[
              'appointment-form__input',
              fieldErrors.reason ? 'appointment-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={values.reason}
            onChange={updateField('reason')}
            disabled={isSubmitting}
            required
            aria-invalid={Boolean(fieldErrors.reason)}
          />
          {fieldErrors.reason ? (
            <p className="appointment-form__error" role="alert">{fieldErrors.reason}</p>
          ) : null}
        </div>
      </div>

      <div className="appointment-form__actions">
        <button
          type="submit"
          className="appointment-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t('common.saving')
            : isEdit
              ? t('profile.saveChanges')
              : t('appointments.add')}
        </button>
        <button
          type="button"
          className="appointment-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
