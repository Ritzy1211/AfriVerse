'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Key,
  Loader2,
  X,
  Crown,
  Users,
  PenTool,
  Eye,
  FileEdit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// Billboard-style role hierarchy
const ROLE_HIERARCHY = {
  SUPER_ADMIN: {
    label: 'Editor-in-Chief',
    level: 6,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: Crown,
    description: 'Full access - final approval authority on all content',
  },
  ADMIN: {
    label: 'Managing Editor',
    level: 5,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    icon: Shield,
    description: 'Site management, can approve content, manages workflow',
  },
  EDITOR: {
    label: 'Section Editor',
    level: 4,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: FileEdit,
    description: 'Can review, edit, and approve content in their section',
  },
  SENIOR_WRITER: {
    label: 'Senior Writer',
    level: 3,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: PenTool,
    description: 'Trusted writer - can publish breaking news without review',
  },
  AUTHOR: {
    label: 'Staff Writer',
    level: 2,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Users,
    description: 'Regular contributor - all content requires approval',
  },
  CONTRIBUTOR: {
    label: 'Contributor',
    level: 1,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    icon: Eye,
    description: 'Guest contributor - requires strict review process',
  },
};

// Permissions by role
const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    'Manage all site settings',
    'Manage all users & roles',
    'Final approval on all content',
    'Publish any content immediately',
    'Delete any content',
    'Access all analytics',
    'Manage billing & subscriptions',
    'Override any decision',
  ],
  ADMIN: [
    'Manage editorial calendar',
    'Approve/reject content',
    'Assign stories to editors',
    'Manage authors & contributors',
    'Publish approved content',
    'Edit any content',
    'View all analytics',
    'Escalate to Editor-in-Chief',
  ],
  EDITOR: [
    'Review submitted content',
    'Request changes on content',
    'Approve routine content',
    'Edit content in section',
    'Assign stories to writers',
    'Publish in assigned section',
    'Escalate sensitive topics',
  ],
  SENIOR_WRITER: [
    'Write articles',
    'Publish breaking news (notify editor)',
    'Self-edit routine content',
    'Mentor junior writers',
    'Access own analytics',
  ],
  AUTHOR: [
    'Write articles',
    'Submit for review',
    'Edit own drafts',
    'Respond to revision requests',
    'View own analytics',
  ],
  CONTRIBUTOR: [
    'Pitch story ideas',
    'Write assigned articles',
    'Submit for strict review',
    'Edit own drafts before submission',
  ],
};

