import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import zh from './locales/zh';

const LANGUAGE_KEY = 'offermind-language';

// Get saved language or default to English
const getSavedLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(LANGUAGE_KEY) || 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language preference
export const setLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem(LANGUAGE_KEY, lang);
};

export const getLanguage = (): string => {
  return i18n.language || 'en';
};

export default i18n;
