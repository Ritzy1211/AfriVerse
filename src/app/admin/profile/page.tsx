'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Check,
  Loader2,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  AlertCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    twitter: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    avatar: '',
    role: 'AUTHOR',
    jobTitle: '',
    company: '',
  });

  // Load user data from API
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/admin/users/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setProfile(prev => ({
              ...prev,
              name: data.user.name || '',
              email: data.user.email || '',
              role: data.user.role || 'AUTHOR',
              avatar: data.user.image || '',
              bio: data.user.bio || '',
              phone: data.user.phone || '',
              location: data.user.location || '',
              website: data.user.website || '',
              jobTitle: data.user.jobTitle || '',
              company: data.user.company || '',
              twitter: data.user.twitter || '',
              facebook: data.user.facebook || '',
              instagram: data.user.instagram || '',
              linkedin: data.user.linkedin || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
    
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profile.name,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, use a placeholder - in production, upload to cloud storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      AUTHOR: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[role] || colors.AUTHOR;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your personal information and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2 font-semibold rounded-lg transition-colors ${
            saved
              ? 'bg-green-500 text-white'
              : loading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-secondary text-primary hover:bg-secondary/90'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary via-primary to-gray-800 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
        </div>

        {/* Avatar Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={profile.avatar} 
                    alt={profile.name || 'User avatar'} 
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <span className="text-primary font-bold text-2xl">
                    {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.name || 'Your Name'}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <User className="w-5 h-5 text-secondary" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full pl-11 pr-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="john@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed for security reasons. Contact support if you need to update it.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="+234 800 000 0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="Lagos, Nigeria"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Senior Editor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company / Organization
            </label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="AfriVerse"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              placeholder="Tell us a little about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed on your author profile.
            </p>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Globe className="w-5 h-5 text-secondary" />
          Social Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Twitter / X
            </label>
            <div className="relative">
              <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profile.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="@username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facebook
            </label>
            <div className="relative">
              <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profile.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="facebook.com/username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram
            </label>
            <div className="relative">
              <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profile.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="@username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={profile.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className="w-full pl-11 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Info (Read-only) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <User className="w-5 h-5 text-secondary" />
          Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Role
            </label>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
              <span className={`text-sm px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(profile.role)}`}>
                {profile.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Contact a Super Admin to change your role.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Member Since
            </label>
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
              January 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
