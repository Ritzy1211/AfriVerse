import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch editorial queue with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has editorial permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build filter for posts in review states
    const postFilter: any = {
      status: {
        in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED']
      }
    };

    if (category) {
      postFilter.category = category;
    }

    // If editor, only show posts in their assigned categories
    if (user.role === 'EDITOR') {
      const assignments = await prisma.editorialAssignment.findMany({
        where: { userId: user.id }
      });
      const assignedCategories = assignments.map(a => a.category);
      postFilter.category = { in: assignedCategories };
    }

    // Fetch posts pending review
    const posts = await prisma.post.findMany({
      where: postFilter,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Fetch editorial reviews for these posts
    const postIds = posts.map(p => p.id);
    const reviews = await prisma.editorialReview.findMany({
      where: {
        postId: { in: postIds }
      },
      include: {
        feedbackHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        }
      }
    });

    // Map reviews to posts
    const reviewMap = new Map(reviews.map(r => [r.postId, r]));
    
    const postsWithReviews = posts.map(post => ({
      ...post,
      editorialReview: reviewMap.get(post.id) || null,
    }));

    // Filter by editorial status if specified
    let filteredPosts = postsWithReviews;
    if (status) {
      filteredPosts = postsWithReviews.filter(p => 
        p.editorialReview?.status === status || 
        (!p.editorialReview && status === 'PENDING')
      );
    }

    if (priority) {
      filteredPosts = filteredPosts.filter(p => 
        p.editorialReview?.priority === priority
      );
    }

    if (assignedTo) {
      filteredPosts = filteredPosts.filter(p => 
        p.editorialReview?.reviewerId === assignedTo
      );
    }

    // Get counts by status
    const statusCounts = await prisma.post.groupBy({
      by: ['status'],
      where: {
        status: {
          in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED']
        }
      },
      _count: true,
    });

    const total = await prisma.post.count({ where: postFilter });

    return NextResponse.json({
      posts: filteredPosts,
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching editorial queue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial queue' },
      { status: 500 }
    );
  }
}

// POST - Submit post for review
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { postId, priority, notes } = body;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user owns the post or is admin
    if (post.authorId !== user.id && !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Cannot submit this post' }, { status: 403 });
    }

    // Check publishing rules
    const rule = await prisma.publishingRule.findUnique({
      where: { category: post.category }
    });

    const validationErrors: string[] = [];

    if (rule) {
      const wordCount = post.content.split(/\s+/).length;
      
      if (wordCount < rule.minWordCount) {
        validationErrors.push(`Minimum word count is ${rule.minWordCount}. Current: ${wordCount}`);
      }
      if (rule.maxWordCount && wordCount > rule.maxWordCount) {
        validationErrors.push(`Maximum word count is ${rule.maxWordCount}. Current: ${wordCount}`);
      }
      if (rule.requiresFeaturedImage && !post.featuredImage) {
        validationErrors.push('Featured image is required');
      }
      if (rule.requiresExcerpt && !post.excerpt) {
        validationErrors.push('Excerpt is required');
      }
      if (rule.requiresMetaDescription && !post.metaDescription) {
        validationErrors.push('Meta description is required');
      }
      if (post.tags.length < rule.requiredTags) {
        validationErrors.push(`At least ${rule.requiredTags} tags are required`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        validationErrors 
      }, { status: 400 });
    }

    // Check if senior writer can auto-publish
    if (rule?.autoPublishTrusted && user.role === 'SENIOR_WRITER') {
      // Auto-approve for trusted users
      await prisma.post.update({
        where: { id: postId },
        data: {
          status: 'APPROVED',
        }
      });

      await prisma.editorialActivityLog.create({
        data: {
          postId,
          userId: user.id,
          userName: user.name || user.email,
          userRole: user.role,
          action: 'AUTO_APPROVED',
          details: 'Senior writer - auto-approved per category rules',
        }
      });

      return NextResponse.json({ 
        message: 'Post auto-approved',
        status: 'APPROVED'
      });
    }

    // Update post status
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PENDING_REVIEW',
      }
    });

    // Create or update editorial review
    const existingReview = await prisma.editorialReview.findFirst({
      where: { postId }
    });

    let review;
    if (existingReview) {
      review = await prisma.editorialReview.update({
        where: { id: existingReview.id },
        data: {
          status: 'PENDING',
          priority: priority || 'NORMAL',
          notes,
        }
      });
    } else {
      review = await prisma.editorialReview.create({
        data: {
          postId,
          status: 'PENDING',
          priority: priority || 'NORMAL',
          notes,
        }
      });
    }

    // Log activity
    await prisma.editorialActivityLog.create({
      data: {
        postId,
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: 'SUBMITTED',
        details: `Submitted for review with ${priority || 'NORMAL'} priority`,
      }
    });

    // Notify editors (would integrate with email service)
    if (rule?.notifyOnSubmission?.length) {
      // TODO: Send notification emails
      console.log('Would notify:', rule.notifyOnSubmission);
    }

    return NextResponse.json({ 
      message: 'Post submitted for review',
      review
    });
  } catch (error) {
    console.error('Error submitting for review:', error);
    return NextResponse.json(
      { error: 'Failed to submit for review' },
      { status: 500 }
    );
  }
}
