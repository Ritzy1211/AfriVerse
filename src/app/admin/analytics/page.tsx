'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

// Mock analytics data
const overviewStats = [
  { name: 'Page Views', value: '45,231', change: '+12.3%', trend: 'up', icon: Eye },
  { name: 'Unique Visitors', value: '12,847', change: '+8.7%', trend: 'up', icon: Users },
  { name: 'Avg. Session', value: '3m 42s', change: '-2.1%', trend: 'down', icon: Clock },
  { name: 'Bounce Rate', value: '42.3%', change: '-5.4%', trend: 'up', icon: TrendingDown },
];

const trafficData = {
  daily: [
    { date: 'Mon', views: 2340, visitors: 890 },
    { date: 'Tue', views: 3210, visitors: 1120 },
    { date: 'Wed', views: 2890, visitors: 980 },
    { date: 'Thu', views: 4120, visitors: 1450 },
    { date: 'Fri', views: 3780, visitors: 1280 },
    { date: 'Sat', views: 2560, visitors: 920 },
    { date: 'Sun', views: 2190, visitors: 780 },
  ],
};

const topPages = [
  { title: 'Nigerian Tech Startups Secure $500M', views: 8234, avgTime: '4:23', bounceRate: '32%' },
  { title: 'Davido Announces World Tour 2025', views: 6891, avgTime: '3:45', bounceRate: '38%' },
  { title: 'Super Eagles AFCON 2025 Preview', views: 5672, avgTime: '5:12', bounceRate: '28%' },
  { title: 'iPhone 16 vs Samsung S24 in Nigeria', views: 4523, avgTime: '6:34', bounceRate: '25%' },
  { title: 'Lagos Fashion Week 2024 Recap', views: 3891, avgTime: '4:56', bounceRate: '35%' },
];

const trafficSources = [
  { source: 'Google Search', visitors: 5234, percentage: 42 },
  { source: 'Direct', visitors: 2891, percentage: 23 },
  { source: 'Social Media', visitors: 2156, percentage: 17 },
  { source: 'Referral', visitors: 1423, percentage: 11 },
  { source: 'Email', visitors: 891, percentage: 7 },
];

const topCountries = [
  { country: 'Nigeria', flag: '🇳🇬', visitors: 8234, percentage: 65 },
  { country: 'United States', flag: '🇺🇸', visitors: 1523, percentage: 12 },
  { country: 'United Kingdom', flag: '🇬🇧', visitors: 1021, percentage: 8 },
  { country: 'Ghana', flag: '🇬🇭', visitors: 756, percentage: 6 },
  { country: 'South Africa', flag: '🇿🇦', visitors: 534, percentage: 4 },
];

const deviceStats = [
  { device: 'Mobile', icon: Smartphone, percentage: 62, color: 'bg-blue-500' },
  { device: 'Desktop', icon: Monitor, percentage: 32, color: 'bg-purple-500' },
  { device: 'Tablet', icon: Smartphone, percentage: 6, color: 'bg-green-500' },
];

type DateRange = '7d' | '30d' | '90d' | '1y';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const maxViews = Math.max(...trafficData.daily.map(d => d.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track your site performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dateRange === range
                    ? 'bg-white dark:bg-gray-700 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <stat.icon className="w-5 h-5 text-secondary" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-secondary rounded-full"></span>
              Page Views
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-accent rounded-full"></span>
              Visitors
            </span>
          </div>
        </div>
        
        {/* Simple Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2">
          {trafficData.daily.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 justify-center" style={{ height: '200px' }}>
                <div
                  className="w-1/3 bg-secondary rounded-t transition-all duration-300"
                  style={{ height: `${(day.views / maxViews) * 100}%` }}
                />
                <div
                  className="w-1/3 bg-accent rounded-t transition-all duration-300"
                  style={{ height: `${(day.visitors / maxViews) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Pages</h2>
            <FileText className="w-5 h-5 text-secondary" />
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {topPages.map((page, index) => (
              <div key={page.title} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-secondary text-primary' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {page.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {page.views.toLocaleString()} views • {page.avgTime} avg time • {page.bounceRate} bounce
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic Sources</h2>
            <TrendingUp className="w-5 h-5 text-secondary" />
          </div>
          <div className="p-6 space-y-4">
            {trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{source.source}</span>
                  <span className="text-sm text-gray-500">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Countries</h2>
            <Globe className="w-5 h-5 text-secondary" />
          </div>
          <div className="p-4 space-y-3">
            {topCountries.map((country) => (
              <div key={country.country} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{country.country}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${country.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{country.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Devices</h2>
            <Monitor className="w-5 h-5 text-secondary" />
          </div>
          <div className="p-6">
            {/* Simple Donut Chart representation */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {deviceStats.map((device, index) => {
                  const previousPercentages = deviceStats.slice(0, index).reduce((acc, d) => acc + d.percentage, 0);
                  const strokeDasharray = `${device.percentage * 2.51327} ${251.327}`;
                  const strokeDashoffset = -previousPercentages * 2.51327;
                  return (
                    <circle
                      key={device.device}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      strokeWidth="20"
                      stroke={device.color.replace('bg-', '').replace('-500', '')}
                      className={device.color.replace('bg-', 'stroke-')}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                    />
                  );
                })}
              </svg>
            </div>
            <div className="space-y-3">
              {deviceStats.map((device) => (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${device.color}`} />
                    <device.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{device.device}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{device.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Real-time</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-secondary">47</p>
              <p className="text-sm text-gray-500 mt-1">Active users right now</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Page views (last hour)</span>
                <span className="font-semibold text-gray-900 dark:text-white">234</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">New users (today)</span>
                <span className="font-semibold text-gray-900 dark:text-white">89</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Top page right now</span>
                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">Tech Startups</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Export Analytics Data</h3>
            <p className="text-sm text-gray-500">Download reports for further analysis</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Export CSV
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Export PDF
            </button>
            <button className="px-4 py-2 bg-secondary text-primary font-semibold rounded-lg text-sm hover:bg-secondary/90 transition-colors">
              Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
