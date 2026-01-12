'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function TopBannerAd() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-brand-primary via-brand-primary/95 to-brand-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-center gap-4">
          {/* Ad Badge */}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-accent/20 text-brand-accent border border-brand-accent/30">
            AD
          </span>
          
          {/* Ad Content */}
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm md:text-base">
              <span className="font-semibold">🚀 Boost your brand visibility!</span>
              <span className="hidden sm:inline ml-1">Advertise on AfriVerse and reach 2M+ monthly readers.</span>
            </span>
            
            <Link
              href="/advertise"
              className="inline-flex items-center gap-1 px-3 py-1 bg-brand-accent hover:bg-brand-accent/90 text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap"
            >
              Get Started
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            aria-label="Close advertisement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
