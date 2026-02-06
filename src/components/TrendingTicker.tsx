'use client';

import { useState, useEffect } from 'react';
import { TrendingTopic } from '@/types';
import { Flame } from 'lucide-react';
import { useTranslation } from '@/components/providers/TranslationProvider';

export default function TrendingTicker() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchTrendingTopics() {
      try {
        const response = await fetch('/api/trending', {
          next: { revalidate: 60 } // Cache for 60 seconds
        });
        if (response.ok) {
          const data = await response.json();
          setTopics(data);
        }
      } catch (error) {
        console.error('Error fetching trending topics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrendingTopics();
  }, []);

  // Don't render if no topics or still loading
  if (isLoading || topics.length === 0) {
    return null;
  }

  return (
    <div className="bg-brand-secondary text-white overflow-hidden py-2">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 whitespace-nowrap font-bold text-sm">
          <Flame className="w-4 h-4" />
          <span>{t('home.trending').toUpperCase()}</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="flex gap-8 animate-slide-left">
            {/* Duplicate for seamless loop */}
            {[...topics, ...topics].map((topic, index) => (
              <a
                key={`${topic.id}-${index}`}
                href={topic.url}
                className="whitespace-nowrap hover:underline text-sm flex items-center gap-2"
              >
                <span className="opacity-75">{topic.category}:</span>
                <span>{topic.title}</span>
                {topic.trend === 'up' && <span className="text-xs">↗</span>}
                {topic.trend === 'down' && <span className="text-xs">↘</span>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
