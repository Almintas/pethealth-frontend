import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  datetimeLocalInputToIso,
  isoToDatetimeLocalInput,
} from '../../../utils/datetime-local-input';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import { REMINDER_TYPE_LABELS } from '../constants/reminder-type-labels';
import {
  ReminderType,
  type CreateReminderInput,
  type Reminder,
  type ReminderType as ReminderTypeValue,
  type UpdateReminderInput,
} from '../types';
import './reminder-form.css';

export type ReminderFormValues = {
  type: ReminderTypeValue;
  title: string;
  message: string;
  dueAt: string;
};

type ReminderFormField = 'type' | 'title' | 'message' | 'dueAt';

type ReminderFieldErrors = Partial<Record<ReminderFormField, string>>;

const emptyReminderFormValues: ReminderFormValues = {
  type: ReminderType.General,
  title: '',
  message: '',
  dueAt: '',
};

const REMINDER_TYPE_OPTIONS = Object.values(ReminderType);

function validateReminderForm(values: ReminderFormValues): ReminderFieldErrors {
  const errors: ReminderFieldErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!values.dueAt) {
    errors.dueAt = 'Due date and time is required.';
  }

  return errors;
}

function hasFieldErrors(errors: ReminderFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function reminderToFormValues(reminder: Reminder): ReminderFormValues {
  return {
    type: reminder.type,
    title: reminder.title,
    message: reminder.message ?? '',
    dueAt: isoToDatetimeLocalInput(reminder.dueAt),
  };
}

export function buildCreateReminderInput(
  petId: string,
  values: ReminderFormValues,
): CreateReminderInput {
  const input: CreateReminderInput = {
    petId,
    type: values.type,
    title: values.title.trim(),
    dueAt: datetimeLocalInputToIso(values.dueAt),
  };

  const message = values.message.trim();
  if (message) {
    input.message = message;
  }

  return input;
}

export function buildUpdateReminderInput(
  values: ReminderFormValues,
): UpdateReminderInput {
  const input: UpdateReminderInput = {
    type: values.type,
    title: values.title.trim(),
    dueAt: datetimeLocalInputToIso(values.dueAt),
  };

  const message = values.message.trim();
  if (message) {
    input.message = message;
  } else {
    input.message = '';
  }

  return input;
}

export type ReminderFormMode = 'create' | 'edit';

type ReminderFormProps = {
  petId: string;
  mode: ReminderFormMode;
  reminder?: Reminder;
  onCreate: (input: CreateReminderInput) => Promise<void>;
  onUpdate?: (id: string, input: UpdateReminderInput) => Promise<void>;
  onCancel: () => void;
  variant?: 'inline' | 'dialog';
};

function getInitialReminderFormValues(
  mode: ReminderFormMode,
  reminder?: Reminder,
): ReminderFormValues {
  if (mode === 'edit' && reminder) {
    return reminderToFormValues(reminder);
  }

  return emptyReminderFormValues;
}

export function ReminderForm({
  petId,
  mode,
  reminder,
  onCreate,
  onUpdate,
  onCancel,
  variant = 'inline',
}: ReminderFormProps) {
  const isDialog = variant === 'dialog';
  const isEdit = mode === 'edit';
  const [values, setValues] = useState<ReminderFormValues>(() =>
    getInitialReminderFormValues(mode, reminder),
  );
  const [fieldErrors, setFieldErrors] = useState<ReminderFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof ReminderFormValues) =>
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

    const validationErrors = validateReminderForm(values);
    setFieldErrors(validationErrors);
    if (hasFieldErrors(validationErrors)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        if (!reminder?.id || !onUpdate) {
          throw new Error('Reminder is missing.');
        }
        await onUpdate(reminder.id, buildUpdateReminderInput(values));
      } else {
        await onCreate(buildCreateReminderInput(petId, values));
        setValues(emptyReminderFormValues);
      }
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'save-reminder'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className={[
        'reminder-form',
        isDialog ? 'reminder-form--dialog' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={isDialog ? undefined : 'reminder-form-title'}
    >
      {!isDialog ? (
        <h3 id="reminder-form-title" className="reminder-form__title">
          {isEdit ? 'Edit reminder' : 'Add reminder'}
        </h3>
      ) : null}

      {formError ? (
        <p className="reminder-form__alert" role="alert">{formError}</p>
      ) : null}

      <div className="reminder-form__fields">
        <div className="reminder-form__row reminder-form__row--split">
          <div className="reminder-form__field">
            <label className="reminder-form__label" htmlFor="reminder-type">
              Reminder type{' '}
              <span className="reminder-form__required" aria-hidden="true">*</span>
            </label>
            <select
              id="reminder-type"
              name="type"
              className="reminder-form__select"
              value={values.type}
              onChange={updateField('type')}
              disabled={isSubmitting}
              required
            >
              {REMINDER_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {REMINDER_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          <div className="reminder-form__field">
            <label className="reminder-form__label" htmlFor="reminder-due-at">
              Due date &amp; time{' '}
              <span className="reminder-form__required" aria-hidden="true">*</span>
            </label>
            <input
              id="reminder-due-at"
              name="dueAt"
              type="datetime-local"
              className={[
                'reminder-form__input',
                fieldErrors.dueAt ? 'reminder-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.dueAt}
              onChange={updateField('dueAt')}
              disabled={isSubmitting}
              required
              aria-invalid={Boolean(fieldErrors.dueAt)}
            />
            {fieldErrors.dueAt ? (
              <p className="reminder-form__error" role="alert">{fieldErrors.dueAt}</p>
            ) : null}
          </div>
        </div>

        <div className="reminder-form__field">
          <label className="reminder-form__label" htmlFor="reminder-title">
            Title <span className="reminder-form__required" aria-hidden="true">*</span>
          </label>
          <input
            id="reminder-title"
            name="title"
            className={[
              'reminder-form__input',
              fieldErrors.title ? 'reminder-form__input--error' : '',
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
            <p className="reminder-form__error" role="alert">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="reminder-form__field">
          <label className="reminder-form__label" htmlFor="reminder-message">
            Message
          </label>
          <textarea
            id="reminder-message"
            name="message"
            className="reminder-form__textarea"
            value={values.message}
            onChange={updateField('message')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="reminder-form__actions">
        <button
          type="submit"
          className="reminder-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving…'
            : isEdit
              ? 'Save changes'
              : 'Create reminder'}
        </button>
        <button
          type="button"
          className="reminder-form__cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
