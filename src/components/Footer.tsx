'use client';

import Link from 'next/link';
import { categories } from '@/data/categories';
import { Facebook, Twitter, Instagram, Youtube, Rss } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';
import { useTranslation } from '@/components/providers/TranslationProvider';
import AfricaWatermark from './AfricaWatermark';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-primary dark:bg-gray-900 text-white mt-20 relative overflow-hidden">
      {/* Africa Watermark */}
      <AfricaWatermark 
        position="left" 
        size="xl" 
        opacity={0.05} 
        className="text-white"
      />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="lg" variant="full" colorScheme="green" showTagline />
            </Link>
            <p className="text-sm text-gray-400">
              {t('footer.aboutText')}
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/Officialafriverse" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://x.com/afriverseHQ" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="X (Twitter)">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/afriverse_hq" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors opacity-50" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="/feed.xml" className="p-2 bg-white/10 rounded-full hover:bg-orange-500 transition-colors" aria-label="RSS Feed">
                <Rss className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-brand-accent transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  {t('common.about')}
                </Link>
              </li>
              <li>
                <Link href="/authors" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  Our Authors
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  {t('nav.advertise')}
                </Link>
              </li>
              <li>
                <Link href="/media-kit" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  Media Kit
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  {t('common.contact')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  {t('nav.careers')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-brand-accent transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4">{t('newsletter.title')}</h4>
            <p className="text-sm text-gray-400 mb-4">
              {t('newsletter.subtitle')}
            </p>
            <NewsletterSignup variant="compact" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-brand-accent transition-colors">
                {t('footer.terms')}
              </Link>
              <Link href="/privacy" className="hover:text-brand-accent transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/cookie-policy" className="hover:text-brand-accent transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
