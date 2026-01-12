'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Globe,
  Star,
  Award,
  Crown,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  X,
  Users,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

type StorytellerBadge = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'AMBASSADOR';
type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'MORE_INFO_NEEDED';
type StorytellerStatus = 'PENDING' | 'VERIFIED' | 'FEATURED' | 'SUSPENDED' | 'REVOKED';

interface Application {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  city?: string;
  languages: string[];
  expertise: string[];
  bio: string;
  credentials?: string;
  portfolioLinks: string[];
  linkedIn?: string;
  twitter?: string;
  whyJoin: string;
  sampleWork?: string;
  references: string[];
  status: ApplicationStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface VerifiedStoryteller {
  id: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  displayName: string;
  bio: string;
  badgeLevel: StorytellerBadge;
  expertise: string[];
  languages: string[];
  country: string;
  region?: string;
  city?: string;
  articlesCount: number;
  verifiedImpacts: number;
  trustScore: number;
  communityRating: number;
  verifiedAt?: string;
  status: StorytellerStatus;
}

const badgeConfig = {
  BRONZE: { icon: Shield, color: 'text-amber-700', bg: 'bg-amber-100', label: 'Bronze' },
  SILVER: { icon: Star, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Silver' },
  GOLD: { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Gold' },
  PLATINUM: { icon: Crown, color: 'text-slate-600', bg: 'bg-slate-100', label: 'Platinum' },
  AMBASSADOR: { icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Ambassador' },
};

const statusConfig = {
  PENDING: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
  UNDER_REVIEW: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Under Review' },
  APPROVED: { color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
  REJECTED: { color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  MORE_INFO_NEEDED: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'More Info Needed' },
};

export default function StorytellersAdminPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'verified'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [storytellers, setStorytellers] = useState<VerifiedStoryteller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch applications and storytellers on mount
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch applications
      const appsResponse = await fetch('/api/admin/storytellers/applications');
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }

      // Fetch verified storytellers
      const storytellersResponse = await fetch('/api/admin/storytellers');
      if (storytellersResponse.ok) {
        const storytellersData = await storytellersResponse.json();
        setStorytellers(storytellersData.storytellers || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStorytellers = storytellers.filter((st) =>
    st.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (st.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (app: Application) => {
    setActionLoading(app.id);
    try {
      const response = await fetch(`/api/admin/storytellers/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          reviewNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve application');
      }

      // Update local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, status: 'APPROVED' as ApplicationStatus, reviewedAt: new Date().toISOString(), reviewNotes }
            : a
        )
      );
      
      // Refresh data to get the new storyteller
      await fetchData();
      
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to approve application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (app: Application) => {
    if (!reviewNotes.trim()) {
      alert('Please provide rejection notes');
      return;
    }
    setActionLoading(app.id);
    try {
      const response = await fetch(`/api/admin/storytellers/applications/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          reviewNotes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject application');
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, status: 'REJECTED' as ApplicationStatus, reviewedAt: new Date().toISOString(), reviewNotes }
            : a
        )
      );
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject application');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateBadge = async (storytellerId: string, newBadge: StorytellerBadge) => {
    setActionLoading(storytellerId);
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeLevel: newBadge }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update badge');
      }

      setStorytellers((prev) =>
        prev.map((st) => (st.id === storytellerId ? { ...st, badgeLevel: newBadge } : st))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update badge');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (storytellerId: string) => {
    if (!confirm('Are you sure you want to suspend this storyteller?')) return;
    
    setActionLoading(storytellerId);
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUSPENDED' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to suspend storyteller');
      }

      setStorytellers((prev) =>
        prev.map((st) => (st.id === storytellerId ? { ...st, status: 'SUSPENDED' as StorytellerStatus } : st))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to suspend storyteller');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevoke = async (storytellerId: string) => {
    if (!confirm('Are you sure you want to revoke verification? This action cannot be undone.')) return;
    
    setActionLoading(storytellerId);
    try {
      const response = await fetch(`/api/admin/storytellers/${storytellerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVOKED' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke verification');
      }

      setStorytellers((prev) =>
        prev.map((st) => (st.id === storytellerId ? { ...st, status: 'REVOKED' as StorytellerStatus } : st))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to revoke verification');
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            Verified Storytellers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage storyteller applications and verified members
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'applications'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Applications ({applications.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'verified'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Verified ({storytellers.filter((s) => s.status === 'VERIFIED' || s.status === 'FEATURED').length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        {activeTab === 'applications' && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Pending Applications</div>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {applications.filter((a) => a.status === 'PENDING').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Storytellers</div>
          <div className="text-2xl font-bold text-green-500 mt-1">
            {storytellers.filter((s) => s.status === 'VERIFIED' || s.status === 'FEATURED').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Articles</div>
          <div className="text-2xl font-bold text-blue-500 mt-1">
            {storytellers.reduce((sum, s) => sum + s.articlesCount, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">Ambassadors</div>
          <div className="text-2xl font-bold text-emerald-500 mt-1">
            {storytellers.filter((s) => s.badgeLevel === 'AMBASSADOR').length}
          </div>
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Applicant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Expertise
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Regions
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Applied
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.map((app) => {
                  const status = statusConfig[app.status];
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-amber-700">
                              {app.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{app.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {app.expertise.slice(0, 2).map((exp) => (
                            <span
                              key={exp}
                              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {exp}
                            </span>
                          ))}
                          {app.expertise.length > 2 && (
                            <span className="text-xs text-gray-500">+{app.expertise.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {app.languages.slice(0, 2).map((lang) => (
                            <span
                              key={lang}
                              className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedApplication(app);
                                  handleApprove(app);
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedApplication(app)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verified Storytellers Tab */}
      {activeTab === 'verified' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Storyteller
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Badge
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Impact Articles
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total Views
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Community Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStorytellers.map((st) => {
                  const badge = badgeConfig[st.badgeLevel];
                  const Icon = badge.icon;
                  return (
                    <tr key={st.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {st.user?.image ? (
                            <Image
                              src={st.user.image}
                              alt={st.displayName}
                              width={36}
                              height={36}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-amber-700">
                                {st.displayName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{st.displayName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Verified {st.verifiedAt ? new Date(st.verifiedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={st.badgeLevel}
                          onChange={(e) => handleUpdateBadge(st.id, e.target.value as StorytellerBadge)}
                          disabled={actionLoading === st.id}
                          className={`px-2 py-1 text-sm rounded-full border-0 ${badge.bg} ${badge.color} font-medium cursor-pointer disabled:opacity-50`}
                        >
                          <option value="BRONZE">🛡️ Bronze</option>
                          <option value="SILVER">⭐ Silver</option>
                          <option value="GOLD">🏆 Gold</option>
                          <option value="PLATINUM">👑 Platinum</option>
                          <option value="AMBASSADOR">🌍 Ambassador</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-900 dark:text-white">{st.articlesCount}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-900 dark:text-white">
                          {st.verifiedImpacts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                st.trustScore >= 80
                                  ? 'bg-green-500'
                                  : st.trustScore >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${st.trustScore}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{st.trustScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            st.status === 'VERIFIED' || st.status === 'FEATURED'
                              ? 'bg-green-100 text-green-600'
                              : st.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`/author/${st.userId}`, '_blank')}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="View Profile"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          {(st.status === 'VERIFIED' || st.status === 'FEATURED') && (
                            <button
                              onClick={() => handleSuspend(st.id)}
                              disabled={actionLoading === st.id}
                              className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded disabled:opacity-50"
                              title="Suspend"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {st.status === 'SUSPENDED' && (
                            <button
                              onClick={async () => {
                                setActionLoading(st.id);
                                try {
                                  const response = await fetch(`/api/admin/storytellers/${st.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'VERIFIED' }),
                                  });
                                  if (response.ok) {
                                    setStorytellers((prev) => prev.map((s) => s.id === st.id ? { ...s, status: 'VERIFIED' as StorytellerStatus } : s));
                                  }
                                } finally {
                                  setActionLoading(null);
                                }
                              }}
                              disabled={actionLoading === st.id}
                              className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-50"
                              title="Reactivate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRevoke(st.id)}
                            disabled={actionLoading === st.id}
                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50"
                            title="Revoke Verification"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Application Details</h2>
              <button
                onClick={() => {
                  setSelectedApplication(null);
                  setReviewNotes('');
                }}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-700">
                    {selectedApplication.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedApplication.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedApplication.email}</p>
                  {selectedApplication.country && (
                    <p className="text-sm text-gray-500">{selectedApplication.city ? `${selectedApplication.city}, ` : ''}{selectedApplication.country}</p>
                  )}
                </div>
              </div>

              {/* Portfolio Links */}
              {selectedApplication.portfolioLinks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Portfolio Links
                  </label>
                  <div className="space-y-1">
                    {selectedApplication.portfolioLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                      >
                        {link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Areas of Expertise
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.expertise.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {selectedApplication.bio}
                </p>
              </div>

              {/* Why Join */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Why They Want to Join
                </label>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  {selectedApplication.whyJoin}
                </p>
              </div>

              {/* Sample Work */}
              {selectedApplication.sampleWork && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sample Work
                  </label>
                  <a
                    href={selectedApplication.sampleWork}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {selectedApplication.sampleWork}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Social Links */}
              {(selectedApplication.twitter || selectedApplication.linkedIn) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Social Links
                  </label>
                  <div className="flex gap-4">
                    {selectedApplication.twitter && (
                      <a href={selectedApplication.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                        Twitter/X
                      </a>
                    )}
                    {selectedApplication.linkedIn && (
                      <a href={selectedApplication.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about your decision (required for rejection)..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedApplication)}
                  disabled={actionLoading === selectedApplication.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedApplication.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication)}
                  disabled={actionLoading === selectedApplication.id}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedApplication.id && <Loader2 className="w-4 h-4 animate-spin" />}
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
