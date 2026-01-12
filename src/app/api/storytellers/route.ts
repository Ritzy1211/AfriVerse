import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/storytellers - Public endpoint to get verified storytellers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeLevel = searchParams.get('badge');
    const expertise = searchParams.get('expertise');
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';

    const where: any = {
      status: 'VERIFIED',
    };

    if (badgeLevel) {
      where.badgeLevel = badgeLevel;
    }

    if (expertise) {
      where.expertise = { has: expertise };
    }

    if (country) {
      where.country = country;
    }

    // For featured, get top storytellers by trust score
    const orderBy: any = featured
      ? { trustScore: 'desc' }
      : { verifiedAt: 'desc' };

    const storytellers = await prisma.verifiedStoryteller.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    // Get stats by badge level
    const stats = await prisma.verifiedStoryteller.groupBy({
      by: ['badgeLevel'],
      where: { status: 'VERIFIED' },
      _count: true,
    });

    const badgeCounts = stats.reduce((acc: Record<string, number>, item) => {
      acc[item.badgeLevel] = item._count;
      return acc;
    }, {});

    return NextResponse.json({
      storytellers,
      stats: {
        total: storytellers.length,
        ...badgeCounts,
      },
    });
  } catch (error) {
    console.error('Error fetching storytellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storytellers' },
      { status: 500 }
    );
  }
}
