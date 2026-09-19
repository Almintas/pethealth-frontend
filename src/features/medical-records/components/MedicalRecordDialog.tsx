import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './medical-record-dialog.css';

type MedicalRecordDialogProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function MedicalRecordDialog({
  isOpen,
  title,
  onClose,
  children,
}: MedicalRecordDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="medical-record-dialog" role="presentation">
      <button
        type="button"
        className="medical-record-dialog__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="medical-record-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="medical-record-dialog__header">
          <h3 id={titleId} className="medical-record-dialog__title">{title}</h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="medical-record-dialog__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="medical-record-dialog__body">{children}</div>
      </div>
    </div>
  );
}
