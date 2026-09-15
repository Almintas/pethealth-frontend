import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { BrandMark } from '../components/BrandMark';
import { useAuth } from '../features/auth';
import './authenticated-layout.css';

const navItems: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/pets', label: 'My Pets' },
  { to: '/appointments', label: 'Appointments' },
  { to: '/reminders', label: 'Reminders' },
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
              Pet wellness hub
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
