import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// GET - Fetch single article for editorial review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get editorial review
    const editorialReview = await prisma.editorialReview.findFirst({
      where: { postId: resolvedParams.id },
    });

    // Get reviewer info if exists
    let reviewer = null;
    if (editorialReview?.reviewerId) {
      reviewer = await prisma.user.findUnique({
        where: { id: editorialReview.reviewerId },
        select: { id: true, name: true, email: true },
      });
    }

    // Get editorial feedback
    const editorialFeedback = editorialReview
      ? await prisma.editorialFeedback.findMany({
          where: { editorialReviewId: editorialReview.id },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Get author info for each feedback
    const feedbackAuthorIds = [...new Set(editorialFeedback.map(f => f.authorId))];
    const feedbackAuthors = await prisma.user.findMany({
      where: { id: { in: feedbackAuthorIds } },
      select: { id: true, name: true, role: true },
    });
    const authorMap = new Map(feedbackAuthors.map(a => [a.id, a]));

    const feedbackWithAuthors = editorialFeedback.map(f => ({
      id: f.id,
      message: f.content,
      type: f.type,
      isInternal: f.isInternal,
      createdAt: f.createdAt,
      author: authorMap.get(f.authorId) || { name: f.authorName, role: f.authorRole },
    }));

    // Get activity log
    const activityLog = await prisma.editorialActivityLog.findMany({
      where: { postId: resolvedParams.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const activityLogWithUsers = activityLog.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details,
      createdAt: log.createdAt,
      user: { name: log.userName },
    }));

    return NextResponse.json({
      article: {
        ...article,
        category: { id: article.category, name: article.category, slug: article.category },
        editorialReview: editorialReview
          ? { ...editorialReview, reviewer }
          : null,
        editorialFeedback: feedbackWithAuthors,
        activityLog: activityLogWithUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update article (editor edits)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      categoryId,
      featuredImage,
      metaTitle,
      metaDescription,
      tags,
      priority,
    } = body;

    // Update the article
    const article = await prisma.post.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        excerpt,
        content,
        category: categoryId,
        featuredImage,
        metaTitle,
        metaDescription,
        tags,
        updatedAt: new Date(),
      },
    });

    // Update priority if changed
    if (priority) {
      await prisma.editorialReview.updateMany({
        where: { postId: resolvedParams.id },
        data: { priority },
      });
    }

    // Log the activity
    await prisma.editorialActivityLog.create({
      data: {
        postId: resolvedParams.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userRole: session.user.role,
        action: 'EDITED',
        details: 'made editorial changes to the article',
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
