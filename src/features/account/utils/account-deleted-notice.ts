/**
 * Carries the 'your account was deleted' notice across the logout redirect.
 * Logging out unmounts the settings page and the route guard sends the user
 * to plain /login, so a query parameter alone can be lost.
 */
const KEY = 'pethealth.accountDeletedNotice';

export function rememberAccountDeletedNotice(): void {
  try {
    window.sessionStorage.setItem(KEY, '1');
  } catch {
    // Storage can be unavailable (private mode); the query parameter still works.
  }
}

export function hasAccountDeletedNotice(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function clearAccountDeletedNotice(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
