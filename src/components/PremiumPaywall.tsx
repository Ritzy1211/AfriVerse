'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles, CheckCircle, X } from 'lucide-react';

interface PremiumPaywallProps {
  articleTitle: string;
  articleSlug: string;
  previewContent?: string;
  onClose?: () => void;
}

export default function PremiumPaywall({ 
  articleTitle, 
  articleSlug,
  previewContent,
  onClose 
}: PremiumPaywallProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const handleSubscribe = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          email,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data?.authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorizationUrl;
      } else {
        throw new Error(data.error || 'Failed to initialize payment');
      }
    } catch (error: any) {
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    'Unlimited access to all premium articles',
    'Ad-free reading experience',
    'Exclusive in-depth analysis & reports',
    'Early access to breaking stories',
    'Weekly premium newsletter digest',
    'Support independent African journalism',
  ];

  return (
    <div className="relative">
      {/* Blurred preview content */}
      {previewContent && (
        <div className="relative">
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 dark:via-gray-900/70 to-white dark:to-gray-900" />
        </div>
      )}

      {/* Paywall Card */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 border border-amber-200 dark:border-amber-900/30 shadow-xl">
        {/* Close button (if modal) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
            This is Premium Content
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Subscribe to AfriVerse Premium to continue reading "{articleTitle}" and unlock all premium stories.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          {/* Monthly Plan */}
          <button
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedPlan === 'MONTHLY'
                ? 'border-amber-500 bg-white dark:bg-gray-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">Monthly</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              ₦4,500<span className="text-base font-normal text-gray-500">/mo</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">~$3/month</div>
            {selectedPlan === 'MONTHLY' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-amber-500" />
              </div>
            )}
          </button>

          {/* Yearly Plan */}
          <button
            onClick={() => setSelectedPlan('YEARLY')}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedPlan === 'YEARLY'
                ? 'border-amber-500 bg-white dark:bg-gray-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
            }`}
          >
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
              SAVE 17%
            </div>
            <div className="font-semibold text-gray-900 dark:text-white">Yearly</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              ₦45,000<span className="text-base font-normal text-gray-500">/yr</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">~$30/year (2 months free!)</div>
            {selectedPlan === 'YEARLY' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="w-5 h-5 text-amber-500" />
              </div>
            )}
          </button>
        </div>

        {/* Email & Subscribe */}
        <div className="max-w-md mx-auto space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Subscribe Now
              </>
            )}
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-center font-semibold text-gray-900 dark:text-white mb-4">
            What you get with Premium:
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Already subscribed */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Already a subscriber?{' '}
          <Link href="/admin/login" className="text-amber-600 hover:text-amber-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// Inline paywall for article pages
export function ArticlePaywall({ 
  isPremium,
  isSubscriber,
  articleTitle,
  articleSlug,
  children 
}: {
  isPremium: boolean;
  isSubscriber: boolean;
  articleTitle: string;
  articleSlug: string;
  children: React.ReactNode;
}) {
  // If not premium content, show full article
  if (!isPremium) {
    return <>{children}</>;
  }

  // If user is a subscriber, show full article
  if (isSubscriber) {
    return <>{children}</>;
  }

  // Show paywall for non-subscribers trying to read premium content
  return (
    <PremiumPaywall 
      articleTitle={articleTitle}
      articleSlug={articleSlug}
    />
  );
}

// Premium badge for article cards
export function PremiumBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded ${className}`}>
      <Lock className="w-3 h-3" />
      Premium
    </div>
  );
}
