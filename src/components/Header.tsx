'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu, X, Moon, Sun, ChevronDown, Info, Phone, Megaphone, Briefcase, FileText, Shield, Users } from 'lucide-react';
import { categories } from '@/data/categories';
import { getPreferences, toggleDarkMode } from '@/lib/preferences';
import SearchModal from './SearchModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/components/providers/TranslationProvider';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Translated more links
  const moreLinks = [
    { name: t('common.about'), href: '/about', icon: Info },
    { name: t('nav.authors'), href: '/authors', icon: Users },
    { name: t('common.contact'), href: '/contact', icon: Phone },
    { name: t('nav.advertise'), href: '/advertise', icon: Megaphone },
    { name: t('nav.careers'), href: '/careers', icon: Briefcase },
    { name: t('footer.privacy'), href: '/privacy', icon: Shield },
    { name: t('footer.terms'), href: '/terms', icon: FileText },
  ];

  useEffect(() => {
    const prefs = getPreferences();
    setDarkMode(prefs.darkMode);
    
    if (prefs.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = toggleDarkMode();
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-brand-dark/95 backdrop-blur-md shadow-soft' 
          : 'bg-white dark:bg-brand-dark'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/assets/logos/Afriverse-logo.png"
              alt="AfriVerse Logo"
              width={48}
              height={48}
              className="h-12 w-12 object-contain transform group-hover:scale-105 transition-transform"
              priority
            />
            <div>
              <h1 className="text-xl font-headline font-bold text-brand-primary dark:text-white">
                {t('common.siteName')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">{t('common.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {categories.slice(0, 5).map((category) => {
              const translationKey = `nav.${category.slug}`;
              const translated = t(translationKey);
              return (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-accent transition-colors relative group"
                >
                  {translated !== translationKey ? translated : category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-accent transition-all group-hover:w-full" />
                </Link>
              );
            })}
            
            {/* More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-accent transition-colors flex items-center gap-1"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                  <div className="p-2">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-accent/20 transition-colors">
                          <link.icon className="w-5 h-5 text-brand-accent" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {link.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  {/* Newsletter CTA */}
                  <div className="p-4 bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Stay updated with our newsletter</p>
                    <Link 
                      href="/contact" 
                      onClick={() => setMoreMenuOpen(false)}
                      className="text-sm font-medium text-brand-accent hover:text-brand-secondary transition-colors"
                    >
                      Subscribe Now →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            <button
              onClick={handleDarkModeToggle}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="hidden lg:flex items-center gap-1 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px]">K</kbd>
              </span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {/* Categories */}
              <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">Categories</p>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors py-2 px-2 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
              
              {/* More Links */}
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">More</p>
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-accent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors py-2 px-2 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4 text-brand-accent" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
