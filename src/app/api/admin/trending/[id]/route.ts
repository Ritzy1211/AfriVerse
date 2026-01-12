import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single trending topic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const trendingTopic = await prisma.trendingTopic.findUnique({
      where: { id },
    });

    if (!trendingTopic) {
      return NextResponse.json({ error: 'Trending topic not found' }, { status: 404 });
    }

    return NextResponse.json(trendingTopic);
  } catch (error) {
    console.error('Error fetching trending topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topic' },
      { status: 500 }
    );
  }
}

// PUT - Update a trending topic
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, url, category, upiScore, trend, isActive, order, expiresAt } = body;

    const trendingTopic = await prisma.trendingTopic.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(url && { url }),
        ...(category && { category }),
        ...(upiScore !== undefined && { upiScore }),
        ...(trend && { trend: trend.toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json(trendingTopic);
  } catch (error) {
    console.error('Error updating trending topic:', error);
    return NextResponse.json(
      { error: 'Failed to update trending topic' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a trending topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.trendingTopic.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Trending topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting trending topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete trending topic' },
      { status: 500 }
    );
  }
}
