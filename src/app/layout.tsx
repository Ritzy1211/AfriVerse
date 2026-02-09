import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import ConditionalLayout from '@/components/ConditionalLayout';
import AppearanceProvider from '@/components/providers/AppearanceProvider';
import AfricanSlangPopup from '@/components/AfricanSlangPopup';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true,
});

const poppins = Poppins({ 
  weight: ['600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'AfriVerse - Where Stories Connect',
  description: 'Your trusted source for news, culture, tech, business, and everything that matters across Africa. Premium content without the noise.',
  keywords: ['African news', 'Nigeria', 'Lagos', 'Kenya', 'South Africa', 'Ghana', 'tech', 'culture', 'business', 'entertainment', 'sports'],
  authors: [{ name: 'AfriVerse' }],
  creator: 'AfriVerse',
  publisher: 'AfriVerse',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://afriverse.africa',
    siteName: 'AfriVerse',
    title: 'AfriVerse - Where Stories Connect',
    description: 'Your trusted source for news, culture, tech, and everything that matters across Africa.',
    images: [
      {
        url: '/assets/logos/Afriverse-logo.png',
        width: 1200,
        height: 630,
        alt: 'AfriVerse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@AfriVerse',
    creator: '@AfriVerse',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://afriverse.africa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/logos/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/logos/Afriverse-logo.png" />
        <meta name="theme-color" content="#1A1A2E" />
        <link rel="alternate" type="application/rss+xml" title="AfriVerse RSS Feed" href="/feed.xml" />
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <AppearanceProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          {/* African Slang Daily Popup - Shows once per session after 5s */}
          <AfricanSlangPopup delay={5000} showOnce={true} />
        </AppearanceProvider>
      </body>
    </html>
  );
}
