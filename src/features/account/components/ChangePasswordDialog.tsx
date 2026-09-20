import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { getAuthErrorMessage } from '../../auth/utils/get-auth-error-message';
import '../../appointments/components/appointment-dialog.css';

type ChangePasswordDialogProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
};

export function ChangePasswordDialog({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ChangePasswordDialogProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!currentPassword) {
      setFormError('Current password is required.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirmation do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setFormError('New password must be different from your current password.');
      return;
    }

    try {
      await onSubmit({ currentPassword, newPassword, confirmPassword });
    } catch (error) {
      setFormError(getAuthErrorMessage(error, 'auth'));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="appointment-dialog" role="presentation">
      <button
        type="button"
        className="appointment-dialog__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={isSubmitting}
      />
      <div
        className="appointment-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="appointment-dialog__header">
          <h3 id={titleId} className="appointment-dialog__title">
            Change password
          </h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="appointment-dialog__close"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            ×
          </button>
        </header>
        <div className="appointment-dialog__body">
          <form className="ph-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
            {formError ? (
              <p className="ph-form__alert" role="alert">{formError}</p>
            ) : null}

            <div className="ph-form__fields">
              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="change-password-current">
                  Current password
                </label>
                <input
                  id="change-password-current"
                  type="password"
                  className="ph-form__input"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="change-password-new">
                  New password
                </label>
                <input
                  id="change-password-new"
                  type="password"
                  className="ph-form__input"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="ph-form__field">
                <label className="ph-form__label" htmlFor="change-password-confirm">
                  Confirm new password
                </label>
                <input
                  id="change-password-confirm"
                  type="password"
                  className="ph-form__input"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="ph-form__actions">
              <button
                type="submit"
                className="ph-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Changing…' : 'Change password'}
              </button>
              <button
                type="button"
                className="ph-form__cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
