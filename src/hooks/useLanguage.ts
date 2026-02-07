import { useTranslation } from 'react-i18next';
import { getLanguage } from '@/lib/i18n';

/**
 * Hook to get the current language for API calls
 * Returns the language code ('en' or 'zh') for use with edge functions
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  
  return {
    language: i18n.language || 'en',
    isEnglish: i18n.language === 'en',
    isChinese: i18n.language === 'zh',
  };
}

/**
 * Get the current language synchronously (for non-React contexts)
 */
export { getLanguage };
