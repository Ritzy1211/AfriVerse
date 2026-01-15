'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Calendar,
  Clock,
  Tag,
  FileText,
  Trash2,
  Send,
} from 'lucide-react';
import BrandedSpinner, { AfriPulseSpinner } from '@/components/BrandedSpinner';
import MediaUploader from '@/components/MediaUploader';

// Dynamically import the editor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import('@/components/editor/RichTextEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="h-12 bg-gray-50 dark:bg-gray-800 animate-pulse" />
        <div className="h-[400px] bg-white dark:bg-gray-900 animate-pulse" />
      </div>
    )
  }
);

const categories = ['Business', 'Entertainment', 'Lifestyle', 'Sports', 'Technology', 'Politics'];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [featured, setFeatured] = useState(false);
  const [featuredImage, setFeaturedImage] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Monetization fields
  const [isPremium, setIsPremium] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorLogo, setSponsorLogo] = useState('');

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/admin/posts/${postId}`);
        
        // Handle session expired / unauthorized
        if (response.status === 401) {
          router.push('/admin/login?error=session_expired&callbackUrl=' + encodeURIComponent(`/admin/posts/${postId}/edit`));
          return;
        }
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to fetch post');
        }
        const post = await response.json();
        
        setTitle(post.title || '');
        setSlug(post.slug || '');
        setContent(post.content || '');
        setExcerpt(post.excerpt || '');
        setCategory(post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : '');
        setTags(post.tags || []);
        setStatus(post.status?.toLowerCase() || 'draft');
        setFeatured(post.featured || false);
        setFeaturedImage(post.featuredImage || '');
        setMetaTitle(post.metaTitle || '');
        setMetaDescription(post.metaDescription || '');
        setIsPremium(post.isPremium || false);
        setIsSponsored(post.isSponsored || false);
        setSponsorName(post.sponsorName || '');
        setSponsorLogo(post.sponsorLogo || '');
        
        if (post.scheduledAt) {
          setPublishDate(new Date(post.scheduledAt).toISOString().slice(0, 16));
        }
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (postId) {
      fetchPost();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-generate slug if it's empty or matches the previous auto-generated slug
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Calculate reading time
  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const plainText = text.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  };

  const handleSave = async (saveStatus: string) => {
    setIsSaving(true);
    setError('');
    
    try {
      // Determine the final status and scheduled date
      let finalStatus = saveStatus.toUpperCase();
      let finalScheduledAt = publishDate || null;

      // If scheduling, validate the date is in the future
      if (saveStatus === 'scheduled') {
        if (!publishDate) {
          setError('Please select a publish date for scheduling');
          setIsSaving(false);
          return;
        }
        const scheduledDate = new Date(publishDate);
        if (scheduledDate <= new Date()) {
          setError('Scheduled date must be in the future');
          setIsSaving(false);
          return;
        }
        finalStatus = 'SCHEDULED';
      }

      const postData = {
        title,
        slug,
        excerpt,
        content,
        category: category.toLowerCase(),
        tags,
        featuredImage,
        status: finalStatus,
        scheduledAt: finalScheduledAt,
        readingTime: calculateReadingTime(content),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaKeywords: tags.join(', '),
        featured,
        isPremium,
        isSponsored,
        sponsorName: isSponsored ? sponsorName : null,
        sponsorLogo: isSponsored ? sponsorLogo : null,
      };

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      // Handle session expired / unauthorized
      if (response.status === 401) {
        router.push('/admin/login?error=session_expired&callbackUrl=' + encodeURIComponent(`/admin/posts/${postId}/edit`));
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update post');
      }

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      // Handle session expired / unauthorized
      if (response.status === 401) {
        router.push('/admin/login?error=session_expired&callbackUrl=' + encodeURIComponent('/admin/posts'));
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      router.push('/admin/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleSubmitForReview = async () => {
    // First save the post
    setIsSubmitting(true);
    setError('');
    
    try {
      // Save post first
      const postData = {
        title,
        slug,
        excerpt,
        content,
        category: category.toLowerCase(),
        tags,
        featuredImage,
        status: 'DRAFT',
        scheduledAt: publishDate || null,
        readingTime: calculateReadingTime(content),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        metaKeywords: tags.join(', '),
        featured,
      };

      const saveResponse = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save post before submission');
      }

      // Now submit for review
      const submitResponse = await fetch('/api/admin/editorial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          priority: 'NORMAL',
        }),
      });

      const submitData = await submitResponse.json();

      if (!submitResponse.ok) {
        if (submitData.validationErrors) {
          throw new Error(`Validation failed:\n${submitData.validationErrors.join('\n')}`);
        }
        throw new Error(submitData.error || 'Failed to submit for review');
      }

      setSuccess('Post submitted for review successfully!');
      setStatus('pending_review');
      
      // Redirect to editorial queue after 2 seconds
      setTimeout(() => {
        router.push('/admin/editorial');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit for review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <AfriPulseSpinner size="md" />
          <span>Loading post...</span>
        </div>
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Edit Post
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Update your blog post
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Save Draft
          </button>
          <button
            onClick={handleSubmitForReview}
            disabled={isSubmitting || !title || !content || !category || status === 'pending_review' || status === 'in_review'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <BrandedSpinner size="sm" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit for Review
              </>
            )}
          </button>
          {publishDate && new Date(publishDate) > new Date() && status !== 'published' && (
            <button
              onClick={() => handleSave('scheduled')}
              disabled={isSaving || !title || !content || !category}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <BrandedSpinner size="sm" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Schedule
                </>
              )}
            </button>
          )}
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving || !title || !content || !category}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <BrandedSpinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {status === 'published' ? 'Update' : 'Publish Now'}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 whitespace-pre-line">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter post title..."
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-lg font-medium focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          {/* Slug */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug (URL)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">afriverse.africa/{category.toLowerCase() || 'category'}/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="post-slug"
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Content
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your article..."
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt (Short description)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a short description for search results and social sharing..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Publish Settings
            </h3>
            
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  <option value="draft">Draft</option>
                  <option value="review">Under Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Schedule Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  Schedule for Later
                </label>
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                {publishDate && (
                  <div className="mt-2">
                    {new Date(publishDate) > new Date() ? (
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Will publish on {new Date(publishDate).toLocaleString()}
                      </p>
                    ) : status !== 'published' ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Date is in the past. Post will publish immediately.
                      </p>
                    ) : null}
                    <button
                      onClick={() => setPublishDate('')}
                      className="text-xs text-red-500 hover:text-red-600 mt-1"
                    >
                      Clear schedule
                    </button>
                  </div>
                )}
              </div>

              {/* Featured */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Mark as featured post
                </span>
              </label>
            </div>
          </div>

          {/* Monetization Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monetization
            </h3>
            
            <div className="space-y-4">
              {/* Premium Content */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Premium Content
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Only premium subscribers can read full article
                  </p>
                </div>
              </label>

              {/* Sponsored Content */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSponsored}
                    onChange={(e) => setIsSponsored(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sponsored Content
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mark as branded/sponsored content
                    </p>
                  </div>
                </label>

                {isSponsored && (
                  <div className="mt-4 space-y-3 pl-7">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sponsor Name *
                      </label>
                      <input
                        type="text"
                        value={sponsorName}
                        onChange={(e) => setSponsorName(e.target.value)}
                        placeholder="e.g., MTN Nigeria"
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sponsor Logo URL
                      </label>
                      <input
                        type="text"
                        value={sponsorLogo}
                        onChange={(e) => setSponsorLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Category
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-4 h-4 border-gray-300 text-secondary focus:ring-secondary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag and press Enter..."
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-secondary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <ImageIcon className="w-5 h-5" />
              Featured Image
            </h3>
            {featuredImage ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <MediaUploader
                onUpload={(url) => setFeaturedImage(url)}
                folder="afriverse/posts"
                maxFiles={1}
                showLibrary={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              {featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featuredImage} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
              )}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                {category && <span className="text-secondary font-medium">{category}</span>}
                {publishDate && <span>{new Date(publishDate).toLocaleDateString()}</span>}
              </div>
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
                {title || 'Untitled Post'}
              </h1>
              {excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{excerpt}</p>
              )}
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content || '<p>No content yet...</p>' }}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Post?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
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
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
