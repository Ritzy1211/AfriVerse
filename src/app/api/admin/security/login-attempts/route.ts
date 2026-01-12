import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Check if LoginAttempt model is available
const hasLoginAttemptModel = () => {
  try {
    return 'loginAttempt' in prisma;
  } catch {
    return false;
  }
};

// GET - Fetch login attempts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if model is available
    if (!hasLoginAttemptModel()) {
      return NextResponse.json({
        attempts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        message: 'Login tracking not yet configured. Run: npx prisma generate && npx prisma db push'
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status === 'success') where.success = true;
    if (status === 'failed') where.success = false;

    // @ts-ignore - Model may not be generated yet
    const [attempts, total] = await Promise.all([
      // @ts-ignore
      prisma.loginAttempt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      // @ts-ignore
      prisma.loginAttempt.count({ where }),
    ]);

    return NextResponse.json({
      attempts: attempts.map((a: { id: string; email: string; ipAddress: string; userAgent: string | null; location: string | null; success: boolean; createdAt: Date }) => ({
        id: a.id,
        email: a.email,
        ip: a.ipAddress,
        userAgent: a.userAgent,
        location: a.location || 'Unknown',
        status: a.success ? 'success' : 'failed',
        date: a.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Clear old login attempts
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasLoginAttemptModel()) {
      return NextResponse.json({ error: 'Login tracking not configured' }, { status: 400 });
    }

    const { olderThan } = await request.json();
    const date = new Date(olderThan || Date.now() - 30 * 24 * 60 * 60 * 1000);

    // @ts-ignore
    const result = await prisma.loginAttempt.deleteMany({
      where: {
        createdAt: { lt: date },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error('Error clearing login attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
