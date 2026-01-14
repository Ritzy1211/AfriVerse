/**
 * Activity Logger Service
 * 
 * Tracks all content-related actions for audit trail and compliance.
 * Similar to systems used by Billboard, TechCrunch, and other major publishers.
 */

import { prisma } from '@/lib/prisma';

// Activity action types
export const ACTIVITY_ACTIONS = {
  // Post lifecycle
  POST_CREATED: 'POST_CREATED',
  POST_UPDATED: 'POST_UPDATED',
  POST_DELETED: 'POST_DELETED',
  
  // Workflow actions
  SUBMITTED_FOR_REVIEW: 'SUBMITTED_FOR_REVIEW',
  ASSIGNED_TO_EDITOR: 'ASSIGNED_TO_EDITOR',
  REVIEW_STARTED: 'REVIEW_STARTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  REVISION_SUBMITTED: 'REVISION_SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  SCHEDULED: 'SCHEDULED',
  ARCHIVED: 'ARCHIVED',
  
  // Editorial actions
  FEEDBACK_ADDED: 'FEEDBACK_ADDED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  DEADLINE_SET: 'DEADLINE_SET',
  
  // User actions
  USER_CREATED: 'USER_CREATED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  
  // Settings
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
} as const;

export type ActivityAction = typeof ACTIVITY_ACTIONS[keyof typeof ACTIVITY_ACTIONS];

interface LogActivityParams {
  postId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an editorial activity
 */
export async function logActivity({
  postId,
  userId,
  userName,
  userRole,
  action,
  details,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.editorialActivityLog.create({
      data: {
        postId: postId || 'system',
        userId,
        userName,
        userRole,
        action,
        details,
        metadata: metadata || {},
      },
    });
    
    console.log(`[Activity] ${action} by ${userName} (${userRole})${postId ? ` on post ${postId}` : ''}`);
  } catch (error) {
    // Don't fail the main operation if logging fails
    console.error('[Activity Logger] Failed to log activity:', error);
  }
}

/**
 * Get activity log for a specific post
 */
export async function getPostActivityLog(postId: string, limit = 50) {
  return prisma.editorialActivityLog.findMany({
    where: { postId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get activity log for a specific user
 */
export async function getUserActivityLog(userId: string, limit = 50) {
  return prisma.editorialActivityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get recent activity across all posts
 */
export async function getRecentActivity(options: {
  limit?: number;
  actions?: ActivityAction[];
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const { limit = 100, actions, startDate, endDate } = options;
  
  return prisma.editorialActivityLog.findMany({
    where: {
      ...(actions && { action: { in: actions } }),
      ...(startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get activity stats for dashboard
 */
export async function getActivityStats(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const activities = await prisma.editorialActivityLog.groupBy({
    by: ['action'],
    where: {
      createdAt: { gte: startDate },
    },
    _count: true,
  });
  
  return activities.reduce((acc, item) => {
    acc[item.action] = item._count;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Format activity for display
 */
export function formatActivityMessage(action: ActivityAction, userName: string, details?: string): string {
  const messages: Record<ActivityAction, string> = {
    POST_CREATED: `${userName} created a new article`,
    POST_UPDATED: `${userName} updated the article`,
    POST_DELETED: `${userName} deleted the article`,
    SUBMITTED_FOR_REVIEW: `${userName} submitted for review`,
    ASSIGNED_TO_EDITOR: `Article assigned to ${details || 'editor'}`,
    REVIEW_STARTED: `${userName} started reviewing`,
    CHANGES_REQUESTED: `${userName} requested changes: ${details || ''}`,
    REVISION_SUBMITTED: `${userName} submitted revisions`,
    APPROVED: `${userName} approved the article`,
    REJECTED: `${userName} rejected the article: ${details || ''}`,
    PUBLISHED: `${userName} published the article`,
    UNPUBLISHED: `${userName} unpublished the article`,
    SCHEDULED: `${userName} scheduled for ${details || 'publication'}`,
    ARCHIVED: `${userName} archived the article`,
    FEEDBACK_ADDED: `${userName} added feedback`,
    PRIORITY_CHANGED: `${userName} changed priority to ${details || ''}`,
    DEADLINE_SET: `${userName} set deadline to ${details || ''}`,
    USER_CREATED: `${userName} account created`,
    USER_ROLE_CHANGED: `${userName}'s role changed to ${details || ''}`,
    USER_DEACTIVATED: `${userName} account deactivated`,
    SETTINGS_CHANGED: `${userName} changed settings: ${details || ''}`,
  };
  
  return messages[action] || `${userName} performed ${action}`;
}

/**
 * Get activity icon/color for UI
 */
export function getActivityStyle(action: ActivityAction): { icon: string; color: string; bgColor: string } {
  const styles: Record<string, { icon: string; color: string; bgColor: string }> = {
    POST_CREATED: { icon: '📝', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    POST_UPDATED: { icon: '✏️', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    POST_DELETED: { icon: '🗑️', color: 'text-red-600', bgColor: 'bg-red-100' },
    SUBMITTED_FOR_REVIEW: { icon: '📤', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    ASSIGNED_TO_EDITOR: { icon: '👤', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    REVIEW_STARTED: { icon: '👀', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    CHANGES_REQUESTED: { icon: '🔄', color: 'text-orange-600', bgColor: 'bg-orange-100' },
    REVISION_SUBMITTED: { icon: '📥', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    APPROVED: { icon: '✅', color: 'text-green-600', bgColor: 'bg-green-100' },
    REJECTED: { icon: '❌', color: 'text-red-600', bgColor: 'bg-red-100' },
    PUBLISHED: { icon: '🚀', color: 'text-green-600', bgColor: 'bg-green-100' },
    UNPUBLISHED: { icon: '📥', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    SCHEDULED: { icon: '📅', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    ARCHIVED: { icon: '📦', color: 'text-gray-600', bgColor: 'bg-gray-100' },
    FEEDBACK_ADDED: { icon: '💬', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    PRIORITY_CHANGED: { icon: '🎯', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    DEADLINE_SET: { icon: '⏰', color: 'text-red-600', bgColor: 'bg-red-100' },
    USER_CREATED: { icon: '👤', color: 'text-green-600', bgColor: 'bg-green-100' },
    USER_ROLE_CHANGED: { icon: '🔐', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    USER_DEACTIVATED: { icon: '🚫', color: 'text-red-600', bgColor: 'bg-red-100' },
    SETTINGS_CHANGED: { icon: '⚙️', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  };
  
  return styles[action] || { icon: '📋', color: 'text-gray-600', bgColor: 'bg-gray-100' };
}
