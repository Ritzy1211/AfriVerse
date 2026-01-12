'use client';

import { useTranslation } from '@/components/providers/TranslationProvider';
import Link from 'next/link';

interface TranslatedSectionHeaderProps {
  titleKey: string;
  viewAllLink?: string;
  viewAllKey?: string;
  icon?: string;
  categorySlug?: string;
}

export function TranslatedSectionHeader({ 
  titleKey, 
  viewAllLink, 
  viewAllKey = 'common.viewAll',
  icon,
  categorySlug
}: TranslatedSectionHeaderProps) {
  const { t } = useTranslation();
  
  // If it's a category, try to get translated name
  const translationKey = categorySlug ? `nav.${categorySlug}` : titleKey;
  const translated = t(translationKey);
  const title = translated !== translationKey ? translated : titleKey;
  
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-headline font-bold text-gray-900 dark:text-white flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {viewAllLink && (
        <Link 
          href={viewAllLink}
          className="text-brand-accent hover:text-brand-secondary text-sm font-medium transition-colors"
        >
          {t(viewAllKey)} →
        </Link>
      )}
    </div>
  );
}

export function TranslatedTopStoriesHeader() {
  const { t } = useTranslation();
  
  return (
    <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
      🔥 {t('home.topStories')}
    </h3>
  );
}

export function TranslatedText({ textKey }: { textKey: string }) {
  const { t } = useTranslation();
  return <>{t(textKey)}</>;
}
