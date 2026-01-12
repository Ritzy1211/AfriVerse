'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  MessageSquare,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import BrandedSpinner, { AfriPulseSpinner } from '@/components/BrandedSpinner';

interface Post {
  id: string;
  title: string;
  category: string;
  status: string;
  viewCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  author: {
    name: string;
  };
  content: string;
  post: {
    title: string;
  };
  createdAt: string;
}

interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalUsers: number;
  totalComments: number;
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalViews: 0,
    totalUsers: 0,
    totalComments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch recent posts
        const postsRes = await fetch('/api/admin/posts?limit=5');
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setRecentPosts(postsData.posts || []);
          setStats(prev => ({
            ...prev,
            totalPosts: postsData.pagination?.total || 0,
          }));
        }

        // Fetch pending comments
        const commentsRes = await fetch('/api/admin/comments?status=pending&limit=3');
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setPendingComments(commentsData.comments || []);
          setStats(prev => ({
            ...prev,
            totalComments: commentsData.pagination?.total || 0,
          }));
        }

        // Fetch stats
        const statsRes = await fetch('/api/admin/analytics/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({
            ...prev,
            totalViews: statsData.totalViews || 0,
            totalUsers: statsData.totalUsers || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'PUBLISHED': 'Published',
      'DRAFT': 'Draft',
      'REVIEW': 'Review',
      'SCHEDULED': 'Scheduled',
    };
    return statusMap[status] || status;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const statsDisplay = [
    { name: 'Total Posts', value: formatNumber(stats.totalPosts), change: '+12%', trend: 'up' as const, icon: FileText },
    { name: 'Total Views', value: formatNumber(stats.totalViews), change: '+8.3%', trend: 'up' as const, icon: Eye },
    { name: 'Active Users', value: formatNumber(stats.totalUsers), change: '+23%', trend: 'up' as const, icon: Users },
    { name: 'Comments', value: formatNumber(stats.totalComments), change: '+5%', trend: 'up' as const, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome back! Here&apos;s what&apos;s happening with AfriVerse today.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-secondary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Posts</h2>
            <Link href="/admin/posts" className="text-sm text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <AfriPulseSpinner size="md" />
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
                <Link href="/admin/posts/new" className="text-sm text-secondary hover:underline mt-2 inline-block">
                  Create your first post
                </Link>
              </div>
            ) : (
              recentPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{post.category}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          post.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {getStatusDisplay(post.status)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Eye className="w-3 h-3" />
                          {(post.viewCount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/posts/${post.id}/edit`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Articles</h2>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <BrandedSpinner size="md" />
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No articles yet</p>
            ) : (
              recentPosts.slice(0, 5).map((post, index) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-secondary text-primary' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(post.viewCount || 0).toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Comments & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Comments */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Comments</h2>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs rounded-full">
                {pendingComments.length}
              </span>
            </div>
            <Link href="/admin/comments" className="text-sm text-secondary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <AfriPulseSpinner size="md" />
              </div>
            ) : pendingComments.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No pending comments</p>
              </div>
            ) : (
              pendingComments.map((comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{comment.author?.name?.charAt(0) || 'A'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.author?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">on &quot;{comment.post?.title || 'Unknown'}&quot; • {formatTimeAgo(comment.createdAt)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-secondary/10 rounded-lg">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Create New Post</span>
            </Link>
            <Link
              href="/admin/media"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Upload Media</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
