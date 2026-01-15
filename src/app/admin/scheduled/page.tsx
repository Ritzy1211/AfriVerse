'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  Clock, 
  Calendar, 
  Edit, 
  Trash2, 
  Play, 
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ScheduledPost {
  id: string;
  title: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
  };
  scheduledAt: string;
  createdAt: string;
  featured: boolean;
}

export default function ScheduledPostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/posts?status=SCHEDULED&sort=scheduledAt&limit=100');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else {
        setError('Failed to fetch scheduled posts');
      }
    } catch {
      setError('Failed to fetch scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const publishNow = async (postId: string) => {
    if (!confirm('Publish this post immediately?')) return;
    
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
          scheduledAt: null
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Post published successfully!' });
        fetchScheduledPosts();
      } else {
        setMessage({ type: 'error', text: 'Failed to publish post' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to publish post' });
    } finally {
      setActionLoading(null);
    }
  };

  const cancelSchedule = async (postId: string) => {
    if (!confirm('Cancel the schedule and move this post back to draft?')) return;
    
    setActionLoading(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'DRAFT',
          scheduledAt: null
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Schedule cancelled. Post moved to drafts.' });
        fetchScheduledPosts();
      } else {
        setMessage({ type: 'error', text: 'Failed to cancel schedule' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to cancel schedule' });
    } finally {
      setActionLoading(null);
    }
  };

  const triggerCron = async () => {
    try {
      const res = await fetch('/api/cron/publish-scheduled', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev-test'}`
        }
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: `Published ${data.publishedCount} scheduled posts` 
        });
        fetchScheduledPosts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to run scheduler' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to run scheduler' });
    }
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative = '';
    if (diffMs < 0) {
      relative = 'Overdue - will publish on next cron run';
    } else if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      relative = `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      relative = `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      relative = `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }

    return {
      formatted: date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      relative,
      isOverdue: diffMs < 0
    };
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/posts"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Scheduled Posts
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {posts.length} post{posts.length !== 1 ? 's' : ''} scheduled for publishing
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchScheduledPosts}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={triggerCron}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Scheduler
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Scheduled Posts
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Schedule posts to be published automatically at a specific date and time.
          </p>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Create New Post
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Scheduled For
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => {
                  const scheduleInfo = formatScheduledDate(post.scheduledAt);
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="font-medium text-gray-900 dark:text-white hover:text-secondary transition-colors"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                              {post.category?.name || 'Uncategorized'}
                            </span>
                            {post.featured && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {post.author?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${scheduleInfo.isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm">
                              {scheduleInfo.formatted}
                            </p>
                            <p className={`text-xs ${scheduleInfo.isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                              {scheduleInfo.relative}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => publishNow(post.id)}
                            disabled={actionLoading === post.id}
                            className="p-2 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Publish Now"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelSchedule(post.id)}
                            disabled={actionLoading === post.id}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          How Scheduled Publishing Works
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Posts are automatically published every 5 minutes when their scheduled time passes.</span>
          </li>
          <li className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Set a publish date in the post editor to schedule content for future publication.</span>
          </li>
          <li className="flex items-start gap-2">
            <Play className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Click the play button to publish a post immediately, bypassing the schedule.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
