'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  DollarSign,
  Megaphone,
  Mail,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';

const defaultAdPlacements = [
  { id: 'header-banner', name: 'Header Banner', location: 'Top of page', size: '728x90', active: true },
  { id: 'sidebar-top', name: 'Sidebar Top', location: 'Sidebar widget area', size: '300x250', active: true },
  { id: 'in-article', name: 'In-Article', location: 'Between paragraphs', size: '336x280', active: false },
  { id: 'footer-banner', name: 'Footer Banner', location: 'Above footer', size: '728x90', active: true },
  { id: 'mobile-sticky', name: 'Mobile Sticky', location: 'Bottom of mobile screen', size: '320x50', active: false },
];

const defaultSettings = {
  enableAds: true,
  googleAdsenseId: 'ca-pub-xxxxxxxxxx',
  googleAnalyticsId: 'G-1XV77SHCF1',
  facebookPixelId: '',
  enableSponsoredPosts: true,
  sponsoredLabel: 'Sponsored',
  enableAffiliate: true,
  affiliateDisclosure: 'This post contains affiliate links. We may earn a commission if you make a purchase through these links.',
  enableNewsletter: true,
  mailchimpApiKey: '',
  mailchimpListId: '',
  enableDonations: false,
  paypalEmail: '',
  paystackPublicKey: '',
};

export default function MonetizationSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placements, setPlacements] = useState(defaultAdPlacements);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings?category=monetization');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        if (data.placements) setPlacements(data.placements);
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

  const togglePlacement = (id: string) => {
    setPlacements(placements.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: 'monetization', 
          settings: { settings, placements }
        }),
      });

      if (response.ok) {
        setSaved(true);
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
            Monetization Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure ads, sponsorships, and revenue streams
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

      {/* Google Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Megaphone className="w-5 h-5 text-secondary" />
          Google Services
        </h2>
        <div className="space-y-6">
          <div>
            <label className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Google Ads
                </span>
                <p className="text-xs text-gray-500">Display Google AdSense ads on your site</p>
              </div>
              <button
                onClick={() => handleChange('enableAds', !settings.enableAds)}
                className="text-secondary"
              >
                {settings.enableAds ? (
                  <ToggleRight className="w-10 h-6" />
                ) : (
                  <ToggleLeft className="w-10 h-6 text-gray-400" />
                )}
              </button>
            </label>
            
            {settings.enableAds && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google AdSense Publisher ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleAdsenseId}
                    onChange={(e) => handleChange('googleAdsenseId', e.target.value)}
                    placeholder="ca-pub-xxxxxxxxxx"
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={settings.googleAnalyticsId}
                  onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  value={settings.facebookPixelId}
                  onChange={(e) => handleChange('facebookPixelId', e.target.value)}
                  placeholder="XXXXXXXXXX"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ad Placements
          </h2>
          <button className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <Plus className="w-4 h-4" />
            Add Placement
          </button>
        </div>
        <div className="space-y-3">
          {placements.map((placement) => (
            <div
              key={placement.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-gray-900 dark:text-white">{placement.name}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    placement.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                  }`}>
                    {placement.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {placement.location} • {placement.size}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlacement(placement.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    placement.active
                      ? 'text-secondary hover:bg-secondary/10'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {placement.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
                <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsored Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <DollarSign className="w-5 h-5 text-secondary" />
          Sponsored Content
        </h2>
        <div className="space-y-6">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Sponsored Posts
              </span>
              <p className="text-xs text-gray-500">Allow marking posts as sponsored content</p>
            </div>
            <button
              onClick={() => handleChange('enableSponsoredPosts', !settings.enableSponsoredPosts)}
              className="text-secondary"
            >
              {settings.enableSponsoredPosts ? (
                <ToggleRight className="w-10 h-6" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-gray-400" />
              )}
            </button>
          </label>
          
          {settings.enableSponsoredPosts && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sponsored Label Text
              </label>
              <input
                type="text"
                value={settings.sponsoredLabel}
                onChange={(e) => handleChange('sponsoredLabel', e.target.value)}
                className="w-full max-w-xs px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Affiliate Links
                </span>
                <p className="text-xs text-gray-500">Show affiliate disclosure notice</p>
              </div>
              <button
                onClick={() => handleChange('enableAffiliate', !settings.enableAffiliate)}
                className="text-secondary"
              >
                {settings.enableAffiliate ? (
                  <ToggleRight className="w-10 h-6" />
                ) : (
                  <ToggleLeft className="w-10 h-6 text-gray-400" />
                )}
              </button>
            </label>
            
            {settings.enableAffiliate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Affiliate Disclosure Text
                </label>
                <textarea
                  value={settings.affiliateDisclosure}
                  onChange={(e) => handleChange('affiliateDisclosure', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Mail className="w-5 h-5 text-secondary" />
          Newsletter Integration
        </h2>
        <div className="space-y-6">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Newsletter
              </span>
              <p className="text-xs text-gray-500">Show newsletter signup forms</p>
            </div>
            <button
              onClick={() => handleChange('enableNewsletter', !settings.enableNewsletter)}
              className="text-secondary"
            >
              {settings.enableNewsletter ? (
                <ToggleRight className="w-10 h-6" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-gray-400" />
              )}
            </button>
          </label>
          
          {settings.enableNewsletter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mailchimp API Key
                </label>
                <input
                  type="password"
                  value={settings.mailchimpApiKey}
                  onChange={(e) => handleChange('mailchimpApiKey', e.target.value)}
                  placeholder="Enter API key"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mailchimp List ID
                </label>
                <input
                  type="text"
                  value={settings.mailchimpListId}
                  onChange={(e) => handleChange('mailchimpListId', e.target.value)}
                  placeholder="Enter list ID"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Integration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <DollarSign className="w-5 h-5 text-secondary" />
          Payment & Donations
        </h2>
        <div className="space-y-6">
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Donations
              </span>
              <p className="text-xs text-gray-500">Accept donations from readers</p>
            </div>
            <button
              onClick={() => handleChange('enableDonations', !settings.enableDonations)}
              className="text-secondary"
            >
              {settings.enableDonations ? (
                <ToggleRight className="w-10 h-6" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-gray-400" />
              )}
            </button>
          </label>
          
          {settings.enableDonations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={settings.paypalEmail}
                  onChange={(e) => handleChange('paypalEmail', e.target.value)}
                  placeholder="paypal@yourdomain.com"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paystack Public Key
                </label>
                <input
                  type="text"
                  value={settings.paystackPublicKey}
                  onChange={(e) => handleChange('paystackPublicKey', e.target.value)}
                  placeholder="pk_live_xxxxxx"
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ad Partner Links */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.google.com/adsense"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Google AdSense
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Google Analytics
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://paystack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Paystack
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://mailchimp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Mailchimp
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
