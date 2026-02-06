'use client';

import { useEffect } from 'react';

export default function MonetagMultitag() {
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[data-zone="208386"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://quge5.com/88/tag.min.js';
    script.setAttribute('data-zone', '208386');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[data-zone="208386"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null;
}
