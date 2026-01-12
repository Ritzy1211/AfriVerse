import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PostStatus, EditorialStatus } from '@prisma/client';

const EDITOR_ROLES = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// POST - Perform editorial action (approve, reject, request changes, publish)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user || !EDITOR_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, message, publishDate, addToHomepage, socialShare } = body;

    const article = await prisma.post.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get existing editorial review
    const existingReview = await prisma.editorialReview.findFirst({
      where: { postId: resolvedParams.id },
    });

    let newStatus: PostStatus;
    let activityDetails: string;

    switch (action) {
      case 'START_REVIEW':
        newStatus = 'IN_REVIEW';
        activityDetails = 'started reviewing the article';
        
        // Update or create editorial review
        if (existingReview) {
          await prisma.editorialReview.update({
            where: { id: existingReview.id },
            data: {
              status: 'IN_REVIEW',
              reviewerId: session.user.id,
              reviewedAt: new Date(),
            },
          });
        } else {
          await prisma.editorialReview.create({
            data: {
              postId: resolvedParams.id,
              status: 'IN_REVIEW',
              reviewerId: session.user.id,
              reviewedAt: new Date(),
            },
          });
        }
        break;

      case 'APPROVE':
        newStatus = 'APPROVED';
        activityDetails = 'approved the article for publication';
        
        await prisma.editorialReview.updateMany({
          where: { postId: resolvedParams.id },
          data: {
            status: 'APPROVED',
          },
        });
        break;

      case 'REJECT':
        newStatus = 'REJECTED';
        activityDetails = `rejected the article${message ? `: ${message}` : ''}`;
        
        await prisma.editorialReview.updateMany({
          where: { postId: resolvedParams.id },
          data: {
            status: 'REJECTED',
            notes: message,
          },
        });

        // Add feedback if message provided
        if (message && existingReview) {
          await prisma.editorialFeedback.create({
            data: {
              editorialReviewId: existingReview.id,
              authorId: session.user.id,
              authorName: session.user.name || 'Unknown',
              authorRole: session.user.role,
              content: message,
              type: 'REJECTION',
              isInternal: false,
            },
          });
        }
        break;

      case 'REQUEST_CHANGES':
        newStatus = 'CHANGES_REQUESTED';
        activityDetails = 'requested changes to the article';
        
        await prisma.editorialReview.updateMany({
          where: { postId: resolvedParams.id },
          data: {
            status: 'CHANGES_REQUESTED',
            notes: message,
          },
        });

        // Add feedback for the writer
        if (message && existingReview) {
          await prisma.editorialFeedback.create({
            data: {
              editorialReviewId: existingReview.id,
              authorId: session.user.id,
              authorName: session.user.name || 'Unknown',
              authorRole: session.user.role,
              content: message,
              type: 'REVISION_REQUEST',
              isInternal: false,
            },
          });
        }
        break;

      case 'PUBLISH':
        const scheduledDate = publishDate ? new Date(publishDate) : null;
        const isScheduled = scheduledDate && scheduledDate > new Date();
        
        newStatus = isScheduled ? 'SCHEDULED' : 'PUBLISHED';
        activityDetails = isScheduled 
          ? `scheduled the article for ${scheduledDate.toLocaleDateString()}`
          : 'published the article';
        
        await prisma.post.update({
          where: { id: resolvedParams.id },
          data: {
            status: newStatus,
            publishedAt: isScheduled ? scheduledDate : new Date(),
            featured: addToHomepage || false,
          },
        });

        const editorialStatus: EditorialStatus = isScheduled ? 'APPROVED' : 'PUBLISHED';
        await prisma.editorialReview.updateMany({
          where: { postId: resolvedParams.id },
          data: {
            status: editorialStatus,
            publishedAt: isScheduled ? scheduledDate : new Date(),
          },
        });

        // Log social share intent (would integrate with actual social APIs)
        if (socialShare) {
          await prisma.editorialActivityLog.create({
            data: {
              postId: resolvedParams.id,
              userId: session.user.id,
              userName: session.user.name || 'Unknown',
              userRole: session.user.role,
              action: 'SOCIAL_SHARE',
              details: 'queued article for social media distribution',
            },
          });
        }
        
        // Log the main activity and return
        await prisma.editorialActivityLog.create({
          data: {
            postId: resolvedParams.id,
            userId: session.user.id,
            userName: session.user.name || 'Unknown',
            userRole: session.user.role,
            action: action,
            details: activityDetails,
          },
        });
        
        return NextResponse.json({ success: true, status: newStatus });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update article status
    await prisma.post.update({
      where: { id: resolvedParams.id },
      data: { status: newStatus },
    });

    // Log the activity
    await prisma.editorialActivityLog.create({
      data: {
        postId: resolvedParams.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userRole: session.user.role,
        action: action,
        details: activityDetails,
      },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('Error performing action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
