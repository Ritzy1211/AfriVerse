'use client';

import { useState } from 'react';
import { Check, Crown, Sparkles, ArrowRight, Shield, Zap, Clock, Mail } from 'lucide-react';
import Link from 'next/link';
import AfricaWatermark from '@/components/AfricaWatermark';

const SUBSCRIPTION_PLANS = [
  {
    id: 'MONTHLY',
    name: 'Monthly',
    price: '$1.34',
    priceNGN: '₦2,000',
    period: '/month',
    description: 'Perfect for casual readers',
    popular: false,
    features: [
      'Ad-free reading experience',
      'Early access to articles (24hr)',
      'Exclusive premium content',
      'Weekly premium digest',
      'Priority support',
    ],
  },
  {
    id: 'YEARLY',
    name: 'Yearly',
    price: '$13.40',
    priceNGN: '₦20,000',
    period: '/year',
    description: 'Best value - Save 17%',
    popular: true,
    badge: 'Best Value',
    features: [
      'Everything in Monthly',
      '2 months FREE',
      'Exclusive annual reports',
      'Early event access',
      'Founding member badge',
    ],
  },
];

const PREMIUM_BENEFITS = [
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Read articles 24 hours before everyone else',
  },
  {
    icon: Shield,
    title: 'Ad-Free Experience',
    description: 'Enjoy distraction-free reading',
  },
  {
    icon: Crown,
    title: 'Exclusive Content',
    description: 'Premium articles, analysis, and insights',
  },
  {
    icon: Mail,
    title: 'Premium Digest',
    description: 'Weekly curated newsletter with deep dives',
  },
  {
    icon: Clock,
    title: 'Offline Reading',
    description: 'Download articles for offline access',
  },
  {
    icon: Sparkles,
    title: 'Member Badge',
    description: 'Stand out in the community',
  },
];

export default function PremiumSubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('YEARLY');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

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

      if (data.success && data.data.authorizationUrl) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorizationUrl;
      } else {
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Africa Watermark */}
      <div className="absolute inset-0 pointer-events-none">
        <AfricaWatermark 
          position="right" 
          size="xl" 
          opacity={0.04} 
          className="text-amber-500"
        />
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-6">
              <Crown className="w-4 h-4" />
              Premium Membership
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-6">
              Unlock the Full{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                AfriVerse
              </span>{' '}
              Experience
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Join thousands of readers who enjoy premium content, ad-free reading, 
              and exclusive insights into Africa's most important stories.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl p-8 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'bg-white dark:bg-gray-800 shadow-2xl ring-2 ring-amber-500 scale-105'
                    : 'bg-white/50 dark:bg-gray-800/50 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {plan.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === plan.id
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {selectedPlan === plan.id && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {plan.priceNGN} {plan.period}
                  </p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Email Input & CTA */}
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
                Start Your Premium Subscription
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Subscribe Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Secure payment powered by Paystack. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Premium Member Benefits
          </h2>
          
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PREMIUM_BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can cancel anytime. Your access continues until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                What payment methods are accepted?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major cards (Visa, Mastercard), bank transfers, and mobile money through Paystack.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Is my payment secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely. All payments are processed securely through Paystack, a PCI-DSS compliant payment processor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Go Premium?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our growing community of premium members and get the most out of AfriVerse.
          </p>
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold rounded-xl transition-colors"
          >
            <Crown className="w-5 h-5" />
            Subscribe Now
          </Link>
        </div>
      </section>
    </div>
  );
}
