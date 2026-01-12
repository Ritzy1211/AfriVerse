import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// GET - Fetch feedback for an article
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

    // First, get the editorial review for this post
    const editorialReview = await prisma.editorialReview.findFirst({
      where: { postId: resolvedParams.id },
    });

    if (!editorialReview) {
      return NextResponse.json({ feedback: [] });
    }

    const feedback = await prisma.editorialFeedback.findMany({
      where: { editorialReviewId: editorialReview.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get author info for each feedback
    const authorIds = [...new Set(feedback.map(f => f.authorId))];
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true, role: true },
    });
    const authorMap = new Map(authors.map(a => [a.id, a]));

    const feedbackWithAuthors = feedback.map(f => ({
      id: f.id,
      message: f.content,
      type: f.type,
      isInternal: f.isInternal,
      createdAt: f.createdAt,
      author: authorMap.get(f.authorId) || { name: f.authorName, role: f.authorRole },
    }));

    return NextResponse.json({ feedback: feedbackWithAuthors });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// POST - Add feedback to an article
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

    const body = await request.json();
    const { message, type, isInternal } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Find or create editorial review
    let editorialReview = await prisma.editorialReview.findFirst({
      where: { postId: resolvedParams.id },
    });

    if (!editorialReview) {
      editorialReview = await prisma.editorialReview.create({
        data: {
          postId: resolvedParams.id,
          status: 'IN_REVIEW',
          reviewerId: session.user.id,
        },
      });
    }

    // Create the feedback
    const feedback = await prisma.editorialFeedback.create({
      data: {
        editorialReviewId: editorialReview.id,
        authorId: session.user.id,
        authorName: session.user.name || 'Unknown',
        authorRole: session.user.role,
        content: message.trim(),
        type: type || 'COMMENT',
        isInternal: isInternal || false,
      },
    });

    // Log the activity
    await prisma.editorialActivityLog.create({
      data: {
        postId: resolvedParams.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userRole: session.user.role,
        action: 'FEEDBACK',
        details: `added ${isInternal ? 'internal ' : ''}${type?.toLowerCase() || 'general'} feedback`,
      },
    });

    return NextResponse.json({
      feedback: {
        id: feedback.id,
        message: feedback.content,
        type: feedback.type,
        isInternal: feedback.isInternal,
        createdAt: feedback.createdAt,
        author: {
          name: session.user.name,
          role: session.user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    return NextResponse.json(
      { error: 'Failed to add feedback' },
      { status: 500 }
    );
  }
}
