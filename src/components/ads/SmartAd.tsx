'use client';

import { ReactNode } from 'react';
import { 
  AdSenseAd, 
  MediaNetAd, 
  AdsterraAd, 
  MgidAd,
  adNetworkConfig,
  AdNetwork 
} from './AdNetworks';

// ============================================
// SMART AD PLACEMENT COMPONENT
// Automatically selects best ad network based on config
// ============================================

export type AdPlacementType = 
  | 'billboard'      // 970x250 or 728x90 - Top of page
  | 'leaderboard'    // 728x90 - Header/footer
  | 'sidebar'        // 300x250 - Sidebar widget
  | 'halfPage'       // 300x600 - Tall sidebar
  | 'inArticle'      // Fluid/responsive in content
  | 'native'         // Content recommendations
  | 'sticky'         // Sticky footer/sidebar
  | 'mobile';        // Mobile-optimized

interface SmartAdProps {
  placement: AdPlacementType;
  className?: string;
  fallback?: ReactNode;
  // Override automatic network selection
  preferNetwork?: AdNetwork;
}

// Map placements to ad sizes for each network
const placementConfig: Record<AdPlacementType, {
  adsenseSlot: string;
  adsenseFormat: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  medianetSize: '728x90' | '300x250' | '160x600' | '300x600' | '320x50';
  style: React.CSSProperties;
}> = {
  billboard: {
    adsenseSlot: adNetworkConfig.adsense.slots.billboard,
    adsenseFormat: 'horizontal',
    medianetSize: '728x90',
    style: { minHeight: 90 },
  },
  leaderboard: {
    adsenseSlot: adNetworkConfig.adsense.slots.leaderboard,
    adsenseFormat: 'horizontal',
    medianetSize: '728x90',
    style: { minHeight: 90 },
  },
  sidebar: {
    adsenseSlot: adNetworkConfig.adsense.slots.sidebar,
    adsenseFormat: 'rectangle',
    medianetSize: '300x250',
    style: { minHeight: 250 },
  },
  halfPage: {
    adsenseSlot: adNetworkConfig.adsense.slots.sidebar,
    adsenseFormat: 'vertical',
    medianetSize: '300x600',
    style: { minHeight: 600 },
  },
  inArticle: {
    adsenseSlot: adNetworkConfig.adsense.slots.inArticle,
    adsenseFormat: 'fluid',
    medianetSize: '300x250',
    style: { minHeight: 250 },
  },
  native: {
    adsenseSlot: adNetworkConfig.adsense.slots.native,
    adsenseFormat: 'fluid',
    medianetSize: '300x250',
    style: { minHeight: 300 },
  },
  sticky: {
    adsenseSlot: adNetworkConfig.adsense.slots.leaderboard,
    adsenseFormat: 'horizontal',
    medianetSize: '728x90',
    style: { minHeight: 90 },
  },
  mobile: {
    adsenseSlot: adNetworkConfig.adsense.slots.leaderboard,
    adsenseFormat: 'horizontal',
    medianetSize: '320x50',
    style: { minHeight: 50 },
  },
};

// Determine which network to use based on priority and availability
function selectNetwork(placement: AdPlacementType, preferNetwork?: AdNetwork): AdNetwork | null {
  // Priority order for each placement type
  const priorityMap: Record<AdPlacementType, AdNetwork[]> = {
    billboard: ['adsense', 'medianet', 'adsterra'],
    leaderboard: ['adsense', 'medianet', 'adsterra'],
    sidebar: ['adsense', 'medianet', 'adsterra'],
    halfPage: ['medianet', 'adsense', 'adsterra'],
    inArticle: ['adsense', 'adsterra', 'medianet'],
    native: ['mgid', 'adsterra', 'adsense'],
    sticky: ['adsterra', 'adsense', 'medianet'],
    mobile: ['adsense', 'adsterra', 'medianet'],
  };

  // If preferred network is specified and enabled, use it
  if (preferNetwork) {
    if (preferNetwork === 'adsense' && adNetworkConfig.adsense.enabled) return 'adsense';
    if (preferNetwork === 'medianet' && adNetworkConfig.medianet.enabled) return 'medianet';
    if (preferNetwork === 'adsterra' && adNetworkConfig.adsterra.enabled) return 'adsterra';
    if (preferNetwork === 'mgid' && adNetworkConfig.mgid.enabled) return 'mgid';
  }

  // Otherwise, use priority order
  const priorities = priorityMap[placement];
  for (const network of priorities) {
    if (network === 'adsense' && adNetworkConfig.adsense.enabled) return 'adsense';
    if (network === 'medianet' && adNetworkConfig.medianet.enabled) return 'medianet';
    if (network === 'adsterra' && adNetworkConfig.adsterra.enabled) return 'adsterra';
    if (network === 'mgid' && adNetworkConfig.mgid.enabled) return 'mgid';
  }

  return null;
}

