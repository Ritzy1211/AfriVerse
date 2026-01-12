'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Globe,
  Building2,
  Users,
  Cpu,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface CountryPulse {
  id: string;
  country: string;
  countryName: string;
  flagEmoji: string;
  economyScore: number;
  politicsScore: number;
  socialScore: number;
  techScore: number;
  overallScore: number;
  overallTrend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  economyTrend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  politicsTrend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  socialTrend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  techTrend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  topStory?: string;
  topStoryUrl?: string;
  keyIndicators: string[];
  lastUpdated: string;
}

interface TopicPulse {
  id: string;
  topic: string;
  category: string;
  sentimentScore: number;
  trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  mentions: number;
}

interface AfriPulseStats {
  continentalAverage: number;
  mostOptimistic: { countryName: string; overallScore: number } | null;
  mostPessimistic: { countryName: string; overallScore: number } | null;
  risingCount: number;
  fallingCount: number;
}

interface AfriPulseIndexProps {
  variant?: 'full' | 'compact' | 'ticker';
  countries?: string[]; // Filter by country codes
  showTopics?: boolean;
  maxCountries?: number;
  maxTopics?: number;
  className?: string;
}

const trendConfig = {
  RISING: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Rising' },
  FALLING: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Falling' },
  STABLE: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', label: 'Stable' },
  VOLATILE: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Volatile' },
};

const categoryIcons = {
  Economy: Building2,
  Politics: Globe,
  Social: Users,
  Tech: Cpu,
};

