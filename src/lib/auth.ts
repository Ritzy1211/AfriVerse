import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { 
  recordLoginAttempt, 
  isNewDevice, 
  sendLoginNotificationEmail, 
  getLocationFromIP,
  getSecuritySettings,
  verifyRecaptcha,
  isIPBlocked 
} from '@/lib/security';

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Note: PrismaAdapter removed - not needed with JWT strategy for credentials
  // This fixes the oversized session cookie issue
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    // Google OAuth (optional - for future use)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Email/Password credentials
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        captchaToken: { label: 'Captcha', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Get client IP and user agent for security tracking
        const ip = (req?.headers?.get?.('x-forwarded-for') as string)?.split(',')[0]?.trim() ||
                   req?.headers?.get?.('x-real-ip') as string || 
                   '127.0.0.1';
        const userAgent = req?.headers?.get?.('user-agent') as string || 'Unknown';

        // Check if IP is blocked
        const blocked = await isIPBlocked(ip);
        if (blocked) {
          throw new Error('Too many failed login attempts. Please try again later.');
        }

        // Verify CAPTCHA if enabled
        const securitySettings = await getSecuritySettings();
        if (securitySettings.enableCaptcha && credentials.captchaToken) {
          const captchaResult = await verifyRecaptcha(credentials.captchaToken as string);
          if (!captchaResult.success) {
            throw new Error('CAPTCHA verification failed');
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          // Record failed attempt
          await recordLoginAttempt({
            userId: '',
            email: credentials.email as string,
            ip,
            userAgent,
            success: false,
            timestamp: new Date(),
          });
          throw new Error('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          // Record failed attempt
          await recordLoginAttempt({
            userId: user.id,
            email: credentials.email as string,
            ip,
            userAgent,
            success: false,
            timestamp: new Date(),
          });
          throw new Error('Invalid email or password');
        }

        // Successful login - record attempt
        const location = await getLocationFromIP(ip);
        await recordLoginAttempt({
          userId: user.id,
          email: user.email,
          ip,
          userAgent,
          location,
          success: true,
          timestamp: new Date(),
        });

        // Check if login notifications are enabled and if this is a new device
        if (securitySettings.loginNotifications) {
          const newDevice = await isNewDevice(user.id, ip, userAgent);
          
          // Send notification email (async, don't block login)
          sendLoginNotificationEmail(
            user.email,
            user.name || 'User',
            {
              ip,
              device: userAgent.substring(0, 100), // Truncate long user agents
              location,
              timestamp: new Date(),
              isNewDevice: newDevice,
            }
          ).catch(err => console.error('Failed to send login notification:', err));
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only store minimal data in token to keep cookie size small
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
        // Remove unnecessary default fields to minimize size
        delete token.name;
        delete token.email;
        delete token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, check if user has admin access
      if (account?.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        
        // Only allow existing users with admin roles to sign in via OAuth
        if (!dbUser || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'].includes(dbUser.role)) {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log('User signed out');
    },
  },
  // Disable debug to reduce cookie size
  debug: false,
});

// Helper function to check if user has required role
export function hasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// Role hierarchy for authorization
export const ROLE_HIERARCHY = {
  SUPER_ADMIN: ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
  ADMIN: ['ADMIN', 'EDITOR', 'AUTHOR'],
  EDITOR: ['EDITOR', 'AUTHOR'],
  AUTHOR: ['AUTHOR'],
};

// Check if user can perform action based on role
export function canPerformAction(userRole: string | undefined, requiredRole: string): boolean {
  if (!userRole) return false;
  const allowedRoles = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || [];
  return allowedRoles.includes(requiredRole);
}
