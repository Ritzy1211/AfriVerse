'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Settings,
  Eye,
  EyeOff,
  TrendingUp,
  Globe,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface AdNetwork {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  impressions: number;
  cpm: number;
  envKeys: string[];
  setupGuide: string;
  bestFor: string[];
}

const adNetworks: AdNetwork[] = [
  {
    id: 'adsense',
    name: 'Google AdSense',
    logo: '🔵',
    description: 'The most popular ad network. High CPM for quality traffic.',
    website: 'https://www.google.com/adsense',
    status: 'active',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['NEXT_PUBLIC_ADSENSE_PUBLISHER_ID', 'NEXT_PUBLIC_ADSENSE_SLOT_*'],
    setupGuide: 'Create ad units in AdSense dashboard, copy slot IDs to .env',
    bestFor: ['Display ads', 'Auto ads', 'Quality traffic'],
  },
  {
    id: 'medianet',
    name: 'Media.net',
    logo: '🟣',
    description: 'Yahoo/Bing contextual ads. Great AdSense alternative.',
    website: 'https://www.media.net',
    status: 'inactive',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['NEXT_PUBLIC_MEDIANET_CID', 'NEXT_PUBLIC_MEDIANET_CRID'],
    setupGuide: 'Apply at media.net, get approved, create ad units',
    bestFor: ['Contextual ads', 'High CPM', 'US/UK traffic'],
  },
  {
    id: 'adsterra',
    name: 'Adsterra',
    logo: '🟢',
    description: 'Great for African & emerging market traffic. Multiple ad formats.',
    website: 'https://adsterra.com',
    status: 'active',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['NEXT_PUBLIC_ADSTERRA_KEY', 'NEXT_PUBLIC_ADSTERRA_NATIVE_KEY'],
    setupGuide: 'Sign up at publishers.adsterra.com, create ad codes',
    bestFor: ['African traffic', 'Social bar', 'Native ads', 'Popunders'],
  },
  {
    id: 'propellerads',
    name: 'PropellerAds',
    logo: '🟠',
    description: 'Push notifications & interstitials. Good fill rates.',
    website: 'https://propellerads.com',
    status: 'inactive',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['NEXT_PUBLIC_PROPELLER_ZONE_ID', 'NEXT_PUBLIC_PROPELLER_PUSH_ID'],
    setupGuide: 'Register at partners.propellerads.com, add push notification code',
    bestFor: ['Push notifications', 'Interstitials', 'High fill rate'],
  },
  {
    id: 'mgid',
    name: 'MGID',
    logo: '🔴',
    description: 'Native content recommendation ads. Good for engagement.',
    website: 'https://www.mgid.com',
    status: 'inactive',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['NEXT_PUBLIC_MGID_WIDGET_ID', 'NEXT_PUBLIC_MGID_CONTAINER_ID'],
    setupGuide: 'Apply at mgid.com/publishers, create native widget',
    bestFor: ['Native ads', 'Content recommendation', 'Engagement'],
  },
  {
    id: 'ezoic',
    name: 'Ezoic',
    logo: '🟡',
    description: 'AI-powered ad optimization. Manages all your ad networks.',
    website: 'https://www.ezoic.com',
    status: 'inactive',
    revenue: 0,
    impressions: 0,
    cpm: 0,
    envKeys: ['Requires DNS/Cloudflare integration'],
    setupGuide: 'Sign up, integrate via Cloudflare or name servers',
    bestFor: ['Ad optimization', 'Revenue maximization', '10k+ monthly visits'],
  },
];

export default function AdNetworksPage() {
  const [networks, setNetworks] = useState(adNetworks);
  const [selectedNetwork, setSelectedNetwork] = useState<AdNetwork | null>(null);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeNetworks = networks.filter(n => n.status === 'active');
  const totalRevenue = networks.reduce((sum, n) => sum + n.revenue, 0);
  const totalImpressions = networks.reduce((sum, n) => sum + n.impressions, 0);

  const copyEnvTemplate = () => {
    const template = `# ==========================================
# AD NETWORKS CONFIGURATION
# ==========================================

# Google AdSense
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_BILLBOARD=
NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD=
NEXT_PUBLIC_ADSENSE_SLOT_MEDIUM_RECT=
NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE=
NEXT_PUBLIC_ADSENSE_SLOT_NATIVE=

# Media.net
NEXT_PUBLIC_MEDIANET_CID=
NEXT_PUBLIC_MEDIANET_CRID=

# Adsterra
NEXT_PUBLIC_ADSTERRA_KEY=
NEXT_PUBLIC_ADSTERRA_NATIVE_KEY=
NEXT_PUBLIC_ADSTERRA_POPUNDER_KEY=

# PropellerAds
NEXT_PUBLIC_PROPELLER_ZONE_ID=
NEXT_PUBLIC_PROPELLER_PUSH_ID=

# MGID
NEXT_PUBLIC_MGID_WIDGET_ID=
NEXT_PUBLIC_MGID_CONTAINER_ID=
`;
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-500" />
            Ad Networks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage multiple ad networks to maximize revenue
          </p>
        </div>
        <button
          onClick={copyEnvTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy .env Template'}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Impressions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {totalImpressions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. CPM</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${(totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Networks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {activeNetworks.length} / {networks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 mb-8 text-white">
        <h3 className="font-bold text-lg mb-2">💡 Recommended for AfriVerse</h3>
        <p className="opacity-90 mb-4">
          Based on your African audience, we recommend this combination:
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Google AdSense (Primary)</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ Adsterra (Secondary - African traffic)</span>
          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">✅ MGID (Native recommendations)</span>
        </div>
      </div>

      {/* Networks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {networks.map((network) => (
          <div
            key={network.id}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 transition-all ${
              network.status === 'active'
                ? 'border-green-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{network.logo}</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{network.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      network.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : network.status === 'pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {network.status === 'active' ? 'Active' : network.status === 'pending' ? 'Pending' : 'Not Setup'}
                  </span>
                </div>
              </div>
              <a
                href={network.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-amber-500"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {network.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {network.bestFor.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {network.status === 'active' && (
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${network.revenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {network.impressions.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Impressions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ${network.cpm.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">CPM</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Required .env keys:</p>
              <div className="flex flex-wrap gap-1">
                {network.envKeys.map((key) => (
                  <code
                    key={key}
                    className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {key}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedNetwork(network)}
              className="w-full mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
            >
              {network.status === 'active' ? 'Manage' : 'Setup Guide'}
            </button>
          </div>
        ))}
      </div>

      {/* Setup Modal */}
      {selectedNetwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedNetwork.logo}</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedNetwork.name} Setup
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Sign Up</h3>
                <a
                  href={selectedNetwork.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:underline flex items-center gap-1"
                >
                  Visit {selectedNetwork.website} <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Get Approved</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Submit your site for review. Most networks require 10,000+ monthly pageviews.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Add to .env</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedNetwork.setupGuide}
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  {selectedNetwork.envKeys.map((key) => (
                    <code key={key} className="block text-sm text-gray-800 dark:text-gray-200">
                      {key}=your_value_here
                    </code>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 4: Deploy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Restart your app to apply changes. Ads will automatically appear.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedNetwork(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <a
                href={selectedNetwork.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
