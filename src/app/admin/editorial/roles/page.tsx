'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Settings,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Loader2,
  RefreshCw,
  Crown,
  Star,
  Pen,
  UserCheck,
  UserPlus,
  ChevronDown,
  Save,
  AlertCircle,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface Assignment {
  id: string;
  userId: string;
  category: string;
  canApprove: boolean;
  canPublish: boolean;
  user?: User;
}

interface PublishingRule {
  id?: string;
  category: string;
  requiresReview: boolean;
  minWordCount: number;
  maxWordCount?: number;
  requiresFeaturedImage: boolean;
  requiresExcerpt: boolean;
  requiresMetaDescription: boolean;
  requiredTags: number;
  autoPublishTrusted: boolean;
  notifyOnSubmission: string[];
}

const roleConfig = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full access - final approval authority',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Site management, can approve content',
    icon: Shield,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  EDITOR: {
    label: 'Editor',
    description: 'Can review and request changes',
    icon: Edit,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  SENIOR_WRITER: {
    label: 'Senior Writer',
    description: 'Can publish without review (trusted)',
    icon: Star,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  AUTHOR: {
    label: 'Author',
    description: 'Contributor - requires approval',
    icon: Pen,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  },
  CONTRIBUTOR: {
    label: 'Contributor',
    description: 'Guest contributor - strict review',
    icon: UserPlus,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
};

const categories = ['Business', 'Entertainment', 'Lifestyle', 'Sports', 'Technology', 'Politics'];

export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'rules'>('assignments');
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [rules, setRules] = useState<PublishingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Assignment form
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [canApprove, setCanApprove] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  
  // Rules form
  const [editingRule, setEditingRule] = useState<PublishingRule | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch assignments
      const assignmentsRes = await fetch('/api/admin/editorial/assignments');
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData.assignments || []);
      }

      // Fetch rules
      const rulesRes = await fetch('/api/admin/editorial/rules');
      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData.rules || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveAssignment = async () => {
    if (!selectedUser || !selectedCategory) {
      setError('Please select a user and category');
      return;
    }

    try {
      const response = await fetch('/api/admin/editorial/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          category: selectedCategory.toLowerCase(),
          canApprove,
          canPublish,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Assignment saved successfully');
      setShowAssignmentForm(false);
      setSelectedUser('');
      setSelectedCategory('');
      setCanApprove(false);
      setCanPublish(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      const response = await fetch(`/api/admin/editorial/assignments?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess('Assignment removed');
      await fetchData();
    } catch (err) {
      setError('Failed to remove assignment');
    }
  };

  const handleSaveRule = async () => {
    if (!editingRule?.category) {
      setError('Please select a category');
      return;
    }

    try {
      const response = await fetch('/api/admin/editorial/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRule),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSuccess('Publishing rule saved successfully');
      setShowRuleForm(false);
      setEditingRule(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteRule = async (category: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/admin/editorial/rules?category=${category}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess('Rule deleted');
      await fetchData();
    } catch (err) {
      setError('Failed to delete rule');
    }
  };

  const editors = users.filter(u => ['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(u.role));

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            Roles & Permissions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage editorial assignments and publishing rules
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Role Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Role Hierarchy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div
                key={key}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {config.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {config.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assignments'
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Editorial Assignments
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rules'
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Publishing Rules
            </button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : activeTab === 'assignments' ? (
            <div className="space-y-6">
              {/* Add Assignment Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAssignmentForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Assignment
                </button>
              </div>

              {/* Assignment Form Modal */}
              {showAssignmentForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Add Editorial Assignment
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Editor
                        </label>
                        <select
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="">Select an editor...</option>
                          {editors.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        >
                          <option value="">Select a category...</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={canApprove}
                            onChange={(e) => setCanApprove(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Can approve content
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={canPublish}
                            onChange={(e) => setCanPublish(e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Can publish directly
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowAssignmentForm(false)}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAssignment}
                        className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                      >
                        Save Assignment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignments Table */}
              {assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Editor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Can Approve
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Can Publish
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {assignment.user?.image ? (
                                <img
                                  src={assignment.user.image}
                                  alt=""
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {assignment.user?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignment.user?.role}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="capitalize text-sm text-gray-900 dark:text-white">
                              {assignment.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {assignment.canApprove ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {assignment.canPublish ? (
                              <Check className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No assignments yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Click &quot;Add Assignment&quot; to assign editors to categories
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add Rule Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingRule({
                      category: '',
                      requiresReview: true,
                      minWordCount: 300,
                      requiresFeaturedImage: true,
                      requiresExcerpt: true,
                      requiresMetaDescription: true,
                      requiredTags: 2,
                      autoPublishTrusted: false,
                      notifyOnSubmission: [],
                    });
                    setShowRuleForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
              </div>

              {/* Rule Form Modal */}
              {showRuleForm && editingRule && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {editingRule.id ? 'Edit' : 'Add'} Publishing Rule
                    </h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          value={editingRule.category}
                          onChange={(e) => setEditingRule({ ...editingRule, category: e.target.value.toLowerCase() })}
                          disabled={!!editingRule.id}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
                        >
                          <option value="">Select a category...</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Min Word Count
                          </label>
                          <input
                            type="number"
                            value={editingRule.minWordCount}
                            onChange={(e) => setEditingRule({ ...editingRule, minWordCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Max Word Count
                          </label>
                          <input
                            type="number"
                            value={editingRule.maxWordCount || ''}
                            onChange={(e) => setEditingRule({ ...editingRule, maxWordCount: parseInt(e.target.value) || undefined })}
                            placeholder="No limit"
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Minimum Tags Required
                        </label>
                        <input
                          type="number"
                          value={editingRule.requiredTags}
                          onChange={(e) => setEditingRule({ ...editingRule, requiredTags: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.requiresReview}
                            onChange={(e) => setEditingRule({ ...editingRule, requiresReview: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Requires editorial review
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.requiresFeaturedImage}
                            onChange={(e) => setEditingRule({ ...editingRule, requiresFeaturedImage: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Requires featured image
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.requiresExcerpt}
                            onChange={(e) => setEditingRule({ ...editingRule, requiresExcerpt: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Requires excerpt
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.requiresMetaDescription}
                            onChange={(e) => setEditingRule({ ...editingRule, requiresMetaDescription: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Requires meta description
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRule.autoPublishTrusted}
                            onChange={(e) => setEditingRule({ ...editingRule, autoPublishTrusted: e.target.checked })}
                            className="rounded border-gray-300 dark:border-gray-600 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Auto-publish for Senior Writers
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowRuleForm(false);
                          setEditingRule(null);
                        }}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRule}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/90 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save Rule
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rules List */}
              {rules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rules.map((rule) => (
                    <div
                      key={rule.category}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                          {rule.category}
                        </h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingRule(rule);
                              setShowRuleForm(true);
                            }}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.category)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Word Count</span>
                          <span className="text-gray-900 dark:text-white">
                            {rule.minWordCount}{rule.maxWordCount ? ` - ${rule.maxWordCount}` : '+'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Min Tags</span>
                          <span className="text-gray-900 dark:text-white">{rule.requiredTags}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {rule.requiresReview && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                              Review Required
                            </span>
                          )}
                          {rule.requiresFeaturedImage && (
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                              Image Required
                            </span>
                          )}
                          {rule.autoPublishTrusted && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Auto-Publish Trusted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No publishing rules defined</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Click &quot;Add Rule&quot; to set up category-specific rules
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
