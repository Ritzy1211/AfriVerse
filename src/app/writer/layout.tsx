import { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import WriterLayoutClient from './WriterLayoutClient';

export const metadata: Metadata = {
  title: 'Newsroom | AfriVerse',
  description: 'AfriVerse Newsroom - Write and submit your stories',
  robots: 'noindex, nofollow',
};

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WriterLayoutClient>{children}</WriterLayoutClient>
    </AuthProvider>
  );
}
