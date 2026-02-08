'use client';

/**
 * Admin Post Preview Page
 * 
 * Allows editors to preview an article before approving/publishing.
 * Shows the article exactly as it would appear to readers.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  MessageSquare
} from 'lucide-react';
import BrandedSpinner from '@/components/BrandedSpinner';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
  };
}

export default function AdminPostPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'changes'>('approve');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchPost();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/posts/${postId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      setPost(data);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    if (!post) return;
    
    try {
      setIsSubmitting(true);
      
      const actionMap = {
        approve: 'approve',
        reject: 'reject',
        changes: 'request_changes',
      };
      
      const response = await fetch('/api/workflow/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post.id,
          action: actionMap[actionType],
          feedback: feedback || undefined,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }
      
      setActionSuccess(
        actionType === 'approve' 
          ? 'Article approved successfully!' 
          : actionType === 'reject'
            ? 'Article rejected.'
            : 'Changes requested successfully.'
      );
      setShowActionModal(false);
      setFeedback('');
      
      // Refresh post data
      await fetchPost();
      
      // Redirect back to review queue after a short delay
      setTimeout(() => {
        router.push('/admin/review');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to perform action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionModal = (type: 'approve' | 'reject' | 'changes') => {
    setActionType(type);
    setShowActionModal(true);
    setFeedback('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedSpinner size="lg" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link
          href="/admin/review"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const statusColors: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    IN_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    CHANGES_REQUESTED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/review"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Review</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-gray-900 dark:text-white">Preview Mode</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[post.status] || statusColors.DRAFT}`}>
                {post.status.replace('_', ' ')}
              </span>
              
              {['PENDING_REVIEW', 'IN_REVIEW'].includes(post.status) && (
                <>
                  <button
                    onClick={() => openActionModal('changes')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Request Changes</span>
                  </button>
                  <button
                    onClick={() => openActionModal('reject')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Reject</span>
                  </button>
                  <button
                    onClick={() => openActionModal('approve')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Approve</span>
                  </button>
                </>
              )}
              
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {actionSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {actionSuccess}
          </div>
        </div>
      )}

      {/* Article Preview */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
            <Tag className="w-3.5 h-3.5" />
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {Math.ceil((post.content || '').split(/\s+/).filter(Boolean).length / 200)} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Author */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          {post.author.image ? (
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{post.author.email}</p>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50 dark:prose-blockquote:bg-amber-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {actionType === 'approve' && 'Approve Article'}
              {actionType === 'reject' && 'Reject Article'}
              {actionType === 'changes' && 'Request Changes'}
            </h3>
            
            {actionType !== 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actionType === 'reject' ? 'Reason for rejection' : 'Describe the changes needed'}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={actionType === 'reject' 
                    ? 'Please explain why this article is being rejected...'
                    : 'Describe the changes the author needs to make...'}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            )}
            
            {actionType === 'approve' && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to approve this article? It will be marked as ready for publication.
              </p>
            )}
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={isSubmitting || (actionType !== 'approve' && !feedback.trim())}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'approve'
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : actionType === 'reject'
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {isSubmitting ? 'Processing...' : 
                  actionType === 'approve' ? 'Approve' :
                  actionType === 'reject' ? 'Reject' : 'Request Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
