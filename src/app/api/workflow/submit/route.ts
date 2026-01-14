/**
 * Content Workflow API
 * 
 * Enterprise-grade content approval workflow endpoints.
 * Handles: submit, assign, review, approve, reject, request changes, publish
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/activity-logger';
import { sendEmail } from '@/lib/email';

// Roles that can perform editorial actions
const EDITOR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];
const PUBLISH_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SENIOR_WRITER'];

// POST /api/workflow/submit - Submit post for review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, notes } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Get the post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user owns the post or is an editor
    const userRole = (session.user as any).role || 'AUTHOR';
    const isOwner = post.author.email === session.user.email;
    const isEditor = EDITOR_ROLES.includes(userRole);

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: 'Not authorized to submit this post' }, { status: 403 });
    }

    // Validate post has required fields
    const validationErrors: string[] = [];
    if (!post.title || post.title.trim().length < 10) {
      validationErrors.push('Title must be at least 10 characters');
    }
    if (!post.content || post.content.trim().length < 100) {
      validationErrors.push('Content must be at least 100 characters');
    }
    if (!post.excerpt) {
      validationErrors.push('Excerpt is required');
    }
    if (!post.category) {
      validationErrors.push('Category is required');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Post does not meet requirements', 
        validationErrors 
      }, { status: 400 });
    }

    // Update post status
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status: 'PENDING_REVIEW' },
    });

    // Create or update editorial review
    const existingReview = await prisma.editorialReview.findFirst({
      where: { postId },
    });

    if (existingReview) {
      await prisma.editorialReview.update({
        where: { id: existingReview.id },
        data: {
          status: 'PENDING',
          notes: notes || existingReview.notes,
        },
      });
    } else {
      await prisma.editorialReview.create({
        data: {
          postId,
          status: 'PENDING',
          priority: 'NORMAL',
          notes,
        },
      });
    }

    // Log activity
    await logActivity({
      postId,
      userId: (session.user as any).id || session.user.email,
      userName: session.user.name || session.user.email,
      userRole,
      action: ACTIVITY_ACTIONS.SUBMITTED_FOR_REVIEW,
      details: notes,
    });

    // Notify editors (get editors for this category)
    const editors = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      },
      select: { email: true, name: true },
    });

    // Send notification emails
    for (const editor of editors.slice(0, 5)) { // Limit to 5 editors
      try {
        await sendEmail({
          to: editor.email,
          subject: `[Review Required] New article submitted: ${post.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">New Article Awaiting Review</h2>
              <p><strong>Title:</strong> ${post.title}</p>
              <p><strong>Author:</strong> ${post.author.name || post.author.email}</p>
              <p><strong>Category:</strong> ${post.category}</p>
              ${notes ? `<p><strong>Author Notes:</strong> ${notes}</p>` : ''}
              <p><strong>Excerpt:</strong> ${post.excerpt}</p>
              <div style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/admin/review/${postId}" 
                   style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  Review Article
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error(`Failed to notify editor ${editor.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Article submitted for review',
      post: updatedPost,
    });
  } catch (error) {
    console.error('[Workflow] Submit error:', error);
    return NextResponse.json({ error: 'Failed to submit for review' }, { status: 500 });
  }
}

// GET /api/workflow/submit - Get submission requirements
export async function GET() {
  return NextResponse.json({
    requirements: {
      title: { minLength: 10, required: true },
      content: { minLength: 100, required: true },
      excerpt: { required: true },
      category: { required: true },
      featuredImage: { required: false, recommended: true },
      tags: { minCount: 1, recommended: 3 },
    },
    reviewProcess: [
      'Submit article for review',
      'Editor reviews and provides feedback',
      'Author makes revisions if needed',
      'Editor approves or requests more changes',
      'Approved articles can be published',
    ],
  });
}
