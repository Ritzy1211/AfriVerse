import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all editorial assignments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');

    const filter: any = {};
    if (userId) filter.userId = userId;
    if (category) filter.category = category;

    const assignments = await prisma.editorialAssignment.findMany({
      where: filter,
      orderBy: [{ category: 'asc' }]
    });

    // Get user details for assignments
    const userIds = [...new Set(assignments.map(a => a.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      }
    });

    const userMap = new Map(users.map(u => [u.id, u]));
    const assignmentsWithUsers = assignments.map(a => ({
      ...a,
      user: userMap.get(a.userId),
    }));

    return NextResponse.json({ assignments: assignmentsWithUsers });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST - Create or update editorial assignment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can manage editorial assignments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, category, canApprove, canPublish } = body;

    if (!userId || !category) {
      return NextResponse.json(
        { error: 'User ID and category are required' },
        { status: 400 }
      );
    }

    // Verify user exists and is an editor
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(targetUser.role)) {
      return NextResponse.json(
        { error: 'User must be an Editor or Admin to have assignments' },
        { status: 400 }
      );
    }

    const assignment = await prisma.editorialAssignment.upsert({
      where: {
        userId_category: {
          userId,
          category,
        }
      },
      update: {
        canApprove: canApprove ?? false,
        canPublish: canPublish ?? false,
      },
      create: {
        userId,
        category,
        canApprove: canApprove ?? false,
        canPublish: canPublish ?? false,
      }
    });

    return NextResponse.json({
      message: 'Assignment saved',
      assignment,
    });
  } catch (error) {
    console.error('Error saving assignment:', error);
    return NextResponse.json(
      { error: 'Failed to save assignment' },
      { status: 500 }
    );
  }
}

// DELETE - Remove editorial assignment
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can manage editorial assignments' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    await prisma.editorialAssignment.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove assignment' },
      { status: 500 }
    );
  }
}
