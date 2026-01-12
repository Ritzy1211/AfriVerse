'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Shield,
  Lock,
  Key,
  UserX,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Bot,
} from 'lucide-react';

interface LoginAttempt {
  id: string;
  ip: string;
  email: string;
  status: 'success' | 'failed';
  date: string;
  location: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  date: string;
  failedAttempts: number;
}

const defaultSettings = {
  twoFactorEnabled: false,
  loginNotifications: true,
  ipWhitelisting: false,
  maxLoginAttempts: '5',
  lockoutDuration: '30',
  sessionTimeout: '60',
  forceSSL: true,
  hideWPVersion: true,
  disableXMLRPC: true,
  enableCaptcha: false,
  captchaType: 'recaptcha',
  recaptchaSiteKey: '',
  recaptchaSecretKey: '',
};

export default function SecuritySettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [settings, setSettings] = useState(defaultSettings);
  
  // Login attempts state
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);
  
  // Blocked IPs state  
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch login attempts
  const fetchLoginAttempts = useCallback(async () => {
    setLoadingAttempts(true);
    try {
      const response = await fetch('/api/admin/security/login-attempts?limit=10');
      if (response.ok) {
        const data = await response.json();
        setLoginAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error('Error fetching login attempts:', error);
    } finally {
      setLoadingAttempts(false);
    }
  }, []);

  // Fetch blocked IPs
  const fetchBlockedIPs = useCallback(async () => {
    setLoadingBlocked(true);
    try {
      const response = await fetch('/api/admin/security/blocked-ips');
      if (response.ok) {
        const data = await response.json();
        setBlockedIPs(data.blockedIPs || []);
      }
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLoginAttempts();
    fetchBlockedIPs();
  }, [fetchLoginAttempts, fetchBlockedIPs]);

  async function fetchSettings() {
    try {
      const response = await fetch('/api/admin/settings?category=security');
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

  const handlePasswordChange = (key: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [key]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'security', settings }),
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

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    if (!confirm(`Are you sure you want to unblock IP ${ip}?`)) return;
    
    try {
      const response = await fetch('/api/admin/security/blocked-ips', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      
      if (response.ok) {
        setBlockedIPs(prev => prev.filter(b => b.ip !== ip));
        fetchLoginAttempts(); // Refresh login attempts
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to unblock IP');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      alert('Failed to unblock IP');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
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
            Security Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Protect your site and manage access controls
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

      {/* Security Status */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Security Status: Good</h2>
            <p className="text-white/80">Your site is protected with recommended security settings</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">SSL</p>
            <p className="text-sm text-white/80">Enabled</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{blockedIPs.length}</p>
            <p className="text-sm text-white/80">Blocked IPs</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">5</p>
            <p className="text-sm text-white/80">Max Login Attempts</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">2FA</p>
            <p className="text-sm text-white/80">{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Key className="w-5 h-5 text-secondary" />
          Change Password
        </h2>
        
        {/* Password Error */}
        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {passwordError}
          </div>
        )}
        
        {/* Password Success */}
        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {passwordSuccess}
          </div>
        )}
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Lock className="w-5 h-5 text-secondary" />
          Two-Factor Authentication
        </h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Two-Factor Authentication (2FA)
            </p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={() => handleChange('twoFactorEnabled', !settings.twoFactorEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.twoFactorEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-secondary text-primary hover:bg-secondary/90'
            }`}
          >
            {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Login Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-6">
          <Shield className="w-5 h-5 text-secondary" />
          Login Security
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Login Attempts
              </label>
              <select
                value={settings.maxLoginAttempts}
                onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="3">3 attempts</option>
                <option value="5">5 attempts</option>
                <option value="10">10 attempts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lockout Duration
              </label>
              <select
                value={settings.lockoutDuration}
                onChange={(e) => handleChange('lockoutDuration', e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="1440">24 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="480">8 hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Login Notifications
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Get notified via email when someone logs into your account from a new device or location</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.loginNotifications}
                  onChange={(e) => handleChange('loginNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable CAPTCHA Protection
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Add Google reCAPTCHA to login forms to prevent automated bot attacks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableCaptcha}
                  onChange={(e) => handleChange('enableCaptcha', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-secondary"></div>
              </label>
            </div>
            
            {settings.enableCaptcha && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> CAPTCHA requires Google reCAPTCHA keys. Add these to your environment variables:
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 mt-2 list-disc list-inside space-y-1">
                  <li>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</li>
                  <li>RECAPTCHA_SECRET_KEY</li>
                </ul>
                <a 
                  href="https://www.google.com/recaptcha/admin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Get reCAPTCHA keys from Google →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blocked IPs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <UserX className="w-5 h-5 text-secondary" />
            Blocked IP Addresses
          </h2>
          <button 
            onClick={fetchBlockedIPs}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBlocked ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {loadingBlocked ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : blockedIPs.length > 0 ? (
          <div className="space-y-3">
            {blockedIPs.map((blocked) => (
              <div
                key={blocked.ip}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-lg"
              >
                <div>
                  <p className="font-mono text-gray-900 dark:text-white">{blocked.ip}</p>
                  <p className="text-sm text-gray-500">{blocked.reason} • Blocked on {blocked.date}</p>
                </div>
                <button
                  onClick={() => handleUnblockIP(blocked.ip)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
            <p className="text-gray-500">No blocked IP addresses</p>
            <p className="text-xs text-gray-400 mt-1">IPs are automatically blocked after {settings.maxLoginAttempts} failed attempts</p>
          </div>
        )}
      </div>

      {/* Recent Login Attempts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <AlertTriangle className="w-5 h-5 text-secondary" />
            Recent Login Attempts
          </h2>
          <button 
            onClick={fetchLoginAttempts}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAttempts ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {loadingAttempts ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : loginAttempts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loginAttempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-mono text-sm">{attempt.ip}</td>
                  <td className="px-4 py-3 text-sm">{attempt.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      attempt.status === 'success'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{attempt.location}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(attempt.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No login attempts recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Login attempts will appear here after users try to sign in</p>
          </div>
        )}
      </div>

      {/* Advanced Security */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Advanced Security
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Force SSL/HTTPS
              </span>
              <p className="text-xs text-gray-500">Redirect all traffic to HTTPS</p>
            </div>
            <input
              type="checkbox"
              checked={settings.forceSSL}
              onChange={(e) => handleChange('forceSSL', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hide CMS Version
              </span>
              <p className="text-xs text-gray-500">Remove version info from page source</p>
            </div>
            <input
              type="checkbox"
              checked={settings.hideWPVersion}
              onChange={(e) => handleChange('hideWPVersion', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
          
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Disable XML-RPC
              </span>
              <p className="text-xs text-gray-500">Disable remote publishing protocol</p>
            </div>
            <input
              type="checkbox"
              checked={settings.disableXMLRPC}
              onChange={(e) => handleChange('disableXMLRPC', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
