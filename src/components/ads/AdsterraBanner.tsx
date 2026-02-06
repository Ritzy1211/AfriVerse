'use client';

import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  className?: string;
}

export default function AdsterraBanner({ className }: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const bannerKey = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY;

  useEffect(() => {
    if (!bannerKey || scriptLoaded.current || !containerRef.current) return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${bannerKey}"]`);
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    // Create the atOptions config script
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      atOptions = {
        'key' : '${bannerKey}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    containerRef.current.appendChild(configScript);

    // Create and append the Adsterra invoke script
    const invokeScript = document.createElement('script');
    invokeScript.src = `https://www.highperformanceformat.com/${bannerKey}/invoke.js`;
    containerRef.current.appendChild(invokeScript);
    
    scriptLoaded.current = true;

    return () => {
      // Cleanup on unmount
      if (configScript.parentNode) configScript.parentNode.removeChild(configScript);
      if (invokeScript.parentNode) invokeScript.parentNode.removeChild(invokeScript);
    };
  }, [bannerKey]);

  if (!bannerKey) {
    return null;
  }

  return (
    <div className={`adsterra-banner flex justify-center ${className || ''}`}>
      <div 
        ref={containerRef} 
        style={{ width: 300, height: 250, overflow: 'hidden' }}
      />
    </div>
  );
}
