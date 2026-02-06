'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Music,
  Trophy,
  Laptop,
  Briefcase,
  Palette,
  Sparkles,
  Film,
  Flag,
  ExternalLink,
  Star,
  Ticket,
  Globe,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  country: string;
  category: string;
  imageUrl: string;
  ticketUrl: string | null;
  isFree: boolean;
  featured: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Music: <Music className="w-4 h-4" />,
  Sports: <Trophy className="w-4 h-4" />,
  Technology: <Laptop className="w-4 h-4" />,
  Business: <Briefcase className="w-4 h-4" />,
  Culture: <Palette className="w-4 h-4" />,
  Fashion: <Sparkles className="w-4 h-4" />,
  Film: <Film className="w-4 h-4" />,
  Holiday: <Flag className="w-4 h-4" />
};

const categoryColors: Record<string, string> = {
  Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Business: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Culture: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Fashion: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  Film: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Holiday: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedCountry !== 'all') params.set('country', selectedCountry);
      params.set('upcoming', 'true');

      const response = await fetch(`/api/events?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
        setCategories(data.categories);
        setCountries(data.countries);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedCountry, currentDate]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth && sameYear) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${start.getFullYear()}`;
    }

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ongoing';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days away`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks away`;
    return `${Math.ceil(diffDays / 30)} months away`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const featuredEvents = events.filter(e => e.featured).slice(0, 3);
  const upcomingEvents = events.slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            🌍 African Events Calendar
          </h1>
          <p className="text-lg opacity-90 mb-8 max-w-2xl">
            Discover festivals, concerts, tech conferences, sports events, and cultural celebrations happening across Africa.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{events.length}</span>
              <span className="text-sm ml-2 opacity-80">Upcoming Events</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{countries.length}</span>
              <span className="text-sm ml-2 opacity-80">Countries</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">{categories.length}</span>
              <span className="text-sm ml-2 opacity-80">Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <div className="container mx-auto px-4 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvents.map(event => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="relative h-40">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
                      {event.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold line-clamp-1">{event.title}</h3>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDateRange(event.startDate, event.endDate)}
                  </span>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    {getDaysUntil(event.startDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm sticky top-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

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

              {/* Quick Category Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2">
                  {['Music', 'Sports', 'Technology'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Event CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/events/submit"
                  className="block w-full text-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  Submit Event - Free
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Get featured across Africa
                </p>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Upcoming Events
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {loading ? 'Loading...' : `${events.length} events found`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="relative h-36">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400`;
                        }}
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${categoryColors[event.category]}`}>
                          {categoryIcons[event.category]}
                          {event.category}
                        </span>
                        {event.featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      {event.isFree && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          FREE
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {event.location}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateRange(event.startDate, event.endDate)}
                        </span>
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                          {getDaysUntil(event.startDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && events.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your filters or check back later
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-64">
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ×
              </button>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[selectedEvent.category]} mb-2`}>
                  {categoryIcons[selectedEvent.category]}
                  {selectedEvent.category}
                </span>
                <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  <Globe className="w-4 h-4" />
                  {selectedEvent.country}
                </span>
                {selectedEvent.isFree && (
                  <span className="flex items-center gap-1 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    <Ticket className="w-4 h-4" />
                    Free Entry
                  </span>
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {selectedEvent.description}
              </p>

              <div className="flex gap-3">
                {selectedEvent.ticketUrl ? (
                  <a
                    href={selectedEvent.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-6 py-3 bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4" />
                    Get Tickets
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button className="flex-1 text-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold rounded-xl cursor-not-allowed">
                    No Ticket Link Available
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
