import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import lt from './locales/lt';
import {
  DEFAULT_LANGUAGE,
  readStoredLanguage,
  writeStoredLanguage,
  type AppLanguage,
} from './language-storage';

const initialLanguage = readStoredLanguage();

function applyDocumentLanguage(language: AppLanguage): void {
  document.documentElement.lang = language;
}

applyDocumentLanguage(initialLanguage);

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    lt: { translation: lt },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ['en', 'lt'],
  nonExplicitSupportedLngs: true,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

i18n.on('languageChanged', (language) => {
  const normalized = language === 'lt' ? 'lt' : 'en';
  writeStoredLanguage(normalized);
  applyDocumentLanguage(normalized);
});

export function changeAppLanguage(language: AppLanguage): void {
  void i18n.changeLanguage(language);
}

export { i18n };
export type { AppLanguage } from './language-storage';
export { readStoredLanguage, writeStoredLanguage, DEFAULT_LANGUAGE } from './language-storage';
export { toIntlLocale, getIntlLocaleForLanguage } from './app-locale';
