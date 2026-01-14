'use client';

/**
 * Sanity Studio embedded in Next.js
 * Access at: /studio
 * 
 * SECURITY MODEL (Billboard/Enterprise-grade):
 * - Only authenticated users can access (middleware protection)
 * - Only ADMIN and EDITOR roles can use the studio
 * - Writers must use /writer portal instead
 * - Full audit trail via Sanity's built-in history
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Roles that can access Sanity Studio (enterprise-grade CMS access)
// SUPER_ADMIN, ADMIN, EDITOR can manage all content
// Writers use the /writer portal for their content
const STUDIO_ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

export default function StudioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      // Not logged in - redirect to login
      router.push('/admin/login?callbackUrl=/studio&reason=studio_access');
      return;
    }

    // Check if user has required role
    const userRole = (session.user as any)?.role || 'WRITER';
    const hasAccess = STUDIO_ALLOWED_ROLES.includes(userRole);
    setIsAuthorized(hasAccess);

    if (!hasAccess) {
      console.log(`[Studio] Access denied for role: ${userRole}`);
    }
  }, [session, status, router]);

  // Loading state
  if (status === 'loading' || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Access denied - show friendly message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Restricted
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The Sanity Studio is reserved for <strong>Administrators</strong> and{' '}
            <strong>Editors</strong> only. As a Writer, please use the Writer Portal 
            to create and manage your content.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-left text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Why the restriction?</p>
                <p>
                  Sanity Studio has full CMS access including site settings, 
                  categories, and all content. The Writer Portal provides a 
                  focused, secure environment for content creation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/writer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Go to Writer Portal
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Site
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            Logged in as: {session?.user?.email}
            <br />
            Role: {(session?.user as any)?.role || 'WRITER'}
          </p>
        </div>
      </div>
    );
  }

  // Authorized - render Sanity Studio
  return <NextStudio config={config} />;
}
