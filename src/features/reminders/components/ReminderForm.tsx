import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import {
  ReminderType,
  SourceType,
  type CreateReminderInput,
  type ReminderType as ReminderTypeValue,
  type SourceType as SourceTypeValue,
} from '../types';
import './reminder-form.css';

const NO_SOURCE_VALUE = '';

export type ReminderFormValues = {
  type: ReminderTypeValue;
  title: string;
  message: string;
  dueAt: string;
  sourceType: SourceTypeValue | typeof NO_SOURCE_VALUE;
  sourceId: string;
};

type ReminderFormField =
  | 'type'
  | 'title'
  | 'message'
  | 'dueAt'
  | 'sourceType'
  | 'sourceId';

type ReminderFieldErrors = Partial<Record<ReminderFormField, string>>;

const emptyReminderFormValues: ReminderFormValues = {
  type: ReminderType.General,
  title: '',
  message: '',
  dueAt: '',
  sourceType: NO_SOURCE_VALUE,
  sourceId: '',
};

const REMINDER_TYPE_OPTIONS = Object.values(ReminderType);
const SOURCE_TYPE_OPTIONS = Object.values(SourceType);

function validateReminderForm(values: ReminderFormValues): ReminderFieldErrors {
  const errors: ReminderFieldErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!values.dueAt) {
    errors.dueAt = 'Due date and time is required.';
  }

  if (values.sourceType && !values.sourceId.trim()) {
    errors.sourceId = 'Source id is required when source type is selected.';
  }

  return errors;
}

function hasFieldErrors(errors: ReminderFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildCreateReminderInput(
  petId: string,
  values: ReminderFormValues,
): CreateReminderInput {
  const input: CreateReminderInput = {
    petId,
    type: values.type,
    title: values.title.trim(),
    dueAt: new Date(values.dueAt).toISOString(),
  };

  const message = values.message.trim();
  if (message) {
    input.message = message;
  }

  if (values.sourceType) {
    input.sourceType = values.sourceType;
    input.sourceId = values.sourceId.trim();
  }

  return input;
}

type ReminderFormProps = {
  petId: string;
  onSubmit: (input: CreateReminderInput) => Promise<void>;
  onCancel: () => void;
};

export function ReminderForm({ petId, onSubmit, onCancel }: ReminderFormProps) {
  const [values, setValues] = useState<ReminderFormValues>(emptyReminderFormValues);
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
      const nextValue = event.target.value;
      setValues((current) => {
        if (field === 'sourceType') {
          return {
            ...current,
            sourceType: nextValue as ReminderFormValues['sourceType'],
            sourceId: nextValue ? current.sourceId : '',
          };
        }
        return { ...current, [field]: nextValue };
      });
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
      await onSubmit(buildCreateReminderInput(petId, values));
      setValues(emptyReminderFormValues);
      setFieldErrors({});
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="reminder-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="reminder-form-title"
    >
      <h3 id="reminder-form-title" className="reminder-form__title">
        Add reminder
      </h3>

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
                <option key={type} value={type}>{type}</option>
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

        <div className="reminder-form__row reminder-form__row--split">
          <div className="reminder-form__field">
            <label className="reminder-form__label" htmlFor="reminder-source-type">
              Source type
            </label>
            <select
              id="reminder-source-type"
              name="sourceType"
              className="reminder-form__select"
              value={values.sourceType}
              onChange={updateField('sourceType')}
              disabled={isSubmitting}
            >
              <option value={NO_SOURCE_VALUE}>None</option>
              {SOURCE_TYPE_OPTIONS.map((sourceType) => (
                <option key={sourceType} value={sourceType}>{sourceType}</option>
              ))}
            </select>
          </div>

          <div className="reminder-form__field">
            <label className="reminder-form__label" htmlFor="reminder-source-id">
              Source id
            </label>
            <input
              id="reminder-source-id"
              name="sourceId"
              className={[
                'reminder-form__input',
                fieldErrors.sourceId ? 'reminder-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              value={values.sourceId}
              onChange={updateField('sourceId')}
              disabled={isSubmitting || !values.sourceType}
              aria-invalid={Boolean(fieldErrors.sourceId)}
            />
            {fieldErrors.sourceId ? (
              <p className="reminder-form__error" role="alert">{fieldErrors.sourceId}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="reminder-form__actions">
        <button
          type="submit"
          className="reminder-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Create reminder'}
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
