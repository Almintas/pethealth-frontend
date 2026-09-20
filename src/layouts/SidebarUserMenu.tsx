import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { AuthUser } from '../features/auth/types';

type SidebarUserMenuProps = {
  user: AuthUser | null;
  isLoggingOut: boolean;
  onLogout: () => void | Promise<void>;
  onAfterAction?: () => void;
};

function getUserInitials(user: AuthUser | null): string {
  const initials =
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.trim();
  return initials || 'U';
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
      />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={[
        'sidebar-user-menu__chevron',
        isOpen ? 'sidebar-user-menu__chevron--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SidebarUserMenu({
  user,
  isLoggingOut,
  onLogout,
  onAfterAction,
}: SidebarUserMenuProps) {
  const navigate = useNavigate();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!rootRef.current?.contains(target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  const handleNavigate = (path: string) => {
    closeMenu();
    onAfterAction?.();
    void navigate(path);
  };

  const handleSignOut = () => {
    closeMenu();
    onAfterAction?.();
    void onLogout();
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Account';
  const email = user?.email ?? '';

  return (
    <div className="sidebar-user-menu" ref={rootRef}>
      {isOpen ? (
        <div
          id={menuId}
          className="sidebar-user-menu__panel"
          role="menu"
          aria-label="Account menu"
        >
          <button
            type="button"
            role="menuitem"
            className="sidebar-user-menu__item"
            onClick={() => handleNavigate('/profile')}
          >
            <span className="sidebar-user-menu__item-icon">
              <ProfileIcon />
            </span>
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            className="sidebar-user-menu__item"
            onClick={() => handleNavigate('/settings')}
          >
            <span className="sidebar-user-menu__item-icon">
              <SettingsIcon />
            </span>
            Settings
          </button>
          <div className="sidebar-user-menu__separator" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="sidebar-user-menu__item sidebar-user-menu__item--danger"
            onClick={handleSignOut}
            disabled={isLoggingOut}
          >
            <span className="sidebar-user-menu__item-icon">
              <SignOutIcon />
            </span>
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className="sidebar-user-menu__trigger"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggleMenu}
        disabled={isLoggingOut}
      >
        <span className="sidebar-user-menu__avatar" aria-hidden="true">
          {getUserInitials(user)}
        </span>
        <span className="sidebar-user-menu__text">
          <span className="sidebar-user-menu__name">{displayName}</span>
          {email ? (
            <span className="sidebar-user-menu__email" title={email}>{email}</span>
          ) : null}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>
    </div>
  );
}
