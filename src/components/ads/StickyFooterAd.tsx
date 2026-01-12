'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdUnit from './AdUnit';

export default function StickyFooterAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the ad in this session
    const dismissed = sessionStorage.getItem('stickyAdDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show ad after scrolling 50% of the page
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 30 && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('stickyAdDismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-2 relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-8 right-4 p-1.5 bg-gray-800 text-white rounded-t-lg hover:bg-gray-700 transition-colors"
          aria-label="Close advertisement"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex justify-center">
          <AdUnit slot="sticky-footer" showLabel={false} />
        </div>
      </div>
    </div>
  );
}
