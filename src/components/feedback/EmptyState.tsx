import { Link } from 'react-router';
import './feedback.css';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  section?: boolean;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  section = false,
}: EmptyStateProps) {
  const action =
    actionLabel && onAction ? (
      <button type="button" className="ph-empty-state__action" onClick={onAction}>
        {actionLabel}
      </button>
    ) : actionLabel && actionHref ? (
      <Link className="ph-empty-state__action" to={actionHref}>
        {actionLabel}
      </Link>
    ) : null;

  return (
    <div
      className={[
        'ph-feedback',
        'ph-empty-state',
        section ? 'ph-empty-state--section' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="ph-empty-state__title">{title}</h3>
      {description ? (
        <p className="ph-empty-state__description">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
