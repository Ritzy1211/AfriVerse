import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/impact/report - Submit community impact report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Allow both authenticated and anonymous reports
    const body = await request.json();
    const {
      postId,
      description,
      impactType,
      evidenceUrl,
      reporterEmail,
      location,
    } = body;

    // Validate required fields
    if (!postId || !description || !impactType) {
      return NextResponse.json(
        { error: 'Post ID, description, and impact type are required' },
        { status: 400 }
      );
    }

    // Check if post exists and has an impact score
    const impactScore = await prisma.impactScore.findUnique({
      where: { postId },
    });

    if (!impactScore) {
      return NextResponse.json(
        { error: 'This article does not have impact tracking enabled' },
        { status: 404 }
      );
    }

    // Create the report
    const report = await prisma.impactReport.create({
      data: {
        impactScoreId: impactScore.id,
        reporterId: session?.user?.id || null,
        reporterEmail: session?.user?.email || reporterEmail || null,
        description,
        impactType,
        evidenceUrl: evidenceUrl || null,
        location: location || null,
        status: 'PENDING',
      },
    });

    // Increment community votes
    await prisma.impactScore.update({
      where: { id: impactScore.id },
      data: {
        communityVotes: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your report! Our team will review it shortly.',
      report: {
        id: report.id,
        impactType: report.impactType,
        createdAt: report.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting impact report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

// GET /api/impact/report - Get reports for a post (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const verified = searchParams.get('verified');

    const where: any = {};
    
    if (postId) {
      const impactScore = await prisma.impactScore.findUnique({
        where: { postId },
      });
      if (impactScore) {
        where.impactScoreId = impactScore.id;
      }
    }

    if (verified !== null) {
      where.verified = verified === 'true';
    }

    const reports = await prisma.impactReport.findMany({
      where,
      include: {
        impactScore: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
