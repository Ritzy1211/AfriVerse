'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Globe,
  Users,
  Cpu,
  ArrowLeft,
  RefreshCw,
  Calendar,
  FileText,
  BarChart3,
  Share2,
  Bookmark,
} from 'lucide-react';

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

interface HistoricalData {
  date: string;
  score: number;
}

const trendConfig = {
  RISING: { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Rising' },
  FALLING: { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Falling' },
  STABLE: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-700', label: 'Stable' },
  VOLATILE: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Volatile' },
};

const categoryConfig = {
  economy: { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Economy' },
  politics: { icon: Globe, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Politics' },
  social: { icon: Users, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Social' },
  tech: { icon: Cpu, color: 'text-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30', label: 'Technology' },
};

// Fallback country data
const countryDataMap: Record<string, CountryPulse> = {
  ng: {
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
  ke: {
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
  za: {
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
  gh: {
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
  eg: {
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
  et: {
    id: '6',
    country: 'ET',
    countryName: 'Ethiopia',
    flagEmoji: '🇪🇹',
    economyScore: 45,
    politicsScore: 40,
    socialScore: 48,
    techScore: 52,
    overallScore: 46,
    overallTrend: 'STABLE',
    economyTrend: 'RISING',
    politicsTrend: 'STABLE',
    socialTrend: 'STABLE',
    techTrend: 'RISING',
    topStory: 'Telecom sector opens to foreign investment',
    topStoryUrl: '/business/ethiopia-telecom-investment',
    keyIndicators: ['Telecom liberalization', 'Agricultural growth', 'Infrastructure development'],
    lastUpdated: new Date().toISOString(),
  },
  rw: {
    id: '7',
    country: 'RW',
    countryName: 'Rwanda',
    flagEmoji: '🇷🇼',
    economyScore: 62,
    politicsScore: 55,
    socialScore: 60,
    techScore: 70,
    overallScore: 62,
    overallTrend: 'RISING',
    economyTrend: 'RISING',
    politicsTrend: 'STABLE',
    socialTrend: 'RISING',
    techTrend: 'RISING',
    topStory: 'Kigali Innovation City attracts tech giants',
    topStoryUrl: '/technology/kigali-innovation-city',
    keyIndicators: ['Tech hub expansion', 'Tourism booming', 'Clean energy initiatives'],
    lastUpdated: new Date().toISOString(),
  },
  tz: {
    id: '8',
    country: 'TZ',
    countryName: 'Tanzania',
    flagEmoji: '🇹🇿',
    economyScore: 54,
    politicsScore: 50,
    socialScore: 56,
    techScore: 48,
    overallScore: 52,
    overallTrend: 'STABLE',
    economyTrend: 'RISING',
    politicsTrend: 'STABLE',
    socialTrend: 'STABLE',
    techTrend: 'STABLE',
    topStory: 'Tourism sector records strong growth',
    topStoryUrl: '/business/tanzania-tourism-growth',
    keyIndicators: ['Safari tourism up', 'Mining investments', 'Agricultural exports'],
    lastUpdated: new Date().toISOString(),
  },
};

// Generate mock historical data
function generateHistoricalData(baseScore: number): HistoricalData[] {
  const data: HistoricalData[] = [];
  const today = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variance = Math.floor(Math.random() * 10) - 5;
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.max(0, Math.min(100, baseScore + variance)),
    });
  }
  
  return data;
}

function getSentimentColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

function getSentimentLabel(score: number): string {
  if (score >= 70) return 'Positive';
  if (score >= 50) return 'Neutral';
  return 'Negative';
}

export default function CountryPulsePage() {
  const params = useParams();
  const countryCode = (params.country as string)?.toLowerCase();
  
  const [countryData, setCountryData] = useState<CountryPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    // Try to fetch from API first, fallback to local data
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/afripulse/country/${countryCode}`);
        if (response.ok) {
          const data = await response.json();
          setCountryData(data.country);
          setHistoricalData(data.history || generateHistoricalData(data.country.overallScore));
        } else {
          // Use fallback data
          const fallback = countryDataMap[countryCode];
          if (fallback) {
            setCountryData(fallback);
            setHistoricalData(generateHistoricalData(fallback.overallScore));
          }
        }
      } catch {
        // Use fallback data
        const fallback = countryDataMap[countryCode];
        if (fallback) {
          setCountryData(fallback);
          setHistoricalData(generateHistoricalData(fallback.overallScore));
        }
      } finally {
        setLoading(false);
      }
    };

    if (countryCode) {
      fetchData();
    }
  }, [countryCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading country data...</p>
        </div>
      </div>
    );
  }

  if (!countryData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Country Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We don't have data for this country yet.
          </p>
          <Link
            href="/afripulse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AfriPulse Index
          </Link>
        </div>
      </div>
    );
  }

  const TrendIcon = trendConfig[countryData.overallTrend].icon;
  const maxHistorical = Math.max(...historicalData.map(d => d.score));
  const minHistorical = Math.min(...historicalData.map(d => d.score));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href="/afripulse"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AfriPulse Index
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Country Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-6xl">{countryData.flagEmoji}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold">{countryData.countryName}</h1>
                    <span className="text-slate-400 text-lg">{countryData.country}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${trendConfig[countryData.overallTrend].bg}`}>
                      <TrendIcon className={`w-4 h-4 ${trendConfig[countryData.overallTrend].color}`} />
                      <span className={`font-medium ${trendConfig[countryData.overallTrend].color}`}>
                        {trendConfig[countryData.overallTrend].label}
                      </span>
                    </span>
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Updated: {new Date(countryData.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="flex flex-wrap gap-2 mt-6">
                {countryData.keyIndicators.map((indicator, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-slate-300"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            </div>

            {/* Overall Score Card */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-2">Overall Sentiment Score</div>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(countryData.overallScore / 100) * 352} 352`}
                      className={getSentimentColor(countryData.overallScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getSentimentColor(countryData.overallScore)}`}>
                      {countryData.overallScore}
                    </span>
                    <span className="text-slate-400 text-sm">/100</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${trendConfig[countryData.overallTrend].bg}`}>
                  <TrendIcon className={`w-5 h-5 ${trendConfig[countryData.overallTrend].color}`} />
                  <span className={`font-medium ${trendConfig[countryData.overallTrend].color}`}>
                    {getSentimentLabel(countryData.overallScore)} Sentiment
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm">
                  <Bookmark className="w-4 h-4" />
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Scores */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Score Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-500" />
              Sentiment Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'economy', score: countryData.economyScore, trend: countryData.economyTrend },
                { key: 'politics', score: countryData.politicsScore, trend: countryData.politicsTrend },
                { key: 'social', score: countryData.socialScore, trend: countryData.socialTrend },
                { key: 'tech', score: countryData.techScore, trend: countryData.techTrend },
              ].map(({ key, score, trend }) => {
                const config = categoryConfig[key as keyof typeof categoryConfig];
                const CategoryIcon = config.icon;
                const TrendIndicator = trendConfig[trend].icon;

                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                          <CategoryIcon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{config.label}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${trendConfig[trend].color}`}>
                        <TrendIndicator className="w-4 h-4" />
                        <span className="text-sm font-medium">{trendConfig[trend].label}</span>
                      </div>
                    </div>

                    <div className="flex items-end gap-4">
                      <span className={`text-4xl font-bold ${getSentimentColor(score)}`}>{score}</span>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              score >= 70
                                ? 'bg-green-500'
                                : score >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {score >= 70 ? 'Strong positive sentiment' : score >= 50 ? 'Neutral sentiment' : 'Negative sentiment'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historical Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                30-Day Sentiment Trend
              </h3>
              <div className="h-48 flex items-end gap-1">
                {historicalData.map((data, i) => {
                  const height = ((data.score - minHistorical + 10) / (maxHistorical - minHistorical + 20)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 group relative"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          data.score >= 70
                            ? 'bg-green-500 hover:bg-green-400'
                            : data.score >= 50
                            ? 'bg-amber-500 hover:bg-amber-400'
                            : 'bg-red-500 hover:bg-red-400'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.date}: {data.score}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Story */}
            {countryData.topStory && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Top Story
                </h3>
                <Link
                  href={countryData.topStoryUrl || '#'}
                  className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <p className="text-gray-900 dark:text-white font-medium mb-2">
                    {countryData.topStory}
                  </p>
                  <span className="text-amber-600 dark:text-amber-400 text-sm">
                    Read article →
                  </span>
                </Link>
              </div>
            )}

            {/* Related Countries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Compare With
              </h3>
              <div className="space-y-3">
                {Object.entries(countryDataMap)
                  .filter(([code]) => code !== countryCode)
                  .slice(0, 4)
                  .map(([code, country]) => (
                    <Link
                      key={code}
                      href={`/afripulse/${code}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{country.flagEmoji}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {country.countryName}
                        </span>
                      </div>
                      <span className={`font-bold ${getSentimentColor(country.overallScore)}`}>
                        {country.overallScore}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Methodology Link */}
            <Link
              href="/afripulse/methodology"
              className="block bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-6 hover:from-amber-600 hover:to-orange-600 transition-colors"
            >
              <h3 className="font-bold mb-2">How We Calculate</h3>
              <p className="text-white/80 text-sm mb-4">
                Learn about the AfriPulse methodology and data sources.
              </p>
              <span className="text-sm font-medium">Learn more →</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
