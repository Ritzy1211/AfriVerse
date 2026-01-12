'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  Tag,
  MoreHorizontal,
  ChevronRight,
  FileText,
} from 'lucide-react';

// Mock data
const categoriesData = [
  { id: 1, name: 'Business', slug: 'business', description: 'Business news and entrepreneurship', postCount: 24, color: '#3B82F6' },
  { id: 2, name: 'Entertainment', slug: 'entertainment', description: 'Music, movies, and celebrity news', postCount: 31, color: '#EC4899' },
  { id: 3, name: 'Lifestyle', slug: 'lifestyle', description: 'Fashion, food, and living', postCount: 18, color: '#8B5CF6' },
  { id: 4, name: 'Sports', slug: 'sports', description: 'Sports news and analysis', postCount: 27, color: '#10B981' },
  { id: 5, name: 'Technology', slug: 'technology', description: 'Tech news and gadget reviews', postCount: 42, color: '#F59E0B' },
  { id: 6, name: 'Politics', slug: 'politics', description: 'Political news and opinion', postCount: 14, color: '#EF4444' },
];

const tagsData = [
  { id: 1, name: 'Nigeria', slug: 'nigeria', postCount: 56 },
  { id: 2, name: 'Lagos', slug: 'lagos', postCount: 23 },
  { id: 3, name: 'Tech', slug: 'tech', postCount: 38 },
  { id: 4, name: 'Startup', slug: 'startup', postCount: 19 },
  { id: 5, name: 'Music', slug: 'music', postCount: 27 },
  { id: 6, name: 'Afrobeats', slug: 'afrobeats', postCount: 15 },
  { id: 7, name: 'Fashion', slug: 'fashion', postCount: 12 },
  { id: 8, name: 'Football', slug: 'football', postCount: 31 },
  { id: 9, name: 'Super Eagles', slug: 'super-eagles', postCount: 9 },
  { id: 10, name: 'AFCON', slug: 'afcon', postCount: 7 },
  { id: 11, name: 'Finance', slug: 'finance', postCount: 14 },
  { id: 12, name: 'Investment', slug: 'investment', postCount: 11 },
];

type ModalType = 'category' | 'tag' | null;

export default function CategoriesPage() {
  const [categories, setCategories] = useState(categoriesData);
  const [tags, setTags] = useState(tagsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [showModal, setShowModal] = useState<ModalType>(null);
  const [editItem, setEditItem] = useState<any>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#F39C12');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = (type: ModalType, item?: any) => {
    setShowModal(type);
    if (item) {
      setEditItem(item);
      setFormName(item.name);
      setFormSlug(item.slug);
      setFormDescription(item.description || '');
      setFormColor(item.color || '#F39C12');
    } else {
      setEditItem(null);
      setFormName('');
      setFormSlug('');
      setFormDescription('');
      setFormColor('#F39C12');
    }
  };

  const closeModal = () => {
    setShowModal(null);
    setEditItem(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormColor('#F39C12');
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSave = () => {
    if (showModal === 'category') {
      if (editItem) {
        setCategories(categories.map(cat =>
          cat.id === editItem.id
            ? { ...cat, name: formName, slug: formSlug, description: formDescription, color: formColor }
            : cat
        ));
      } else {
        setCategories([
          ...categories,
          {
            id: Math.max(...categories.map(c => c.id)) + 1,
            name: formName,
            slug: formSlug,
            description: formDescription,
            postCount: 0,
            color: formColor,
          }
        ]);
      }
    } else if (showModal === 'tag') {
      if (editItem) {
        setTags(tags.map(tag =>
          tag.id === editItem.id
            ? { ...tag, name: formName, slug: formSlug }
            : tag
        ));
      } else {
        setTags([
          ...tags,
          {
            id: Math.max(...tags.map(t => t.id)) + 1,
            name: formName,
            slug: formSlug,
            postCount: 0,
          }
        ]);
      }
    }
    closeModal();
  };

  const handleDelete = (type: 'category' | 'tag', id: number) => {
    if (type === 'category') {
      setCategories(categories.filter(cat => cat.id !== id));
    } else {
      setTags(tags.filter(tag => tag.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Categories & Tags
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Organize your content with categories and tags
          </p>
        </div>
        <button
          onClick={() => openModal(activeTab === 'categories' ? 'category' : 'tag')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {activeTab === 'categories' ? 'Category' : 'Tag'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-secondary text-primary'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-secondary text-primary'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          Tags ({tags.length})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500">/{category.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('category', category)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete('category', category.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {category.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  {category.postCount} posts
                </span>
                <button className="flex items-center gap-1 text-sm text-secondary hover:underline">
                  View Posts
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags Grid */}
      {activeTab === 'tags' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-secondary" />
                        <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tag.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tag.postCount} posts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal('tag', tag)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete('tag', tag.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editItem ? 'Edit' : 'Add'} {showModal === 'category' ? 'Category' : 'Tag'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editItem) setFormSlug(generateSlug(e.target.value));
                  }}
                  placeholder={`${showModal === 'category' ? 'Category' : 'Tag'} name`}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                  placeholder="slug-format"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              {showModal === 'category' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Category description"
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formColor}
                        onChange={(e) => setFormColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formName}
                className="px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {editItem ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
