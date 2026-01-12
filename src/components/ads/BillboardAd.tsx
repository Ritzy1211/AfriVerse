'use client';

import AdUnit from './AdUnit';

interface BillboardAdProps {
  className?: string;
}

export default function BillboardAd({ className = '' }: BillboardAdProps) {
  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      {/* Desktop Billboard */}
      <div className="hidden lg:block">
        <AdUnit slot="billboard" />
      </div>
      
      {/* Tablet Leaderboard */}
      <div className="hidden md:block lg:hidden">
        <AdUnit slot="leaderboard" />
      </div>
      
      {/* Mobile Banner */}
      <div className="block md:hidden">
        <AdUnit slot="mobile-banner" />
      </div>
    </div>
  );
}
