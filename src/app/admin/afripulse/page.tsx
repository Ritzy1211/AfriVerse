'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Building2,
  Users,
  Cpu,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import BrandedSpinner, { AfriPulseSpinner } from '@/components/BrandedSpinner';

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
  overallTrend: string;
  economyTrend: string;
  politicsTrend: string;
  socialTrend: string;
  techTrend: string;
  topStory?: string;
  topStoryUrl?: string;
  keyIndicators: string[];
  lastUpdated: string;
}

const trendOptions = ['RISING', 'FALLING', 'STABLE', 'VOLATILE'];
const trendIcons: Record<string, any> = {
  RISING: TrendingUp,
  FALLING: TrendingDown,
  STABLE: Minus,
  VOLATILE: Activity,
};
const trendColors: Record<string, string> = {
  RISING: 'text-green-500',
  FALLING: 'text-red-500',
  STABLE: 'text-gray-500',
  VOLATILE: 'text-amber-500',
};

// African countries data
const africanCountries = [
  { code: 'NG', name: 'Nigeria', emoji: '🇳🇬' },
  { code: 'KE', name: 'Kenya', emoji: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', emoji: '🇿🇦' },
  { code: 'GH', name: 'Ghana', emoji: '🇬🇭' },
  { code: 'EG', name: 'Egypt', emoji: '🇪🇬' },
  { code: 'ET', name: 'Ethiopia', emoji: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', emoji: '🇹🇿' },
  { code: 'MA', name: 'Morocco', emoji: '🇲🇦' },
  { code: 'RW', name: 'Rwanda', emoji: '🇷🇼' },
  { code: 'SN', name: 'Senegal', emoji: '🇸🇳' },
  { code: 'CI', name: 'Côte d\'Ivoire', emoji: '🇨🇮' },
  { code: 'UG', name: 'Uganda', emoji: '🇺🇬' },
  { code: 'CM', name: 'Cameroon', emoji: '🇨🇲' },
  { code: 'AO', name: 'Angola', emoji: '🇦🇴' },
  { code: 'TN', name: 'Tunisia', emoji: '🇹🇳' },
];

// Sample data
const sampleData: CountryPulse[] = [
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
];

export default function AfriPulseAdminPage() {
  const [pulseData, setPulseData] = useState<CountryPulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CountryPulse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [suggestionDays, setSuggestionDays] = useState(7);
  
  const [newCountry, setNewCountry] = useState({
    country: '',
    economyScore: 50,
    politicsScore: 50,
    socialScore: 50,
    techScore: 50,
    economyTrend: 'STABLE',
    politicsTrend: 'STABLE',
    socialTrend: 'STABLE',
    techTrend: 'STABLE',
    topStory: '',
    topStoryUrl: '',
    keyIndicators: '',
  });

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/afripulse');
      if (!response.ok) throw new Error('Failed to fetch AfriPulse data');
      const data = await response.json();
      
      // Map API response to component format
      const mapped = (data.countries || []).map((c: any) => ({
        id: c.id,
        country: c.country,
        countryName: c.countryName,
        flagEmoji: c.flagEmoji,
        economyScore: c.economyScore,
        politicsScore: c.politicsScore,
        socialScore: c.socialScore,
        techScore: c.techScore,
        overallScore: c.overallScore,
        overallTrend: c.overallTrend,
        economyTrend: c.economyTrend,
        politicsTrend: c.politicsTrend,
        socialTrend: c.socialTrend,
        techTrend: c.techTrend,
        topStory: c.topStory,
        topStoryUrl: c.topStoryUrl,
        keyIndicators: c.keyIndicators || [],
        lastUpdated: c.lastUpdated || c.updatedAt,
      }));
      
      setPulseData(mapped);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching AfriPulse data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = pulseData.filter(
    (item) =>
      item.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (item: CountryPulse) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    setActionLoading(editForm.id);
    
    try {
      const response = await fetch(`/api/admin/afripulse/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          economyScore: editForm.economyScore,
          politicsScore: editForm.politicsScore,
          socialScore: editForm.socialScore,
          techScore: editForm.techScore,
          economyTrend: editForm.economyTrend,
          politicsTrend: editForm.politicsTrend,
          socialTrend: editForm.socialTrend,
          techTrend: editForm.techTrend,
          topStory: editForm.topStory,
          topStoryUrl: editForm.topStoryUrl,
          keyIndicators: editForm.keyIndicators,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      // Update local state
      setPulseData((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...editForm,
                overallScore: Math.round(
                  (editForm.economyScore + editForm.politicsScore + editForm.socialScore + editForm.techScore) / 4
                ),
                lastUpdated: new Date().toISOString(),
              }
            : item
        )
      );
      setEditingId(null);
      setEditForm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this country from AfriPulse?')) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/afripulse/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setPulseData((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCountry = async () => {
    const countryInfo = africanCountries.find((c) => c.code === newCountry.country);
    if (!countryInfo) return;

    setActionLoading('add');
    try {
      const overallScore = Math.round(
        (newCountry.economyScore + newCountry.politicsScore + newCountry.socialScore + newCountry.techScore) / 4
      );

      const response = await fetch('/api/admin/afripulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: countryInfo.code,
          countryName: countryInfo.name,
          flagEmoji: countryInfo.emoji,
          economyScore: newCountry.economyScore,
          politicsScore: newCountry.politicsScore,
          socialScore: newCountry.socialScore,
          techScore: newCountry.techScore,
          economyTrend: newCountry.economyTrend,
          politicsTrend: newCountry.politicsTrend,
          socialTrend: newCountry.socialTrend,
          techTrend: newCountry.techTrend,
          topStory: newCountry.topStory,
          topStoryUrl: newCountry.topStoryUrl,
          keyIndicators: newCountry.keyIndicators.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add country');
      }

      const data = await response.json();
      
      const newEntry: CountryPulse = {
        id: data.id || Date.now().toString(),
        country: countryInfo.code,
        countryName: countryInfo.name,
        flagEmoji: countryInfo.emoji,
        economyScore: newCountry.economyScore,
        politicsScore: newCountry.politicsScore,
        socialScore: newCountry.socialScore,
        techScore: newCountry.techScore,
        overallScore,
        overallTrend: determineTrend([newCountry.economyTrend, newCountry.politicsTrend, newCountry.socialTrend, newCountry.techTrend]),
        economyTrend: newCountry.economyTrend,
        politicsTrend: newCountry.politicsTrend,
        socialTrend: newCountry.socialTrend,
        techTrend: newCountry.techTrend,
        topStory: newCountry.topStory,
        topStoryUrl: newCountry.topStoryUrl,
        keyIndicators: newCountry.keyIndicators.split(',').map((s) => s.trim()).filter(Boolean),
        lastUpdated: new Date().toISOString(),
      };

      setPulseData((prev) => [...prev, newEntry]);
      setShowAddModal(false);
      setNewCountry({
        country: '',
        economyScore: 50,
        politicsScore: 50,
        socialScore: 50,
        techScore: 50,
        economyTrend: 'STABLE',
        politicsTrend: 'STABLE',
        socialTrend: 'STABLE',
        techTrend: 'STABLE',
        topStory: '',
        topStoryUrl: '',
        keyIndicators: '',
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add country');
    } finally {
      setActionLoading(null);
    }
  };

  const determineTrend = (trends: string[]): string => {
    const risingCount = trends.filter((t) => t === 'RISING').length;
    const fallingCount = trends.filter((t) => t === 'FALLING').length;
    if (risingCount >= 3) return 'RISING';
    if (fallingCount >= 3) return 'FALLING';
    if (risingCount > 0 && fallingCount > 0) return 'VOLATILE';
    return 'STABLE';
  };

  const renderTrendBadge = (trend: string) => {
    const Icon = trendIcons[trend] || Minus;
    return (
      <span className={`inline-flex items-center gap-1 ${trendColors[trend] || 'text-gray-500'}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs">{trend}</span>
      </span>
    );
  };

  // Fetch AI suggestions from article analysis
  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const response = await fetch(`/api/admin/afripulse/suggestions?days=${suggestionDays}`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.data);
      setShowSuggestions(true);
    } catch (err: any) {
      alert(err.message || 'Failed to generate suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Apply a suggestion to a country
  const applySuggestion = async (countryCode: string, scores: any) => {
    setActionLoading(`suggestion-${countryCode}`);
    try {
      const response = await fetch('/api/admin/afripulse/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, scores }),
      });
      if (!response.ok) throw new Error('Failed to apply suggestion');
      
      // Refresh data
      await fetchData();
      
      // Remove from suggestions
      if (suggestions) {
        setSuggestions({
          ...suggestions,
          countrySuggestions: suggestions.countrySuggestions.filter(
            (s: any) => s.countryCode !== countryCode
          ),
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to apply suggestion');
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AfriPulseSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" />
            AfriPulse Index™ Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage country sentiment scores and trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSuggestions}
            disabled={suggestionsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {suggestionsLoading ? (
              <BrandedSpinner size="sm" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Suggestions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && suggestions && (
        <div className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI-Generated Suggestions</h2>
              <span className="text-sm text-gray-500">
                Based on {suggestions.analyzedArticleCount} articles from last {suggestionDays} days
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={suggestionDays}
                onChange={(e) => setSuggestionDays(Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
              </select>
              <button
                onClick={fetchSuggestions}
                disabled={suggestionsLoading}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Country Suggestions */}
          {suggestions.countrySuggestions && suggestions.countrySuggestions.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Country Sentiment Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {suggestions.countrySuggestions.slice(0, 6).map((suggestion: any) => (
                  <div
                    key={suggestion.countryCode}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {suggestion.countryName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {suggestion.articleCount} articles
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Overall:</span>
                        <span className="font-medium">{suggestion.overallSentiment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Economy:</span>
                        <span className="font-medium">{suggestion.economySentiment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Politics:</span>
                        <span className="font-medium">{suggestion.politicsSentiment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tech:</span>
                        <span className="font-medium">{suggestion.techSentiment}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.confidence >= 70 ? 'bg-green-100 text-green-700' :
                        suggestion.confidence >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {suggestion.confidence}% confidence
                      </span>
                      <button
                        onClick={() => applySuggestion(suggestion.countryCode, {
                          overallSentiment: suggestion.overallSentiment,
                          economySentiment: suggestion.economySentiment,
                          politicsSentiment: suggestion.politicsSentiment,
                          socialSentiment: suggestion.socialSentiment,
                          techSentiment: suggestion.techSentiment,
                        })}
                        disabled={actionLoading === `suggestion-${suggestion.countryCode}`}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                      >
                        {actionLoading === `suggestion-${suggestion.countryCode}` ? (
                          <BrandedSpinner size="sm" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No suggestions available. Publish more articles to get AI-powered sentiment analysis.</p>
          )}

          {/* Trending Topics Suggestions */}
          {suggestions.topicSuggestions && suggestions.topicSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detected Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.topicSuggestions.map((topic: any, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                  >
                    <Zap className="w-3 h-3" />
                    {topic.name}
                    <span className="text-xs opacity-70">({topic.articleCount})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Countries Tracked</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pulseData.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg Continental Score</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Math.round(pulseData.reduce((sum, c) => sum + c.overallScore, 0) / pulseData.length || 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Rising Trends</div>
          <div className="text-2xl font-bold text-green-500 mt-1">
            {pulseData.filter((c) => c.overallTrend === 'RISING').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Falling Trends</div>
          <div className="text-2xl font-bold text-red-500 mt-1">
            {pulseData.filter((c) => c.overallTrend === 'FALLING').length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Country
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Overall
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Economy
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Politics
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Social
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Tech
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Trend
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {editingId === item.id && editForm ? (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.flagEmoji}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.countryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {Math.round((editForm.economyScore + editForm.politicsScore + editForm.socialScore + editForm.techScore) / 4)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.economyScore}
                            onChange={(e) => setEditForm({ ...editForm, economyScore: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-center border rounded"
                          />
                          <select
                            value={editForm.economyTrend}
                            onChange={(e) => setEditForm({ ...editForm, economyTrend: e.target.value })}
                            className="w-20 px-1 py-0.5 text-xs border rounded"
                          >
                            {trendOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.politicsScore}
                            onChange={(e) => setEditForm({ ...editForm, politicsScore: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-center border rounded"
                          />
                          <select
                            value={editForm.politicsTrend}
                            onChange={(e) => setEditForm({ ...editForm, politicsTrend: e.target.value })}
                            className="w-20 px-1 py-0.5 text-xs border rounded"
                          >
                            {trendOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.socialScore}
                            onChange={(e) => setEditForm({ ...editForm, socialScore: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-center border rounded"
                          />
                          <select
                            value={editForm.socialTrend}
                            onChange={(e) => setEditForm({ ...editForm, socialTrend: e.target.value })}
                            className="w-20 px-1 py-0.5 text-xs border rounded"
                          >
                            {trendOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.techScore}
                            onChange={(e) => setEditForm({ ...editForm, techScore: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-center border rounded"
                          />
                          <select
                            value={editForm.techTrend}
                            onChange={(e) => setEditForm({ ...editForm, techTrend: e.target.value })}
                            className="w-20 px-1 py-0.5 text-xs border rounded"
                          >
                            {trendOptions.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderTrendBadge(determineTrend([editForm.economyTrend, editForm.politicsTrend, editForm.socialTrend, editForm.techTrend]))}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">Now</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.flagEmoji}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.countryName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">{item.overallScore}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-gray-900 dark:text-white">{item.economyScore}</span>
                          {renderTrendBadge(item.economyTrend)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-gray-900 dark:text-white">{item.politicsScore}</span>
                          {renderTrendBadge(item.politicsTrend)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-gray-900 dark:text-white">{item.socialScore}</span>
                          {renderTrendBadge(item.socialTrend)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-gray-900 dark:text-white">{item.techScore}</span>
                          {renderTrendBadge(item.techTrend)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{renderTrendBadge(item.overallTrend)}</td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Country Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Country to AfriPulse</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                <select
                  value={newCountry.country}
                  onChange={(e) => setNewCountry({ ...newCountry, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {africanCountries
                    .filter((c) => !pulseData.some((p) => p.country === c.code))
                    .map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['economy', 'politics', 'social', 'tech'].map((metric) => (
                  <div key={metric}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {metric} Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newCountry[`${metric}Score` as keyof typeof newCountry] as number}
                      onChange={(e) =>
                        setNewCountry({ ...newCountry, [`${metric}Score`]: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newCountry[`${metric}Trend` as keyof typeof newCountry] as string}
                      onChange={(e) => setNewCountry({ ...newCountry, [`${metric}Trend`]: e.target.value })}
                      className="w-full mt-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {trendOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Top Story</label>
                <input
                  type="text"
                  value={newCountry.topStory}
                  onChange={(e) => setNewCountry({ ...newCountry, topStory: e.target.value })}
                  placeholder="Main headline affecting sentiment"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Top Story URL</label>
                <input
                  type="text"
                  value={newCountry.topStoryUrl}
                  onChange={(e) => setNewCountry({ ...newCountry, topStoryUrl: e.target.value })}
                  placeholder="/category/article-slug"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Indicators (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCountry.keyIndicators}
                  onChange={(e) => setNewCountry({ ...newCountry, keyIndicators: e.target.value })}
                  placeholder="Indicator 1, Indicator 2, Indicator 3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCountry}
                disabled={!newCountry.country}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
