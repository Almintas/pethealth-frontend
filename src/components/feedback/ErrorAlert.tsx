import './feedback.css';

type ErrorAlertProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
};

export function ErrorAlert({
  message,
  title,
  onRetry,
  retryLabel = 'Try again',
  compact = false,
}: ErrorAlertProps) {
  return (
    <div
      className={[
        'ph-feedback',
        'ph-error-alert',
        compact ? 'ph-error-alert--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      {title ? <p className="ph-error-alert__title">{title}</p> : null}
      <p className="ph-error-alert__message">{message}</p>
      {onRetry ? (
        <div className="ph-error-alert__actions">
          <button type="button" className="ph-error-alert__retry" onClick={onRetry}>
            {retryLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
