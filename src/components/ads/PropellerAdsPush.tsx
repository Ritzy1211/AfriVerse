'use client';

import { useEffect, useRef } from 'react';

export default function PropellerAdsPush() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    const zoneId = process.env.NEXT_PUBLIC_PROPELLER_ZONE_ID;
    if (!zoneId) return;

    // Register the service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('PropellerAds SW registered:', registration.scope);
        })
        .catch((error) => {
          console.error('PropellerAds SW registration failed:', error);
        });
    }

    initialized.current = true;
  }, []);

  // This component doesn't render anything visible
  return null;
}
