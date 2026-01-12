import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all trending topics (including inactive) for admin
export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trendingTopics = await prisma.trendingTopic.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}

// POST - Create a new trending topic
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, url, category, upiScore, trend, isActive, order, expiresAt } = body;

    if (!title || !url || !category) {
      return NextResponse.json(
        { error: 'Title, URL, and category are required' },
        { status: 400 }
      );
    }

    const trendingTopic = await prisma.trendingTopic.create({
      data: {
        title,
        url,
        category,
        upiScore: upiScore || 50,
        trend: trend?.toUpperCase() || 'STABLE',
        isActive: isActive ?? true,
        order: order || 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(trendingTopic, { status: 201 });
  } catch (error) {
    console.error('Error creating trending topic:', error);
    return NextResponse.json(
      { error: 'Failed to create trending topic' },
      { status: 500 }
    );
  }
}
