'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  X,
  FileText,
  StickyNote,
  ChevronDown,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ComposePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showEditorNotes, setShowEditorNotes] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    suggestedImages: '',
    editorNotes: '',
    tags: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-save draft every 60 seconds if there's content
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title && formData.content) {
        handleAutoSave();
      }
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setMessage(null);
  };

  const handleAutoSave = async () => {
    // Silent auto-save
    try {
      await fetch('/api/writer/drafts/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const saveDraft = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please add a headline before saving' });
      return;
    }

    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/writer/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: 'Draft saved successfully!' });
        setLastSaved(new Date());
        // Redirect to edit page with the draft ID
        router.push(`/writer/articles/${data.draft.id}`);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save draft' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
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
      // First save as draft
      const saveRes = await fetch('/api/writer/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save draft');
      }

      const { draft } = await saveRes.json();

      // Then submit for editorial review
      const submitRes = await fetch('/api/writer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: draft.id }),
      });

      if (submitRes.ok) {
        setMessage({ type: 'success', text: 'Article submitted for editorial review!' });
        setTimeout(() => router.push('/writer/submitted'), 1500);
      } else {
        const error = await submitRes.json();
        setMessage({ type: 'error', text: error.error || 'Failed to submit for review' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(Boolean).length;
  const characterCount = formData.content.length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Draft</h1>
            {lastSaved && (
              <p className="text-xs text-slate-400">
                Last saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveDraft}
            disabled={saving || !formData.title}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          <button
            onClick={submitForReview}
            disabled={submitting || !formData.title || !formData.content || !formData.categoryId}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit for Review
          </button>
        </div>
      </div>

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
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Headline */}
        <div className="border-b border-slate-100">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Write your headline..."
            className="w-full px-6 py-5 text-2xl font-bold focus:outline-none placeholder:text-slate-300"
          />
        </div>

        {/* Excerpt */}
        <div className="border-b border-slate-100">
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Write a brief summary (2-3 sentences)..."
            rows={2}
            className="w-full px-6 py-4 text-sm focus:outline-none placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Category:</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-medium text-slate-500">Tags:</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="politics, economy, africa..."
              className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Article Body */}
        <div className="relative">
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your article here...

You can use Markdown for formatting:
- **bold** for emphasis
- *italic* for style
- ## Heading 2
- ### Heading 3
- > for quotes
- [text](url) for links"
            rows={20}
            className="w-full px-6 py-6 focus:outline-none placeholder:text-slate-400 resize-none text-base leading-relaxed"
          />
          
          {/* Word count */}
          <div className="absolute bottom-4 right-6 text-xs text-slate-400 bg-white px-2 py-1 rounded">
            {wordCount} words {wordCount < 300 && <span className="text-amber-500">• min 300</span>}
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="mt-6 space-y-4">
        {/* Suggested Images */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Suggested Images</h3>
              <p className="text-xs text-slate-500">Add image URLs or descriptions for editors (optional)</p>
            </div>
          </div>
          <textarea
            name="suggestedImages"
            value={formData.suggestedImages}
            onChange={handleChange}
            placeholder="Paste image URLs or describe the images you'd like to use...

Example:
- Hero image: https://example.com/image.jpg
- Suggested: Photo of Lagos skyline at sunset
- Source: Reuters/AFP"
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
          />
          <p className="text-xs text-slate-400 mt-2">
            Note: Final images will be selected and licensed by the editorial team
          </p>
        </div>

        {/* Notes for Editors */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowEditorNotes(!showEditorNotes)}
            className="w-full flex items-center justify-between p-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <StickyNote className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-slate-900">Notes for Editors</h3>
                <p className="text-xs text-slate-500">Add context or special requests (optional)</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showEditorNotes ? 'rotate-180' : ''}`} />
          </button>
          {showEditorNotes && (
            <div className="px-6 pb-6">
              <textarea
                name="editorNotes"
                value={formData.editorNotes}
                onChange={handleChange}
                placeholder="Any notes for the editorial team...

Example:
- This is time-sensitive, hoping for quick turnaround
- Please verify the quote from Minister X
- Sources are confidential"
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Before Submitting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
            <span className="text-slate-600">Proofread for spelling/grammar</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
            <span className="text-slate-600">Facts and quotes are accurate</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
            <span className="text-slate-600">Selected appropriate category</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20" />
            <span className="text-slate-600">Added compelling headline</span>
          </label>
        </div>
      </div>

      {/* Important Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ What happens next?</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Your article enters the editorial queue</li>
          <li>2. An editor will review your submission</li>
          <li>3. You'll receive feedback or approval notification</li>
          <li>4. If approved, the editorial team handles publication</li>
        </ol>
        <p className="text-xs text-blue-600 mt-3">
          Note: Once submitted, you cannot edit the article until the review is complete or revisions are requested.
        </p>
      </div>
    </div>
  );
}
