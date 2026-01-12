export const locales = ['en', 'fr', 'sw', 'pt', 'ar', 'ha'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  sw: 'Kiswahili',
  pt: 'Português',
  ar: 'العربية',
  ha: 'Hausa',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  sw: '🇰🇪',
  pt: '🇵🇹',
  ar: '🇪🇬',
  ha: '🇳🇬',
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
