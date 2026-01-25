import { Metadata } from 'next';
import { Suspense } from 'react';
import AuthProvider from '@/components/providers/AuthProvider';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin | AfriVerse',
  description: 'AfriVerse Admin Dashboard',
  robots: 'noindex, nofollow', // Don't index admin pages
};

function AdminLayoutFallback() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense fallback={<AdminLayoutFallback />}>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </Suspense>
    </AuthProvider>
  );
}
