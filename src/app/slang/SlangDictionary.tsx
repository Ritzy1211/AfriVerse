'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  Globe, 
  Sparkles, 
  BookOpen, 
  Filter,
  Shuffle,
  Loader2,
  Heart
} from 'lucide-react';

interface Slang {
  id: string;
  slang: string;
  meaning: string;
  example: string;
  country: string;
  countryCode: string;
  flag: string;
  pronunciation: string;
  category: string;
}

export default function SlangDictionary() {
  const [slangs, setSlangs] = useState<Slang[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredSlang, setFeaturedSlang] = useState<Slang | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSlangs();
    fetchRandomSlang();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoritesSlangs');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const fetchSlangs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/slang');
      const data = await response.json();
      
      if (data.success) {
        setSlangs(data.slangs);
        setCountries(data.countries);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch slangs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomSlang = async () => {
    try {
      const response = await fetch('/api/slang?random=true');
      const data = await response.json();
      if (data.success) {
        setFeaturedSlang(data.slang);
      }
    } catch (error) {
      console.error('Failed to fetch random slang:', error);
    }
  };

  const speakSlang = (slang: Slang) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const text = `${slang.slang}. ${slang.meaning}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleFavorite = (slangId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(slangId)) {
      newFavorites.delete(slangId);
    } else {
      newFavorites.add(slangId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritesSlangs', JSON.stringify([...newFavorites]));
  };

  const filteredSlangs = slangs.filter(slang => {
    const matchesSearch = search === '' || 
      slang.slang.toLowerCase().includes(search.toLowerCase()) ||
      slang.meaning.toLowerCase().includes(search.toLowerCase()) ||
      slang.country.toLowerCase().includes(search.toLowerCase());
    
    const matchesCountry = selectedCountry === 'all' || slang.country === selectedCountry;
    const matchesCategory = selectedCategory === 'all' || slang.category === selectedCategory;
    
    return matchesSearch && matchesCountry && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                African Slang Dictionary
              </h1>
              <p className="text-white/80">
                🌍 Learn the lingo from across the continent
              </p>
            </div>
          </div>
          
          <p className="text-lg opacity-90 mb-8 max-w-2xl">
            From Nigerian Pidgin to South African slang, Kenyan Sheng to Ghanaian expressions. 
            Discover the vibrant language of Africa.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search slangs, meanings, or countries..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Featured Slang of the Day */}
      {featuredSlang && (
        <div className="container mx-auto px-4 -mt-6">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-orange-200 dark:border-orange-800"
            style={{
              boxShadow: '0 20px 40px -12px rgba(249, 115, 22, 0.25)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Today's Featured Slang
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {featuredSlang.flag} {featuredSlang.country}
                  </p>
                </div>
              </div>
              <button
                onClick={fetchRandomSlang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors text-sm"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-3xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                "{featuredSlang.slang}"
              </h2>
              <button
                onClick={() => speakSlang(featuredSlang)}
                className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-3">
              /{featuredSlang.pronunciation}/
            </p>
            
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              {featuredSlang.meaning}
            </p>
            
            <p className="text-gray-500 dark:text-gray-400 italic">
              {featuredSlang.example}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              {/* Country Filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Countries</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Quick Country Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {['🇳🇬 Nigeria', '🇿🇦 South Africa', '🇬🇭 Ghana', '🇰🇪 Kenya'].map(country => {
                    const countryName = country.split(' ')[1];
                    return (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(selectedCountry === countryName ? 'all' : countryName)}
                        className={`px-2 py-1 rounded-full text-xs transition-colors ${
                          selectedCountry === countryName 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {country}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-500">{slangs.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slangs in Dictionary</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slang Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `${filteredSlangs.length} slangs found`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSlangs.map(slang => (
                  <div
                    key={slang.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group"
                    style={{
                      transform: 'perspective(1000px) rotateX(0deg)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{slang.flag}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{slang.country}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(slang.id)}
                          className={`p-1.5 rounded-lg transition-all ${
                            favorites.has(slang.id)
                              ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${favorites.has(slang.id) ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => speakSlang(slang)}
                          className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                      "{slang.slang}"
                    </h3>
                    
                    <p className="text-xs text-gray-400 font-mono mb-2">
                      /{slang.pronunciation}/
                    </p>

                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mb-3">
                      {slang.category}
                    </span>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {slang.meaning}
                    </p>

                    <p className="text-gray-500 dark:text-gray-500 text-sm italic">
                      {slang.example}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredSlangs.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No slangs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
