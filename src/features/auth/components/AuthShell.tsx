import type { ReactNode } from 'react';
import { BrandMark } from '../../../components/BrandMark';
import './auth-ui.css';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <aside className="auth-shell__brand" aria-label="PetHealth">
        <div className="auth-shell__brand-inner">
          <div className="auth-shell__logo">
            <BrandMark size="md" />
          </div>
          <h1 className="auth-shell__brand-title">PetHealth</h1>
          <p className="auth-shell__brand-copy">
            Keep your pet&apos;s health history in one place.
          </p>
        </div>
      </aside>
      <div className="auth-shell__panel">
        <div className="auth-card">
          <h2 className="auth-card__title">{title}</h2>
          <p className="auth-card__subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
