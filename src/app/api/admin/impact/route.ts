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

// GET /api/admin/impact - Get all impact scores
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const level = searchParams.get('level');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (postId) where.postId = postId;
    if (level) where.level = level;

    const [scores, total] = await Promise.all([
      prisma.impactScore.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
            },
          },
        },
        orderBy: { overallScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.impactScore.count({ where }),
    ]);

    return NextResponse.json({
      scores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching impact scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact scores' },
      { status: 500 }
    );
  }
}

// POST /api/admin/impact - Create or update impact score for a post
export async function POST(request: NextRequest) {
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
      postId,
      policyInfluence,
      socialReach,
      mediaExposure,
      economicImpact,
      communityEngagement,
      verifiedOutcomes,
      evidenceLinks,
    } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

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

    // Upsert impact score
    const impactScore = await prisma.impactScore.upsert({
      where: { postId },
      update: {
        policyInfluence,
        socialReach,
        mediaExposure,
        economicImpact,
        communityEngagement,
        overallScore,
        level: level as any,
        verifiedOutcomes: verifiedOutcomes || [],
        evidenceLinks: evidenceLinks || [],
        lastUpdated: new Date(),
      },
      create: {
        postId,
        policyInfluence: policyInfluence || 0,
        socialReach: socialReach || 0,
        mediaExposure: mediaExposure || 0,
        economicImpact: economicImpact || 0,
        communityEngagement: communityEngagement || 0,
        overallScore,
        level: level as any,
        verifiedOutcomes: verifiedOutcomes || [],
        evidenceLinks: evidenceLinks || [],
      },
    });

    return NextResponse.json(impactScore, { status: 201 });
  } catch (error) {
    console.error('Error creating impact score:', error);
    return NextResponse.json(
      { error: 'Failed to create impact score' },
      { status: 500 }
    );
  }
}
