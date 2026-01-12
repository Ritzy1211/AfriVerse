'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Eye,
  Globe,
  Image as ImageIcon,
  Tag,
  Settings,
  ChevronDown,
  Loader2,
  History,
  ExternalLink,
  Share2,
  Bookmark,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  featuredImage: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  category: { id: string; name: string; slug: string };
  author: { id: string; name: string; email: string; image: string; role: string };
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  viewCount: number;
  metadata?: {
    suggestedImages?: string;
    editorNotes?: string;
  };
  editorialReview?: {
    id: string;
    status: string;
    priority: string;
    submittedAt: string;
    reviewedAt: string | null;
    reviewer?: { name: string; email: string };
  };
  editorialFeedback: Array<{
    id: string;
    message: string;
    type: string;
    isInternal: boolean;
    createdAt: string;
    author: { name: string; role: string };
  }>;
  activityLog: Array<{
    id: string;
    action: string;
    details: string;
    createdAt: string;
    user: { name: string };
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditorialReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'feedback' | 'activity'>('edit');
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  
  // Feedback
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('GENERAL');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Publishing
  const [publishDate, setPublishDate] = useState('');
  const [addToHomepage, setAddToHomepage] = useState(false);
  const [socialShare, setSocialShare] = useState(false);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/admin/desk/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
        
        // Populate editable fields
        setTitle(data.article.title || '');
        setExcerpt(data.article.excerpt || '');
        setContent(data.article.content || '');
        setCategoryId(data.article.category?.id || '');
        setFeaturedImage(data.article.featuredImage || '');
        setMetaTitle(data.article.metaTitle || '');
        setMetaDescription(data.article.metaDescription || '');
        setTags(data.article.tags?.join(', ') || '');
        setPriority(data.article.editorialReview?.priority || 'NORMAL');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // Fetch data on mount
  useEffect(() => {
    fetchArticle();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/desk/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          categoryId,
          featuredImage,
          metaTitle,
          metaDescription,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          priority,
        }),
      });

      if (res.ok) {
        fetchArticle();
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (action: string, message?: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/desk/${resolvedParams.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message, publishDate, addToHomepage, socialShare }),
      });

      if (res.ok) {
        if (action === 'PUBLISH') {
          router.push('/admin/desk');
        } else {
          fetchArticle();
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setSaving(false);
      setShowPublishPanel(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    
    setSendingFeedback(true);
    try {
      const res = await fetch(`/api/admin/desk/${resolvedParams.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackMessage,
          type: feedbackType,
          isInternal: isInternalNote,
        }),
      });

      if (res.ok) {
        setFeedbackMessage('');
        fetchArticle();
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    } finally {
      setSendingFeedback(false);
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Article not found</h2>
        <Link href="/admin/desk" className="text-primary hover:underline mt-2 inline-block">
          Back to Editorial Desk
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-100 text-amber-700',
    IN_REVIEW: 'bg-blue-100 text-blue-700',
    CHANGES_REQUESTED: 'bg-red-100 text-red-700',
    APPROVED: 'bg-green-100 text-green-700',
    PUBLISHED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/desk"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">Editorial Review</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[article.status]}`}>
                {article.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              By {article.author?.name} • Submitted {new Date(article.editorialReview?.submittedAt || article.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>

          {article.status === 'IN_REVIEW' && (
            <>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                Request Changes
              </button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleAction('APPROVE')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </>
          )}

          {article.status === 'APPROVED' && (
            <button
              onClick={() => setShowPublishPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Publish
            </button>
          )}

          {article.status === 'PENDING_REVIEW' && !article.editorialReview?.reviewer && (
            <button
              onClick={() => handleAction('START_REVIEW')}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              Start Review
            </button>
          )}
        </div>
      </div>

      {/* Publish Panel Modal */}
      {showPublishPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Publish Article</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-slate-500 mt-1">Leave empty to publish immediately</p>
              </div>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={addToHomepage}
                  onChange={(e) => setAddToHomepage(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div>
                  <p className="font-medium text-slate-900">Add to Homepage</p>
                  <p className="text-xs text-slate-500">Feature this article on the homepage</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={socialShare}
                  onChange={(e) => setSocialShare(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <div>
                  <p className="font-medium text-slate-900">Share to Social Media</p>
                  <p className="text-xs text-slate-500">Auto-post to connected social accounts</p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowPublishPanel(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction('PUBLISH')}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                {publishDate ? 'Schedule' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-slate-50 text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Edit Article
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'feedback'
                    ? 'bg-slate-50 text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Feedback ({article.editorialFeedback?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-slate-50 text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Activity Log
              </button>
            </div>

            {activeTab === 'edit' && (
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg font-semibold"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Article Body
                    </label>
                    <span className="text-xs text-slate-500">{wordCount} words</span>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="p-6 space-y-6">
                {/* Add Feedback */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">Add Feedback</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      >
                        <option value="GENERAL">General Note</option>
                        <option value="SUGGESTION">Suggestion</option>
                        <option value="REVISION_REQUEST">Revision Request</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        Internal (hidden from writer)
                      </label>
                    </div>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Write your feedback for the writer..."
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <button
                      onClick={handleSendFeedback}
                      disabled={sendingFeedback || !feedbackMessage.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                    >
                      {sendingFeedback ? 'Sending...' : 'Send Feedback'}
                    </button>
                  </div>
                </div>

                {/* Feedback List */}
                <div className="space-y-4">
                  {article.editorialFeedback?.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No feedback yet</p>
                  ) : (
                    article.editorialFeedback?.map((feedback) => (
                      <div
                        key={feedback.id}
                        className={`p-4 rounded-lg border ${
                          feedback.isInternal
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            feedback.type === 'REVISION_REQUEST'
                              ? 'bg-red-100 text-red-700'
                              : feedback.type === 'SUGGESTION'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {feedback.type.replace('_', ' ')}
                          </span>
                          {feedback.isInternal && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Internal
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700">{feedback.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {feedback.author.name} ({feedback.author.role}) • {new Date(feedback.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6">
                <div className="space-y-4">
                  {article.activityLog?.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">No activity yet</p>
                  ) : (
                    article.activityLog?.map((log) => (
                      <div key={log.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <History className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">{log.user.name}</span> {log.details}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Meta */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Article Details</h3>
            
            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Featured Image</h3>
            
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-500">No image selected</p>
              </div>
            )}
            
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="Image URL"
              className="w-full mt-3 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            {/* Writer's suggested images */}
            {article.metadata?.suggestedImages && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Writer's Image Suggestions:</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{article.metadata.suggestedImages}</p>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-slate-500 mt-1">{metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">{metaDescription.length}/160 characters</p>
              </div>
            </div>
          </div>

          {/* Writer Notes */}
          {article.metadata?.editorNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Notes from Writer
              </h3>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{article.metadata.editorNotes}</p>
            </div>
          )}

          {/* Author Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Author</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                {article.author?.image ? (
                  <img src={article.author.image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{article.author?.name}</p>
                <p className="text-sm text-slate-500">{article.author?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
