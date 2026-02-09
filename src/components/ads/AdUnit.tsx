'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Extend Window interface for AdSense
declare global {
  interface Window {
    adsbygoogle: unknown[];
    atOptions?: any;
  }
}

// Adsterra Banner Embed Component
function AdsterraBannerEmbed({ slot }: { slot: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const key = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY || '6cef7c73d9e7809b268030f63ea69ae';
    
    // Set options
    window.atOptions = {
      'key': key,
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };
    
    // Load script
    const script = document.createElement('script');
    script.src = `//www.highperformanceformat.com/${key}/invoke.js`;
    script.async = true;
    containerRef.current.appendChild(script);
    
    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  return <div ref={containerRef} id={`adsterra-banner-${slot}`} />;
}

// Adsterra Native Embed Component
function AdsterraNativeEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const key = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY || '8468b3413a41d83e9710099afc8c5932';
    
    // Load script
    const script = document.createElement('script');
    script.src = `//pl25485917.profitablegatecpm.com/${key}/invoke.js`;
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    containerRef.current.appendChild(script);
    
    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div ref={containerRef}>
      <div id="container-8468b3413a41d83e9710099afc8c5932"></div>
    </div>
  );
}

// Ad configuration types
export type AdSlotType = 
  | 'billboard'      // 970x250 - Top of page (premium)
  | 'leaderboard'    // 728x90 - Standard header
  | 'medium-rect'    // 300x250 - Sidebar
  | 'half-page'      // 300x600 - Sidebar sticky
  | 'in-article'     // 728x90 or responsive - Within content
  | 'mobile-banner'  // 320x50 - Mobile header
  | 'sticky-footer'  // 728x90 - Sticky bottom
  | 'native';        // Custom - Native content ad

interface AdConfig {
  width: number;
  height: number;
  responsive?: boolean;
  envKey: string; // Environment variable key for this slot
}

