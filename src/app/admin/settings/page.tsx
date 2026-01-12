'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Globe,
  Clock,
  Mail,
  Image as ImageIcon,
  FileText,
  Settings,
  Check,
  Loader2,
} from 'lucide-react';

const defaultSettings = {
  siteName: 'AfriVerse',
  siteTagline: "Africa's Voice in Global Conversations",
  siteDescription: 'Your gateway to African culture, business, entertainment, technology, and lifestyle. Stay informed with authentic stories from across the continent.',
  siteUrl: 'https://afriverse.ng',
  adminEmail: 'john.paulson@afriverse.africa',
  contactEmail: 'hello@afriverse.ng',
  timezone: 'Africa/Lagos',
  dateFormat: 'MMMM D, YYYY',
  postsPerPage: '10',
  enableComments: true,
  moderateComments: true,
  enableNewsletter: true,
  enableRss: true,
  siteLogo: '',
  favicon: '',
};

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings?category=general');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched settings from DB:', data);
        // Only update settings that exist in the response
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => {
            const merged = { ...prev };
            Object.keys(data).forEach(key => {
              if (key in merged && data[key] !== undefined && data[key] !== null) {
                (merged as Record<string, string | boolean>)[key] = data[key];
              }
            });
            return merged;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    console.log('Saving settings:', settings);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'general', settings }),
      });

      const result = await response.json();
      console.log('Save response:', result);

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save settings: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            General Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your site&apos;s basic information
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-secondary text-primary hover:bg-secondary/90'
          } disabled:opacity-50`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Site Identity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Globe className="w-5 h-5 text-secondary" />
          Site Identity
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={settings.siteTagline}
                onChange={(e) => handleChange('siteTagline', e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Description (SEO)
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site URL
            </label>
            <input
              type="url"
              value={settings.siteUrl}
              onChange={(e) => handleChange('siteUrl', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <ImageIcon className="w-5 h-5 text-secondary" />
          Branding
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {settings.siteLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.siteLogo} alt="Site Logo" className="w-full h-full object-contain" />
                ) : (
                  <FileText className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleChange('siteLogo', URL.createObjectURL(file));
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Favicon
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {settings.favicon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.favicon} alt="Site Favicon" className="w-8 h-8 object-contain" />
                ) : (
                  <Settings className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                Upload Favicon
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleChange('favicon', URL.createObjectURL(file));
                }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Mail className="w-5 h-5 text-secondary" />
          Email Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <p className="mt-1 text-xs text-gray-500">Used for system notifications</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <p className="mt-1 text-xs text-gray-500">Displayed on contact page</p>
          </div>
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Clock className="w-5 h-5 text-secondary" />
          Date & Time
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
              <option value="Africa/Cairo">Africa/Cairo (EET)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="MMMM D, YYYY">January 15, 2024</option>
              <option value="DD/MM/YYYY">15/01/2024</option>
              <option value="MM/DD/YYYY">01/15/2024</option>
              <option value="YYYY-MM-DD">2024-01-15</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reading Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <FileText className="w-5 h-5 text-secondary" />
          Reading Settings
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posts Per Page
            </label>
            <select
              value={settings.postsPerPage}
              onChange={(e) => handleChange('postsPerPage', e.target.value)}
              className="w-full max-w-xs px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableComments}
                onChange={(e) => handleChange('enableComments', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Comments
                </span>
                <p className="text-xs text-gray-500">Allow visitors to comment on posts</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.moderateComments}
                onChange={(e) => handleChange('moderateComments', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Moderate Comments
                </span>
                <p className="text-xs text-gray-500">Comments require approval before publishing</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNewsletter}
                onChange={(e) => handleChange('enableNewsletter', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Newsletter
                </span>
                <p className="text-xs text-gray-500">Show newsletter signup forms</p>
              </div>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableRss}
                onChange={(e) => handleChange('enableRss', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable RSS Feed
                </span>
                <p className="text-xs text-gray-500">Allow RSS subscriptions</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
