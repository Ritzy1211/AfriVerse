import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Role check helper
const hasPermission = (userRole: string, minRole: string): boolean => {
  const ROLE_LEVEL: Record<string, number> = {
    CONTRIBUTOR: 1,
    AUTHOR: 2,
    SENIOR_WRITER: 3,
    EDITOR: 4,
    ADMIN: 5,
    SUPER_ADMIN: 6,
  };
  return (ROLE_LEVEL[userRole] || 0) >= (ROLE_LEVEL[minRole] || 0);
};

// GET /api/admin/afripulse/topics - Get all topics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await prisma.afriPulseTopic.findMany({
      orderBy: { mentions: 'desc' },
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST /api/admin/afripulse/topics - Create new topic
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { topic, category, sentimentScore, trend, mentions } = body;

    if (!topic || !category) {
      return NextResponse.json(
        { error: 'Topic and category are required' },
        { status: 400 }
      );
    }

    const newTopic = await prisma.afriPulseTopic.create({
      data: {
        topic,
        category,
        sentimentScore: sentimentScore || 50,
        trend: trend || 'STABLE',
        mentions: mentions || 0,
      },
    });

    return NextResponse.json(newTopic, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/afripulse/topics - Update topic
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, sentimentScore, trend, mentions } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.afriPulseTopic.update({
      where: { id },
      data: {
        sentimentScore,
        trend: trend as any,
        mentions,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/afripulse/topics - Delete topic
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    await prisma.afriPulseTopic.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
