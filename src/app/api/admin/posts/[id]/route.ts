import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notifyPostStatusChange, notifyEditorsNewSubmission } from '@/lib/notifications';

// Helper to validate MongoDB ObjectID
function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// GET /api/admin/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectID format
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectID format
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 });
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

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if slug is being changed and if new slug already exists
    if (slug && slug !== existingPost.slug) {
      const slugExists = await prisma.post.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Determine publishedAt based on status change
    let publishedAt = existingPost.publishedAt;
    if (status === 'PUBLISHED' && existingPost.status !== 'PUBLISHED') {
      publishedAt = new Date();
    } else if (status !== 'PUBLISHED') {
      publishedAt = null;
    }

    // Update the post
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title: title ?? existingPost.title,
        slug: slug ?? existingPost.slug,
        excerpt: excerpt ?? existingPost.excerpt,
        content: content ?? existingPost.content,
        category: category ?? existingPost.category,
        tags: tags ?? existingPost.tags,
        featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
        status: status ?? existingPost.status,
        publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingPost.scheduledAt,
        readingTime: readingTime ?? existingPost.readingTime,
        metaTitle: metaTitle ?? existingPost.metaTitle,
        metaDescription: metaDescription ?? existingPost.metaDescription,
        metaKeywords: metaKeywords ?? existingPost.metaKeywords,
        featured: featured !== undefined ? featured : existingPost.featured,
        isPremium: isPremium !== undefined ? isPremium : existingPost.isPremium,
        isSponsored: isSponsored !== undefined ? isSponsored : existingPost.isSponsored,
        sponsorName: isSponsored ? (sponsorName ?? existingPost.sponsorName) : null,
        sponsorLogo: isSponsored ? (sponsorLogo ?? existingPost.sponsorLogo) : null,
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

    // Send notifications if status changed
    const newStatus = status?.toUpperCase();
    const oldStatus = existingPost.status;
    
    if (newStatus && newStatus !== oldStatus) {
      try {
        // Get current user info for editor name
        const currentUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { name: true, email: true },
        });
        
        // Notify the post author about status change
        await notifyPostStatusChange(
          existingPost.authorId,
          post.title,
          post.id,
          newStatus,
          currentUser?.name || currentUser?.email
        );
        
        // If submitted for review, notify editors
        if (newStatus === 'REVIEW' || newStatus === 'PENDING_REVIEW') {
          await notifyEditorsNewSubmission(
            post.title,
            post.id,
            post.author?.name || post.author?.email || 'Unknown Author'
          );
        }
      } catch (notifyError) {
        // Log but don't fail the request if notifications fail
        console.error('Error sending notifications:', notifyError);
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectID format
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid post ID format' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
