'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  Check,
  X,
  Trash2,
  Flag,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  articleSlug: string;
  articleTitle?: string;
  status: 'PENDING' | 'APPROVED' | 'SPAM' | 'DELETED';
  likes: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  all: number;
  PENDING: number;
  APPROVED: number;
  SPAM: number;
  DELETED: number;
}

type CommentStatus = 'all' | 'PENDING' | 'APPROVED' | 'SPAM' | 'DELETED';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentStatus>('all');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [viewingComment, setViewingComment] = useState<Comment | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    all: 0,
    PENDING: 0,
    APPROVED: 0,
    SPAM: 0,
    DELETED: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/comments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
        setStatusCounts(data.counts);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAction = async (id: string, action: 'approve' | 'spam' | 'delete' | 'restore') => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment? This cannot be undone.')) {
      return;
    }

    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/comments?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectComment = (id: string) => {
    if (selectedComments.includes(id)) {
      setSelectedComments(selectedComments.filter(c => c !== id));
    } else {
      setSelectedComments([...selectedComments, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'spam' | 'delete') => {
    if (selectedComments.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedComments, action }),
      });

      if (response.ok) {
        setSelectedComments([]);
        fetchComments();
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Comments
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Moderate and manage user comments
          </p>
        </div>
        <button
          onClick={fetchComments}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'PENDING', 'APPROVED', 'SPAM', 'DELETED'] as CommentStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-secondary text-primary'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              statusFilter === status ? 'bg-primary/20 text-primary' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {statusCounts[status as keyof typeof statusCounts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Bulk Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          
          {selectedComments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selectedComments.length} selected</span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('spam')}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded-lg hover:bg-yellow-200"
              >
                Mark Spam
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedComments.length === comments.length && comments.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-xs font-medium text-gray-500 uppercase">Select All</span>
          </label>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-500" />
            <p className="text-gray-500 mt-2">Loading comments...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && comments.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 mt-4">No comments found</p>
            <p className="text-sm text-gray-400">Comments will appear here when readers engage with your articles.</p>
          </div>
        )}

        {/* Comments */}
        {!loading && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.includes(comment.id)}
                    onChange={() => handleSelectComment(comment.id)}
                    className="mt-1 rounded border-gray-300"
                  />

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.authorAvatar ? (
                      <img 
                        src={comment.authorAvatar} 
                        alt={comment.authorName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.authorName}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                            comment.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            comment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            comment.status === 'SPAM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {comment.status.toLowerCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {comment.authorEmail} • on &quot;{comment.articleTitle || comment.articleSlug}&quot;
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>

                    <p className="mt-3 text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      {actionLoading === comment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          {comment.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleAction(comment.id, 'approve')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(comment.id, 'spam')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-sm rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                Spam
                              </button>
                            </>
                          )}
                          {comment.status === 'APPROVED' && (
                            <button
                              onClick={() => handleAction(comment.id, 'spam')}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-sm rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                            >
                              <Flag className="w-3 h-3" />
                              Mark Spam
                            </button>
                          )}
                          {(comment.status === 'SPAM' || comment.status === 'DELETED') && (
                            <>
                              <button
                                onClick={() => handleAction(comment.id, 'approve')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(comment.id, 'restore')}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Restore
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setViewingComment(comment)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleAction(comment.id, 'delete')}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-red-600 dark:bg-gray-700 text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {comments.length} of {pagination.total} comments
        </p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-secondary text-primary rounded-lg text-sm font-medium">
            {pagination.page} / {pagination.totalPages || 1}
          </span>
          <button 
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comment Detail Modal */}
      {viewingComment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comment Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Author</label>
                <p className="text-gray-900 dark:text-white">{viewingComment.authorName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                <p className="text-gray-900 dark:text-white">{viewingComment.authorEmail}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Article</label>
                <p className="text-gray-900 dark:text-white">{viewingComment.articleTitle || viewingComment.articleSlug}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                <p className="text-gray-900 dark:text-white">{formatDate(viewingComment.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                <p className={`inline-block px-2 py-0.5 text-xs rounded-full capitalize ${
                  viewingComment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  viewingComment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  viewingComment.status === 'SPAM' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {viewingComment.status.toLowerCase()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Comment</label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {viewingComment.content}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              {viewingComment.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => { handleAction(viewingComment.id, 'approve'); setViewingComment(null); }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { handleAction(viewingComment.id, 'spam'); setViewingComment(null); }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Mark Spam
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingComment(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
