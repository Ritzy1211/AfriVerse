'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Inbox,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Send,
  FileText,
  User,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react';

interface QueueItem {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  category: { name: string; slug: string };
  author: { id: string; name: string; image: string; role: string };
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  editorialReview?: {
    status: string;
    priority: string;
    submittedAt: string;
    reviewer?: { name: string };
  };
}

interface QueueStats {
  pending: number;
  inReview: number;
  approved: number;
  changesRequested: number;
  publishedToday: number;
}

const priorityColors: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  NORMAL: 'bg-slate-100 text-slate-700 border-slate-200',
  LOW: 'bg-slate-50 text-slate-500 border-slate-200',
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING_REVIEW: { label: 'In Queue', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  IN_REVIEW: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-50', icon: Eye },
  CHANGES_REQUESTED: { label: 'Needs Revision', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
  APPROVED: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  PUBLISHED: { label: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Send },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

export default function EditorialDeskPage() {
  const { data: session } = useSession();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    inReview: 0,
    approved: 0,
    changesRequested: 0,
    publishedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await fetch(`/api/admin/desk/queue?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/desk/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchCategories();
    fetchQueue();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter, priorityFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQueue(), fetchStats()]);
    setRefreshing(false);
  };

  const handleClaimArticle = async (articleId: string) => {
    try {
      const res = await fetch(`/api/admin/desk/${articleId}/claim`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchQueue();
        fetchStats();
      }
    } catch (error) {
      console.error('Error claiming article:', error);
    }
  };

  const filteredQueue = queue.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editorial Desk</h1>
          <p className="text-slate-500">Review, edit, and publish submitted articles</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setStatusFilter('PENDING_REVIEW')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'PENDING_REVIEW'
              ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Inbox className="w-5 h-5 text-amber-600" />
            {stats.pending > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                {stats.pending}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
          <p className="text-xs text-slate-500">In Queue</p>
        </button>

        <button
          onClick={() => setStatusFilter('IN_REVIEW')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'IN_REVIEW'
              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.inReview}</p>
          <p className="text-xs text-slate-500">In Review</p>
        </button>

        <button
          onClick={() => setStatusFilter('CHANGES_REQUESTED')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'CHANGES_REQUESTED'
              ? 'bg-red-50 border-red-200 ring-2 ring-red-500/20'
              : 'bg-white border-slate-200 hover:border-red-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.changesRequested}</p>
          <p className="text-xs text-slate-500">Needs Revision</p>
        </button>

        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-xl border transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-green-50 border-green-200 ring-2 ring-green-500/20'
              : 'bg-white border-slate-200 hover:border-green-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
          <p className="text-xs text-slate-500">Approved</p>
        </button>

        <div className="p-4 rounded-xl border bg-white border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.publishedToday}</p>
          <p className="text-xs text-slate-500">Published Today</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            {statusConfig[statusFilter]?.label || 'All Articles'} ({filteredQueue.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500">Loading queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Queue is empty</h3>
            <p className="text-slate-500">No articles match your current filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredQueue.map((item) => {
              const config = statusConfig[item.status] || statusConfig.PENDING_REVIEW;
              const StatusIcon = config.icon;
              const isClaimable = item.status === 'PENDING_REVIEW' && !item.editorialReview?.reviewer;

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Priority indicator */}
                    <div className={`w-1 h-full min-h-[80px] rounded-full ${
                      item.editorialReview?.priority === 'URGENT' ? 'bg-red-500' :
                      item.editorialReview?.priority === 'HIGH' ? 'bg-orange-500' :
                      'bg-slate-200'
                    }`} />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Status & Priority badges */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${config.bg} ${config.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {config.label}
                            </span>
                            {item.editorialReview?.priority && item.editorialReview.priority !== 'NORMAL' && (
                              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${priorityColors[item.editorialReview.priority]}`}>
                                {item.editorialReview.priority}
                              </span>
                            )}
                            {item.editorialReview?.reviewer && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.editorialReview.reviewer.name}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <Link
                            href={`/admin/desk/${item.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors block"
                          >
                            {item.title || 'Untitled Article'}
                          </Link>

                          {/* Excerpt */}
                          {item.excerpt && (
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">{item.excerpt}</p>
                          )}

                          {/* Meta info */}
                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {item.author?.name || 'Unknown'}
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                              {item.category?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {item.wordCount || 0} words
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {getTimeAgo(item.editorialReview?.submittedAt || item.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isClaimable ? (
                            <button
                              onClick={() => handleClaimArticle(item.id)}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              Claim & Review
                            </button>
                          ) : (
                            <Link
                              href={`/admin/desk/${item.id}`}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                            >
                              {item.status === 'APPROVED' ? 'Publish' : 'Review'}
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
