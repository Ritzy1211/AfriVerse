import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch writer's own articles only
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // ALWAYS filter by author - writers can only see their own articles
    const where: any = {
      authorId: session.user.id,
    };

    // Handle status filter (can be comma-separated)
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      where.status = { in: statuses };
    }

    const articles = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        views: true,
        category: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching writer articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
