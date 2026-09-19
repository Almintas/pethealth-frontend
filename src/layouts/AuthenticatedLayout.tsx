import { useState, type ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../features/auth';
import './authenticated-layout.css';

const navItems: Array<{
  to: string;
  label: string;
  end?: boolean;
  icon: ReactNode;
}> = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    to: '/pets',
    label: 'My Pets',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M4.5 18c1.2-2.5 3.4-4 7.5-4s6.3 1.5 7.5 4" />
      </svg>
    ),
  },
];

export function AuthenticatedLayout() {
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

  const userInitials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.trim();

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
          Menu
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
              Owner portal
            </div>
          </div>
        </div>

        <nav className="authenticated-layout__nav" aria-label="Main">
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
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="authenticated-layout__user">
          <div className="authenticated-layout__user-avatar" aria-hidden="true">
            {userInitials || 'U'}
          </div>
          <div className="authenticated-layout__user-meta">
            <div className="authenticated-layout__user-name">
              {user?.firstName} {user?.lastName}
            </div>
            {user?.role ? (
              <div className="authenticated-layout__user-role">{user.role}</div>
            ) : null}
            <div className="authenticated-layout__user-email">{user?.email}</div>
          </div>
          <button
            type="button"
            className="authenticated-layout__logout"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>

      {isMobileNavOpen ? (
        <button
          type="button"
          className="authenticated-layout__backdrop"
          aria-label="Close navigation"
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
