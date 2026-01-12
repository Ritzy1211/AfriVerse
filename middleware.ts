import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Role-based access control for enterprise CMS
// Writers use /writer portal, Editors/Admins use /admin

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for session token (check all possible cookie names)
  const sessionToken = req.cookies.get('authjs.session-token')?.value || 
                       req.cookies.get('next-auth.session-token')?.value ||
                       req.cookies.get('__Secure-authjs.session-token')?.value ||
                       req.cookies.get('__Secure-next-auth.session-token')?.value;
  const isLoggedIn = !!sessionToken;

  // Debug log (remove in production)
  console.log(`[Middleware] Path: ${pathname}, LoggedIn: ${isLoggedIn}, Token exists: ${!!sessionToken}`);

  // Define route types
  const isAdminRoute = pathname.startsWith('/admin');
  const isWriterRoute = pathname.startsWith('/writer');
  const isAdminLoginPage = pathname === '/admin/login';
  const isWriterLoginPage = pathname === '/writer/login';
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isWriterApiRoute = pathname.startsWith('/api/writer');
  const isAdminApiRoute = pathname.startsWith('/api/admin');

  // Skip auth check for API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // ============================================
  // WRITER PORTAL ROUTES (/writer/*)
  // ============================================
  
  // If user is on writer login page and already logged in, redirect to writer dashboard
  if (isWriterLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/writer', req.url));
  }

  // If user is trying to access writer routes but not logged in, redirect to writer login
  if (isWriterRoute && !isWriterLoginPage && !isLoggedIn) {
    const loginUrl = new URL('/writer/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect writer API routes
  if (isWriterApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ============================================
  // ADMIN PANEL ROUTES (/admin/*)
  // ============================================

  // If user is on admin login page and already logged in, redirect to admin dashboard
  if (isAdminLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // If user is trying to access admin routes but not logged in, redirect to admin login
  if (isAdminRoute && !isAdminLoginPage && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin API routes
  if (isAdminApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Admin panel routes
    '/admin/:path*',
    // Writer portal routes
    '/writer/:path*',
    // Protected API routes
    '/api/admin/:path*',
    '/api/writer/:path*',
  ],
};
