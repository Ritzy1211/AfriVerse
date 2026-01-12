'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Send, User, AlertCircle, CheckCircle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsProps {
  articleSlug: string;
  articleTitle: string;
}

export default function Comments({ articleSlug, articleTitle }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  });

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [articleSlug]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?articleSlug=${encodeURIComponent(articleSlug)}`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          articleSlug,
          articleTitle,
          authorName: formData.name,
          authorEmail: formData.email,
          parentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ name: '', email: '', content: '' });
        setReplyingTo(null);
        // Refresh comments after a short delay
        setTimeout(fetchComments, 1000);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit comment. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, action: 'like' }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => 
          prev.map(c => 
            c.id === commentId 
              ? { ...c, likes: data.likes }
              : { ...c, replies: c.replies?.map(r => r.id === commentId ? { ...r, likes: data.likes } : r) }
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const CommentForm = ({ parentId, onCancel }: { parentId?: string; onCancel?: () => void }) => (
    <form onSubmit={(e) => handleSubmit(e, parentId)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
        />
        <input
          type="email"
          placeholder="Your email (not published)"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
          className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all"
        />
      </div>
      <textarea
        placeholder={parentId ? "Write your reply..." : "Share your thoughts..."}
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        required
        rows={parentId ? 3 : 4}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {parentId ? 'Post Reply' : 'Post Comment'}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {comment.authorAvatar ? (
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.authorName}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLike(comment.id)}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{comment.likes}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-accent transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-4">
              <CommentForm parentId={comment.id} onCancel={() => setReplyingTo(null)} />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-headline font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-brand-accent" />
        Comments ({comments.length})
      </h2>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-8">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Leave a comment</h3>
        <CommentForm />
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-3 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </section>
  );
}
