import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './vaccination-dialog.css';

type VaccinationDialogProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function VaccinationDialog({
  isOpen,
  title,
  onClose,
  children,
}: VaccinationDialogProps) {
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
    <div className="vaccination-dialog" role="presentation">
      <button
        type="button"
        className="vaccination-dialog__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="vaccination-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className="vaccination-dialog__header">
          <h3 id={titleId} className="vaccination-dialog__title">{title}</h3>
          <button
            ref={closeButtonRef}
            type="button"
            className="vaccination-dialog__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="vaccination-dialog__body">{children}</div>
      </div>
    </div>
  );
}
