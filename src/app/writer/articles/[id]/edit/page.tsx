'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  X,
  StickyNote,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  category: string;
  tags: string[];
  editorialReview?: {
    feedback: string;
    reviewer?: { name: string };
  };
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showEditorNotes, setShowEditorNotes] = useState(false);
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    suggestedImages: '',
    editorNotes: '',
    tags: '',
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/writer/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        const article = data.article;
        setOriginalArticle(article);
        setFormData({
          title: article.title || '',
          slug: article.slug || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          categoryId: article.category?.slug || article.category || '',
          suggestedImages: '',
          editorNotes: '',
          tags: article.tags?.join(', ') || '',
        });
      } else {
        setMessage({ type: 'error', text: 'Article not found' });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setMessage({ type: 'error', text: 'Failed to load article' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      // Auto-generate slug if slug is empty or matches the previous auto-generated slug
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title) 
        ? generateSlug(newTitle) 
        : prev.slug,
    }));
    setMessage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage(null);
  };

  const saveChanges = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please add a headline' });
      return;
    }

    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch(`/api/writer/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          categoryId: formData.categoryId,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Changes saved successfully!' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save changes' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const resubmitForReview = async () => {
    // Validation
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Headline is required' });
      return;
    }
    if (!formData.content.trim()) {
      setMessage({ type: 'error', text: 'Article body is required' });
      return;
    }
    if (!formData.categoryId) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return;
    }
    if (wordCount < 300) {
      setMessage({ type: 'error', text: 'Article should be at least 300 words' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // First save changes
      const saveRes = await fetch(`/api/writer/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          categoryId: formData.categoryId,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save changes');
      }

      // Then resubmit for review
      const submitRes = await fetch('/api/writer/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: id }),
      });

      if (submitRes.ok) {
        setMessage({ type: 'success', text: 'Article resubmitted for review!' });
        setTimeout(() => router.push('/writer/submitted'), 1500);
      } else {
        const error = await submitRes.json();
        setMessage({ type: 'error', text: error.error || 'Failed to resubmit' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if article can be edited
  const canEdit = originalArticle?.status === 'DRAFT' || originalArticle?.status === 'CHANGES_REQUESTED';

  if (!canEdit && originalArticle) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-600" />
          <h2 className="text-lg font-semibold text-amber-900 mb-2">Cannot Edit Article</h2>
          <p className="text-amber-700 mb-4">
            This article is currently {originalArticle.status.toLowerCase().replace('_', ' ')} and cannot be edited.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Article</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Make your revisions and resubmit
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveChanges}
            disabled={saving || !formData.title}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          <button
            onClick={resubmitForReview}
            disabled={submitting || !formData.title || !formData.content || !formData.categoryId}
            className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white font-medium rounded-lg hover:bg-brand-accent/90 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Resubmit for Review
          </button>
        </div>
      </div>

      {/* Editorial Feedback Banner */}
      {originalArticle?.editorialReview?.feedback && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Editorial Feedback
              </h3>
              <p className="text-amber-800 dark:text-amber-300 text-sm whitespace-pre-wrap">
                {originalArticle.editorialReview.feedback}
              </p>
              {originalArticle.editorialReview.reviewer && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-2">
                  — {originalArticle.editorialReview.reviewer.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Headline */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Write your headline..."
            className="w-full px-6 py-5 text-2xl font-bold focus:outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Slug */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">URL Slug:</label>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">afriverse.africa/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="article-url-slug"
                className="flex-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
              className="text-xs text-brand-accent hover:text-brand-accent/80 font-medium"
            >
              Auto-generate
            </button>
          </div>
        </div>

        {/* Excerpt */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Excerpt / Summary</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Write a compelling summary that will appear in article previews and search results (2-3 sentences)..."
            rows={3}
            className="w-full px-4 py-3 text-sm focus:outline-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-brand-accent/30"
          />
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category:</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-slate-800 dark:text-white"
            >
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tags:</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="politics, economy, africa..."
              className="flex-1 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Article Body */}
        <div className="relative">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your article here..."
            rows={20}
            className="w-full px-6 py-6 focus:outline-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none text-base leading-relaxed"
          />
          
          {/* Word count */}
          <div className="absolute bottom-4 right-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">
            {wordCount} words {wordCount < 300 && <span className="text-amber-500">• min 300</span>}
          </div>
        </div>
      </div>

      {/* Notes for Editors */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <button
          onClick={() => setShowEditorNotes(!showEditorNotes)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">Response to Editor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Explain your revisions (optional)</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${showEditorNotes ? 'rotate-180' : ''}`} />
        </button>
        {showEditorNotes && (
          <div className="px-6 pb-6">
            <textarea
              name="editorNotes"
              value={formData.editorNotes}
              onChange={handleChange}
              placeholder="Explain what changes you made in response to the feedback..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* Important Notice */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">ℹ️ Revision Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Review the editorial feedback carefully</li>
          <li>• Make all requested changes before resubmitting</li>
          <li>• You can save changes without resubmitting</li>
          <li>• Once resubmitted, you cannot edit until review is complete</li>
        </ul>
      </div>
    </div>
  );
}
