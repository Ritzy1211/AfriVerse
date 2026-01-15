'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Eye,
  MousePointer,
  RefreshCw
} from 'lucide-react';

interface AdPlacement {
  id: string;
  name: string;
  slot: string;
  type: 'BANNER' | 'NATIVE' | 'SPONSORED_POST' | 'VIDEO' | 'TEXT';
  width?: number;
  height?: number;
  isActive: boolean;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  adNetworkCode?: string;
  adNetwork?: string;
  categories: string[];
  countries: string[];
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

const AD_TYPES = [
  { value: 'BANNER', label: 'Banner', icon: ImageIcon },
  { value: 'NATIVE', label: 'Native', icon: FileText },
  { value: 'SPONSORED_POST', label: 'Sponsored Post', icon: FileText },
  { value: 'VIDEO', label: 'Video', icon: Video },
  { value: 'TEXT', label: 'Text', icon: FileText },
];

const PRESET_SLOTS = [
  { value: 'header-banner', label: 'Header Banner', size: '728x90' },
  { value: 'sidebar-top', label: 'Sidebar Top', size: '300x250' },
  { value: 'sidebar-bottom', label: 'Sidebar Bottom', size: '300x600' },
  { value: 'in-content-1', label: 'In-Content 1', size: '336x280' },
  { value: 'in-content-2', label: 'In-Content 2', size: '336x280' },
  { value: 'footer-banner', label: 'Footer Banner', size: '970x90' },
  { value: 'mobile-banner', label: 'Mobile Banner', size: '320x50' },
  { value: 'interstitial', label: 'Interstitial', size: '300x250' },
];

export default function AdPlacementsPage() {
  const { data: session } = useSession();
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slot: '',
    type: 'BANNER',
    width: '',
    height: '',
    isActive: true,
    imageUrl: '',
    linkUrl: '',
    altText: '',
    adNetworkCode: '',
    adNetwork: '',
    categories: [] as string[],
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPlacements();
  }, []);

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ad-placements');
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      }
    } catch {
      console.error('Failed to fetch placements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlacement 
        ? `/api/admin/ad-placements/${editingPlacement.id}`
        : '/api/admin/ad-placements';
      
      const res = await fetch(url, {
        method: editingPlacement ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          width: formData.width ? parseInt(formData.width) : null,
          height: formData.height ? parseInt(formData.height) : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `Ad placement ${editingPlacement ? 'updated' : 'created'}!` });
        setShowModal(false);
        resetForm();
        fetchPlacements();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save ad placement' });
    }
  };

  const toggleActive = async (placement: AdPlacement) => {
    try {
      const res = await fetch(`/api/admin/ad-placements/${placement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !placement.isActive }),
      });

      if (res.ok) {
        fetchPlacements();
      }
    } catch {
      console.error('Failed to toggle');
    }
  };

  const deletePlacement = async (id: string) => {
    if (!confirm('Delete this ad placement?')) return;
    
    try {
      const res = await fetch(`/api/admin/ad-placements/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Ad placement deleted' });
        fetchPlacements();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  };

  const openEditModal = (placement: AdPlacement) => {
    setEditingPlacement(placement);
    setFormData({
      name: placement.name,
      slot: placement.slot,
      type: placement.type,
      width: placement.width?.toString() || '',
      height: placement.height?.toString() || '',
      isActive: placement.isActive,
      imageUrl: placement.imageUrl || '',
      linkUrl: placement.linkUrl || '',
      altText: placement.altText || '',
      adNetworkCode: placement.adNetworkCode || '',
      adNetwork: placement.adNetwork || '',
      categories: placement.categories || [],
      startDate: placement.startDate ? placement.startDate.slice(0, 10) : '',
      endDate: placement.endDate ? placement.endDate.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingPlacement(null);
    setFormData({
      name: '',
      slot: '',
      type: 'BANNER',
      width: '',
      height: '',
      isActive: true,
      imageUrl: '',
      linkUrl: '',
      altText: '',
      adNetworkCode: '',
      adNetwork: '',
      categories: [],
      startDate: '',
      endDate: '',
    });
  };

  const selectPresetSlot = (preset: typeof PRESET_SLOTS[0]) => {
    const [w, h] = preset.size.split('x');
    setFormData({
      ...formData,
      slot: preset.value,
      name: formData.name || preset.label,
      width: w,
      height: h,
    });
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ad Placements
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage advertising zones and placements across the site
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlacements}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90"
          >
            <Plus className="w-4 h-4" />
            Add Placement
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Placements List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : placements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Ad Placements
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create ad zones to display advertisements on your site.
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90"
          >
            <Plus className="w-4 h-4" />
            Create First Placement
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Placement
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Size
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Performance
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {placements.map((placement) => (
                <tr key={placement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {placement.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {placement.slot}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {placement.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {placement.width && placement.height 
                      ? `${placement.width}x${placement.height}` 
                      : 'Auto'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Eye className="w-4 h-4" />
                        {placement.impressions.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <MousePointer className="w-4 h-4" />
                        {placement.clicks.toLocaleString()}
                      </span>
                      {placement.impressions > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          {((placement.clicks / placement.impressions) * 100).toFixed(2)}% CTR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(placement)}
                      className={`flex items-center gap-2 ${
                        placement.isActive 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400'
                      }`}
                    >
                      {placement.isActive ? (
                        <ToggleRight className="w-6 h-6" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                      {placement.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(placement)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlacement(placement.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingPlacement ? 'Edit Ad Placement' : 'Create Ad Placement'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Preset Slots */}
              {!editingPlacement && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Select Slot
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {PRESET_SLOTS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => selectPresetSlot(preset)}
                        className={`p-2 text-left text-sm border rounded-lg hover:border-secondary transition-colors ${
                          formData.slot === preset.value 
                            ? 'border-secondary bg-secondary/10' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className="font-medium">{preset.label}</p>
                        <p className="text-gray-500 text-xs">{preset.size}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    placeholder="e.g., Header Banner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slot ID *
                  </label>
                  <input
                    type="text"
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    placeholder="e.g., header-banner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                  >
                    {AD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    placeholder="728"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    placeholder="90"
                  />
                </div>
              </div>

              {/* House Ad Content */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  House Ad Content (Optional)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Link URL
                    </label>
                    <input
                      type="url"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                      placeholder="Advertisement description"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Network */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Ad Network (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Network
                    </label>
                    <select
                      value={formData.adNetwork}
                      onChange={(e) => setFormData({ ...formData, adNetwork: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    >
                      <option value="">None (House Ad)</option>
                      <option value="adsense">Google AdSense</option>
                      <option value="carbon">Carbon Ads</option>
                      <option value="buysellads">BuySellAds</option>
                      <option value="custom">Custom Script</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad Unit Code
                    </label>
                    <input
                      type="text"
                      value={formData.adNetworkCode}
                      onChange={(e) => setFormData({ ...formData, adNetworkCode: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                      placeholder="ca-pub-xxx..."
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Schedule (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`flex items-center gap-2 ${
                    formData.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {formData.isActive ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90"
                >
                  {editingPlacement ? 'Update Placement' : 'Create Placement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
