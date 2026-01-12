import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/analytics/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total posts
    const totalPosts = await prisma.post.count();

    // Get total views (sum of all post views)
    const viewsResult = await prisma.post.aggregate({
      _sum: {
        views: true,
      },
    });
    const totalViews = viewsResult._sum?.views || 0;

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total comments
    const totalComments = await prisma.comment.count();

    // Get published posts count
    const publishedPosts = await prisma.post.count({
      where: { status: 'PUBLISHED' },
    });

    // Get draft posts count
    const draftPosts = await prisma.post.count({
      where: { status: 'DRAFT' },
    });

    // Get posts created in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    // Get comments created in the last 7 days
    const recentComments = await prisma.comment.count({
      where: {
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    return NextResponse.json({
      totalPosts,
      totalViews,
      totalUsers,
      totalComments,
      publishedPosts,
      draftPosts,
      recentPosts,
      recentComments,
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    );
  }
}
