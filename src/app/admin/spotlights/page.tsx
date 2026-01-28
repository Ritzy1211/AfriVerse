'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Image as ImageIcon,
  Calendar,
  MoreHorizontal,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Spotlight {
  id: string;
  title: string;
  subtitle?: string;
  quote?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  placement: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdByName?: string;
}

export default function SpotlightsPage() {
  const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlacement, setFilterPlacement] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSpotlights = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      
      if (filterPlacement !== 'all') {
        params.append('placement', filterPlacement);
      }
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const res = await fetch(`/api/admin/spotlights?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSpotlights(data.spotlights || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching spotlights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpotlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterPlacement, filterStatus]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/spotlights/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      if (res.ok) {
        setSpotlights(prev =>
          prev.map(s => (s.id === id ? { ...s, isActive: !currentStatus } : s))
        );
      }
    } catch (error) {
      console.error('Error toggling spotlight:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/spotlights/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setSpotlights(prev => prev.filter(s => s.id !== id));
        setShowDeleteModal(null);
      }
    } catch (error) {
      console.error('Error deleting spotlight:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSpotlights = spotlights.filter(spotlight =>
    spotlight.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const placementLabels: Record<string, string> = {
    homepage: 'Homepage',
    article: 'Article Pages',
    category: 'Category Pages',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Spotlights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage featured visual content showcases
          </p>
        </div>
        <Link
          href="/admin/spotlights/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Spotlight
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search spotlights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Placement Filter */}
          <select
            value={filterPlacement}
            onChange={(e) => setFilterPlacement(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Placements</option>
            <option value="homepage">Homepage</option>
            <option value="article">Article Pages</option>
            <option value="category">Category Pages</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Spotlights Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : filteredSpotlights.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No spotlights yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first spotlight to showcase featured content
          </p>
          <Link
            href="/admin/spotlights/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Spotlight
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSpotlights.map((spotlight) => (
            <div
              key={spotlight.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Media Preview */}
                <div className="w-full md:w-48 h-32 md:h-auto relative bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                  {spotlight.mediaUrl ? (
                    <Image
                      src={spotlight.mediaUrl}
                      alt={spotlight.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  {spotlight.mediaType === 'VIDEO' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-10 w-10 text-white" fill="white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {spotlight.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            spotlight.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}
                        >
                          {spotlight.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {spotlight.quote && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                          "{spotlight.quote}"
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          {spotlight.mediaType === 'VIDEO' ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <ImageIcon className="h-3 w-3" />
                          )}
                          {spotlight.mediaType}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                          {placementLabels[spotlight.placement] || spotlight.placement}
                        </span>
                        <span>Priority: {spotlight.priority}</span>
                        {spotlight.startDate && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(spotlight.startDate).toLocaleDateString()}
                            {spotlight.endDate && ` - ${new Date(spotlight.endDate).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(spotlight.id, spotlight.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          spotlight.isActive
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={spotlight.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {spotlight.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/spotlights/${spotlight.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setShowDeleteModal(spotlight.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
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
