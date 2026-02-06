'use client';

import { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
}

export default function AdsterraNativeBanner({ className }: AdsterraNativeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const nativeKey = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY;

  useEffect(() => {
    if (!nativeKey || scriptLoaded.current || !containerRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${nativeKey}"]`);
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    // Create and append the Adsterra script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = `https://pl28632003.effectivegatecpm.com/${nativeKey}/invoke.js`;
    
    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [nativeKey]);

  if (!nativeKey) {
    return null;
  }

  return (
    <div className={`adsterra-native-banner ${className || ''}`}>
      <div ref={containerRef}>
        <div id={`container-${nativeKey}`}></div>
      </div>
    </div>
  );
}
