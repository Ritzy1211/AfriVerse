import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Add feedback/comment to editorial review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const postId = params.id;
    const body = await request.json();
    const { content, type, isInternal, attachments } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permissions - must be author or editor
    const isAuthor = post.authorId === user.id;
    const isEditor = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role);

    if (!isAuthor && !isEditor) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Authors cannot add internal notes
    if (isInternal && !isEditor) {
      return NextResponse.json(
        { error: 'Only editors can add internal notes' },
        { status: 403 }
      );
    }

    // Get or create review
    let review = await prisma.editorialReview.findFirst({
      where: { postId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'No editorial review found for this post' },
        { status: 404 }
      );
    }

    // Create feedback
    const feedback = await prisma.editorialFeedback.create({
      data: {
        editorialReviewId: review.id,
        authorId: user.id,
        authorName: user.name || user.email,
        authorRole: user.role,
        type: type || (isAuthor ? 'RESPONSE' : 'COMMENT'),
        content,
        isInternal: isInternal || false,
        attachments: attachments || [],
      }
    });

    // If author is responding to revision request, update status
    if (isAuthor && review.status === 'CHANGES_REQUESTED') {
      await prisma.editorialReview.update({
        where: { id: review.id },
        data: { status: 'REVISION_SUBMITTED' }
      });

      await prisma.post.update({
        where: { id: postId },
        data: { status: 'PENDING_REVIEW' }
      });

      // Log activity
      await prisma.editorialActivityLog.create({
        data: {
          postId,
          userId: user.id,
          userName: user.name || user.email,
          userRole: user.role,
          action: 'REVISION_SUBMITTED',
          details: 'Author submitted revisions',
        }
      });
    } else {
      // Log comment activity
      await prisma.editorialActivityLog.create({
        data: {
          postId,
          userId: user.id,
          userName: user.name || user.email,
          userRole: user.role,
          action: isInternal ? 'INTERNAL_NOTE' : 'COMMENT',
          details: `Added ${isInternal ? 'internal note' : 'comment'}`,
        }
      });
    }

    return NextResponse.json({
      message: 'Feedback added',
      feedback,
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json(
      { error: 'Failed to add feedback' },
      { status: 500 }
    );
  }
}

// GET - Get all feedback for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const postId = params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isAuthor = post.authorId === user.id;
    const isEditor = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role);

    if (!isAuthor && !isEditor) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const review = await prisma.editorialReview.findFirst({
      where: { postId }
    });

    if (!review) {
      return NextResponse.json({ feedback: [] });
    }

    // Filter internal notes for non-editors
    const feedback = await prisma.editorialFeedback.findMany({
      where: {
        editorialReviewId: review.id,
        ...(isAuthor && !isEditor ? { isInternal: false } : {}),
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
