import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyPostStatusChange, notifyEditorsNewSubmission } from '@/lib/notifications';
import { revalidatePath, revalidateTag } from 'next/cache';

// GET /api/admin/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (category && category !== 'all') {
      where.category = category.toLowerCase();
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get posts with pagination
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      status,
      scheduledAt,
      readingTime,
      metaTitle,
      metaDescription,
      metaKeywords,
      featured,
      isPremium,
      isSponsored,
      sponsorName,
      sponsorLogo,
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based permission check for publishing
    // Only EDITOR, ADMIN, and SUPER_ADMIN can publish directly
    const canPublishDirectly = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
    let finalStatus = status || 'DRAFT';
    
    // If user tries to publish but doesn't have permission, change to PENDING_REVIEW
    if (!canPublishDirectly && (finalStatus === 'PUBLISHED' || finalStatus === 'SCHEDULED')) {
      finalStatus = 'PENDING_REVIEW';
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content: content || '',
        category: category || 'uncategorized',
        tags: tags || [],
        featuredImage: featuredImage || null,
        status: finalStatus,
        publishedAt: finalStatus === 'PUBLISHED' ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        readingTime: readingTime || 1,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || '',
        metaKeywords: metaKeywords || '',
        featured: featured || false,
        isPremium: isPremium || false,
        isSponsored: isSponsored || false,
        sponsorName: isSponsored ? sponsorName : null,
        sponsorLogo: isSponsored ? sponsorLogo : null,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Send notifications based on status
    try {
      const postStatus = finalStatus;
      
      // Notify author about post status
      await notifyPostStatusChange(
        user.id,
        title,
        post.id,
        postStatus
      );
      
      // If submitted for review, notify editors
      if (postStatus === 'REVIEW' || postStatus === 'PENDING_REVIEW') {
        await notifyEditorsNewSubmission(
          title,
          post.id,
          user.name || user.email
        );
      }
    } catch (notifyError) {
      // Log but don't fail the request if notifications fail
      console.error('Error sending notifications:', notifyError);
    }

    // Include info about whether status was changed due to permissions
    const response: any = { ...post };
    if (!canPublishDirectly && (status === 'PUBLISHED' || status === 'SCHEDULED')) {
      response.statusChanged = true;
      response.originalStatus = status;
      response.message = 'Your article has been submitted for review. Editors will review it before publication.';
    }

    // Revalidate caches so changes appear immediately
    revalidateTag('articles');
    revalidatePath('/', 'layout');
    revalidatePath(`/${category}`, 'page');
    revalidatePath(`/${category}/${slug}`, 'page');

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
