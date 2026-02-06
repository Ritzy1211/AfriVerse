'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Crown,
  Mail,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AfriPulseSpinner } from '@/components/BrandedSpinner';

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  isPremium: boolean;
  subscribedAt: string;
  source?: string;
  subscriptions?: Array<{
    id: string;
    plan: string;
    status: string;
    amount: number;
    currentPeriodEnd: string;
  }>;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [error, setError] = useState('');

  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (filterPremium !== 'all') {
        params.append('premium', filterPremium === 'premium' ? 'true' : 'false');
      }

      const response = await fetch(`/api/admin/subscribers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch subscribers');
      
      const data = await response.json();
      setSubscribers(data.subscribers || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalSubscribers(data.pagination?.total || 0);
      setPremiumCount(data.premiumCount || 0);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, filterPremium]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Debounce search - reset to page 1 when searching
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const togglePremiumStatus = async (subscriberId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${subscriberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !currentStatus }),
      });
      
      if (response.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      setError('Failed to update subscriber');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Subscribers
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage newsletter and premium subscribers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Premium Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{premiumCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSubscribers > 0 ? ((premiumCount / totalSubscribers) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Premium Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterPremium}
              onChange={(e) => setFilterPremium(e.target.value as 'all' | 'premium' | 'free')}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Subscribers</option>
              <option value="premium">Premium Only</option>
              <option value="free">Free Only</option>
            </select>
          </div>

          <button
            onClick={fetchSubscribers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <AfriPulseSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-500">{error}</p>
            <button onClick={fetchSubscribers} className="px-4 py-2 bg-secondary text-primary rounded-lg">
              Retry
            </button>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Users className="w-12 h-12 text-gray-400" />
            <p className="text-gray-500">No subscribers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{subscriber.email}</div>
                            {subscriber.name && (
                              <div className="text-sm text-gray-500">{subscriber.name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                          subscriber.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {subscriber.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {subscriber.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {subscriber.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <Crown className="w-3 h-3" />
                            Premium
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Free</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {subscriber.subscriptions && subscriber.subscriptions.length > 0 ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {subscriber.subscriptions[0].plan}
                            </div>
                            <div className="text-gray-500">
                              {formatCurrency(subscriber.subscriptions[0].amount)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 capitalize">
                        {subscriber.source || 'website'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => togglePremiumStatus(subscriber.id, subscriber.isPremium)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            subscriber.isPremium
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {subscriber.isPremium ? 'Remove Premium' : 'Grant Premium'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
