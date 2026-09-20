import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { BrandMark } from '../components/BrandMark';
import { LanguageSelector } from '../components/LanguageSelector';
import { useAuth } from '../features/auth';
import { SidebarUserMenu } from './SidebarUserMenu';
import '../components/language-selector.css';
import './authenticated-layout.css';

const navItems: Array<{
  to: string;
  labelKey: 'navigation.dashboard' | 'navigation.myPets';
  end?: boolean;
  icon: ReactNode;
}> = [
  {
    to: '/dashboard',
    labelKey: 'navigation.dashboard',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    to: '/pets',
    labelKey: 'navigation.myPets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M4.5 18c1.2-2.5 3.4-4 7.5-4s6.3 1.5 7.5 4" />
      </svg>
    ),
  },
];

export function AuthenticatedLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      void navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="authenticated-layout">
      <button
        type="button"
        className="authenticated-layout__mobile-toggle"
        aria-expanded={isMobileNavOpen}
        aria-controls="app-sidebar"
        onClick={() => setIsMobileNavOpen((open) => !open)}
      >
        <span className="authenticated-layout__mobile-toggle-bar" />
        <span className="authenticated-layout__mobile-toggle-bar" />
        <span className="authenticated-layout__mobile-toggle-bar" />
        <span className="authenticated-layout__mobile-toggle-label">
          {t('common.menu')}
        </span>
      </button>

      <aside
        id="app-sidebar"
        className={[
          'authenticated-layout__sidebar',
          isMobileNavOpen ? 'authenticated-layout__sidebar--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="authenticated-layout__brand">
          <BrandMark size="sm" />
          <div>
            <div className="authenticated-layout__brand-name">PetHealth</div>
            <div className="authenticated-layout__brand-tagline">
              {t('common.brandTagline')}
            </div>
          </div>
        </div>

        <nav className="authenticated-layout__nav" aria-label={t('common.mainNav')}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className="authenticated-layout__link"
              to={item.to}
              end={item.end}
              onClick={() => setIsMobileNavOpen(false)}
            >
              <span className="authenticated-layout__link-icon" aria-hidden="true">
                {item.icon}
              </span>
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="authenticated-layout__user">
          <LanguageSelector />
          <SidebarUserMenu
            user={user}
            isLoggingOut={isLoggingOut}
            onLogout={handleLogout}
            onAfterAction={() => setIsMobileNavOpen(false)}
          />
        </div>
      </aside>

      {isMobileNavOpen ? (
        <button
          type="button"
          className="authenticated-layout__backdrop"
          aria-label={t('common.closeNavigation')}
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <div className="authenticated-layout__main">
        <main className="authenticated-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
