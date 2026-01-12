import { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin | AfriVerse',
  description: 'AfriVerse Admin Dashboard',
  robots: 'noindex, nofollow', // Don't index admin pages
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AuthProvider>
  );
}
