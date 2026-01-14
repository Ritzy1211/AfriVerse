'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  PenLine,
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Eye,
  MessageSquare,
  BarChart3,
  Award,
  Target,
  Sparkles,
} from 'lucide-react';

interface Stats {
  drafts: number;
  submitted: number;
  inReview: number;
  needsRevision: number;
  approved: number;
  published: number;
  rejected: number;
}

interface Performance {
  totalViews: number;
  avgViews: number;
  approvalRate: number;
  thisMonthPublished: number;
  memberSince: string;
}

interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  publishedAt: string;
  category: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  updatedAt: string;
  views: number;
}

interface EditorialNote {
  id: string;
  message: string;
  postTitle: string;
  createdAt: string;
  editorName: string;
}

export default function WriterDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    drafts: 0,
    submitted: 0,
    inReview: 0,
    needsRevision: 0,
    approved: 0,
    published: 0,
    rejected: 0,
  });
  const [performance, setPerformance] = useState<Performance>({
    totalViews: 0,
    avgViews: 0,
    approvalRate: 100,
    thisMonthPublished: 0,
    memberSince: '',
  });
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [articlesByCategory, setArticlesByCategory] = useState<CategoryCount[]>([]);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [editorialNotes, setEditorialNotes] = useState<EditorialNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/writer/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPerformance(data.performance || {});
        setTopArticles(data.topArticles || []);
        setArticlesByCategory(data.articlesByCategory || []);
        setRecentArticles(data.recentArticles || []);
        setEditorialNotes(data.editorialNotes || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string }> = {
      DRAFT: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
      PENDING_REVIEW: { label: 'Submitted', color: 'text-amber-600', bg: 'bg-amber-50' },
      IN_REVIEW: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-50' },
      CHANGES_REQUESTED: { label: 'Needs Revision', color: 'text-red-600', bg: 'bg-red-50' },
      APPROVED: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50' },
      PUBLISHED: { label: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    };
    return configs[status] || { label: status, color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const firstName = session?.user?.name?.split(' ')[0] || 'Writer';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {firstName}</h1>
            <p className="text-slate-300">
              Ready to tell Africa's stories? Start writing or check on your submissions.
            </p>
          </div>
          <Link
            href="/writer/compose"
            className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-6 py-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap"
          >
            <PenLine className="w-5 h-5" />
            Start Writing
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link
          href="/writer/articles?status=DRAFT"
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.drafts}</p>
          <p className="text-sm text-slate-500">Drafts</p>
        </Link>

        <Link
          href="/writer/submitted"
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Send className="w-5 h-5 text-amber-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.submitted}</p>
          <p className="text-sm text-slate-500">Submitted</p>
        </Link>

        <Link
          href="/writer/submitted?status=IN_REVIEW"
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.inReview}</p>
          <p className="text-sm text-slate-500">In Review</p>
        </Link>

        <Link
          href="/writer/articles?status=CHANGES_REQUESTED"
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-red-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.needsRevision}</p>
          <p className="text-sm text-slate-500">Needs Revision</p>
        </Link>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.approved}</p>
          <p className="text-sm text-slate-500">Approved</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.published}</p>
          <p className="text-sm text-slate-500">Published</p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-secondary" />
          <h2 className="font-semibold">Your Performance</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 text-sm">Total Views</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : formatNumber(performance.totalViews)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-sm">Approval Rate</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : `${performance.approvalRate}%`}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-sm">Avg. Views/Article</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : formatNumber(performance.avgViews)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400 text-sm">This Month</span>
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : performance.thisMonthPublished}</p>
            <span className="text-xs text-slate-400">articles published</span>
          </div>
        </div>
      </div>

      {/* Needs Attention Alert */}
      {stats.needsRevision > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Action Required</h3>
              <p className="text-red-700 text-sm mt-1">
                You have {stats.needsRevision} article{stats.needsRevision > 1 ? 's' : ''} that need{stats.needsRevision === 1 ? 's' : ''} revision. 
                Please review the editorial feedback and make the requested changes.
              </p>
              <Link 
                href="/writer/articles?status=CHANGES_REQUESTED"
                className="inline-flex items-center gap-1 text-red-700 font-medium text-sm mt-2 hover:underline"
              >
                View articles needing revision <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Articles</h2>
            <Link href="/writer/articles" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : recentArticles.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 font-medium">No articles yet</p>
                <p className="text-slate-400 text-sm mt-1">Start writing your first story</p>
                <Link
                  href="/writer/compose"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                >
                  <PenLine className="w-4 h-4" />
                  Create Draft
                </Link>
              </div>
            ) : (
              recentArticles.map((article) => {
                const statusConfig = getStatusConfig(article.status);
                return (
                  <Link
                    key={article.id}
                    href={`/writer/articles/${article.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {article.title || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(article.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Editorial Notes */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Editorial Notes</h2>
            <Link href="/writer/notes" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : editorialNotes.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-600 font-medium">No editorial notes</p>
                <p className="text-slate-400 text-sm mt-1">Feedback from editors will appear here</p>
              </div>
            ) : (
              editorialNotes.slice(0, 4).map((note) => (
                <div key={note.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{note.postTitle}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{note.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {note.editorName} • {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Articles */}
      {topArticles.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-slate-900">Top Performing Articles</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {topArticles.map((article, index) => (
              <div key={article.id} className="flex items-center gap-4 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-slate-200 text-slate-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{article.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 capitalize">{article.category}</span>
                    <span className="text-xs text-slate-400">
                      {article.publishedAt && new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {formatNumber(article.views)}
                  </div>
                  <span className="text-xs text-slate-400">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Writing Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-3">📝 Writing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Write compelling headlines that capture attention
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Aim for at least 800 words for in-depth articles
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Proofread before submitting for review
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Add notes for editors if you have specific requests
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
