/**
 * Editorial Review API
 * 
 * Handles editor actions: assign, start review, approve, reject, request changes
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/activity-logger';
import { sendEmail } from '@/lib/email';

// Roles that can perform editorial actions
const EDITOR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

// Helper to check editor access
async function checkEditorAccess(session: any) {
  if (!session?.user?.email) {
    return { authorized: false, error: 'Unauthorized', status: 401 };
  }
  
  const userRole = (session.user as any).role || 'AUTHOR';
  if (!EDITOR_ROLES.includes(userRole)) {
    return { authorized: false, error: 'Editor access required', status: 403 };
  }
  
  return { authorized: true, userRole };
}

// POST /api/workflow/review - Perform review action
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const accessCheck = await checkEditorAccess(session);
    
    if (!accessCheck.authorized) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    const { postId, action, feedback, priority, deadline } = await request.json();

    if (!postId || !action) {
      return NextResponse.json({ error: 'Post ID and action are required' }, { status: 400 });
    }

    const validActions = ['assign', 'start_review', 'approve', 'reject', 'request_changes', 'set_priority', 'set_deadline'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` }, { status: 400 });
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get or create editorial review
    let review = await prisma.editorialReview.findFirst({
      where: { postId },
    });

    if (!review) {
      review = await prisma.editorialReview.create({
        data: {
          postId,
          status: 'PENDING',
          priority: 'NORMAL',
        },
      });
    }

    const user = session!.user!;
    const userId = (user as any).id || user.email;
    const userName = user.name || user.email || 'Editor';
    const userRole = accessCheck.userRole!;

    let updatedPost: any = post;
    let updatedReview = review;
    let activityAction: any;
    let activityDetails: string | undefined;

    switch (action) {
      case 'assign':
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            reviewerId: userId,
            status: 'ASSIGNED',
            assignedAt: new Date(),
          },
        });
        activityAction = ACTIVITY_ACTIONS.ASSIGNED_TO_EDITOR;
        activityDetails = userName;
        break;

      case 'start_review':
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            reviewerId: userId,
            status: 'IN_REVIEW',
            assignedAt: review.assignedAt || new Date(),
          },
        });
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { status: 'IN_REVIEW' },
        });
        activityAction = ACTIVITY_ACTIONS.REVIEW_STARTED;
        break;

      case 'approve':
        if (!feedback) {
          // Approval without comment is fine
        }
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            notes: feedback || review.notes,
          },
        });
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { status: 'APPROVED' },
        });
        
        // Add feedback to history
        if (feedback) {
          await prisma.editorialFeedback.create({
            data: {
              editorialReviewId: review.id,
              authorId: userId,
              authorName: userName,
              authorRole: userRole,
              type: 'APPROVAL',
              content: feedback,
            },
          });
        }
        
        activityAction = ACTIVITY_ACTIONS.APPROVED;
        activityDetails = feedback;
        
        // Notify author
        await sendEmail({
          to: post.author.email,
          subject: `🎉 Your article has been approved: ${post.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10B981;">Article Approved!</h2>
              <p>Great news! Your article "<strong>${post.title}</strong>" has been approved by our editorial team.</p>
              ${feedback ? `<p><strong>Editor's note:</strong> ${feedback}</p>` : ''}
              <p>Your article is now ready to be published. You can publish it from your writer dashboard.</p>
              <div style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/writer/posts/${postId}" 
                   style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  View Article
                </a>
              </div>
            </div>
          `,
        });
        break;

      case 'reject':
        if (!feedback) {
          return NextResponse.json({ error: 'Feedback is required for rejection' }, { status: 400 });
        }
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
            notes: feedback,
          },
        });
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { status: 'REJECTED' },
        });
        
        // Add feedback to history
        await prisma.editorialFeedback.create({
          data: {
            editorialReviewId: review.id,
            authorId: userId,
            authorName: userName,
            authorRole: userRole,
            type: 'REJECTION',
            content: feedback,
          },
        });
        
        activityAction = ACTIVITY_ACTIONS.REJECTED;
        activityDetails = feedback;
        
        // Notify author
        await sendEmail({
          to: post.author.email,
          subject: `Article Review Update: ${post.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #EF4444;">Article Not Approved</h2>
              <p>Unfortunately, your article "<strong>${post.title}</strong>" was not approved for publication at this time.</p>
              <p><strong>Reason:</strong> ${feedback}</p>
              <p>You may revise the article and resubmit it for review, or contact our editorial team for more guidance.</p>
            </div>
          `,
        });
        break;

      case 'request_changes':
        if (!feedback) {
          return NextResponse.json({ error: 'Feedback is required when requesting changes' }, { status: 400 });
        }
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'CHANGES_REQUESTED',
            reviewedAt: new Date(),
          },
        });
        updatedPost = await prisma.post.update({
          where: { id: postId },
          data: { status: 'CHANGES_REQUESTED' },
        });
        
        // Add feedback to history
        await prisma.editorialFeedback.create({
          data: {
            editorialReviewId: review.id,
            authorId: userId,
            authorName: userName,
            authorRole: userRole,
            type: 'REVISION_REQUEST',
            content: feedback,
          },
        });
        
        activityAction = ACTIVITY_ACTIONS.CHANGES_REQUESTED;
        activityDetails = feedback;
        
        // Notify author
        await sendEmail({
          to: post.author.email,
          subject: `Revisions Requested: ${post.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">Revisions Requested</h2>
              <p>Our editorial team has reviewed your article "<strong>${post.title}</strong>" and would like you to make some changes.</p>
              <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <strong>Requested Changes:</strong>
                <p>${feedback}</p>
              </div>
              <p>Please update your article and resubmit it for review.</p>
              <div style="margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}/writer/posts/${postId}/edit" 
                   style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
                  Edit Article
                </a>
              </div>
            </div>
          `,
        });
        break;

      case 'set_priority':
        if (!priority || !['URGENT', 'HIGH', 'NORMAL', 'LOW'].includes(priority)) {
          return NextResponse.json({ error: 'Valid priority is required' }, { status: 400 });
        }
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: { priority },
        });
        activityAction = ACTIVITY_ACTIONS.PRIORITY_CHANGED;
        activityDetails = priority;
        break;

      case 'set_deadline':
        if (!deadline) {
          return NextResponse.json({ error: 'Deadline is required' }, { status: 400 });
        }
        updatedReview = await prisma.editorialReview.update({
          where: { id: review.id },
          data: { deadline: new Date(deadline) },
        });
        activityAction = ACTIVITY_ACTIONS.DEADLINE_SET;
        activityDetails = new Date(deadline).toLocaleDateString();
        break;
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
      message: `Action '${action}' completed successfully`,
      post: updatedPost,
      review: updatedReview,
    });
  } catch (error) {
    console.error('[Workflow] Review error:', error);
    return NextResponse.json({ error: 'Failed to perform review action' }, { status: 500 });
  }
}

// GET /api/workflow/review - Get review queue
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const accessCheck = await checkEditorAccess(session);
    
    if (!accessCheck.authorized) {
      return NextResponse.json({ error: accessCheck.error }, { status: accessCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Get posts in review queue
    const whereClause: any = {};
    
    if (status === 'all') {
      whereClause.status = {
        in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED'],
      };
    } else {
      // Map status to post status
      const statusMap: Record<string, string> = {
        PENDING: 'PENDING_REVIEW',
        IN_REVIEW: 'IN_REVIEW',
        CHANGES_REQUESTED: 'CHANGES_REQUESTED',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
      };
      whereClause.status = statusMap[status] || 'PENDING_REVIEW';
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
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
        take: limit,
        skip,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    // Get editorial reviews for these posts
    const postIds = posts.map(p => p.id);
    const reviews = await prisma.editorialReview.findMany({
      where: { postId: { in: postIds } },
      include: {
        feedbackHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Combine posts with their reviews
    const postsWithReviews = posts.map(post => ({
      ...post,
      review: reviews.find(r => r.postId === post.id) || null,
    }));

    // Get stats
    const stats = await prisma.post.groupBy({
      by: ['status'],
      where: {
        status: {
          in: ['PENDING_REVIEW', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'],
        },
      },
      _count: true,
    });

    return NextResponse.json({
      posts: postsWithReviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
      stats: stats.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('[Workflow] Get queue error:', error);
    return NextResponse.json({ error: 'Failed to get review queue' }, { status: 500 });
  }
}
