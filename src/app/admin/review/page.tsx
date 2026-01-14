'use client';

/**
 * Editorial Review Queue
 * 
 * Billboard-style content review dashboard for editors.
 * View, assign, review, approve, reject, and request changes on submitted content.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Flag
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
  };
  review?: {
    id: string;
    status: string;
    priority: string;
    deadline: string | null;
    assignedAt: string | null;
    notes: string | null;
    feedbackHistory: Array<{
      id: string;
      type: string;
      content: string;
      authorName: string;
      createdAt: string;
    }>;
  };
}

interface Stats {
  PENDING_REVIEW?: number;
  IN_REVIEW?: number;
  CHANGES_REQUESTED?: number;
  APPROVED?: number;
  REJECTED?: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  PENDING_REVIEW: { 
    label: 'Pending Review', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: <Clock className="w-4 h-4" />
  },
  IN_REVIEW: { 
    label: 'In Review', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <Eye className="w-4 h-4" />
  },
  CHANGES_REQUESTED: { 
    label: 'Changes Requested', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    icon: <Edit3 className="w-4 h-4" />
  },
  APPROVED: { 
    label: 'Approved', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: <CheckCircle className="w-4 h-4" />
  },
  REJECTED: { 
    label: 'Rejected', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: <XCircle className="w-4 h-4" />
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  URGENT: { label: 'Urgent', color: 'text-red-600 bg-red-100' },
  HIGH: { label: 'High', color: 'text-orange-600 bg-orange-100' },
  NORMAL: { label: 'Normal', color: 'text-gray-600 bg-gray-100' },
  LOW: { label: 'Low', color: 'text-blue-600 bg-blue-100' },
};

export default function ReviewQueuePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReviewQueue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchReviewQueue = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/workflow/review?status=${activeTab}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setPosts(data.posts);
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching review queue:', err);
      setError('Failed to load review queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, postId: string, feedbackText?: string) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/workflow/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action,
          feedback: feedbackText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      setSuccess(`Action completed successfully`);
      setShowReviewModal(false);
      setFeedback('');
      fetchReviewQueue();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/workflow/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'publish' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Publish failed');
      }

      setSuccess('Article published successfully!');
      fetchReviewQueue();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (post: Post) => {
    setSelectedPost(post);
    setShowReviewModal(true);
    setFeedback('');
    setError('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editorial Review Queue
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve submitted content before publication
          </p>
        </div>
        <button
          onClick={fetchReviewQueue}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = stats[status as keyof Stats] || 0;
          const isActive = activeTab === status.replace('_REVIEW', '').replace('PENDING_REVIEW', 'PENDING');
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status.replace('_REVIEW', '').replace('PENDING_REVIEW', 'PENDING'))}
              className={`p-4 rounded-xl border transition-all ${
                isActive 
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
              }`}
            >
              <div className={`flex items-center gap-2 ${config.color}`}>
                {config.icon}
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Review Queue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading review queue...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No articles in this queue right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => {
              const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.PENDING_REVIEW;
              const priorityConfig = PRIORITY_CONFIG[post.review?.priority || 'NORMAL'];
              
              return (
                <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {post.category}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>

                      {/* Author & Date */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.author.name || post.author.email}</span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {post.author.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        {post.review?.feedbackHistory && post.review.feedbackHistory.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.review.feedbackHistory.length} comments</span>
                          </div>
                        )}
                      </div>

                      {/* Recent Feedback */}
                      {post.review?.feedbackHistory && post.review.feedbackHistory.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 mb-1">Latest Feedback:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            "{post.review.feedbackHistory[0].content}"
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            — {post.review.feedbackHistory[0].authorName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap lg:flex-col gap-2 lg:w-48">
                      <Link
                        href={`/admin/posts/${post.id}/preview`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Link>
                      
                      {post.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => handleAction('start_review', post.id)}
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Start Review
                        </button>
                      )}

                      {(post.status === 'IN_REVIEW' || post.status === 'PENDING_REVIEW') && (
                        <>
                          <button
                            onClick={() => openReviewModal(post)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Review
                          </button>
                        </>
                      )}

                      {post.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePublish(post.id)}
                          disabled={isSubmitting}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                        >
                          <Send className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Review: {selectedPost.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                By {selectedPost.author.name || selectedPost.author.email}
              </p>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Feedback / Notes
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add your review comments here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3">
              <button
                onClick={() => handleAction('approve', selectedPost.id, feedback)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              
              <button
                onClick={() => {
                  if (!feedback.trim()) {
                    setError('Feedback is required when requesting changes');
                    return;
                  }
                  handleAction('request_changes', selectedPost.id, feedback);
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Edit3 className="w-4 h-4" />
                Request Changes
              </button>
              
              <button
                onClick={() => {
                  if (!feedback.trim()) {
                    setError('Feedback is required for rejection');
                    return;
                  }
                  handleAction('reject', selectedPost.id, feedback);
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
              
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setFeedback('');
                  setError('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
