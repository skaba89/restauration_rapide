import { getRequestConfig } from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
};

export default getRequestConfig(async () => {
  return {
    locales,
    defaultLocale,
    messages: {
      fr: (await import('../../messages/fr.json')).default,
      en: (await import('../../messages/en.json')).default,
    },
  };
});
