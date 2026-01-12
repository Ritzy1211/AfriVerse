import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get specific editorial review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = params.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check permissions - must be author, editor, or admin
    const isAuthor = post.authorId === user.id;
    const isEditor = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role);

    if (!isAuthor && !isEditor) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const review = await prisma.editorialReview.findFirst({
      where: { postId },
      include: {
        feedbackHistory: {
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    // Get activity log
    const activityLog = await prisma.editorialActivityLog.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get publishing rules for this category
    const rules = await prisma.publishingRule.findUnique({
      where: { category: post.category }
    });

    return NextResponse.json({
      post,
      review,
      activityLog,
      rules,
    });
  } catch (error) {
    console.error('Error fetching editorial review:', error);
    return NextResponse.json(
      { error: 'Failed to fetch editorial review' },
      { status: 500 }
    );
  }
}

// PUT - Update editorial review (assign, approve, reject, request changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const postId = params.id;
    const body = await request.json();
    const { action, feedback, priority, notes, assignTo } = body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check category assignment for editors
    if (user.role === 'EDITOR') {
      const assignment = await prisma.editorialAssignment.findFirst({
        where: {
          userId: user.id,
          category: post.category,
        }
      });

      if (!assignment) {
        return NextResponse.json(
          { error: 'Not assigned to this category' },
          { status: 403 }
        );
      }

      // Check specific permissions
      if (action === 'APPROVE' && !assignment.canApprove) {
        return NextResponse.json(
          { error: 'No approval permission for this category' },
          { status: 403 }
        );
      }

      if (action === 'PUBLISH' && !assignment.canPublish) {
        return NextResponse.json(
          { error: 'No publish permission for this category' },
          { status: 403 }
        );
      }
    }

    // Get or create review
    let review = await prisma.editorialReview.findFirst({
      where: { postId }
    });

    if (!review) {
      review = await prisma.editorialReview.create({
        data: {
          postId,
          status: 'PENDING',
        }
      });
    }

    let newPostStatus = post.status;
    let newReviewStatus = review.status;
    let logAction = action;
    let logDetails = '';

    switch (action) {
      case 'ASSIGN':
        // Assign to reviewer
        newReviewStatus = 'ASSIGNED';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            reviewerId: assignTo || user.id,
            status: 'ASSIGNED',
            assignedAt: new Date(),
            priority: priority || review.priority,
          }
        });
        logDetails = `Assigned to reviewer`;
        break;

      case 'START_REVIEW':
        // Begin reviewing
        newReviewStatus = 'IN_REVIEW';
        newPostStatus = 'IN_REVIEW';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            reviewerId: user.id,
            status: 'IN_REVIEW',
          }
        });
        logDetails = 'Started reviewing';
        break;

      case 'REQUEST_CHANGES':
        // Send back for revisions
        if (!feedback) {
          return NextResponse.json(
            { error: 'Feedback is required when requesting changes' },
            { status: 400 }
          );
        }
        newReviewStatus = 'CHANGES_REQUESTED';
        newPostStatus = 'CHANGES_REQUESTED';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'CHANGES_REQUESTED',
          }
        });
        // Add feedback
        await prisma.editorialFeedback.create({
          data: {
            editorialReviewId: review.id,
            authorId: user.id,
            authorName: user.name || user.email,
            authorRole: user.role,
            type: 'REVISION_REQUEST',
            content: feedback,
          }
        });
        logDetails = 'Requested changes from author';
        break;

      case 'APPROVE':
        // Approve - only SUPER_ADMIN and ADMIN can give final approval
        if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
          // Editors can only recommend approval
          newReviewStatus = 'APPROVED';
          newPostStatus = 'APPROVED';
          await prisma.editorialReview.update({
            where: { id: review.id },
            data: {
              status: 'APPROVED',
              reviewedAt: new Date(),
            }
          });
          logDetails = 'Recommended for approval';
          logAction = 'RECOMMEND_APPROVAL';
        } else {
          newReviewStatus = 'APPROVED';
          newPostStatus = 'APPROVED';
          await prisma.editorialReview.update({
            where: { id: review.id },
            data: {
              status: 'APPROVED',
              reviewedAt: new Date(),
            }
          });
          if (feedback) {
            await prisma.editorialFeedback.create({
              data: {
                editorialReviewId: review.id,
                authorId: user.id,
                authorName: user.name || user.email,
                authorRole: user.role,
                type: 'APPROVAL',
                content: feedback,
              }
            });
          }
          logDetails = 'Approved for publication';
        }
        break;

      case 'REJECT':
        // Reject publication
        if (!feedback) {
          return NextResponse.json(
            { error: 'Reason is required when rejecting' },
            { status: 400 }
          );
        }
        newReviewStatus = 'REJECTED';
        newPostStatus = 'REJECTED';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'REJECTED',
            reviewedAt: new Date(),
          }
        });
        await prisma.editorialFeedback.create({
          data: {
            editorialReviewId: review.id,
            authorId: user.id,
            authorName: user.name || user.email,
            authorRole: user.role,
            type: 'REJECTION',
            content: feedback,
          }
        });
        logDetails = 'Rejected for publication';
        break;

      case 'PUBLISH':
        // Publish the post - only SUPER_ADMIN and ADMIN
        if (!['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
          return NextResponse.json(
            { error: 'Only Super Admin or Admin can publish' },
            { status: 403 }
          );
        }
        newReviewStatus = 'PUBLISHED';
        newPostStatus = 'PUBLISHED';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          }
        });
        await prisma.post.update({
          where: { id: postId },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          }
        });
        logDetails = 'Published post';
        break;

      case 'HOLD':
        // Put on hold
        newReviewStatus = 'ON_HOLD';
        await prisma.editorialReview.update({
          where: { id: review.id },
          data: {
            status: 'ON_HOLD',
            notes: notes || review.notes,
          }
        });
        logDetails = notes || 'Put on hold';
        break;

      case 'ADD_NOTE':
        // Add internal note
        if (notes) {
          await prisma.editorialFeedback.create({
            data: {
              editorialReviewId: review.id,
              authorId: user.id,
              authorName: user.name || user.email,
              authorRole: user.role,
              type: 'COMMENT',
              content: notes,
              isInternal: true,
            }
          });
        }
        logDetails = 'Added internal note';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update post status if changed
    if (newPostStatus !== post.status && action !== 'PUBLISH') {
      await prisma.post.update({
        where: { id: postId },
        data: { status: newPostStatus }
      });
    }

    // Log activity
    await prisma.editorialActivityLog.create({
      data: {
        postId,
        userId: user.id,
        userName: user.name || user.email,
        userRole: user.role,
        action: logAction,
        details: logDetails,
      }
    });

    // Fetch updated review
    const updatedReview = await prisma.editorialReview.findFirst({
      where: { postId },
      include: {
        feedbackHistory: {
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    return NextResponse.json({
      message: `Action ${action} completed`,
      review: updatedReview,
      postStatus: newPostStatus,
    });
  } catch (error) {
    console.error('Error updating editorial review:', error);
    return NextResponse.json(
      { error: 'Failed to update editorial review' },
      { status: 500 }
    );
  }
}
