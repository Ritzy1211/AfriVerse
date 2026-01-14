import Link from 'next/link';
import { CheckCircle, Building2, ArrowRight, Mail, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed! | AfriVerse Advertising',
  description: 'Your AfriVerse advertising order has been confirmed.',
};

export default function AdvertisingSuccessPage() {
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
            <Building2 className="w-4 h-4" />
            Order Confirmed
          </div>

          <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-6">
            Thank You for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
              Partnering with Us
            </span>
            !
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your advertising order has been confirmed and payment received successfully.
          </p>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 text-left">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              What Happens Next?
            </h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Confirmation Email Sent
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check your inbox for order details and receipt
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Account Manager Contact
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Our team will reach out within 24 hours to discuss your campaign
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Content Planning
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We'll work together to create compelling content for your brand
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  4
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Campaign Launch
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your content goes live to our millions of engaged readers
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
            <p className="font-medium text-gray-900 dark:text-white mb-4">
              Have questions? Get in touch:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:tips@afriverse.africa"
                className="inline-flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 hover:underline"
              >
                <Mail className="w-4 h-4" />
                tips@afriverse.africa
              </a>
              <a
                href="tel:+2348012345678"
                className="inline-flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 hover:underline"
              >
                <Phone className="w-4 h-4" />
                +234 801 234 5678
              </a>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all"
            >
              Explore AfriVerse
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/media-kit"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-xl transition-all"
            >
              View Media Kit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
