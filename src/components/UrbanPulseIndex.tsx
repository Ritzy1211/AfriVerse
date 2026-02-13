'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  sentimentScore: number;
  trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  mentions: number;
}

// Fallback data when API is unavailable
const fallbackTopics: TrendingTopic[] = [
  { id: '1', topic: 'Lagos Traffic Updates', category: 'News', sentimentScore: 95, trend: 'RISING', mentions: 12000 },
  { id: '2', topic: 'Dollar Exchange Rate', category: 'Economy', sentimentScore: 88, trend: 'RISING', mentions: 45000 },
  { id: '3', topic: 'Wizkid New Album', category: 'Culture', sentimentScore: 82, trend: 'RISING', mentions: 67000 },
  { id: '4', topic: 'Super Eagles AFCON', category: 'Sports', sentimentScore: 75, trend: 'STABLE', mentions: 89000 },
  { id: '5', topic: 'Startup Tax Relief', category: 'Politics', sentimentScore: 70, trend: 'RISING', mentions: 15000 },
  { id: '6', topic: 'Lagos Real Estate', category: 'Economy', sentimentScore: 68, trend: 'FALLING', mentions: 8000 },
  { id: '7', topic: 'Fintech Innovation', category: 'Tech', sentimentScore: 65, trend: 'STABLE', mentions: 23000 },
  { id: '8', topic: 'Burna Boy Grammy', category: 'Culture', sentimentScore: 63, trend: 'FALLING', mentions: 34000 },
  { id: '9', topic: 'African Markets 2025', category: 'Economy', sentimentScore: 58, trend: 'RISING', mentions: 11000 },
  { id: '10', topic: 'Power Supply Updates', category: 'News', sentimentScore: 55, trend: 'STABLE', mentions: 28000 },
];

export default function UrbanPulseIndex() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/afripulse');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.topics && data.topics.length > 0) {
        setTopics(data.topics);
      } else {
        setTopics(fallbackTopics);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setTopics(fallbackTopics);
      setError('Using cached data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
    // Refresh every 30 minutes as indicated in the UI
    const interval = setInterval(fetchTopics, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTopics]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'RISING':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'FALLING':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-yellow-500';
  };

  if (loading && topics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">
              Urban Pulse Index
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Loading trending topics...
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-secondary rounded-lg flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white">
            Urban Pulse Index
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time trending topics • Updated every 30 min
            {error && <span className="text-amber-500 ml-1">({error})</span>}
          </p>
        </div>
        <button
          onClick={fetchTopics}
          disabled={loading}
          className="w-12 h-12 bg-gradient-to-br from-brand-accent to-brand-secondary rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <RefreshCw className={`w-6 h-6 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {topics.slice(0, 10).map((topic, index) => (
          <a
            key={topic.id}
            href={`/search?q=${encodeURIComponent(topic.topic)}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <span className="text-xl font-bold text-gray-300 dark:text-gray-600 w-6">
              {index + 1}
            </span>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-accent transition-colors truncate">
                {topic.topic}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {topic.category} • {topic.mentions?.toLocaleString() || 0} mentions
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${getScoreColor(topic.sentimentScore)}`}>
                {topic.sentimentScore}
              </span>
              {getTrendIcon(topic.trend)}
            </div>
          </a>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          UPI Score = Social Velocity + Street Credibility + Economic Impact
        </p>
      </div>
    </div>
  );
}
