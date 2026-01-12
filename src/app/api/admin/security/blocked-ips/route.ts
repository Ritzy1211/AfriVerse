import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSecuritySettings } from '@/lib/security';

// Check if LoginAttempt model is available
const hasLoginAttemptModel = () => {
  try {
    return 'loginAttempt' in prisma;
  } catch {
    return false;
  }
};

// GET - Fetch blocked IPs
export async function GET() {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if model is available
    if (!hasLoginAttemptModel()) {
      return NextResponse.json({ blockedIPs: [] });
    }

    const settings = await getSecuritySettings();
    const lockoutTime = new Date(Date.now() - settings.lockoutDuration * 60 * 1000);

    // @ts-ignore - Model may not be generated yet
    const failedAttempts = await prisma.loginAttempt.groupBy({
      by: ['ipAddress'],
      where: {
        success: false,
        createdAt: { gte: lockoutTime },
      },
      _count: true,
    });

    const blockedIPs = await Promise.all(
      (failedAttempts as Array<{ ipAddress: string; _count: number }>)
        .filter((a) => a._count >= settings.maxLoginAttempts)
        .map(async (a) => {
          // @ts-ignore
          const lastAttempt = await prisma.loginAttempt.findFirst({
            where: {
              ipAddress: a.ipAddress,
              success: false,
            },
            orderBy: { createdAt: 'desc' },
          });

          return {
            ip: a.ipAddress,
            failedAttempts: a._count,
            reason: `${a._count} failed login attempts`,
            date: lastAttempt?.createdAt.toISOString().split('T')[0] || 'Unknown',
            location: lastAttempt?.location || 'Unknown',
          };
        })
    );

    return NextResponse.json({ blockedIPs });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Unblock an IP
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasLoginAttemptModel()) {
      return NextResponse.json({ error: 'Login tracking not configured' }, { status: 400 });
    }

    const { ip } = await request.json();

    if (!ip) {
      return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
    }

    // @ts-ignore
    const result = await prisma.loginAttempt.deleteMany({
      where: {
        ipAddress: ip,
        success: false,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
      message: `Unblocked IP ${ip} - deleted ${result.count} failed attempts`,
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
