import Link from 'next/link';
import { CheckCircle, Crown, ArrowRight, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to Premium! | AfriVerse',
  description: 'Your AfriVerse Premium subscription is now active.',
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Heading */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Premium Member
          </div>

          <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              AfriVerse Premium
            </span>
            !
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your subscription is now active. Thank you for supporting quality African journalism!
          </p>

          {/* Benefits Reminder */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Your Premium Benefits:
            </h2>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Ad-free reading experience
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  24-hour early access to all articles
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Exclusive premium content & analysis
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Weekly premium newsletter digest
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  Priority customer support
                </span>
              </li>
            </ul>
          </div>

          {/* Email Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-8 flex items-start gap-4">
            <Mail className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Check your email!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a confirmation email with your subscription details and receipt.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all"
            >
              Start Reading
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-all"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