const AD_CONFIG: Record<AdSlotType, AdConfig> = {
  billboard: { width: 970, height: 250, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_BILLBOARD' },
  leaderboard: { width: 728, height: 90, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD' },
  'medium-rect': { width: 300, height: 250, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_MEDIUM_RECT' },
  'half-page': { width: 300, height: 600, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_HALF_PAGE' },
  'in-article': { width: 728, height: 90, responsive: true, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE' },
  'mobile-banner': { width: 320, height: 50, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_MOBILE' },
  'sticky-footer': { width: 728, height: 90, responsive: true, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_FOOTER' },
  native: { width: 0, height: 0, envKey: 'NEXT_PUBLIC_ADSENSE_SLOT_NATIVE' },
};

// Get slot ID from environment
const getSlotId = (slot: AdSlotType): string | undefined => {
  const config = AD_CONFIG[slot];
  // Access env vars dynamically
  const envVars: Record<string, string | undefined> = {
    'NEXT_PUBLIC_ADSENSE_SLOT_BILLBOARD': process.env.NEXT_PUBLIC_ADSENSE_SLOT_BILLBOARD,
    'NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD': process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD,
    'NEXT_PUBLIC_ADSENSE_SLOT_MEDIUM_RECT': process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEDIUM_RECT,
    'NEXT_PUBLIC_ADSENSE_SLOT_HALF_PAGE': process.env.NEXT_PUBLIC_ADSENSE_SLOT_HALF_PAGE,
    'NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE': process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
    'NEXT_PUBLIC_ADSENSE_SLOT_MOBILE': process.env.NEXT_PUBLIC_ADSENSE_SLOT_MOBILE,
    'NEXT_PUBLIC_ADSENSE_SLOT_FOOTER': process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER,
    'NEXT_PUBLIC_ADSENSE_SLOT_NATIVE': process.env.NEXT_PUBLIC_ADSENSE_SLOT_NATIVE,
  };
  // Return specific slot ID or fall back to default slot ID
  return envVars[config.envKey] || process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
};

// Fallback house ads - rotate these when no AdSense
const HOUSE_ADS = [
  {
    id: 'advertise',
    title: '🚀 Advertise on AfriVerse',
    subtitle: 'Reach 2M+ African readers monthly',
    cta: 'Get Started',
    link: '/advertise',
    bgClass: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    id: 'newsletter',
    title: '📧 Subscribe to Our Newsletter',
    subtitle: 'Get the latest African stories delivered',
    cta: 'Subscribe Free',
    link: '#newsletter',
    bgClass: 'bg-gradient-to-r from-blue-600 to-purple-600',
  },
  {
    id: 'premium',
    title: '👑 Go Premium',
    subtitle: 'Ad-free reading + exclusive content',
    cta: 'Upgrade Now',
    link: '/subscribe/premium',
    bgClass: 'bg-gradient-to-r from-purple-600 to-pink-600',
  },
];

// Slots that should use Adsterra as fallback instead of house ads
const ADSTERRA_FALLBACK_SLOTS: AdSlotType[] = ['medium-rect', 'half-page', 'in-article'];

// Slots reserved for AdSense (show house ads until approved)
const ADSENSE_RESERVED_SLOTS: AdSlotType[] = ['billboard', 'leaderboard', 'sticky-footer'];

interface AdUnitProps {
  slot: AdSlotType;
  className?: string;
  showLabel?: boolean;
  fallbackOnly?: boolean; // Force fallback ads (for testing)
}

export default function AdUnit({ 
  slot, 
  className = '', 
  showLabel = true,
  fallbackOnly = false 
}: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(fallbackOnly);
  const [adInitialized, setAdInitialized] = useState(false);
  const config = AD_CONFIG[slot];

  // Get AdSense publisher ID from env
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const slotId = getSlotId(slot);

  // Check if we're in development/localhost
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    // If no AdSense config, fallbackOnly, or in development, show house ads
    if (!publisherId || !slotId || fallbackOnly || isDevelopment) {
      setShowFallback(true);
      return;
    }

    // Prevent double initialization (React Strict Mode issue)
    if (adInitialized) {
      return;
    }

    // Wait for container to have width before loading ads
    const checkAndLoadAd = () => {
      if (!adRef.current) return;
      
      const containerWidth = adRef.current.offsetWidth;
      if (containerWidth === 0) {
        // Container not visible yet, retry after a short delay
        setTimeout(checkAndLoadAd, 100);
        return;
      }

      // Try to load AdSense
      try {
        // @ts-ignore - AdSense global
        if (window.adsbygoogle && !adInitialized) {
          setAdInitialized(true);
          // @ts-ignore - AdSense global
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdLoaded(true);
          // @ts-ignore - AdSense global
        } else if (!window.adsbygoogle) {
          // AdSense not loaded, show fallback
          setShowFallback(true);
        }
      } catch (e) {
        // Silently handle AdSense errors in production
        // These are usually "already has ads" or "no slot size" errors
        if (process.env.NODE_ENV === 'development') {
          console.warn('AdSense warning (expected in dev):', e);
        }
        setShowFallback(true);
      }
    };

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(checkAndLoadAd, 100);

    // Set timeout for ad load - if not loaded in 3s, show fallback
    const fallbackTimeout = setTimeout(() => {
      if (!adLoaded) {
        setShowFallback(true);
      }
    }, 3000);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [publisherId, slotId, fallbackOnly, isDevelopment, adInitialized, adLoaded]);

  // Randomly select a house ad (memoized to prevent re-selection on re-render)
  const [houseAd] = useState(() => HOUSE_ADS[Math.floor(Math.random() * HOUSE_ADS.length)]);

  // Check if this slot should use Adsterra
  const shouldUseAdsterra = ADSTERRA_FALLBACK_SLOTS.includes(slot);

  // Render Adsterra ad for secondary slots
  const renderAdsterraFallback = () => {
    // Use Adsterra 300x250 banner for medium-rect and half-page slots
    if (slot === 'medium-rect' || slot === 'half-page') {
      return (
        <div className="flex justify-center">
          <AdsterraBannerEmbed slot={slot} />
        </div>
      );
    }

    // For in-article, use native banner
    if (slot === 'in-article') {
      return (
        <div className="my-4">
          <AdsterraNativeEmbed />
        </div>
      );
    }

    // Default to house ad
    return renderHouseAd();
  };

  // Render fallback house ad
  const renderHouseAd = () => {
    if (slot === 'native') {
      return (
        <Link href={houseAd.link} className="block group">
          <div className={`${houseAd.bgClass} rounded-xl p-6 text-white transition-transform hover:scale-[1.02]`}>
            <p className="text-lg font-bold mb-1">{houseAd.title}</p>
            <p className="text-sm opacity-90 mb-3">{houseAd.subtitle}</p>
            <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium group-hover:bg-white/30 transition-colors">
              {houseAd.cta} →
            </span>
          </div>
        </Link>
      );
    }

    return (
      <Link href={houseAd.link} className="block w-full h-full">
        <div 
          className={`${houseAd.bgClass} rounded-lg flex items-center justify-center text-white p-4 transition-opacity hover:opacity-90`}
          style={{ 
            width: '100%',
            height: config.height,
            maxWidth: config.width,
          }}
        >
          <div className="text-center">
            <p className="font-bold text-base md:text-lg">{houseAd.title}</p>
            <p className="text-xs md:text-sm opacity-90 mt-1">{houseAd.subtitle}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
              {houseAd.cta}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  // Main render fallback function - decides between Adsterra or house ads
  const renderFallback = () => {
    if (shouldUseAdsterra) {
      return renderAdsterraFallback();
    }
    return renderHouseAd();
  };

  // Native ad styling
  if (slot === 'native') {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Sponsored</p>
        )}
        {showFallback ? renderFallback() : (
          <div ref={adRef}>
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client={publisherId}
              data-ad-slot={slotId}
              data-ad-format="fluid"
              data-native-ad="true"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {showLabel && (
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider mb-1">
          Advertisement
        </p>
      )}
      <div 
        ref={adRef}
        className="flex items-center justify-center mx-auto overflow-hidden"
        style={{ 
          maxWidth: '100%',
          width: config.responsive ? '100%' : config.width,
          minHeight: config.height,
        }}
      >
        {showFallback ? renderFallback() : (
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block',
              width: config.responsive ? '100%' : config.width,
              height: config.height,
            }}
            data-ad-client={publisherId}
            data-ad-slot={slotId}
            data-ad-format={config.responsive ? 'auto' : undefined}
            data-full-width-responsive={config.responsive ? 'true' : undefined}
          />
        )}
      </div>
    </div>
  );
}
