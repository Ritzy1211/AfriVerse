/**
 * Activity Log API
 * 
 * Provides access to editorial activity logs for audit and compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getActivityStyle, formatActivityMessage } from '@/lib/activity-logger';

// Roles that can view activity logs
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const EDITOR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR'];

// GET /api/workflow/activity - Get activity logs
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    
    // Only editors and above can view activity logs
    if (!EDITOR_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (postId) {
      whereClause.postId = postId;
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (action) {
      whereClause.action = action;
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // Non-admins can only see limited activity
    if (!ADMIN_ROLES.includes(userRole)) {
      // Editors can only see content-related activity, not user management
      whereClause.action = {
        notIn: ['USER_CREATED', 'USER_ROLE_CHANGED', 'USER_DEACTIVATED', 'SETTINGS_CHANGED'],
      };
    }

    const [activities, total] = await Promise.all([
      prisma.editorialActivityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.editorialActivityLog.count({ where: whereClause }),
    ]);

    // Enhance activities with formatting
    const enhancedActivities = activities.map(activity => ({
      ...activity,
      message: formatActivityMessage(activity.action as any, activity.userName, activity.details || undefined),
      style: getActivityStyle(activity.action as any),
    }));

    // Get action stats for filters
    const actionStats = await prisma.editorialActivityLog.groupBy({
      by: ['action'],
      _count: true,
      orderBy: { _count: { action: 'desc' } },
    });

    // Get user stats (who is most active)
    const userStats = await prisma.editorialActivityLog.groupBy({
      by: ['userId', 'userName'],
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      activities: enhancedActivities,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
        limit,
      },
      stats: {
        byAction: actionStats.reduce((acc, s) => {
          acc[s.action] = s._count;
          return acc;
        }, {} as Record<string, number>),
        byUser: userStats.map(u => ({
          userId: u.userId,
          userName: u.userName,
          count: u._count,
        })),
      },
    });
  } catch (error) {
    console.error('[Activity] Get logs error:', error);
    return NextResponse.json({ error: 'Failed to get activity logs' }, { status: 500 });
  }
}

// GET /api/workflow/activity/stats - Get activity statistics
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { days = 7 } = await request.json().catch(() => ({ days: 7 }));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Activity by day
    const activitiesByDay = await prisma.editorialActivityLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Group by actual day
    const dailyStats: Record<string, number> = {};
    activitiesByDay.forEach(a => {
      const day = a.createdAt.toISOString().split('T')[0];
      dailyStats[day] = (dailyStats[day] || 0) + a._count;
    });

    // Top actions
    const topActions = await prisma.editorialActivityLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    });

    // Most active users
    const activeUsers = await prisma.editorialActivityLog.groupBy({
      by: ['userId', 'userName', 'userRole'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    // Content velocity (posts through workflow)
    const contentStats = await prisma.post.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days,
      },
      dailyActivity: dailyStats,
      topActions: topActions.map(a => ({
        action: a.action,
        count: a._count,
        style: getActivityStyle(a.action as any),
      })),
      activeUsers: activeUsers.map(u => ({
        userId: u.userId,
        userName: u.userName,
        userRole: u.userRole,
        count: u._count,
      })),
      contentByStatus: contentStats.reduce((acc, s) => {
        acc[s.status] = s._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('[Activity] Stats error:', error);
    return NextResponse.json({ error: 'Failed to get activity stats' }, { status: 500 });
  }
}
