/**
 * Publish Workflow API
 * 
 * Handles publishing actions for approved content
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/activity-logger';
import { sendEmail } from '@/lib/email';

// Roles that can publish content
const PUBLISH_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'SENIOR_WRITER'];

// POST /api/workflow/publish - Publish or unpublish content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    
    const { postId, action, scheduledAt } = await request.json();

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action are required' }, { status: 400 });
    }

    if (!['publish', 'unpublish', 'schedule'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const user = session.user;
    const userId = (user as any).id || user.email;
    const userName = user.name || user.email || 'User';
    const isOwner = post.author.email === user.email;

    // Check publish permissions
    const canPublish = PUBLISH_ROLES.includes(userRole);
    
    // Authors can only publish their own approved content
    if (!canPublish) {
      if (!isOwner) {
        return NextResponse.json({ error: 'Not authorized to publish this content' }, { status: 403 });
      }
      if (post.status !== 'APPROVED') {
        return NextResponse.json({ 
          error: 'Content must be approved before publishing. Current status: ' + post.status 
        }, { status: 403 });
      }
    }

    let updatedPost;
    let activityAction: any;
    let activityDetails: string | undefined;

    switch (action) {
      case 'publish':
        // Editors can publish any approved content, Senior Writers can publish their own
        if (post.status !== 'APPROVED' && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
          return NextResponse.json({ 
            error: 'Only approved content can be published' 
          }, { status: 400 });
        }

        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            scheduledAt: null,
          },
        });

        // Update editorial review
        await prisma.editorialReview.updateMany({
          where: { postId },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });

        activityAction = ACTIVITY_ACTIONS.PUBLISHED;
        
        // Notify author if not self
        if (!isOwner) {
          await sendEmail({
            to: post.author.email,
            subject: `🚀 Your article is now live: ${post.title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10B981;">Your Article is Live!</h2>
                <p>Great news! Your article "<strong>${post.title}</strong>" has been published on AfriVerse.</p>
                <div style="margin-top: 20px;">
                  <a href="${process.env.NEXTAUTH_URL}/${post.category.toLowerCase()}/${post.slug}" 
                     style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                    View Live Article
                  </a>
                </div>
                <p style="margin-top: 20px; color: #666;">Share it on social media to increase your reach!</p>
              </div>
            `,
          });
        }
        break;

      case 'unpublish':
        if (!PUBLISH_ROLES.includes(userRole)) {
          return NextResponse.json({ error: 'Not authorized to unpublish' }, { status: 403 });
        }

        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'APPROVED', // Back to approved, not draft
            publishedAt: null,
          },
        });

        activityAction = ACTIVITY_ACTIONS.UNPUBLISHED;
        break;

      case 'schedule':
        if (!scheduledAt) {
          return NextResponse.json({ error: 'Scheduled date is required' }, { status: 400 });
        }

        const scheduleDate = new Date(scheduledAt);
        if (scheduleDate <= new Date()) {
          return NextResponse.json({ error: 'Scheduled date must be in the future' }, { status: 400 });
        }

        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'SCHEDULED',
            scheduledAt: scheduleDate,
          },
        });

        activityAction = ACTIVITY_ACTIONS.SCHEDULED;
        activityDetails = scheduleDate.toISOString();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log activity
    await logActivity({
      postId,
      userId,
      userName,
      userRole,
      action: activityAction,
      details: activityDetails,
    });

    return NextResponse.json({
      success: true,
      message: `Article ${action}ed successfully`,
      post: updatedPost,
    });
  } catch (error) {
    console.error('[Workflow] Publish error:', error);
    return NextResponse.json({ error: 'Failed to perform publish action' }, { status: 500 });
  }
}
