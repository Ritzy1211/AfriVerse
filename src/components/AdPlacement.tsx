'use client';

import { AdUnit } from '@/components/ads';
import type { AdSlotType } from '@/components/ads/AdUnit';

interface AdPlacementProps {
  slot: 'header' | 'sidebar' | 'in-article' | 'footer' | 'billboard';
  className?: string;
}

// Map legacy slot names to new AdUnit slot types
const slotMapping: Record<AdPlacementProps['slot'], AdSlotType> = {
  header: 'leaderboard',
  sidebar: 'medium-rect',
  'in-article': 'in-article',
  footer: 'leaderboard',
  billboard: 'billboard',
};

export default function AdPlacement({ slot, className = '' }: AdPlacementProps) {
  const adSlot = slotMapping[slot];

  return (
    <div className={className}>
      <AdUnit slot={adSlot} />
    </div>
  );
}
