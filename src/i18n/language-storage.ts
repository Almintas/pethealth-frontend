export const LANGUAGE_STORAGE_KEY = 'pethealth-language';

export type AppLanguage = 'en' | 'lt';

export const DEFAULT_LANGUAGE: AppLanguage = 'en';

export function isAppLanguage(value: string): value is AppLanguage {
  return value === 'en' || value === 'lt';
}

export function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isAppLanguage(stored)) {
      return stored;
    }
  } catch {
    /* private mode */
  }
  return DEFAULT_LANGUAGE;
}

export function writeStoredLanguage(language: AppLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* ignore */
  }
}
