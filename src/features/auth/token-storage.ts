const ACCESS_TOKEN_KEY = 'pethealth.accessToken';

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    // Storage can be unavailable (private mode, quota); the session then
    // only lasts until the page is reloaded.
  }
}

export function clearAccessToken(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

/** Subscribe to "the API rejected our token" events. Returns an unsubscribe. */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

/**
 * Called when an authenticated request is rejected because the token is
 * expired, revoked, or belongs to a deleted user.
 */
export function notifySessionExpired(): void {
  if (!getAccessToken()) {
    return;
  }
  clearAccessToken();
  sessionExpiredListeners.forEach((listener) => listener());
}
