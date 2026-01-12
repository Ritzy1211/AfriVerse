'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

// Import all message files
import en from '@/i18n/messages/en.json';
import fr from '@/i18n/messages/fr.json';
import sw from '@/i18n/messages/sw.json';
import pt from '@/i18n/messages/pt.json';
import ar from '@/i18n/messages/ar.json';
import ha from '@/i18n/messages/ha.json';

const messages: Record<Locale, typeof en> = { en, fr, sw, pt, ar, ha };

type Messages = typeof en;
type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? K | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // Update document direction for RTL languages
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  // Translation function that works consistently for both SSR and client
  const getTranslation = (key: string, loc: Locale): string => {
    const keys = key.split('.');
    let value: any = messages[loc];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  const t = (key: string): string => getTranslation(key, locale);

  const isRtl = locale === 'ar';

  // Use defaultLocale translations during SSR to prevent hydration mismatch
  // Both server and initial client render will use the same default locale
  if (!mounted) {
    const defaultT = (key: string): string => getTranslation(key, defaultLocale);
    return (
      <TranslationContext.Provider value={{ locale: defaultLocale, setLocale, t: defaultT, isRtl: false }}>
        {children}
      </TranslationContext.Provider>
    );
  }

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, isRtl }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
