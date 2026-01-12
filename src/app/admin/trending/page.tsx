'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Flame,
  ExternalLink,
} from 'lucide-react';

interface TrendingTopic {
  id: string;
  title: string;
  url: string;
  category: string;
  upiScore: number;
  trend: string;
  isActive: boolean;
  order: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  'News',
  'Business',
  'Politics',
  'Entertainment',
  'Sports',
  'Technology',
  'Lifestyle',
  'Culture',
  'Opinion',
];

export default function TrendingPage() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TrendingTopic | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'News',
    upiScore: 50,
    trend: 'STABLE',
    isActive: true,
    order: 0,
    expiresAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    try {
      const response = await fetch('/api/admin/trending');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingTopic
        ? `/api/admin/trending/${editingTopic.id}`
        : '/api/admin/trending';
      const method = editingTopic ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTopics();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save topic');
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Failed to save topic');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this trending topic?')) return;

    try {
      const response = await fetch(`/api/admin/trending/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTopics();
      } else {
        alert('Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic');
    }
  }

  async function toggleActive(topic: TrendingTopic) {
    try {
      const response = await fetch(`/api/admin/trending/${topic.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !topic.isActive }),
      });

      if (response.ok) {
        await fetchTopics();
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  }

  function editTopic(topic: TrendingTopic) {
    setEditingTopic(topic);
    setFormData({
      title: topic.title,
      url: topic.url,
      category: topic.category,
      upiScore: topic.upiScore,
      trend: topic.trend,
      isActive: topic.isActive,
      order: topic.order,
      expiresAt: topic.expiresAt ? topic.expiresAt.split('T')[0] : '',
    });
    setShowForm(true);
  }

  function resetForm() {
    setShowForm(false);
    setEditingTopic(null);
    setFormData({
      title: '',
      url: '',
      category: 'News',
      upiScore: 50,
      trend: 'STABLE',
      isActive: true,
      order: 0,
      expiresAt: '',
    });
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'UP':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'DOWN':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Trending Topics
          </h1>
          <p className="text-gray-600 mt-1">
            Manage the topics displayed in the &quot;Trending Now&quot; ticker
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingTopic ? 'Edit Trending Topic' : 'Add Trending Topic'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  placeholder="e.g., Lagos Traffic Updates"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                  placeholder="e.g., /news/lagos-traffic or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trend
                  </label>
                  <select
                    value={formData.trend}
                    onChange={(e) =>
                      setFormData({ ...formData, trend: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="UP">↗ Trending Up</option>
                    <option value="DOWN">↘ Trending Down</option>
                    <option value="STABLE">→ Stable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPI Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.upiScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        upiScore: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires At (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Topic will automatically hide after this date
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible in ticker)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingTopic ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {topics.length === 0 ? (
          <div className="p-12 text-center">
            <Flame className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No trending topics yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first trending topic to display in the ticker
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Topic
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPI Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.order}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {topic.title}
                        </span>
                        <a
                          href={topic.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {topic.expiresAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(topic.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {topic.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTrendIcon(topic.trend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {topic.upiScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(topic)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          topic.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {topic.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editTopic(topic)}
                          className="p-1 text-gray-500 hover:text-brand-primary"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(topic.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">How Trending Topics Work</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Topics with lower order numbers appear first in the ticker</li>
          <li>• Inactive topics are hidden from the public ticker</li>
          <li>• Topics with expiration dates automatically hide after that date</li>
          <li>• UPI Score can be used for future automated trending features</li>
        </ul>
      </div>
    </div>
  );
}
