import type { AppLanguage } from './language-storage';

export function toIntlLocale(language: string): string {
  return language === 'lt' ? 'lt-LT' : 'en-US';
}

export function getIntlLocaleForLanguage(language: AppLanguage): string {
  return toIntlLocale(language);
}
