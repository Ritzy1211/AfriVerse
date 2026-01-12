'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PenLine,
  FileText,
  Send,
  MessageSquare,
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
  Home,
} from 'lucide-react';

// Restricted navigation - ONLY writing-related items
const navigation = [
  { name: 'Dashboard', href: '/writer', icon: Home },
  { name: 'Create Draft', href: '/writer/compose', icon: PenLine },
  { name: 'My Articles', href: '/writer/articles', icon: FileText },
  { name: 'Submitted', href: '/writer/submitted', icon: Send },
  { name: 'Editorial Notes', href: '/writer/notes', icon: MessageSquare },
];

// Role display names
const roleLabels: Record<string, string> = {
  CONTRIBUTOR: 'Contributor',
  AUTHOR: 'Staff Writer',
  SENIOR_WRITER: 'Senior Writer',
  EDITOR: 'Editor',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Managing Editor',
};

// Roles that should use the writer portal (restricted access)
const WRITER_ROLES = ['CONTRIBUTOR', 'AUTHOR', 'SENIOR_WRITER'];

export default function WriterLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/writer') return pathname === '/writer';
    return pathname.startsWith(href);
  };

  const isLoginPage = pathname === '/writer/login';

  // Redirect editors/admins to admin panel - they shouldn't be here
  useEffect(() => {
    if (session?.user?.role && !WRITER_ROLES.includes(session.user.role)) {
      router.push('/admin');
    }
  }, [session, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // For login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading newsroom...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/writer/login');
    return null;
  }

  const user = session?.user;
  const userRole = user?.role || 'CONTRIBUTOR';
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'W';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">AFRIVERSE</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Newsroom</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-800 rounded text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
              {user?.image ? (
                <img src={user.image} alt={user.name || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-primary font-bold text-sm">{userInitials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-secondary">{roleLabels[userRole]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href) 
                  ? 'bg-secondary text-primary' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Need help?</p>
            <Link href="/writer/guidelines" className="text-sm text-secondary hover:underline">
              Writer Guidelines →
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Newsroom</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-700 font-medium">
                {navigation.find(n => isActive(n.href))?.name || 'Dashboard'}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick compose button */}
            <Link
              href="/writer/compose"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <PenLine className="w-4 h-4" />
              New Draft
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
