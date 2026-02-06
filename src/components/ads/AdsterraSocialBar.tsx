'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraSocialBar() {
  const scriptLoaded = useRef(false);

  const socialBarKey = process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY;

  useEffect(() => {
    if (!socialBarKey || scriptLoaded.current) return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="${socialBarKey}"]`);
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    // Create and append the Adsterra Social Bar script
    const script = document.createElement('script');
    script.src = `https://pl28632058.effectivegatecpm.com/97/0b/be/${socialBarKey}.js`;
    script.async = true;
    document.body.appendChild(script);
    
    scriptLoaded.current = true;

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [socialBarKey]);

  // Social Bar renders itself as a floating element, no container needed
  return null;
}
