'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MailX, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error');
      setMessage('No email provided');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'You have been successfully unsubscribed.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unsubscribed Successfully
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              We're sorry to see you go. You can always resubscribe anytime.
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {message}
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailX className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unsubscribe from Newsletter
            </h1>
            {email ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to unsubscribe?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                  {email}
                </p>
                <button
                  onClick={handleUnsubscribe}
                  disabled={status === 'loading'}
                  className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 mb-4"
                >
                  {status === 'loading' ? 'Unsubscribing...' : 'Yes, Unsubscribe Me'}
                </button>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                No email address provided. Please use the link from your email.
              </p>
            )}
          </>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-accent hover:text-brand-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AfriVerse
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
