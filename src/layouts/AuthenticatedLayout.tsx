import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../features/auth';
import './authenticated-layout.css';

export function AuthenticatedLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      <header className="authenticated-layout__header">
        <div className="authenticated-layout__brand">PetHealth</div>
        <nav className="authenticated-layout__nav" aria-label="Main">
          <NavLink
            className="authenticated-layout__link"
            to="/dashboard"
            end
          >
            Dashboard
          </NavLink>
          <NavLink className="authenticated-layout__link" to="/pets">
            Pets
          </NavLink>
          <button
            type="button"
            className="authenticated-layout__logout"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Signing out…' : 'Logout'}
          </button>
        </nav>
      </header>
      <main className="authenticated-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
