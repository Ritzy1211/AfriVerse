'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Palette,
  Type,
  Layout,
  Sun,
  Moon,
  Monitor,
  Check,
  Loader2,
} from 'lucide-react';

const colorPresets = [
  { name: 'Default', primary: '#1A1A2E', secondary: '#F39C12', accent: '#00D9FF' },
  { name: 'Ocean', primary: '#0F172A', secondary: '#0EA5E9', accent: '#22D3EE' },
  { name: 'Forest', primary: '#14532D', secondary: '#22C55E', accent: '#86EFAC' },
  { name: 'Sunset', primary: '#1C1917', secondary: '#F97316', accent: '#FB923C' },
  { name: 'Royal', primary: '#1E1B4B', secondary: '#7C3AED', accent: '#A78BFA' },
  { name: 'Rose', primary: '#1F1F1F', secondary: '#F43F5E', accent: '#FB7185' },
];

const fontOptions = [
  { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Open Sans', value: 'Open Sans' },
];

const defaultSettings = {
  primaryColor: '#1A1A2E',
  secondaryColor: '#F39C12',
  accentColor: '#00D9FF',
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Plus Jakarta Sans',
  theme: 'light',
  headerStyle: 'default',
  footerStyle: 'default',
  showSocialIcons: true,
  showSearchBar: true,
  showTrendingTicker: true,
  showAuthorBio: true,
  articleLayout: 'default',
};

export default function AppearanceSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings?category=appearance', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
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

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setSettings(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: 'appearance', settings }),
      });

      if (response.ok) {
        setSaved(true);
        // Show success message with refresh prompt
        const refreshNow = window.confirm(
          'Settings saved successfully! The changes will take effect on page refresh.\n\nWould you like to refresh the page now to see the changes?'
        );
        if (refreshNow) {
          window.location.reload();
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Failed to save settings');
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
            Appearance Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Customize your site&apos;s look and feel
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

      {/* Color Scheme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Palette className="w-5 h-5 text-secondary" />
          Color Scheme
        </h2>
        
        {/* Color Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Color Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.primaryColor === preset.primary &&
                  settings.secondaryColor === preset.secondary
                    ? 'border-secondary ring-2 ring-secondary/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Type className="w-5 h-5 text-secondary" />
          Typography
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Heading Font
            </label>
            <select
              value={settings.headingFont}
              onChange={(e) => handleChange('headingFont', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
            <p className="mt-2 text-2xl font-bold" style={{ fontFamily: settings.headingFont }}>
              Preview Heading
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Body Font
            </label>
            <select
              value={settings.bodyFont}
              onChange={(e) => handleChange('bodyFont', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
            <p className="mt-2 text-gray-600 dark:text-gray-400" style={{ fontFamily: settings.bodyFont }}>
              Preview body text appears like this. Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Sun className="w-5 h-5 text-secondary" />
          Theme Mode
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleChange('theme', 'light')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              settings.theme === 'light'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Sun className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Light</p>
              <p className="text-xs text-gray-500">Bright and clean</p>
            </div>
          </button>
          <button
            onClick={() => handleChange('theme', 'dark')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              settings.theme === 'dark'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Moon className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Dark</p>
              <p className="text-xs text-gray-500">Easy on the eyes</p>
            </div>
          </button>
          <button
            onClick={() => handleChange('theme', 'system')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              settings.theme === 'system'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">System</p>
              <p className="text-xs text-gray-500">Follow device preference</p>
            </div>
          </button>
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Layout className="w-5 h-5 text-secondary" />
          Layout Options
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Social Icons in Header
              </span>
              <p className="text-xs text-gray-500">Display social media links in the header</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showSocialIcons}
              onChange={(e) => handleChange('showSocialIcons', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Search Bar
              </span>
              <p className="text-xs text-gray-500">Enable search functionality in header</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showSearchBar}
              onChange={(e) => handleChange('showSearchBar', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Trending Ticker
              </span>
              <p className="text-xs text-gray-500">Display scrolling trending topics bar</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showTrendingTicker}
              onChange={(e) => handleChange('showTrendingTicker', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Show Author Bio
              </span>
              <p className="text-xs text-gray-500">Display author info on articles</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showAuthorBio}
              onChange={(e) => handleChange('showAuthorBio', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
        </div>
      </div>

      {/* Article Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Article Layout
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleChange('articleLayout', 'default')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.articleLayout === 'default'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-full h-20 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
            <p className="text-sm font-medium">Default</p>
            <p className="text-xs text-gray-500">Full-width featured image</p>
          </button>
          <button
            onClick={() => handleChange('articleLayout', 'sidebar')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.articleLayout === 'sidebar'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex gap-2 h-20 mb-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="w-1/3 bg-gray-300 dark:bg-gray-500 rounded" />
            </div>
            <p className="text-sm font-medium">With Sidebar</p>
            <p className="text-xs text-gray-500">Content with side widget</p>
          </button>
          <button
            onClick={() => handleChange('articleLayout', 'centered')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.articleLayout === 'centered'
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-center h-20 mb-2">
              <div className="w-2/3 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
            <p className="text-sm font-medium">Centered</p>
            <p className="text-xs text-gray-500">Narrow centered content</p>
          </button>
        </div>
      </div>
    </div>
  );
}
