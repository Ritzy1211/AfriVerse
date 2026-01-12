'use client';

import { useEffect, useRef, useState } from 'react';
import AdUnit from './AdUnit';

interface SidebarAdsProps {
  className?: string;
}

export default function SidebarAds({ className = '' }: SidebarAdsProps) {
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (stickyRef.current) {
        const rect = stickyRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* First Medium Rectangle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <AdUnit slot="medium-rect" />
      </div>

      {/* Sticky Half-Page Ad */}
      <div 
        ref={stickyRef}
        className={`transition-all duration-300 ${isSticky ? 'sticky top-20' : ''}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <AdUnit slot="half-page" />
        </div>
      </div>

      {/* Native Ad */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <AdUnit slot="native" />
      </div>
    </div>
  );
}