export function SmartAd({ placement, className, fallback, preferNetwork }: SmartAdProps) {
  const network = selectNetwork(placement, preferNetwork);
  const config = placementConfig[placement];

  if (!network) {
    return fallback ? <>{fallback}</> : null;
  }

  const wrapperClass = `ad-placement ad-${placement} ${className || ''}`;

  switch (network) {
    case 'adsense':
      return (
        <div className={wrapperClass}>
          <AdSenseAd
            slot={config.adsenseSlot}
            format={config.adsenseFormat}
            style={config.style}
          />
        </div>
      );

    case 'medianet':
      return (
        <div className={wrapperClass}>
          <MediaNetAd size={config.medianetSize} />
        </div>
      );

    case 'adsterra':
      return (
        <div className={wrapperClass}>
          <AdsterraAd type={placement === 'native' ? 'native' : 'banner'} />
        </div>
      );

    case 'mgid':
      return (
        <div className={wrapperClass}>
          <MgidAd />
        </div>
      );

    default:
      return fallback ? <>{fallback}</> : null;
  }
}

// ============================================
// SPECIFIC AD COMPONENTS FOR COMMON PLACEMENTS
// ============================================

interface AdProps {
  className?: string;
  preferNetwork?: AdNetwork;
}

// Top banner ad (above header)
export function TopBannerAd({ className, preferNetwork }: AdProps) {
  return (
    <div className={`w-full flex justify-center py-2 bg-gray-100 dark:bg-gray-800 ${className || ''}`}>
      <SmartAd placement="leaderboard" preferNetwork={preferNetwork} />
    </div>
  );
}

// Billboard ad (large, prominent)
export function BillboardAd({ className, preferNetwork }: AdProps) {
  return (
    <div className={`w-full flex justify-center py-4 ${className || ''}`}>
      <SmartAd placement="billboard" preferNetwork={preferNetwork} />
    </div>
  );
}

// Sidebar ad
export function SidebarAd({ className, preferNetwork }: AdProps) {
  return (
    <div className={`w-full ${className || ''}`}>
      <SmartAd placement="sidebar" preferNetwork={preferNetwork} />
    </div>
  );
}

// In-article ad (between paragraphs)
export function InArticleAd({ className, preferNetwork }: AdProps) {
  return (
    <div className={`my-6 flex justify-center ${className || ''}`}>
      <SmartAd placement="inArticle" preferNetwork={preferNetwork} />
    </div>
  );
}

// Native/content recommendation ads
export function NativeAd({ className, preferNetwork }: AdProps) {
  return (
    <div className={`w-full py-4 ${className || ''}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
        Sponsored Content
      </p>
      <SmartAd placement="native" preferNetwork={preferNetwork} />
    </div>
  );
}

// Sticky footer ad (mobile)
export function StickyFooterAd({ className }: { className?: string }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-lg lg:hidden ${className || ''}`}>
      <SmartAd placement="mobile" />
    </div>
  );
}

// Multiple sidebar ads with spacing
export function SidebarAds({ count = 2, className }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SidebarAd key={i} />
      ))}
    </div>
  );
}
