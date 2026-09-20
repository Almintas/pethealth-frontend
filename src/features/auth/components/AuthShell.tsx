import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BrandMark } from '../../../components/BrandMark';
import { LanguageSelector } from '../../../components/LanguageSelector';
import './auth-ui.css';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { t } = useTranslation();

  return (
    <div className="auth-shell">
      <LanguageSelector className="auth-shell__language" />
      <aside className="auth-shell__brand" aria-label="PetHealth">
        <div className="auth-shell__brand-inner">
          <div className="auth-shell__logo">
            <BrandMark size="md" />
          </div>
          <h1 className="auth-shell__brand-title">PetHealth</h1>
          <p className="auth-shell__brand-copy">{t('common.brandTaglineAuth')}</p>
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
