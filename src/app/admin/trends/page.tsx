'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Globe, 
  RefreshCw, 
  ExternalLink, 
  Search,
  Flame,
  Clock,
  BarChart3,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

interface TrendingTopic {
  title: string;
  traffic?: string;
  articles?: {
    title: string;
    source: string;
    url: string;
    image?: string;
  }[];
  relatedQueries?: string[];
  image?: string;
}

interface TrendsData {
  success: boolean;
  geo: string;
  type: string;
  trends: TrendingTopic[];
  timestamp: string;
  error?: string;
}

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
];

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [trendType, setTrendType] = useState<'daily' | 'realtime'>('daily');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    setNote('');
    
    try {
      const response = await fetch(`/api/trends?geo=${selectedCountry}&type=${trendType}`);
      const data = await response.json();
      
      if (data.success) {
        setTrends(data.trends);
        setLastUpdated(new Date(data.timestamp).toLocaleString());
        setDataSource(data.source || 'google-trends');
        if (data.note) setNote(data.note);
      } else {
        setError(data.error || 'Failed to fetch trends');
        setTrends([]);
      }
    } catch (err) {
      setError('Failed to connect to trends API');
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [selectedCountry, trendType]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateArticleIdea = (topic: string) => {
    const templates = [
      `${topic}: Everything You Need to Know in 2026`,
      `Breaking: ${topic} - Latest Updates and Analysis`,
      `${topic} Explained: What It Means for Africa`,
      `Why ${topic} Is Trending Right Now`,
      `${topic}: Top 10 Things You Should Know`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-red-500" />
            Google Trends
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover trending topics to write about
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Country Selector */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
          >
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>

          {/* Trend Type Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setTrendType('daily')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                trendType === 'daily'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Daily
            </button>
            <button
              onClick={() => setTrendType('realtime')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                trendType === 'realtime'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Flame className="w-4 h-4 inline mr-1" />
              Real-time
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated}
          </p>
          {dataSource === 'fallback' && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
              Using cached data
            </span>
          )}
        </div>
      )}

      {/* Note/Warning */}
      {note && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">{note}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <p className="text-sm text-red-600 dark:text-red-500 mt-1">
            Try selecting a different country or check back later.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Trends Grid */}
      {!loading && trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trends.map((trend, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-orange-500">#{index + 1}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {trend.title}
                      </h3>
                    </div>
                    {trend.traffic && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {trend.traffic} searches
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(trend.title, index)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy topic"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Article Suggestion */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                      Article Idea:
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {generateArticleIdea(trend.title)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              {trend.articles && trend.articles.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Related News:
                  </p>
                  <div className="space-y-2">
                    {trend.articles.slice(0, 2).map((article, artIndex) => (
                      <a
                        key={artIndex}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        {article.image && (
                          <img
                            src={article.image}
                            alt=""
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-orange-500">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {article.source}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(trend.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Search className="w-4 h-4 inline mr-1" />
                    Research
                  </a>
                  <Link
                    href={`/admin/articles/new?title=${encodeURIComponent(generateArticleIdea(trend.title))}`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Write Article
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && trends.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No trends available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try selecting a different country or trend type.
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Pro Tips for Using Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">⚡ Speed Matters</p>
            <p className="opacity-90">Publish trending articles within 1-2 hours for maximum traffic</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">🎯 Use Exact Keywords</p>
            <p className="opacity-90">Include the trending term in your title and first paragraph</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="font-medium mb-1">📊 Check Multiple Countries</p>
            <p className="opacity-90">Cover stories trending across Africa for wider reach</p>
          </div>
        </div>
      </div>
    </div>
  );
}