// Fallback sample data - used when API is unavailable
const fallbackCountries: CountryPulse[] = [
  {
    id: '1',
    country: 'NG',
    countryName: 'Nigeria',
    flagEmoji: '🇳🇬',
    economyScore: 58,
    politicsScore: 45,
    socialScore: 62,
    techScore: 72,
    overallScore: 59,
    overallTrend: 'RISING',
    economyTrend: 'RISING',
    politicsTrend: 'STABLE',
    socialTrend: 'RISING',
    techTrend: 'RISING',
    topStory: 'Tech startups raise $200M in Q4',
    topStoryUrl: '/business/nigerian-tech-startups',
    keyIndicators: ['Naira strengthening', 'Tech investment up 40%', 'Youth employment improving'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    country: 'KE',
    countryName: 'Kenya',
    flagEmoji: '🇰🇪',
    economyScore: 55,
    politicsScore: 52,
    socialScore: 58,
    techScore: 68,
    overallScore: 58,
    overallTrend: 'STABLE',
    economyTrend: 'STABLE',
    politicsTrend: 'RISING',
    socialTrend: 'STABLE',
    techTrend: 'RISING',
    topStory: 'M-Pesa expands to 10 new markets',
    topStoryUrl: '/technology/mpesa-expansion',
    keyIndicators: ['Fintech growth 25%', 'Tourism rebounding', 'Stable inflation'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    country: 'ZA',
    countryName: 'South Africa',
    flagEmoji: '🇿🇦',
    economyScore: 48,
    politicsScore: 42,
    socialScore: 45,
    techScore: 55,
    overallScore: 48,
    overallTrend: 'FALLING',
    economyTrend: 'FALLING',
    politicsTrend: 'VOLATILE',
    socialTrend: 'STABLE',
    techTrend: 'STABLE',
    topStory: 'Load shedding concerns continue',
    topStoryUrl: '/politics/south-africa-energy-crisis',
    keyIndicators: ['Energy crisis ongoing', 'Rand under pressure', 'Mining sector steady'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    country: 'GH',
    countryName: 'Ghana',
    flagEmoji: '🇬🇭',
    economyScore: 52,
    politicsScore: 58,
    socialScore: 55,
    techScore: 60,
    overallScore: 56,
    overallTrend: 'RISING',
    economyTrend: 'RISING',
    politicsTrend: 'STABLE',
    socialTrend: 'RISING',
    techTrend: 'RISING',
    topStory: 'Ghana Business Forum 2026 announced',
    topStoryUrl: '/business/ghana-business-forum-2026',
    keyIndicators: ['Cedi stabilizing', 'Tech hub growth', 'Agricultural exports up'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '5',
    country: 'EG',
    countryName: 'Egypt',
    flagEmoji: '🇪🇬',
    economyScore: 50,
    politicsScore: 48,
    socialScore: 52,
    techScore: 58,
    overallScore: 52,
    overallTrend: 'STABLE',
    economyTrend: 'STABLE',
    politicsTrend: 'STABLE',
    socialTrend: 'RISING',
    techTrend: 'RISING',
    topStory: 'Cairo Tech Week draws global investors',
    topStoryUrl: '/technology/cairo-tech-week',
    keyIndicators: ['Tourism recovery', 'Tech investment growing', 'Infrastructure projects'],
    lastUpdated: new Date().toISOString(),
  },
];

const fallbackTopics: TopicPulse[] = [
  { id: '1', topic: 'AFCON 2026', category: 'Sports', sentimentScore: 78, trend: 'RISING', mentions: 45000 },
  { id: '2', topic: 'AI in Africa', category: 'Tech', sentimentScore: 72, trend: 'RISING', mentions: 23000 },
  { id: '3', topic: 'Climate Action', category: 'Politics', sentimentScore: 55, trend: 'STABLE', mentions: 18000 },
  { id: '4', topic: 'Naira Exchange', category: 'Economy', sentimentScore: 45, trend: 'VOLATILE', mentions: 32000 },
  { id: '5', topic: 'Afrobeats Global', category: 'Culture', sentimentScore: 85, trend: 'RISING', mentions: 67000 },
];

function getSentimentColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getSentimentBg(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getSentimentLabel(score: number): string {
  if (score >= 70) return 'Optimistic';
  if (score >= 50) return 'Neutral';
  return 'Pessimistic';
}

export default function AfriPulseIndex({
  variant = 'full',
  countries: filterCountries,
  showTopics = true,
  maxCountries = 5,
  maxTopics = 5,
  className = '',
}: AfriPulseIndexProps) {
  const [countryData, setCountryData] = useState<CountryPulse[]>([]);
  const [topicData, setTopicData] = useState<TopicPulse[]>([]);
  const [stats, setStats] = useState<AfriPulseStats | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/afripulse');
      
      if (!response.ok) {
        throw new Error('Failed to fetch AfriPulse data');
      }
      
      const data = await response.json();
      
      if (data.countries && data.countries.length > 0) {
        setCountryData(data.countries);
      } else {
        // Use fallback data if no data in database
        setCountryData(fallbackCountries);
      }
      
      if (data.topics && data.topics.length > 0) {
        setTopicData(data.topics);
      } else {
        setTopicData(fallbackTopics);
      }
      
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching AfriPulse data:', err);
      setError('Unable to load live data');
      // Use fallback data on error
      setCountryData(fallbackCountries);
      setTopicData(fallbackTopics);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter countries if specified
  const displayCountries = filterCountries
    ? countryData.filter(c => filterCountries.includes(c.country))
    : countryData.slice(0, maxCountries);

  const displayTopics = topicData.slice(0, maxTopics);

  // Calculate continental average (use stats from API or calculate locally)
  const continentalAverage = stats?.continentalAverage ?? (
    countryData.length > 0
      ? Math.round(countryData.reduce((sum, c) => sum + c.overallScore, 0) / countryData.length)
      : 50
  );

  const refreshData = () => {
    fetchData();
  };

  // Loading skeleton for ticker
  if (loading && variant === 'ticker') {
    return (
      <div className={`bg-slate-900 text-white py-2 overflow-hidden ${className}`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-slate-900 rounded font-bold text-sm whitespace-nowrap">
            <Activity className="w-4 h-4 animate-pulse" />
            AfriPulse™
          </span>
          <span className="text-gray-400 animate-pulse">Loading continental data...</span>
        </div>
      </div>
    );
  }

  // Ticker variant - horizontal scrolling
  if (variant === 'ticker') {
    return (
      <div className={`bg-slate-900 text-white py-2 overflow-hidden ${className}`}>
        <div className="flex items-center gap-4 animate-slide-left">
          <span className="flex items-center gap-2 px-3 py-1 bg-amber-500 text-slate-900 rounded font-bold text-sm whitespace-nowrap">
            <Activity className="w-4 h-4" />
            AfriPulse™
          </span>
          {displayCountries.length > 0 ? (
            [...displayCountries, ...displayCountries].map((country, i) => {
              const TrendIcon = trendConfig[country.overallTrend].icon;
              return (
                <div key={`${country.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
                  <span>{country.flagEmoji}</span>
                  <span className="font-medium">{country.countryName}</span>
                  <span className={`font-bold ${getSentimentColor(country.overallScore)}`}>
                    {country.overallScore}
                  </span>
                  <TrendIcon className={`w-4 h-4 ${trendConfig[country.overallTrend].color}`} />
                  <span className="text-slate-500 mx-2">|</span>
                </div>
              );
            })
          ) : (
            <span className="text-gray-400">No data available</span>
          )}
        </div>
      </div>
    );
  }

  // Compact variant - sidebar widget
  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-white" />
              <h3 className="font-bold text-white">AfriPulse Index™</h3>
            </div>
            <div className="text-white text-sm">
              <span className="font-bold">{continentalAverage}</span>
              <span className="opacity-75">/100</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {displayCountries.map((country) => {
            const TrendIcon = trendConfig[country.overallTrend].icon;
            return (
              <div key={country.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{country.flagEmoji}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{country.countryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getSentimentColor(country.overallScore)}`}>
                    {country.overallScore}
                  </span>
                  <TrendIcon className={`w-4 h-4 ${trendConfig[country.overallTrend].color}`} />
                </div>
              </div>
            );
          })}
        </div>

        <Link
          href="/afripulse"
          className="block p-3 text-center text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-medium"
        >
          View Full Dashboard <ChevronRight className="inline w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Full variant - main dashboard
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AfriPulse Index™
                <span className="text-xs bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full font-bold">LIVE</span>
              </h2>
              <p className="text-slate-400 text-sm">Real-time African Sentiment Tracker</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Continental Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Continental Avg</div>
            <div className="text-2xl font-bold text-white">{continentalAverage}</div>
            <div className="text-green-400 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +2 this week
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Most Optimistic</div>
            <div className="text-lg font-bold text-white">
              {countryData.sort((a, b) => b.overallScore - a.overallScore)[0]?.flagEmoji}{' '}
              {countryData.sort((a, b) => b.overallScore - a.overallScore)[0]?.countryName}
            </div>
            <div className="text-green-400 text-xs">
              Score: {countryData.sort((a, b) => b.overallScore - a.overallScore)[0]?.overallScore}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Trending Topic</div>
            <div className="text-lg font-bold text-white truncate">
              {topicData[0]?.topic}
            </div>
            <div className="text-amber-400 text-xs">
              {topicData[0]?.mentions.toLocaleString()} mentions
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Countries Tracked</div>
            <div className="text-2xl font-bold text-white">{countryData.length}</div>
            <div className="text-slate-400 text-xs">Across Africa</div>
          </div>
        </div>
      </div>

      {/* Country Grid */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-500" />
          Country Sentiment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCountries.map((country) => {
            const TrendIcon = trendConfig[country.overallTrend].icon;
            return (
              <div
                key={country.id}
                onClick={() => setSelectedCountry(selectedCountry?.id === country.id ? null : country)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCountry?.id === country.id
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{country.flagEmoji}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{country.countryName}</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendConfig[country.overallTrend].bg}`}>
                    <TrendIcon className={`w-4 h-4 ${trendConfig[country.overallTrend].color}`} />
                    <span className={`text-xs font-medium ${trendConfig[country.overallTrend].color}`}>
                      {trendConfig[country.overallTrend].label}
                    </span>
                  </div>
                </div>

                {/* Score Circle */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(country.overallScore / 100) * 176} 176`}
                        className={getSentimentColor(country.overallScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${getSentimentColor(country.overallScore)}`}>
                        {country.overallScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[
                      { label: 'Economy', score: country.economyScore },
                      { label: 'Politics', score: country.politicsScore },
                      { label: 'Social', score: country.socialScore },
                      { label: 'Tech', score: country.techScore },
                    ].map(({ label, score }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-14">{label}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getSentimentBg(score)}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-6">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Story */}
                {country.topStory && (
                  <Link
                    href={country.topStoryUrl || '#'}
                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate"
                  >
                    📰 {country.topStory}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trending Topics */}
      {showTopics && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Trending Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {displayTopics.map((topic) => {
              const TrendIcon = trendConfig[topic.trend].icon;
              return (
                <div
                  key={topic.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <span className={`font-medium text-sm ${getSentimentColor(topic.sentimentScore)}`}>
                    {topic.topic}
                  </span>
                  <span className="text-xs text-gray-500">{topic.sentimentScore}</span>
                  <TrendIcon className={`w-3 h-3 ${trendConfig[topic.trend].color}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Updated: {new Date().toLocaleString()}</span>
        <Link href="/afripulse/methodology" className="hover:text-amber-600 dark:hover:text-amber-400">
          Learn about our methodology →
        </Link>
      </div>
    </div>
  );
}

// Export compact components
export function AfriPulseBadge({ country, score, trend }: { country: string; score: number; trend: string }) {
  const TrendIcon = trendConfig[trend as keyof typeof trendConfig]?.icon || Minus;
  const trendColor = trendConfig[trend as keyof typeof trendConfig]?.color || 'text-gray-500';

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
      <span>{country}</span>
      <span className={`font-bold ${getSentimentColor(score)}`}>{score}</span>
      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
    </div>
  );
}
