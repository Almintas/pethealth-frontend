export const THEME_STORAGE_KEY = 'pethealth-theme';

export type ThemePreference = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system';

export function isThemePreference(value: string): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function readStoredThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isThemePreference(stored)) {
      return stored;
    }
  } catch {
    /* private mode / blocked storage */
  }
  return DEFAULT_THEME_PREFERENCE;
}

export function writeStoredThemePreference(theme: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}
