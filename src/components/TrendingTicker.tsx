'use client';

import { useState, useEffect } from 'react';
import { TrendingTopic } from '@/types';
import { Flame } from 'lucide-react';
import { useTranslation } from '@/components/providers/TranslationProvider';

// Fallback mock data in case API fails
const fallbackTopics: TrendingTopic[] = [
  { id: '1', title: 'Nigerian Tech Startups Raise $500M in 2024', upiScore: 95, trend: 'up', category: 'Business', url: '/business/nigerian-tech-startups-500m-2024' },
  { id: '2', title: 'Davido World Tour 2025 Announced', upiScore: 88, trend: 'up', category: 'Entertainment', url: '/entertainment/davido-world-tour-2025' },
  { id: '3', title: 'Super Eagles AFCON 2025: Finidi Tactics', upiScore: 82, trend: 'up', category: 'Sports', url: '/sports/super-eagles-afcon-2025-finidi-tactics' },
];

export default function TrendingTicker() {
  // Start with fallback data immediately for faster render
  const [topics, setTopics] = useState<TrendingTopic[]>(fallbackTopics);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchTrendingTopics() {
      try {
        const response = await fetch('/api/trending', {
          next: { revalidate: 60 } // Cache for 60 seconds
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setTopics(data);
          }
        }
      } catch (error) {
        // Keep fallback data on error
        console.error('Error fetching trending topics:', error);
      }
    }

    fetchTrendingTopics();
  }, []);

  // Always render with available topics (fallback or fetched)
  if (topics.length === 0) {
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
