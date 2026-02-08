'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Send,
  FileText,
  Calendar,
  Tag,
  User,
  MessageSquare,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  category?: { id: string; name: string; slug: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  author?: { name: string; image: string };
  editorialReview?: {
    id: string;
    status: string;
    priority: string;
    feedback: string;
    reviewer?: { name: string; image: string };
    submittedAt: string;
    reviewedAt: string;
  };
}

export default function ArticleViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/writer/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setArticle(data.article);
      } else if (res.status === 404) {
        setError('Article not found');
      } else {
        setError('Failed to load article');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('An error occurred while loading the article');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      label: string; 
      color: string; 
      bg: string; 
      borderColor: string;
      icon: any;
      description: string;
    }> = {
      DRAFT: { 
        label: 'Draft', 
        color: 'text-slate-600', 
        bg: 'bg-slate-100', 
        borderColor: 'border-slate-300',
        icon: FileText,
        description: 'This article is still a draft and has not been submitted for review.',
      },
      PENDING_REVIEW: { 
        label: 'In Queue', 
        color: 'text-amber-600', 
        bg: 'bg-amber-50', 
        borderColor: 'border-amber-300',
        icon: Clock,
        description: 'Your article has been submitted and is waiting for an editor to review it.',
      },
      IN_REVIEW: { 
        label: 'Under Review', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        borderColor: 'border-blue-300',
        icon: Eye,
        description: 'An editor is currently reviewing your article.',
      },
      CHANGES_REQUESTED: { 
        label: 'Revision Needed', 
        color: 'text-red-600', 
        bg: 'bg-red-50', 
        borderColor: 'border-red-300',
        icon: AlertTriangle,
        description: 'The editor has requested changes to your article.',
      },
      APPROVED: { 
        label: 'Approved', 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        borderColor: 'border-green-300',
        icon: CheckCircle,
        description: 'Your article has been approved and will be published soon.',
      },
      PUBLISHED: { 
        label: 'Published', 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-50', 
        borderColor: 'border-emerald-300',
        icon: CheckCircle,
        description: 'Your article is now live on the site.',
      },
    };
    return configs[status] || { 
      label: status, 
      color: 'text-slate-600', 
      bg: 'bg-slate-100', 
      borderColor: 'border-slate-300',
      icon: FileText,
      description: '',
    };
  };

  const canEdit = article?.status === 'DRAFT' || article?.status === 'CHANGES_REQUESTED';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {error || 'Article not found'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            The article you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(article.status);
  const StatusIcon = statusConfig.icon;

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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Article Details</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View your submission
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              href={`/writer/compose?edit=${article.id}`}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit Article
            </Link>
          )}
          {article.status === 'PUBLISHED' && (
            <Link
              href={`/${article.category?.slug}/${article.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View Published
            </Link>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`mb-6 p-4 rounded-xl border ${statusConfig.bg} ${statusConfig.borderColor}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} flex items-center justify-center`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div className="flex-1">
            <span className={`text-sm font-semibold ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {statusConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Feedback (if any) */}
      {article.editorialReview?.feedback && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                Editorial Feedback
              </h3>
              <p className="text-amber-800 dark:text-amber-300 text-sm whitespace-pre-wrap">
                {article.editorialReview.feedback}
              </p>
              {article.editorialReview.reviewer && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-3">
                  — {article.editorialReview.reviewer.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Title & Meta */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {article.title}
          </h2>
          
          {article.excerpt && (
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 italic">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            {article.category && (
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded">
                <Tag className="w-3.5 h-3.5" />
                {article.category.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Created {new Date(article.createdAt).toLocaleDateString()}
            </span>
            {article.editorialReview?.submittedAt && (
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Submitted {new Date(article.editorialReview.submittedAt).toLocaleDateString()}
              </span>
            )}
            {article.editorialReview?.reviewer && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Reviewer: {article.editorialReview.reviewer.name}
              </span>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article Body */}
        <div className="p-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {/* Render content - simple version */}
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
              {article.content}
            </div>
          </div>
        </div>
      </div>

      {/* Article Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {article.content.split(/\s+/).filter(Boolean).length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Words</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.ceil(article.content.split(/\s+/).filter(Boolean).length / 200)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Min Read</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {article.views || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Views</p>
        </div>
      </div>

      {/* Help Text */}
      {article.status === 'PENDING_REVIEW' && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Your article is currently in the editorial queue. 
            You cannot make changes while it's being reviewed. Most articles are reviewed within 24-48 hours.
          </p>
        </div>
      )}

      {article.status === 'CHANGES_REQUESTED' && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>Action Required:</strong> Please review the editorial feedback above and make the requested changes. 
            Once you've made updates, you can resubmit your article for review.
          </p>
        </div>
      )}
    </div>
  );
}
