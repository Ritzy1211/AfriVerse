'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  Megaphone,
  Palette,
  Shield,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  User,
  ExternalLink,
  Flame,
  ClipboardCheck,
  PenTool,
  Activity,
  BadgeCheck,
  Sparkles,
  Clock,
} from 'lucide-react';

// Define role hierarchy (higher number = more permissions)
const ROLE_LEVEL: Record<string, number> = {
  CONTRIBUTOR: 1,
  AUTHOR: 2,      // Staff Writer
  SENIOR_WRITER: 3,
  EDITOR: 4,
  ADMIN: 5,
  SUPER_ADMIN: 6,
};

// Navigation items with role requirements
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, minRole: 'CONTRIBUTOR' },
  { name: 'My Posts', href: '/admin/posts', icon: PenTool, minRole: 'CONTRIBUTOR', maxRole: 'SENIOR_WRITER' },
  { name: 'Editorial Desk', href: '/admin/desk', icon: ClipboardCheck, minRole: 'EDITOR' },
  { name: 'Review Queue', href: '/admin/review', icon: ClipboardCheck, minRole: 'EDITOR' },
  { name: 'All Posts', href: '/admin/posts', icon: FileText, minRole: 'EDITOR' },
  { name: 'Scheduled', href: '/admin/scheduled', icon: Clock, minRole: 'EDITOR' },
  { 
    name: 'Editorial', 
    icon: ClipboardCheck,
    minRole: 'EDITOR',
    children: [
      { name: 'Review Queue', href: '/admin/review' },
      { name: 'Activity Log', href: '/admin/activity' },
      { name: 'Roles & Permissions', href: '/admin/editorial/roles', minRole: 'ADMIN' },
    ]
  },
  { name: 'Categories & Tags', href: '/admin/categories', icon: FolderOpen, minRole: 'EDITOR' },
  { name: 'Media Library', href: '/admin/media', icon: Image, minRole: 'AUTHOR' },
  { name: 'Trending Topics', href: '/admin/trending', icon: Flame, minRole: 'EDITOR' },
  { name: 'AfriPulse Index', href: '/admin/afripulse', icon: Activity, minRole: 'EDITOR' },
  { name: 'Storytellers', href: '/admin/storytellers', icon: BadgeCheck, minRole: 'ADMIN' },
  { name: 'Users & Authors', href: '/admin/users', icon: Users, minRole: 'ADMIN' },
  { name: 'Comments', href: '/admin/comments', icon: MessageSquare, minRole: 'EDITOR' },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity, minRole: 'ADMIN' },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, minRole: 'ADMIN' },
  { name: 'Ad Placements', href: '/admin/ads', icon: Megaphone, minRole: 'ADMIN' },
  { 
    name: 'Settings', 
    icon: Settings,
    minRole: 'ADMIN',
    children: [
      { name: 'General', href: '/admin/settings' },
      { name: 'Appearance', href: '/admin/settings/appearance', icon: Palette },
      { name: 'Monetization', href: '/admin/settings/monetization', icon: Megaphone, minRole: 'SUPER_ADMIN' },
      { name: 'Security', href: '/admin/settings/security', icon: Shield, minRole: 'SUPER_ADMIN' },
    ]
  },
];

// Check if user has permission for a menu item
const hasPermission = (userRole: string, minRole: string, maxRole?: string): boolean => {
  const userLevel = ROLE_LEVEL[userRole] || 0;
  const minLevel = ROLE_LEVEL[minRole] || 0;
  const maxLevel = maxRole ? ROLE_LEVEL[maxRole] : Infinity;
  return userLevel >= minLevel && userLevel <= maxLevel;
};

// Filter navigation based on user role
const getFilteredNavigation = (userRole: string) => {
  return navigation
    .filter(item => hasPermission(userRole, item.minRole, item.maxRole))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => 
            hasPermission(userRole, child.minRole || item.minRole)
          )
        };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);
};

// Role badge colors
const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  EDITOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SENIOR_WRITER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  AUTHOR: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  CONTRIBUTOR: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

// Role display names
const roleDisplayNames: Record<string, string> = {
  SUPER_ADMIN: 'Editor-in-Chief',
  ADMIN: 'Managing Editor',
  EDITOR: 'Section Editor',
  SENIOR_WRITER: 'Senior Writer',
  AUTHOR: 'Staff Writer',
  CONTRIBUTOR: 'Contributor',
};

