'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrendingTicker from '@/components/TrendingTicker';
import TopBannerAd from '@/components/TopBannerAd';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import { StickyFooterAd } from '@/components/ads';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Routes that should NOT have the public header/footer
  const isAdminRoute = pathname?.startsWith('/admin');
  const isApiRoute = pathname?.startsWith('/api');
  
  // If it's an admin or API route, render children directly
  if (isAdminRoute || isApiRoute) {
    return <>{children}</>;
  }
  
  // For public routes, wrap with header/footer
  return (
    <TranslationProvider>
      <GoogleAnalytics />
      <div className="min-h-screen flex flex-col">
        <TopBannerAd />
        <TrendingTicker />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <StickyFooterAd />
      </div>
    </TranslationProvider>
  );
}
