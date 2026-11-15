import type { ReactNode } from 'react';
import './empty-state.css';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" focusable="false">
          <circle cx="24" cy="24" r="22" className="empty-state__icon-ring" />
          <path
            d="M16 24h16M24 16v16"
            className="empty-state__icon-mark"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </div>
  );
}
