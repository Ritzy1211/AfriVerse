'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// ============================================
// AD NETWORK CONFIGURATION
// ============================================

export type AdNetwork = 'adsense' | 'medianet' | 'adsterra' | 'propellerads' | 'mgid';

export interface AdConfig {
  network: AdNetwork;
  enabled: boolean;
  // AdSense
  adsensePublisherId?: string;
  adsenseSlotId?: string;
  // Media.net
  medianetCid?: string;
  medianetCrid?: string;
  // Adsterra
  adsterraKey?: string;
  // PropellerAds
  propellerZoneId?: string;
  // Mgid
  mgidWidgetId?: string;
}

// Get config from environment
export const adNetworkConfig = {
  adsense: {
    enabled: true,
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
    slots: {
      billboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BILLBOARD || '',
      leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD || '',
      sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MEDIUM_RECT || '',
      inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE || '',
      native: process.env.NEXT_PUBLIC_ADSENSE_SLOT_NATIVE || '',
    },
  },
  medianet: {
    enabled: !!process.env.NEXT_PUBLIC_MEDIANET_CID,
    cid: process.env.NEXT_PUBLIC_MEDIANET_CID || '',
    crid: process.env.NEXT_PUBLIC_MEDIANET_CRID || '',
  },
  adsterra: {
    enabled: !!process.env.NEXT_PUBLIC_ADSTERRA_KEY,
    key: process.env.NEXT_PUBLIC_ADSTERRA_KEY || '',
    nativeBannerKey: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY || '',
    popunderKey: process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_KEY || '',
  },
  propellerads: {
    enabled: !!process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID,
    zoneId: process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID || '',
    pushNotifications: process.env.NEXT_PUBLIC_PROPELLER_PUSH_ID || '',
  },
  mgid: {
    enabled: !!process.env.NEXT_PUBLIC_MGID_WIDGET_ID,
    widgetId: process.env.NEXT_PUBLIC_MGID_WIDGET_ID || '',
    containerId: process.env.NEXT_PUBLIC_MGID_CONTAINER_ID || 'M918476ScriptRootC1594498',
  },
};

// ============================================
// GOOGLE ADSENSE COMPONENT
// ============================================

interface AdSenseAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function AdSenseAd({ slot, format = 'auto', responsive = true, style, className }: AdSenseAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (adRef.current && !adLoaded && adNetworkConfig.adsense.enabled) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [adLoaded]);

  if (!adNetworkConfig.adsense.enabled || !adNetworkConfig.adsense.publisherId) {
    return null;
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client={adNetworkConfig.adsense.publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// ============================================
// MEDIA.NET COMPONENT
// ============================================

interface MediaNetAdProps {
  size: '728x90' | '300x250' | '160x600' | '300x600' | '320x50';
  className?: string;
}

export function MediaNetAd({ size, className }: MediaNetAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [dimensions] = useState(() => {
    const [width, height] = size.split('x').map(Number);
    return { width, height };
  });

  useEffect(() => {
    if (adRef.current && adNetworkConfig.medianet.enabled) {
      try {
        // @ts-ignore
        window._mNHandle = window._mNHandle || {};
        // @ts-ignore
        window._mNHandle.queue = window._mNHandle.queue || [];
        // @ts-ignore
        window._mNHandle.queue.push(function() {
          // @ts-ignore
          window._mNDetails.loadTag(adNetworkConfig.medianet.cid, adNetworkConfig.medianet.crid, size);
        });
      } catch (err) {
        console.error('Media.net error:', err);
      }
    }
  }, [size]);

  if (!adNetworkConfig.medianet.enabled) {
    return null;
  }

  return (
    <div className={className}>
      <div
        ref={adRef}
        id={`medianet_${size.replace('x', '_')}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  );
}

// ============================================
// ADSTERRA COMPONENT
// ============================================

interface AdsterraAdProps {
  type: 'banner' | 'native' | 'social';
  className?: string;
}

export function AdsterraAd({ type, className }: AdsterraAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current && adNetworkConfig.adsterra.enabled) {
      const key = type === 'native' 
        ? adNetworkConfig.adsterra.nativeBannerKey 
        : adNetworkConfig.adsterra.key;
      
      if (key) {
        const script = document.createElement('script');
        script.src = `//www.highperformanceformat.com/${key}/invoke.js`;
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        adRef.current.appendChild(script);
      }
    }
  }, [type]);

  if (!adNetworkConfig.adsterra.enabled) {
    return null;
  }

  return (
    <div ref={adRef} className={className} id={`adsterra-${type}`} />
  );
}

// ============================================
// PROPELLERADS COMPONENT
// ============================================

interface PropellerAdProps {
  type: 'banner' | 'native' | 'interstitial';
  className?: string;
}

export function PropellerAd({ type, className }: PropellerAdProps) {
  useEffect(() => {
    if (adNetworkConfig.propellerads.enabled && type === 'interstitial') {
      // Interstitial ads load automatically via script
    }
  }, [type]);

  if (!adNetworkConfig.propellerads.enabled) {
    return null;
  }

  return (
    <div className={className} id={`propeller-${type}`}>
      {type === 'banner' && (
        <div data-banner-id={adNetworkConfig.propellerads.zoneId}></div>
      )}
    </div>
  );
}

// ============================================
// MGID NATIVE ADS COMPONENT
// ============================================

interface MgidAdProps {
  className?: string;
}

export function MgidAd({ className }: MgidAdProps) {
  useEffect(() => {
    if (adNetworkConfig.mgid.enabled) {
      // MGID loads via script
    }
  }, []);

  if (!adNetworkConfig.mgid.enabled) {
    return null;
  }

  return (
    <div className={className}>
      <div id={adNetworkConfig.mgid.containerId}></div>
    </div>
  );
}

// ============================================
// AD NETWORK SCRIPTS (Load in layout)
// ============================================

export function AdNetworkScripts() {
  return (
    <>
      {/* Google AdSense */}
      {adNetworkConfig.adsense.enabled && adNetworkConfig.adsense.publisherId && (
        <Script
          id="adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adNetworkConfig.adsense.publisherId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* Media.net */}
      {adNetworkConfig.medianet.enabled && (
        <Script
          id="medianet-script"
          async
          src={`https://contextual.media.net/dmedianet.js?cid=${adNetworkConfig.medianet.cid}`}
          strategy="afterInteractive"
        />
      )}

      {/* Adsterra - Social Bar (optional) */}
      {adNetworkConfig.adsterra.enabled && adNetworkConfig.adsterra.key && (
        <Script
          id="adsterra-script"
          async
          src={`//www.highperformanceformat.com/${adNetworkConfig.adsterra.key}/invoke.js`}
          strategy="afterInteractive"
        />
      )}

      {/* PropellerAds Push Notifications */}
      {adNetworkConfig.propellerads.enabled && adNetworkConfig.propellerads.pushNotifications && (
        <Script
          id="propellerads-push"
          src={`//js.wpadmngr.com/static/adManager.js`}
          data-admpid={adNetworkConfig.propellerads.pushNotifications}
          strategy="afterInteractive"
        />
      )}

      {/* MGID Native Ads */}
      {adNetworkConfig.mgid.enabled && (
        <Script
          id="mgid-script"
          src={`https://jsc.mgid.com/a/f/afriverse.africa.${adNetworkConfig.mgid.widgetId}.js`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
