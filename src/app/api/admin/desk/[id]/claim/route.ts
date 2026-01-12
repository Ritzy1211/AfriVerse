import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// POST - Claim article for review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if article exists and is available for claiming
    const article = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (article.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { error: 'Article is not available for review' },
        { status: 400 }
      );
    }

    // Check for existing editorial review
    const existingReview = await prisma.editorialReview.findFirst({
      where: { postId: resolvedParams.id },
    });

    // Update the article status
    await prisma.post.update({
      where: { id: resolvedParams.id },
      data: { status: 'IN_REVIEW' },
    });

    // Update or create editorial review record
    if (existingReview) {
      await prisma.editorialReview.update({
        where: { id: existingReview.id },
        data: {
          status: 'IN_REVIEW',
          reviewerId: session.user.id,
          reviewedAt: new Date(),
        },
      });
    } else {
      await prisma.editorialReview.create({
        data: {
          postId: resolvedParams.id,
          status: 'IN_REVIEW',
          reviewerId: session.user.id,
          reviewedAt: new Date(),
        },
      });
    }

    // Log the activity
    await prisma.editorialActivityLog.create({
      data: {
        postId: resolvedParams.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userRole: session.user.role,
        action: 'CLAIMED',
        details: 'claimed the article for review',
      },
    });

    return NextResponse.json({ success: true, message: 'Article claimed successfully' });
  } catch (error) {
    console.error('Error claiming article:', error);
    return NextResponse.json(
      { error: 'Failed to claim article' },
      { status: 500 }
    );
  }
}
