'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Play,
  Upload,
  X,
  Calendar,
  Loader2,
  Eye,
  Sparkles,
  Trash2,
} from 'lucide-react';
import MediaUploader from '@/components/MediaUploader';

interface Article {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  category: string;
}

export default function EditSpotlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchArticles, setSearchArticles] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteHighlight, setQuoteHighlight] = useState('');
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [overlayPosition, setOverlayPosition] = useState('left');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [highlightColor, setHighlightColor] = useState('#00D9FF');
  const [placement, setPlacement] = useState('homepage');
  const [categorySlug, setCategorySlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<string[]>([]);

  // Fetch spotlight data
  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        const res = await fetch(`/api/admin/spotlights/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || '');
          setSubtitle(data.subtitle || '');
          setQuote(data.quote || '');
          setQuoteHighlight(data.quoteHighlight || '');
          setMediaType(data.mediaType || 'IMAGE');
          setMediaUrl(data.mediaUrl || '');
          setThumbnailUrl(data.thumbnailUrl || '');
          setLinkUrl(data.linkUrl || '');
          setLinkText(data.linkText || '');
          setOverlayPosition(data.overlayPosition || 'left');
          setTextColor(data.textColor || '#FFFFFF');
          setHighlightColor(data.highlightColor || '#00D9FF');
          setPlacement(data.placement || 'homepage');
          setCategorySlug(data.categorySlug || '');
          setIsActive(data.isActive ?? true);
          setPriority(data.priority || 0);
          setStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '');
          setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '');
          setRelatedArticles(data.relatedArticles || []);
        } else {
          router.push('/admin/spotlights');
        }
      } catch (err) {
        console.error('Error fetching spotlight:', err);
        router.push('/admin/spotlights');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchArticles = async () => {
      try {
        const res = await fetch('/api/admin/posts?limit=50');
        if (res.ok) {
          const data = await res.json();
          setArticles(data.posts || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    };

    fetchSpotlight();
    fetchArticles();
  }, [id, router]);

  const handleMediaSelect = (url: string) => {
    setMediaUrl(url);
    setShowMediaModal(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!mediaUrl.trim()) {
      setError('Media URL is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const spotlightData = {
        title,
        subtitle,
        quote,
        quoteHighlight,
        mediaType,
        mediaUrl,
        thumbnailUrl,
        linkUrl,
        linkText,
        overlayPosition,
        textColor,
        highlightColor,
        placement,
        categorySlug: placement === 'category' ? categorySlug : null,
        isActive,
        priority,
        startDate: startDate || null,
        endDate: endDate || null,
        relatedArticles,
      };

      const res = await fetch(`/api/admin/spotlights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spotlightData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update spotlight');
      }

      router.push('/admin/spotlights');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/spotlights/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/admin/spotlights');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete spotlight');
      }
    } catch (err) {
      setError('An error occurred while deleting');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchArticles.toLowerCase()) &&
      !relatedArticles.includes(a.slug)
  );

  const selectedArticleDetails = articles.filter((a) =>
    relatedArticles.includes(a.slug)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/spotlights"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-headline font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Edit Spotlight
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update featured visual showcase
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Spotlight title..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional subtitle..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quote Text
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Featured quote or headline text..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Highlight Words
              </label>
              <input
                type="text"
                value={quoteHighlight}
                onChange={(e) => setQuoteHighlight(e.target.value)}
                placeholder="Words to highlight in the quote..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                These words will be highlighted with the accent color
              </p>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Media
            </h2>

            <div className="flex gap-4">
              <button
                onClick={() => setMediaType('IMAGE')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  mediaType === 'IMAGE'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <ImageIcon
                  className={`h-6 w-6 mx-auto mb-2 ${
                    mediaType === 'IMAGE' ? 'text-amber-500' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    mediaType === 'IMAGE'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Image
                </span>
              </button>
              <button
                onClick={() => setMediaType('VIDEO')}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  mediaType === 'VIDEO'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Play
                  className={`h-6 w-6 mx-auto mb-2 ${
                    mediaType === 'VIDEO' ? 'text-amber-500' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    mediaType === 'VIDEO'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Video
                </span>
              </button>
            </div>

            {/* Media URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {mediaType === 'IMAGE' ? 'Image' : 'Video'} URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={
                    mediaType === 'IMAGE'
                      ? 'https://example.com/image.jpg'
                      : 'https://example.com/video.mp4'
                  }
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview */}
            {mediaUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                {mediaType === 'IMAGE' ? (
                  <Image
                    src={mediaUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={mediaUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>
            )}

            {/* Thumbnail for Video */}
            {mediaType === 'VIDEO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video Thumbnail URL
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Link */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Link
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Watch Now"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Related Articles */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Related Articles (Sidebar)
            </h2>

            {/* Selected Articles */}
            {selectedArticleDetails.length > 0 && (
              <div className="space-y-2">
                {selectedArticleDetails.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white truncate flex-1">
                      {article.title}
                    </span>
                    <button
                      onClick={() =>
                        setRelatedArticles((prev) =>
                          prev.filter((s) => s !== article.slug)
                        )
                      }
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Articles */}
            <div>
              <input
                type="text"
                value={searchArticles}
                onChange={(e) => setSearchArticles(e.target.value)}
                placeholder="Search articles to add..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Article List */}
            {searchArticles && (
              <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {filteredArticles.slice(0, 10).map((article) => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setRelatedArticles((prev) => [...prev, article.slug]);
                      setSearchArticles('');
                    }}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm text-gray-900 dark:text-white"
                  >
                    {article.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Styling */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Styling
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Overlay Position
              </label>
              <select
                value={overlayPosition}
                onChange={(e) => setOverlayPosition(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Highlight Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Placement & Scheduling */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Placement & Scheduling
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Placement
              </label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="homepage">Homepage</option>
                <option value="article">Article Pages</option>
                <option value="category">Category Pages</option>
              </select>
            </div>

            {placement === 'category' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="politics">Politics</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                min={0}
                max={100}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Higher = shown first</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Active (visible on site)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Select Media
              </h3>
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <MediaUploader
                onUpload={handleMediaSelect}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Spotlight?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this spotlight? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