// Route permissions - define minimum role required for each route
const ROUTE_PERMISSIONS: Record<string, string> = {
  '/admin': 'CONTRIBUTOR',
  '/admin/posts': 'CONTRIBUTOR',
  '/admin/posts/new': 'CONTRIBUTOR',
  '/admin/media': 'AUTHOR',
  '/admin/profile': 'CONTRIBUTOR',
  '/admin/desk': 'EDITOR',
  '/admin/editorial': 'EDITOR',
  '/admin/editorial/roles': 'ADMIN',
  '/admin/categories': 'EDITOR',
  '/admin/trending': 'EDITOR',
  '/admin/comments': 'EDITOR',
  '/admin/users': 'ADMIN',
  '/admin/analytics': 'ADMIN',
  '/admin/settings': 'ADMIN',
  '/admin/settings/appearance': 'ADMIN',
  '/admin/settings/monetization': 'SUPER_ADMIN',
  '/admin/settings/security': 'SUPER_ADMIN',
};

// Check if user can access a specific route
const canAccessRoute = (userRole: string, pathname: string): boolean => {
  // Find the matching route permission
  const exactMatch = ROUTE_PERMISSIONS[pathname];
  if (exactMatch) {
    return hasPermission(userRole, exactMatch);
  }
  
  // Check for partial matches (e.g., /admin/posts/[id]/edit)
  const routeKeys = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  for (const route of routeKeys) {
    if (pathname.startsWith(route)) {
      return hasPermission(userRole, ROUTE_PERMISSIONS[route]);
    }
  }
  
  // Default: allow access (for routes not explicitly defined)
  return true;
};

// Notification type
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch('/api/admin/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || []);
        setUnreadCount(data.data?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true })
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session, fetchNotifications]);

  const isActive = (href: string) => pathname === href;
  const isLoginPage = pathname === '/admin/login';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  // For login page, render without the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  // CRITICAL: Redirect to login if not authenticated
  if (status === 'unauthenticated' || !session) {
    // Use useEffect to handle redirect on client side
    if (typeof window !== 'undefined') {
      window.location.href = `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`;
    }
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const user = session?.user;
  const userRole = user?.role || 'AUTHOR';
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase() || 'U';
  
  // Get navigation items filtered by user role
  const filteredNavigation = getFilteredNavigation(userRole);

  // Check route access
  const hasAccess = canAccessRoute(userRole, pathname);

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Your role as{' '}
            <span className="font-medium">{roleDisplayNames[userRole] || userRole}</span>{' '}
            doesn't include this feature.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin"
              className="px-6 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-secondary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } shadow-xl`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700 bg-slate-900">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <img
                src="/assets/logos/Afriverse-logo.png"
                alt="AfriVerse Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-white">AfriVerse</span>
              <span className="block text-[10px] text-slate-400">Admin Panel</span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-slate-600">
              {user?.image ? (
                <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">{userInitials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className={`text-[10px] px-1.5 py-0.5 rounded inline-block ${roleBadgeColors[userRole]} bg-opacity-90`}>
                {roleDisplayNames[userRole] || userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-13rem)] scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {filteredNavigation.map((item) => {
            const isSubmenuActive = item.children?.some(child => pathname.startsWith(child.href));
            const isMenuOpen = openMenus[item.name] || isSubmenuActive;
            
            return item.children ? (
              <div key={item.name}>
                <button
                  onClick={() => setOpenMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSubmenuActive 
                      ? 'bg-amber-500 text-white shadow-md' 
                      : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="ml-4 mt-1 space-y-1 pl-4 border-l-2 border-slate-600">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive(child.href) || pathname.startsWith(child.href + '/') 
                            ? 'bg-amber-500 text-white font-medium' 
                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href!) 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700 bg-slate-900">
          <Link 
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200"
          >
            <ExternalLink className="w-5 h-5" />
            <span>View Live Site</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  if (!notificationsOpen) fetchNotifications();
                }}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-[10px] font-bold text-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-secondary hover:text-secondary/80 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="p-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary mx-auto"></div>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-secondary/5 dark:bg-secondary/10' : ''
                            }`}
                            onClick={() => {
                              if (!notification.read) markAsRead(notification.id);
                              if (notification.link) {
                                window.location.href = notification.link;
                                setNotificationsOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.read ? 'bg-secondary' : 'bg-gray-300 dark:bg-gray-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href="/admin/desk"
                          className="block text-center text-sm text-secondary hover:text-secondary/80 font-medium py-1"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5 sm:p-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-xs">{userInitials}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className={`text-[10px] px-1.5 py-0.5 rounded inline-block mt-0.5 ${roleBadgeColors[userRole]}`}>
                    {roleDisplayNames[userRole] || userRole.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/admin/settings/security"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        Security
                      </Link>
                    </div>
                    <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 lg:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>© {new Date().getFullYear()} AfriVerse. All rights reserved.</span>
            <span>Admin Panel v1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
