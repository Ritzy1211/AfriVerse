'use client';

import { useState } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  Copy,
  Download,
  Eye,
  X,
  FolderPlus,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

// Mock media data
const mediaData = [
  { id: 1, name: 'nigerian-tech-startups.jpg', type: 'image', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f', date: '2024-01-15', dimensions: '1920x1080' },
  { id: 2, name: 'davido-concert.jpg', type: 'image', size: '1.8 MB', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', date: '2024-01-14', dimensions: '1600x900' },
  { id: 3, name: 'lagos-fashion.jpg', type: 'image', size: '3.2 MB', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', date: '2024-01-13', dimensions: '2400x1600' },
  { id: 4, name: 'super-eagles.jpg', type: 'image', size: '2.1 MB', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', date: '2024-01-12', dimensions: '1920x1280' },
  { id: 5, name: 'iphone-16.jpg', type: 'image', size: '1.5 MB', url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5', date: '2024-01-11', dimensions: '1200x800' },
  { id: 6, name: 'press-kit.pdf', type: 'document', size: '5.2 MB', url: '#', date: '2024-01-10', dimensions: '' },
  { id: 7, name: 'interview-clip.mp4', type: 'video', size: '45.8 MB', url: '#', date: '2024-01-09', dimensions: '1920x1080' },
  { id: 8, name: 'lagos-skyline.jpg', type: 'image', size: '2.8 MB', url: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8', date: '2024-01-08', dimensions: '2000x1333' },
  { id: 9, name: 'afrobeats-festival.jpg', type: 'image', size: '4.1 MB', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea', date: '2024-01-07', dimensions: '2560x1440' },
  { id: 10, name: 'tech-conference.jpg', type: 'image', size: '1.9 MB', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', date: '2024-01-06', dimensions: '1800x1200' },
];

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video' | 'document';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState(mediaData);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedMedia, setSelectedMedia] = useState<number[]>([]);
  const [previewMedia, setPreviewMedia] = useState<typeof mediaData[0] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSelectMedia = (id: number) => {
    if (selectedMedia.includes(id)) {
      setSelectedMedia(selectedMedia.filter(m => m !== id));
    } else {
      setSelectedMedia([...selectedMedia, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMedia.length === filteredMedia.length) {
      setSelectedMedia([]);
    } else {
      setSelectedMedia(filteredMedia.map(m => m.id));
    }
  };

  const handleDeleteSelected = () => {
    setMedia(media.filter(m => !selectedMedia.includes(m.id)));
    setSelectedMedia([]);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Toast notification would go here
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file upload
    const files = e.dataTransfer.files;
    console.log('Dropped files:', files);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your images, videos, and documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            New Folder
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search & Filters */}
          <div className="flex flex-1 gap-4 w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">All Files</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMedia.length > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMedia.length} selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedMedia([])}
              className="text-sm text-gray-500 hover:text-gray-600"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging
            ? 'border-secondary bg-secondary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop files here, or{' '}
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-secondary hover:underline"
          >
            browse
          </button>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports: JPG, PNG, GIF, MP4, PDF (Max 50MB)
        </p>
      </div>

      {/* Media Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden cursor-pointer ${
                selectedMedia.includes(item.id) ? 'ring-2 ring-secondary' : ''
              }`}
              onClick={() => handleSelectMedia(item.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(item.type)
                )}
              </div>

              {/* Checkbox */}
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedMedia.includes(item.id)}
                  onChange={() => handleSelectMedia(item.id)}
                  className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewMedia(item);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(item.url);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMedia(media.filter(m => m.id !== item.id));
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              {/* File Info */}
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedMedia.length === filteredMedia.length && filteredMedia.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  File
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dimensions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMedia.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(item.id)}
                      onChange={() => handleSelectMedia(item.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                        {item.type === 'image' ? (
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          getFileIcon(item.type)
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full capitalize ${
                      item.type === 'image' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'video' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.size}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.dimensions || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewMedia(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(item.url)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setMedia(media.filter(m => m.id !== item.id))}
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
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredMedia.length} of {media.length} files
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 bg-secondary text-primary rounded-lg text-sm font-medium">1</span>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            
            {previewMedia.type === 'image' ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.name}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                {getFileIcon(previewMedia.type)}
                <p className="mt-4 text-gray-900 dark:text-white font-medium">
                  {previewMedia.name}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {previewMedia.size} • {previewMedia.type}
                </p>
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => handleCopyUrl(previewMedia.url)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </button>
              <a
                href={previewMedia.url}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-secondary transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-gray-600 dark:text-gray-400">
                  Click to select files
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  or drag and drop
                </span>
                <input type="file" multiple className="hidden" />
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
