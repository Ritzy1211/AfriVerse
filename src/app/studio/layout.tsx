import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AfriVerse Studio | Content Management',
  description: 'Enterprise content management studio for AfriVerse. Manage articles, authors, categories, and site settings.',
  robots: 'noindex, nofollow', // Don't index the studio
};

export default function StudioRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
