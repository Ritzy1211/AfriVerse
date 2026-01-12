import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getNewCommentNotificationHtml } from '@/lib/email';
import * as Sentry from '@sentry/nextjs';

// Helper to get prisma client with error handling
async function getPrisma() {
  try {
    const { prisma } = await import('@/lib/prisma');
    return prisma;
  } catch (error) {
    console.error('Failed to load Prisma client:', error);
    return null;
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      content, 
      articleSlug, 
      articleTitle,
      authorName, 
      authorEmail, 
      authorAvatar,
      parentId 
    } = body;

    // Validation
    if (!content || !articleSlug || !authorName || !authorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: content, articleSlug, authorName, authorEmail' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Sanitize content (basic XSS prevention)
    const sanitizedContent = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();

    if (sanitizedContent.length < 3) {
      return NextResponse.json(
        { error: 'Comment must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > 5000) {
      return NextResponse.json(
        { error: 'Comment must be less than 5000 characters' },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Check if parent comment exists (for replies)
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        articleSlug,
        articleTitle: articleTitle || null,
        authorName: authorName.trim(),
        authorEmail: authorEmail.toLowerCase().trim(),
        authorAvatar: authorAvatar || null,
        parentId: parentId || null,
        status: 'PENDING', // All comments start as pending for moderation
      },
      include: {
        parent: true,
      },
    });

    // Send notification email to admin
    try {
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `New Comment on "${articleTitle || articleSlug}"`,
          html: getNewCommentNotificationHtml(
            articleTitle || articleSlug,
            authorName,
            sanitizedContent
          ),
        });
      }
    } catch (emailError) {
      console.error('Failed to send comment notification:', emailError);
      Sentry.captureException(emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Comment submitted successfully! It will appear after moderation.',
      comment: {
        id: comment.id,
        content: comment.content,
        authorName: comment.authorName,
        createdAt: comment.createdAt,
        status: comment.status,
      },
    });

  } catch (error) {
    console.error('Create comment error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Fetch comments for an article
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json({ comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
    }

    const { searchParams } = new URL(request.url);
    const articleSlug = searchParams.get('articleSlug');
    const status = searchParams.get('status') || 'APPROVED';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeReplies = searchParams.get('includeReplies') !== 'false';

    // For admin: fetch all comments
    if (searchParams.get('admin') === 'true') {
      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: status !== 'ALL' ? { status: status as any } : undefined,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            replies: {
              orderBy: { createdAt: 'asc' },
            },
          },
        }),
        prisma.comment.count({
          where: status !== 'ALL' ? { status: status as any } : undefined,
        }),
      ]);

      return NextResponse.json({
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // For public: fetch approved comments for specific article
    if (!articleSlug) {
      return NextResponse.json(
        { error: 'articleSlug is required' },
        { status: 400 }
      );
    }

    const whereClause: any = {
      articleSlug,
      status: 'APPROVED',
    };

    // Only get top-level comments if including replies
    if (includeReplies) {
      whereClause.parentId = null;
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: includeReplies ? {
          replies: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'asc' },
          },
        } : undefined,
      }),
      prisma.comment.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Fetch comments error:', error);
    // Return empty comments on error instead of 500
    return NextResponse.json({
      comments: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
  }
}

// PATCH - Update comment (approve, spam, delete, like)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, status: newStatus } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'like') {
      const updated = await prisma.comment.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      return NextResponse.json({ success: true, likes: updated.likes });
    }

    if (action === 'approve') {
      await prisma.comment.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
      return NextResponse.json({ success: true, message: 'Comment approved' });
    }

    if (action === 'spam') {
      await prisma.comment.update({
        where: { id },
        data: { status: 'SPAM' },
      });
      return NextResponse.json({ success: true, message: 'Comment marked as spam' });
    }

    if (action === 'delete' || newStatus === 'DELETED') {
      await prisma.comment.update({
        where: { id },
        data: { status: 'DELETED' },
      });
      return NextResponse.json({ success: true, message: 'Comment deleted' });
    }

    // Generic status update
    if (newStatus) {
      await prisma.comment.update({
        where: { id },
        data: { status: newStatus },
      });
      return NextResponse.json({ success: true, message: `Comment status updated to ${newStatus}` });
    }

    return NextResponse.json(
      { error: 'No valid action provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Update comment error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Delete comment and all its replies (cascades due to schema)
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Comment permanently deleted',
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
