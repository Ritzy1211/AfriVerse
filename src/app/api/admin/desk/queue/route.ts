import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter conditions for posts
    const where: any = {
      // Only show articles that have been submitted for review (not drafts)
      status: {
        in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'SCHEDULED'],
      },
    };

    // Filter by specific status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Search by title or author name
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch posts
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // Get editorial reviews for these posts
    const postIds = posts.map(p => p.id);
    const editorialReviews = await prisma.editorialReview.findMany({
      where: { postId: { in: postIds } },
    });
    
    // Create a map for quick lookup
    const reviewMap = new Map(editorialReviews.map(r => [r.postId, r]));

    // Get reviewer info if needed
    const reviewerIds = editorialReviews
      .filter(r => r.reviewerId)
      .map(r => r.reviewerId as string);
    
    const reviewers = reviewerIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: reviewerIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    
    const reviewerMap = new Map(reviewers.map(r => [r.id, r]));

    // Filter by priority if specified
    let filteredPosts = posts;
    if (priority && priority !== 'all') {
      const postIdsWithPriority = editorialReviews
        .filter(r => r.priority === priority)
        .map(r => r.postId);
      filteredPosts = posts.filter(p => postIdsWithPriority.includes(p.id));
    }

    // Transform articles for the queue view
    const queueItems = filteredPosts.map((article) => {
      const review = reviewMap.get(article.id);
      const reviewer = review?.reviewerId ? reviewerMap.get(review.reviewerId) : null;
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        category: article.category,
        author: article.author,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        wordCount: article.content?.split(/\s+/).filter(Boolean).length || 0,
        priority: review?.priority || 'NORMAL',
        submittedAt: review?.createdAt,
        reviewer: reviewer,
        claimedAt: review?.reviewedAt,
      };
    });

    return NextResponse.json({
      items: queueItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching editorial queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial queue' },
      { status: 500 }
    );
  }
}
