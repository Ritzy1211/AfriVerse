'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Loader2,
  ArrowRight,
  ChevronDown,
  Send,
  Zap,
  TrendingUp,
  LayoutGrid,
  List,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
  editorialReview?: {
    id: string;
    status: string;
    priority: string;
    reviewerId?: string;
    assignedAt?: string;
    reviewedAt?: string;
    notes?: string;
    feedbackHistory: Array<{
      id: string;
      type: string;
      content: string;
      authorName: string;
      createdAt: string;
    }>;
  };
}

interface StatusCounts {
  PENDING_REVIEW?: number;
  IN_REVIEW?: number;
  CHANGES_REQUESTED?: number;
  APPROVED?: number;
  REJECTED?: number;
}

const statusConfig = {
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Edit3 },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Clock },
  ASSIGNED: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: User },
  REVISION_SUBMITTED: { label: 'Revision Submitted', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Send },
};

const priorityConfig = {
  URGENT: { label: 'Urgent', color: 'bg-red-500 text-white', icon: Zap },
  HIGH: { label: 'High', color: 'bg-orange-500 text-white', icon: TrendingUp },
  NORMAL: { label: 'Normal', color: 'bg-blue-500 text-white', icon: Clock },
  LOW: { label: 'Low', color: 'bg-gray-500 text-white', icon: Clock },
};

export default function EditorialQueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Business', 'Entertainment', 'Lifestyle', 'Sports', 'Technology', 'Politics'];

  const fetchQueue = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/admin/editorial?${params}`);
      if (!response.ok) throw new Error('Failed to fetch queue');

      const data = await response.json();
      setPosts(data.posts || []);
      setStatusCounts(data.statusCounts || {});
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load editorial queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedPriority, selectedCategory]);

  const filteredPosts = posts.filter(post => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.author.name?.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const getPriorityInfo = (priority: string) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.NORMAL;
  };

  const totalPending = Object.values(statusCounts).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
            Editorial Queue
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review and approve content before publishing
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setSelectedStatus('')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedStatus === ''
              ? 'border-secondary bg-secondary/5'
              : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">All Pending</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedStatus === 'PENDING'
              ? 'border-secondary bg-secondary/5'
              : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.PENDING_REVIEW || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting Review</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedStatus('IN_REVIEW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedStatus === 'IN_REVIEW'
              ? 'border-secondary bg-secondary/5'
              : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.IN_REVIEW || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">In Review</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedStatus('CHANGES_REQUESTED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedStatus === 'CHANGES_REQUESTED'
              ? 'border-secondary bg-secondary/5'
              : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.CHANGES_REQUESTED || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Changes Needed</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedStatus('APPROVED')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedStatus === 'APPROVED'
              ? 'border-secondary bg-secondary/5'
              : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.APPROVED || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ready to Publish</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-secondary text-primary'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedStatus('');
                setSelectedPriority('');
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className="self-end px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchQueue}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl">
          <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All caught up!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No posts pending review at the moment.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPosts.map((post) => {
                  const statusInfo = getStatusInfo(post.status);
                  const priorityInfo = getPriorityInfo(post.editorialReview?.priority || 'NORMAL');
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {post.title}
                            </p>
                            {post.editorialReview?.feedbackHistory?.length ? (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <MessageSquare className="w-3 h-3" />
                                {post.editorialReview.feedbackHistory.length} comments
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {post.author.image ? (
                            <img
                              src={post.author.image}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {post.author.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">{post.author.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/editorial/${post.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-primary text-xs font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                          >
                            Review
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => {
            const statusInfo = getStatusInfo(post.status);
            const priorityInfo = getPriorityInfo(post.editorialReview?.priority || 'NORMAL');
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                {post.featuredImage ? (
                  <img
                    src={post.featuredImage}
                    alt=""
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  {/* Status & Priority */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityInfo.color}`}>
                      {priorityInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="capitalize">{post.category}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {post.author.image ? (
                        <img
                          src={post.author.image}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {post.author.name || 'Unknown'}
                      </span>
                    </div>
                    <Link
                      href={`/admin/editorial/${post.id}`}
                      className="inline-flex items-center gap-1 text-sm text-secondary hover:text-secondary/80 font-medium"
                    >
                      Review
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
