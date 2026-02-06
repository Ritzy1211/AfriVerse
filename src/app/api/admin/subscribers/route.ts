import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/subscribers - Get all subscribers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const premium = searchParams.get('premium');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }
    
    if (premium === 'true') {
      where.isPremium = true;
    } else if (premium === 'false') {
      where.isPremium = false;
    }

    // Get subscribers with their subscriptions
    const [subscribers, total, premiumCount] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            orderBy: { currentPeriodEnd: 'desc' },
            take: 1,
          },
        },
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.subscriber.count({ where }),
      prisma.subscriber.count({ where: { isPremium: true } }),
    ]);

    return NextResponse.json({
      subscribers,
      premiumCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
