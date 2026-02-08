'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Eye,
  MessageSquare,
  Send,
  Loader2,
  ExternalLink,
  Bookmark,
  Tag,
  BarChart3,
  History,
  Play,
  Pause,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Lock,
  Zap,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  status: string;
  featured: boolean;
  views: number;
  readingTime?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  };
}

interface EditorialReview {
  id: string;
  status: string;
  priority: string;
  reviewerId?: string;
  assignedAt?: string;
  reviewedAt?: string;
  deadline?: string;
  notes?: string;
  feedbackHistory: Feedback[];
}

interface Feedback {
  id: string;
  type: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isInternal: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  details?: string;
  createdAt: string;
}

interface PublishingRule {
  category: string;
  minWordCount: number;
  maxWordCount?: number;
  requiresFeaturedImage: boolean;
  requiresExcerpt: boolean;
  requiresMetaDescription: boolean;
  requiredTags: number;
}

const priorityOptions = [
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-500', description: 'Breaking news - immediate review' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-500', description: 'Important - same day' },
  { value: 'NORMAL', label: 'Normal', color: 'bg-blue-500', description: 'Standard - within 48 hours' },
  { value: 'LOW', label: 'Low', color: 'bg-gray-500', description: 'Can wait - within a week' },
];

export default function EditorialReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [review, setReview] = useState<EditorialReview | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [rules, setRules] = useState<PublishingRule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'activity' | 'checklist'>('feedback');

  const isEditor = session?.user && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes((session.user as any).role);
  const canApprove = session?.user && ['SUPER_ADMIN', 'ADMIN'].includes((session.user as any).role);
  const canPublish = session?.user && ['SUPER_ADMIN', 'ADMIN'].includes((session.user as any).role);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/editorial/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setPost(data.post);
      setReview(data.review);
      setActivityLog(data.activityLog || []);
      setRules(data.rules);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load editorial review');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleAction = async (action: string, additionalData: any = {}) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/editorial/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      await fetchData();
      setFeedbackText('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/editorial/${resolvedParams.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: feedbackText,
          isInternal: isInternalNote,
        }),
      });

      if (!response.ok) throw new Error('Failed to add feedback');

      await fetchData();
      setFeedbackText('');
      setIsInternalNote(false);
    } catch (err) {
      setError('Failed to add feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidationStatus = () => {
    if (!post || !rules) return [];

    const wordCount = post.content.split(/\s+/).length;
    const checks = [
      {
        label: `Minimum word count (${rules.minWordCount})`,
        passed: wordCount >= rules.minWordCount,
        current: `${wordCount} words`,
      },
      ...(rules.maxWordCount
        ? [{
            label: `Maximum word count (${rules.maxWordCount})`,
            passed: wordCount <= rules.maxWordCount,
            current: `${wordCount} words`,
          }]
        : []),
      {
        label: 'Featured image',
        passed: !!post.featuredImage,
        current: post.featuredImage ? 'Uploaded' : 'Missing',
      },
      {
        label: 'Excerpt',
        passed: !!post.excerpt,
        current: post.excerpt ? 'Added' : 'Missing',
      },
      {
        label: 'Meta description',
        passed: !!post.metaDescription,
        current: post.metaDescription ? 'Added' : 'Missing',
      },
      {
        label: `Minimum tags (${rules.requiredTags})`,
        passed: post.tags.length >= rules.requiredTags,
        current: `${post.tags.length} tags`,
      },
    ];

    return checks;
  };

  const validationChecks = getValidationStatus();
  const allChecksPassed = validationChecks.every(c => c.passed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileText className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500">Post not found</p>
        <Link href="/admin/editorial" className="mt-4 text-secondary hover:underline">
          Back to Editorial Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/editorial"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">
              Editorial Review
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review and approve content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Post
          </Link>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Post Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt=""
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${
                  post.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  post.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  post.status === 'CHANGES_REQUESTED' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  post.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {post.status === 'PENDING_REVIEW' && <Clock className="w-4 h-4" />}
                  {post.status === 'IN_REVIEW' && <Edit3 className="w-4 h-4" />}
                  {post.status === 'CHANGES_REQUESTED' && <AlertCircle className="w-4 h-4" />}
                  {post.status === 'APPROVED' && <CheckCircle className="w-4 h-4" />}
                  {post.status.replace(/_/g, ' ')}
                </span>
                {review?.priority && (
                  <span className={`px-2 py-1 text-xs font-medium rounded text-white ${
                    review.priority === 'URGENT' ? 'bg-red-500' :
                    review.priority === 'HIGH' ? 'bg-orange-500' :
                    review.priority === 'NORMAL' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {review.priority} Priority
                  </span>
                )}
                {post.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-secondary/20 text-secondary">
                    <Bookmark className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
                {post.title}
              </h2>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  {post.author.image ? (
                    <img src={post.author.image} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                  <span>{post.author.name}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    {post.author.role}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readingTime || Math.ceil(post.content.split(/\s+/).length / 200)} min read
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Category */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Category: <span className="font-medium capitalize">{post.category}</span>
              </p>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {post.excerpt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Content Preview */}
          {showPreview && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Preview
              </h3>
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4">
                {(post.content || '').split('\n\n').map((paragraph, idx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  
                  // Handle markdown-style headers
                  if (trimmed.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-bold mb-4 mt-8">{trimmed.slice(2)}</h1>;
                  }
                  if (trimmed.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-semibold mb-3 mt-6">{trimmed.slice(3)}</h2>;
                  }
                  if (trimmed.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-medium mb-2 mt-4">{trimmed.slice(4)}</h3>;
                  }
                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return <p key={idx} className="font-semibold mb-4">{trimmed.slice(2, -2)}</p>;
                  }
                  if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
                    return <p key={idx} className="italic mb-4">{trimmed.slice(1, -1)}</p>;
                  }
                  
                  return <p key={idx} className="mb-4 leading-relaxed">{trimmed}</p>;
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'feedback'
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Feedback
                  {review?.feedbackHistory?.length ? (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                      {review.feedbackHistory.length}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Activity Log
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'checklist'
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Checklist
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  {/* Add Feedback */}
                  {isEditor && (
                    <div className="space-y-3">
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Add feedback or comments..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <Lock className="w-4 h-4" />
                          Internal note (hidden from author)
                        </label>
                        <button
                          onClick={handleAddFeedback}
                          disabled={!feedbackText.trim() || isSubmitting}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Add Comment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Feedback List */}
                  <div className="space-y-4 mt-6">
                    {review?.feedbackHistory?.length ? (
                      review.feedbackHistory.map((fb) => (
                        <div
                          key={fb.id}
                          className={`p-4 rounded-lg ${
                            fb.isInternal
                              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                              : fb.type === 'REVISION_REQUEST'
                              ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                              : fb.type === 'APPROVAL'
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : fb.type === 'REJECTION'
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : 'bg-gray-50 dark:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {fb.authorName}
                              </span>
                              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                                {fb.authorRole}
                              </span>
                              {fb.isInternal && (
                                <span className="text-xs bg-purple-200 dark:bg-purple-700 text-purple-700 dark:text-purple-200 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Lock className="w-3 h-3" />
                                  Internal
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(fb.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {fb.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No feedback yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {activityLog.length ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                      {activityLog.map((log, index) => (
                        <div key={log.id} className="relative flex gap-4 pb-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            log.action === 'SUBMITTED' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            log.action === 'APPROVED' ? 'bg-green-100 dark:bg-green-900/30' :
                            log.action === 'REJECTED' ? 'bg-red-100 dark:bg-red-900/30' :
                            log.action === 'PUBLISHED' ? 'bg-secondary/20' :
                            'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {log.action === 'SUBMITTED' && <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                            {log.action === 'APPROVED' && <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />}
                            {log.action === 'REJECTED' && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                            {log.action === 'PUBLISHED' && <Zap className="w-4 h-4 text-secondary" />}
                            {!['SUBMITTED', 'APPROVED', 'REJECTED', 'PUBLISHED'].includes(log.action) && (
                              <History className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {log.userName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {log.details}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No activity recorded
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'checklist' && (
                <div className="space-y-3">
                  {validationChecks.map((check, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        check.passed
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {check.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">
                          {check.label}
                        </span>
                      </div>
                      <span className={`text-sm ${
                        check.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {check.current}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Review Actions
            </h3>

            <div className="space-y-3">
              {/* Start Review */}
              {post.status === 'PENDING_REVIEW' && isEditor && (
                <button
                  onClick={() => handleAction('START_REVIEW')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Review
                </button>
              )}

              {/* Request Changes */}
              {['IN_REVIEW', 'PENDING_REVIEW'].includes(post.status) && isEditor && (
                <button
                  onClick={() => {
                    if (feedbackText.trim()) {
                      handleAction('REQUEST_CHANGES', { feedback: feedbackText });
                    } else {
                      setError('Please add feedback before requesting changes');
                    }
                  }}
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Changes
                </button>
              )}

              {/* Approve */}
              {['IN_REVIEW', 'PENDING_REVIEW'].includes(post.status) && canApprove && (
                <button
                  onClick={() => handleAction('APPROVE', { feedback: feedbackText })}
                  disabled={isSubmitting || !allChecksPassed}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Approve
                </button>
              )}

              {/* Reject */}
              {['IN_REVIEW', 'PENDING_REVIEW'].includes(post.status) && canApprove && (
                <button
                  onClick={() => {
                    if (feedbackText.trim()) {
                      handleAction('REJECT', { feedback: feedbackText });
                    } else {
                      setError('Please provide a reason for rejection');
                    }
                  }}
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </button>
              )}

              {/* Publish */}
              {post.status === 'APPROVED' && canPublish && (
                <button
                  onClick={() => handleAction('PUBLISH')}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-primary font-bold rounded-lg hover:bg-secondary/90 disabled:opacity-50 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Publish Now
                </button>
              )}

              {/* Put on Hold */}
              {isEditor && !['PUBLISHED', 'REJECTED'].includes(post.status) && (
                <button
                  onClick={() => handleAction('HOLD', { notes: feedbackText })}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  Put on Hold
                </button>
              )}
            </div>

            {!allChecksPassed && canApprove && (
              <p className="mt-4 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Some requirements not met. Check the checklist tab.
              </p>
            )}
          </div>

          {/* Priority */}
          {isEditor && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Set Priority
              </h3>
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAction('ASSIGN', { priority: option.value })}
                    disabled={isSubmitting}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      review?.priority === option.value
                        ? 'border-secondary bg-secondary/5'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${option.color}`} />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Publishing Rules Info */}
          {rules && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Publishing Rules
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Min Words</span>
                  <span className="font-medium text-gray-900 dark:text-white">{rules.minWordCount}</span>
                </div>
                {rules.maxWordCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Max Words</span>
                    <span className="font-medium text-gray-900 dark:text-white">{rules.maxWordCount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Min Tags</span>
                  <span className="font-medium text-gray-900 dark:text-white">{rules.requiredTags}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Featured Image</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {rules.requiresFeaturedImage ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
