import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  expiresAt?: Date;
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, link, expiresAt } = params;
  
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
        expiresAt,
        read: false,
      },
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        expiresAt: notification.expiresAt,
        read: false,
      })),
    });
    
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

/**
 * Notify author about post status change
 */
export async function notifyPostStatusChange(
  authorId: string,
  postTitle: string,
  postSlug: string,
  newStatus: string,
  editorName?: string,
  feedback?: string
) {
  let title = '';
  let message = '';
  
  switch (newStatus) {
    case 'REVIEW':
    case 'PENDING_REVIEW':
      title = '📝 Post Submitted for Review';
      message = `Your post "${postTitle}" has been submitted for editorial review. You'll be notified once it's been reviewed.`;
      break;
    case 'IN_REVIEW':
      title = '👀 Post Under Review';
      message = `Your post "${postTitle}" is currently being reviewed by ${editorName || 'an editor'}.`;
      break;
    case 'APPROVED':
    case 'PUBLISHED':
      title = '🎉 Post Published!';
      message = `Great news! Your post "${postTitle}" has been approved and published.${editorName ? ` Approved by ${editorName}.` : ''}`;
      break;
    case 'REJECTED':
      title = '❌ Post Needs Revision';
      message = `Your post "${postTitle}" was not approved.${feedback ? ` Feedback: ${feedback}` : ' Please check the editorial notes and make necessary revisions.'}`;
      break;
    case 'REVISION_REQUESTED':
      title = '✏️ Revisions Requested';
      message = `Your post "${postTitle}" needs some changes.${feedback ? ` Feedback: ${feedback}` : ' Please review the comments and update your post.'}`;
      break;
    case 'DRAFT':
      title = '📋 Post Saved as Draft';
      message = `Your post "${postTitle}" has been saved as a draft. You can continue editing and submit it for review when ready.`;
      break;
    case 'SCHEDULED':
      title = '🗓️ Post Scheduled';
      message = `Your post "${postTitle}" has been scheduled for publication.`;
      break;
    default:
      title = '📰 Post Status Updated';
      message = `Your post "${postTitle}" status has been updated to ${newStatus.toLowerCase().replace('_', ' ')}.`;
  }
  
  return createNotification({
    userId: authorId,
    type: 'POST_STATUS',
    title,
    message,
    link: `/admin/posts/${postSlug}/edit`,
  });
}

/**
 * Notify editors about new post submission
 */
export async function notifyEditorsNewSubmission(
  postTitle: string,
  postId: string,
  authorName: string
) {
  try {
    // Get all editors and admins
    const editors = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'],
        },
      },
      select: { id: true },
    });
    
    if (editors.length === 0) return null;
    
    return createBulkNotifications(
      editors.map((e) => e.id),
      {
        type: 'EDITORIAL',
        title: '📥 New Post for Review',
        message: `"${postTitle}" by ${authorName} has been submitted for review.`,
        link: `/admin/editorial?tab=pending`,
      }
    );
  } catch (error) {
    console.error('Error notifying editors:', error);
    throw error;
  }
}

/**
 * Notify author about new comment on their post
 */
export async function notifyNewComment(
  authorId: string,
  postTitle: string,
  postSlug: string,
  commenterName: string
) {
  return createNotification({
    userId: authorId,
    type: 'COMMENT',
    title: '💬 New Comment',
    message: `${commenterName} commented on your post "${postTitle}".`,
    link: `/${postSlug}#comments`,
  });
}
