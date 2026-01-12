import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch editorial notes for the writer's articles
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get writer's posts
    const writerPosts = await prisma.post.findMany({
      where: { authorId: session.user.id },
      select: { id: true, title: true, status: true },
    });
    const postMap = new Map(writerPosts.map(p => [p.id, p]));

    // Get editorial reviews for these posts
    const reviews = await prisma.editorialReview.findMany({
      where: { postId: { in: writerPosts.map(p => p.id) } },
      select: { id: true, postId: true },
    });
    const reviewPostMap = new Map(reviews.map(r => [r.id, r.postId]));

    // Get non-internal feedback
    const feedback = reviews.length > 0 ? await prisma.editorialFeedback.findMany({
      where: {
        editorialReviewId: { in: reviews.map(r => r.id) },
        isInternal: false,
      },
      orderBy: { createdAt: 'desc' },
    }) : [];

    // Map to expected format
    const notes = feedback.map(f => {
      const postId = reviewPostMap.get(f.editorialReviewId);
      const post = postId ? postMap.get(postId) : null;
      return {
        id: f.id,
        message: f.content,
        type: f.type,
        createdAt: f.createdAt,
        author: {
          name: f.authorName,
          role: f.authorRole,
        },
        post: post || { id: '', title: 'Unknown', status: 'DRAFT' },
      };
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching editorial notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}
