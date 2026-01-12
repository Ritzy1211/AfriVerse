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

// GET /api/admin/impact/[id] - Get specific impact score
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const impactScore = await prisma.impactScore.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!impactScore) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(impactScore);
  } catch (error) {
    console.error('Error fetching impact score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact score' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/impact/[id] - Update impact score
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
      policyInfluence,
      socialReach,
      mediaExposure,
      economicImpact,
      communityEngagement,
      verifiedOutcomes,
      evidenceLinks,
    } = body;

    // Calculate overall score
    const overallScore = Math.round(
      (policyInfluence + socialReach + mediaExposure + economicImpact + communityEngagement) / 5
    );

    // Determine level
    let level: string;
    if (overallScore >= 90) level = 'TRANSFORMATIVE';
    else if (overallScore >= 70) level = 'MAJOR';
    else if (overallScore >= 50) level = 'SIGNIFICANT';
    else if (overallScore >= 30) level = 'NOTABLE';
    else level = 'EMERGING';

    const updated = await prisma.impactScore.update({
      where: { id: params.id },
      data: {
        policyInfluence,
        socialReach,
        mediaExposure,
        economicImpact,
        communityEngagement,
        overallScore,
        level: level as any,
        verifiedOutcomes,
        evidenceLinks,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating impact score:', error);
    return NextResponse.json(
      { error: 'Failed to update impact score' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/impact/[id] - Delete impact score
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

    // Delete associated reports first
    await prisma.impactReport.deleteMany({
      where: { impactScoreId: params.id },
    });

    await prisma.impactScore.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting impact score:', error);
    return NextResponse.json(
      { error: 'Failed to delete impact score' },
      { status: 500 }
    );
  }
}
