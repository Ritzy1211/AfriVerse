'use client';

import { useState, useEffect } from 'react';
import Spotlight, { SpotlightData } from './Spotlight';

interface HomepageSpotlightProps {
  placement?: string;
  categorySlug?: string;
  sectionTitle?: string;
  className?: string;
}

export default function HomepageSpotlight({
  placement = 'homepage',
  categorySlug,
  sectionTitle = 'SPOTLIGHT',
  className = '',
}: HomepageSpotlightProps) {
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        const params = new URLSearchParams({
          placement,
          limit: '1',
        });
        if (categorySlug) {
          params.append('category', categorySlug);
        }

        const res = await fetch(`/api/spotlights?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSpotlight(data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching spotlight:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotlight();
  }, [placement, categorySlug]);

  if (isLoading || !spotlight) {
    return null;
  }

  return (
    <Spotlight
      data={spotlight}
      sectionTitle={sectionTitle}
      className={className}
    />
  );
}
