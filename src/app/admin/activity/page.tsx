'use client';

/**
 * Activity Log Viewer
 * 
 * Enterprise audit trail for all editorial actions.
 * Shows who did what, when, and on which content.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  RefreshCw,
  ChevronDown,
  Download,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ActivityItem {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string | null;
  metadata: any;
  createdAt: string;
  message: string;
  style: {
    icon: string;
    color: string;
    bgColor: string;
  };
}

interface ActivityStats {
  byAction: Record<string, number>;
  byUser: Array<{ userId: string; userName: string; count: number }>;
}

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1,
    limit: 50,
  });

  useEffect(() => {
    fetchActivityLog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.current]);

  const fetchActivityLog = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('page', pagination.current.toString());
      params.set('limit', pagination.limit.toString());
      
      if (filters.action) params.set('action', filters.action);
      if (filters.userId) params.set('userId', filters.userId);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const response = await fetch(`/api/workflow/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setActivities(data.activities);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching activity log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User', 'Role', 'Action', 'Details', 'Post ID'];
    const rows = activities.map(a => [
      new Date(a.createdAt).toISOString(),
      a.userName,
      a.userRole,
      a.action,
      a.details || '',
      a.postId,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const actionTypes = stats?.byAction ? Object.keys(stats.byAction) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" />
            Activity Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete audit trail of all editorial actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={fetchActivityLog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Total Activities</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {pagination.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.byUser?.length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Top Action</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {Object.entries(stats.byAction || {}).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, ' ') || 'N/A'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm">Most Active</span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {stats.byUser?.[0]?.userName || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Actions</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User
              </label>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">All Users</option>
                {stats?.byUser?.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.userName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({ action: '', userId: '', startDate: '', endDate: '' });
                setPagination({ ...pagination, current: 1 });
              }}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading activity log...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No activities found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No editorial activities match your filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activity.style.bgColor}`}>
                    {activity.style.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{activity.userName}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {activity.userRole}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDate(activity.createdAt)}</span>
                      </div>
                      
                      {activity.postId && activity.postId !== 'system' && (
                        <Link 
                          href={`/admin/posts/${activity.postId}/edit`}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Post</span>
                        </Link>
                      )}
                    </div>

                    {activity.details && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        {activity.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current - 1 })}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, current: pagination.current + 1 })}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
