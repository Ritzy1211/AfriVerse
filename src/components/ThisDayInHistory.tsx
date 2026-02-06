'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Flag, User, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface HistoricalEvent {
  year: number;
  event: string;
  category: string;
  country?: string;
  yearsAgo: number;
}

interface Birthday {
  name: string;
  born: number;
  description: string;
  country: string;
  age: number;
}

interface HistoryData {
  success: boolean;
  date: string;
  displayDate: string;
  events: HistoricalEvent[];
  birthdays: Birthday[];
  totalEvents: number;
}

const categoryColors: Record<string, string> = {
  Independence: 'bg-green-500',
  Politics: 'bg-blue-500',
  'Human Rights': 'bg-purple-500',
  Economics: 'bg-yellow-500',
  Culture: 'bg-pink-500',
  Tragedy: 'bg-red-500',
  Birthday: 'bg-orange-500',
  Science: 'bg-cyan-500',
  Media: 'bg-indigo-500',
  History: 'bg-gray-500',
  Global: 'bg-teal-500',
};

export default function ThisDayInHistory() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      setError('Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const hasContent = data.events.length > 0 || data.birthdays.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-bold">This Day in African History</span>
          </div>
          <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
            {data.displayDate}
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="p-4 space-y-3">
        {data.events.slice(0, 3).map((event, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <div className={`${categoryColors[event.category] || 'bg-gray-500'} w-2 h-2 rounded-full mt-2 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {event.year}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {event.yearsAgo} years ago
                </span>
                {event.country && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {event.country}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                {event.event}
              </p>
              <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full text-white ${categoryColors[event.category] || 'bg-gray-500'}`}>
                {event.category}
              </span>
            </div>
          </div>
        ))}

        {/* Birthdays */}
        {data.birthdays.slice(0, 1).map((person, index) => (
          <div 
            key={`birthday-${index}`}
            className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-orange-500"
          >
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <User className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                🎂 {person.name} was born today in {person.born}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {person.description} • {person.country}
              </p>
            </div>
          </div>
        ))}

        {/* View More Link */}
        {data.totalEvents > 3 && (
          <Link 
            href="/history"
            className="flex items-center justify-center gap-1 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium pt-2"
          >
            View all {data.totalEvents} events
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
