'use client';

import { useState, useRef, useEffect } from 'react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useTranslation } from '@/components/providers/TranslationProvider';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label={t('common.language')}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeFlags[locale]}</span>
        <span className="hidden md:inline">{localeNames[locale]}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                loc === locale ? 'bg-gray-50 dark:bg-gray-700 text-brand-secondary font-medium' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <span className="text-lg">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {loc === locale && (
                <span className="ml-auto text-brand-secondary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
