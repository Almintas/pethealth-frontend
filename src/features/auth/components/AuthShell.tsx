import type { ReactNode } from 'react';
import './auth-ui.css';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