interface User {
  id: string;
  name: string | null;
  email: string;
  role: keyof typeof ROLE_HIERARCHY;
  image: string | null;
  bio: string | null;
  createdAt: string;
  _count?: {
    posts: number;
  };
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingRole, setViewingRole] = useState<keyof typeof ROLE_HIERARCHY | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<keyof typeof ROLE_HIERARCHY>('AUTHOR');
  const [formBio, setFormBio] = useState('');

  const currentUserRole = session?.user?.role as keyof typeof ROLE_HIERARCHY;
  const canManageUsers = ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole);
  const canChangeRoles = ['SUPER_ADMIN', 'ADMIN'].includes(currentUserRole);
  const canDeleteUsers = currentUserRole === 'SUPER_ADMIN';

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!formName || !formEmail || !formPassword) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          bio: formBio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccessMessage(`User "${formName}" created successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !formName || !formEmail) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updateData: any = {
        id: editingUser.id,
        name: formName,
        email: formEmail,
        bio: formBio,
      };

      // Only include role if current user can change roles
      if (canChangeRoles) {
        updateData.role = formRole;
      }

      // Only include password if it was changed
      if (formPassword) {
        updateData.password = formPassword;
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      setSuccessMessage(`User "${formName}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.name || user.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccessMessage(`User deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormBio(user.bio || '');
    setFormPassword('');
    setError('');
    setShowEditModal(true);
  };

  const openPermissionsModal = (role: keyof typeof ROLE_HIERARCHY) => {
    setViewingRole(role);
    setShowPermissionsModal(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('AUTHOR');
    setFormBio('');
    setError('');
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const getRoleInfo = (role: keyof typeof ROLE_HIERARCHY) => {
    return ROLE_HIERARCHY[role] || ROLE_HIERARCHY.CONTRIBUTOR;
  };

  // Get roles that current user can assign
  const getAssignableRoles = () => {
    if (currentUserRole === 'SUPER_ADMIN') {
      return Object.keys(ROLE_HIERARCHY) as (keyof typeof ROLE_HIERARCHY)[];
    }
    if (currentUserRole === 'ADMIN') {
      // Admins can assign all roles except SUPER_ADMIN
      return (Object.keys(ROLE_HIERARCHY) as (keyof typeof ROLE_HIERARCHY)[])
        .filter(r => r !== 'SUPER_ADMIN');
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 dark:text-green-400">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Users & Authors
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage team members and their roles (Billboard-style hierarchy)
          </p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        )}
      </div>

      {/* Role Hierarchy Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Editorial Hierarchy
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.entries(ROLE_HIERARCHY) as [keyof typeof ROLE_HIERARCHY, typeof ROLE_HIERARCHY[keyof typeof ROLE_HIERARCHY]][]).map(([role, info]) => {
            const Icon = info.icon;
            const count = users.filter(u => u.role === role).length;
            return (
              <button
                key={role}
                onClick={() => openPermissionsModal(role)}
                className={`p-3 rounded-lg text-left transition-all hover:scale-105 ${info.color}`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <p className="font-medium text-sm">{info.label}</p>
                <p className="text-xs opacity-75">{count} user{count !== 1 ? 's' : ''}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-green-500">
            {users.filter(u => ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(u.role)).length}
          </p>
          <p className="text-sm text-gray-500">Editorial Staff</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-secondary">
            {users.filter(u => ['SENIOR_WRITER', 'AUTHOR'].includes(u.role)).length}
          </p>
          <p className="text-sm text-gray-500">Writers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-500">
            {users.filter(u => u.role === 'CONTRIBUTOR').length}
          </p>
          <p className="text-sm text-gray-500">Contributors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option value="All">All Roles</option>
            {Object.entries(ROLE_HIERARCHY).map(([role, info]) => (
              <option key={role} value={role}>{info.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                const isCurrentUser = session?.user?.email === user.email;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img 
                            src={user.image} 
                            alt={user.name || ''} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {getInitials(user.name, user.email)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.name || 'No name'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-secondary">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openPermissionsModal(user.role)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${roleInfo.color}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        {roleInfo.label}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {canManageUsers && (
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                        {canDeleteUsers && !isCurrentUser && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New User</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="john@afriverse.com"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as keyof typeof ROLE_HIERARCHY)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {getAssignableRoles().map(role => (
                    <option key={role} value={role}>
                      {ROLE_HIERARCHY[role].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {ROLE_HIERARCHY[formRole].description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Brief bio about the user..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                disabled={!formName || !formEmail || !formPassword || saving}
                className="px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h2>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                  {!canChangeRoles && (
                    <span className="ml-2 text-xs text-amber-500">(Only Editor-in-Chief can change roles)</span>
                  )}
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as keyof typeof ROLE_HIERARCHY)}
                  disabled={!canChangeRoles}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
                >
                  {getAssignableRoles().map(role => (
                    <option key={role} value={role}>
                      {ROLE_HIERARCHY[role].label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {ROLE_HIERARCHY[formRole].description}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Brief bio about the user..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null); resetForm(); }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                disabled={!formName || !formEmail || saving}
                className="px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && viewingRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {(() => {
                  const info = ROLE_HIERARCHY[viewingRole];
                  const Icon = info.icon;
                  return (
                    <>
                      <div className={`p-2 rounded-lg ${info.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {info.label}
                        </h2>
                        <p className="text-sm text-gray-500">{info.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Permissions & Capabilities
              </h3>
              <ul className="space-y-2">
                {ROLE_PERMISSIONS[viewingRole]?.map((permission, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Level {ROLE_HIERARCHY[viewingRole].level} in hierarchy
                </p>
                <button
                  onClick={() => { setShowPermissionsModal(false); setViewingRole(null); }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
