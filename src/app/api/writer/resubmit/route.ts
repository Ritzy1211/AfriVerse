import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Resubmit article for review after making changes
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, responseNote } = body;

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch the article
    const article = await prisma.post.findFirst({
      where: {
        id: articleId,
        authorId: session.user.id,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Only allow resubmission if status is CHANGES_REQUESTED
    if (article.status !== 'CHANGES_REQUESTED') {
      return NextResponse.json(
        { error: 'Article is not awaiting revisions' },
        { status: 400 }
      );
    }

    // Update article status to PENDING_REVIEW
    await prisma.post.update({
      where: { id: articleId },
      data: {
        status: 'PENDING_REVIEW',
        updatedAt: new Date(),
      },
    });

    // Update the editorial review status
    const editorialReview = await prisma.editorialReview.findFirst({
      where: { postId: articleId },
    });

    if (editorialReview) {
      await prisma.editorialReview.update({
        where: { id: editorialReview.id },
        data: {
          status: 'REVISION_SUBMITTED',
          notes: responseNote ? `Resubmission note: ${responseNote}\n\n${editorialReview.notes || ''}` : editorialReview.notes,
        },
      });

      // Add feedback history entry for the resubmission
      if (responseNote && session.user.name) {
        await prisma.editorialFeedback.create({
          data: {
            editorialReviewId: editorialReview.id,
            authorId: session.user.id,
            authorName: session.user.name || 'Writer',
            authorRole: 'WRITER',
            content: `Writer resubmitted with note: ${responseNote}`,
            type: 'RESPONSE',
          },
        });
      }
    }

    // Create a notification for the admin/editors
    try {
      // Find admin users to notify
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'EDITOR'] },
        },
        select: { id: true },
      });

      // Create notifications for each admin
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'EDITORIAL',
            title: 'Article Resubmitted',
            message: `Article "${article.title}" has been resubmitted for review`,
            link: `/admin/editorial`,
          },
        });
      }
    } catch (notifError) {
      // Don't fail the request if notification creation fails
      console.error('Failed to create notifications:', notifError);
    }

    return NextResponse.json({
      message: 'Article resubmitted for review successfully',
      articleId,
    });
  } catch (error) {
    console.error('Error resubmitting article:', error);
    return NextResponse.json(
      { error: 'Failed to resubmit article' },
      { status: 500 }
    );
  }
}
