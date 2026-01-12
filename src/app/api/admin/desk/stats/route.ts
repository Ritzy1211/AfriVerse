import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get counts for each status
    const [
      pending,
      inReview,
      needsRevision,
      approved,
      publishedToday,
      totalThisWeek,
    ] = await Promise.all([
      prisma.post.count({
        where: { status: 'PENDING_REVIEW' },
      }),
      prisma.post.count({
        where: { status: 'IN_REVIEW' },
      }),
      prisma.post.count({
        where: { status: 'CHANGES_REQUESTED' },
      }),
      prisma.post.count({
        where: { status: 'APPROVED' },
      }),
      prisma.post.count({
        where: {
          status: 'PUBLISHED',
          publishedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.post.count({
        where: {
          status: {
            in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED'],
          },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get urgent items count
    const urgent = await prisma.editorialReview.count({
      where: {
        priority: 'URGENT',
        status: { in: ['PENDING', 'IN_REVIEW'] },
      },
    });

    // Get my claimed articles (for the current editor)
    const myClaimedReviews = await prisma.editorialReview.findMany({
      where: {
        reviewerId: session.user.id,
        status: 'IN_REVIEW',
      },
      select: { postId: true },
    });
    
    const myClaimed = myClaimedReviews.length;

    return NextResponse.json({
      pending,
      inReview,
      needsRevision,
      approved,
      publishedToday,
      totalThisWeek,
      urgent,
      myClaimed,
    });
  } catch (error) {
    console.error('Error fetching editorial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial stats' },
      { status: 500 }
    );
  }
}
