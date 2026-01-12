'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  Clock,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Send,
  MoreVertical,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  category?: { name: string };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

const statusFilters = [
  { value: '', label: 'All Articles' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'CHANGES_REQUESTED', label: 'Needs Revision' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
];

export default function ArticlesPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/writer/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/writer/drafts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      DRAFT: { label: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100', icon: FileText },
      PENDING_REVIEW: { label: 'Submitted', color: 'text-amber-600', bg: 'bg-amber-50', icon: Send },
      IN_REVIEW: { label: 'In Review', color: 'text-blue-600', bg: 'bg-blue-50', icon: Eye },
      CHANGES_REQUESTED: { label: 'Needs Revision', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
      APPROVED: { label: 'Approved', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
      PUBLISHED: { label: 'Published', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle },
    };
    return configs[status] || { label: status, color: 'text-slate-600', bg: 'bg-slate-100', icon: FileText };
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Check if article is editable (only drafts and revision-requested)
  const isEditable = (status: string) => ['DRAFT', 'CHANGES_REQUESTED'].includes(status);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Articles</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your drafts and submissions</p>
        </div>
        <Link
          href="/writer/compose"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Edit className="w-4 h-4" />
          New Draft
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Loading articles...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {statusFilter ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-slate-500 mb-4">
              {statusFilter ? 'Try adjusting your filters' : 'Start writing your first story'}
            </p>
            {!statusFilter && (
              <Link
                href="/writer/compose"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <Edit className="w-4 h-4" />
                Create Draft
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredArticles.map((article) => {
              const statusConfig = getStatusConfig(article.status);
              const StatusIcon = statusConfig.icon;
              const canEdit = isEditable(article.status);
              const canDelete = article.status === 'DRAFT';

              return (
                <div key={article.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/writer/articles/${article.id}`}
                            className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors"
                          >
                            {article.title || 'Untitled'}
                          </Link>
                          {article.excerpt && (
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            {article.category && (
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {article.category.name}
                              </span>
                            )}
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(article.updatedAt).toLocaleDateString()}
                            </span>
                            {article.status === 'PUBLISHED' && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.viewCount} views
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Link
                              href={`/writer/articles/${article.id}/edit`}
                              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                          )}
                          <Link
                            href={`/writer/articles/${article.id}`}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(article.id)}
                              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Revision Alert */}
                      {article.status === 'CHANGES_REQUESTED' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            This article needs revision. Check editorial notes for feedback.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
