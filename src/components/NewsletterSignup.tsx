'use client';

import { useState } from 'react';
import { useTranslation } from '@/components/providers/TranslationProvider';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
}

export default function NewsletterSignup({ variant = 'default', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(t('newsletter.error'));
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(t('newsletter.success'));
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || t('newsletter.error'));
      }
    } catch {
      setStatus('error');
      setMessage(t('newsletter.error'));
    }
  };

  // Compact variant for footer
  if (variant === 'compact') {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder')}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-primary font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
          >
            {status === 'loading' ? '...' : t('newsletter.subscribe')}
          </button>
        </form>
        {message && (
          <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  // Hero variant for homepage
  if (variant === 'hero') {
    return (
      <div className={`bg-gradient-to-r from-primary via-primary to-primary/90 rounded-2xl p-8 md:p-12 ${className}`}>
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium mb-4">
            📧 {t('newsletter.title')}
          </span>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            {t('newsletter.title')}
          </h3>
          <p className="text-gray-300 mb-6">
            {t('newsletter.subtitle')}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:bg-white/15 transition-all"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-primary font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                t('newsletter.subscribe')
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              status === 'success' 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            {t('newsletter.subtitle')}
          </p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-display font-bold text-gray-900 dark:text-white mb-1">
            Get Our Newsletter
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Daily insights delivered to your inbox
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-primary font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {message && (
            <p className={`text-sm mt-3 ${
              status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
