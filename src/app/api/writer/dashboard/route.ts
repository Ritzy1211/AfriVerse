import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Writer dashboard data - restricted to own content only
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get post counts by status - ONLY for this writer
    const [drafts, submitted, inReview, needsRevision, approved, published] = await Promise.all([
      prisma.post.count({
        where: { authorId: userId, status: 'DRAFT' },
      }),
      prisma.post.count({
        where: { authorId: userId, status: 'PENDING_REVIEW' },
      }),
      prisma.post.count({
        where: { authorId: userId, status: 'IN_REVIEW' },
      }),
      prisma.post.count({
        where: { authorId: userId, status: 'CHANGES_REQUESTED' },
      }),
      prisma.post.count({
        where: { authorId: userId, status: 'APPROVED' },
      }),
      prisma.post.count({
        where: { authorId: userId, status: 'PUBLISHED' },
      }),
    ]);

    // Get recent articles (5 most recent)
    const recentArticles = await prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Get editorial notes/feedback (non-internal only) - via editorial reviews
    const editorialReviews = await prisma.editorialReview.findMany({
      where: {
        postId: { in: (await prisma.post.findMany({ where: { authorId: userId }, select: { id: true } })).map(p => p.id) },
      },
      select: { id: true, postId: true },
    });
    
    const reviewIds = editorialReviews.map(r => r.id);
    const postIdMap = new Map(editorialReviews.map(r => [r.id, r.postId]));
    
    const feedbackList = reviewIds.length > 0 ? await prisma.editorialFeedback.findMany({
      where: {
        editorialReviewId: { in: reviewIds },
        isInternal: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }) : [];

    // Get post titles for feedback
    const postIds = [...new Set(feedbackList.map(f => postIdMap.get(f.editorialReviewId)).filter(Boolean))] as string[];
    const posts = postIds.length > 0 ? await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: { id: true, title: true },
    }) : [];
    const postTitleMap = new Map(posts.map(p => [p.id, p.title]));

    return NextResponse.json({
      stats: {
        drafts,
        submitted,
        inReview,
        needsRevision,
        approved,
        published,
      },
      recentArticles,
      editorialNotes: feedbackList.map(note => ({
        id: note.id,
        message: note.content,
        postTitle: postTitleMap.get(postIdMap.get(note.editorialReviewId) || '') || 'Unknown',
        createdAt: note.createdAt,
        editorName: note.authorName,
      })),
    });
  } catch (error) {
    console.error('Error fetching writer dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
