import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Role check helper
const hasPermission = (userRole: string, minRole: string): boolean => {
  const ROLE_LEVEL: Record<string, number> = {
    CONTRIBUTOR: 1,
    AUTHOR: 2,
    SENIOR_WRITER: 3,
    EDITOR: 4,
    ADMIN: 5,
    SUPER_ADMIN: 6,
  };
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
};

// GET /api/admin/afripulse/[id] - Get specific country
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pulseEntry = await prisma.afriPulseIndex.findUnique({
      where: { id: params.id },
    });

    if (!pulseEntry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(pulseEntry);
  } catch (error) {
    console.error('Error fetching AfriPulse entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/afripulse/[id] - Update country data
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      economyScore,
      politicsScore,
      socialScore,
      techScore,
      economyTrend,
      politicsTrend,
      socialTrend,
      techTrend,
      topStory,
      topStoryUrl,
      keyIndicators,
    } = body;

    // Calculate overall score and trend
    const overallScore = Math.round(
      (economyScore + politicsScore + socialScore + techScore) / 4
    );

    const determineTrend = (trends: string[]): string => {
      const risingCount = trends.filter((t) => t === 'RISING').length;
      const fallingCount = trends.filter((t) => t === 'FALLING').length;
      if (risingCount >= 3) return 'RISING';
      if (fallingCount >= 3) return 'FALLING';
      if (risingCount > 0 && fallingCount > 0) return 'VOLATILE';
      return 'STABLE';
    };

    const overallTrend = determineTrend([economyTrend, politicsTrend, socialTrend, techTrend]);

    const updated = await prisma.afriPulseIndex.update({
      where: { id: params.id },
      data: {
        economyScore,
        politicsScore,
        socialScore,
        techScore,
        overallScore,
        economyTrend: economyTrend as any,
        politicsTrend: politicsTrend as any,
        socialTrend: socialTrend as any,
        techTrend: techTrend as any,
        overallTrend: overallTrend as any,
        topStory,
        topStoryUrl,
        keyIndicators,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating AfriPulse entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/afripulse/[id] - Delete country
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.afriPulseIndex.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AfriPulse entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
