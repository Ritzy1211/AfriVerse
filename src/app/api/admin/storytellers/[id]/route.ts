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

// GET /api/admin/storytellers/[id] - Get specific storyteller or application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find as storyteller first
    const storyteller = await prisma.verifiedStoryteller.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (storyteller) {
      return NextResponse.json({ type: 'storyteller', data: storyteller });
    }

    // Try as application (no user relation on applications)
    const application = await prisma.storytellerApplication.findUnique({
      where: { id: params.id },
    });

    if (application) {
      return NextResponse.json({ type: 'application', data: application });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching storyteller:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/storytellers/[id] - Update storyteller or application
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'storyteller') {
      const { badgeLevel, status, trustScore, articlesCount, verifiedImpacts } = data;

      const updated = await prisma.verifiedStoryteller.update({
        where: { id: params.id },
        data: {
          ...(badgeLevel && { badgeLevel: badgeLevel as any }),
          ...(status && { status: status as any }),
          ...(trustScore !== undefined && { trustScore }),
          ...(articlesCount !== undefined && { articlesCount }),
          ...(verifiedImpacts !== undefined && { verifiedImpacts }),
        },
      });

      return NextResponse.json(updated);
    }

    if (type === 'application') {
      const { status, reviewNotes } = data;

      const updated = await prisma.storytellerApplication.update({
        where: { id: params.id },
        data: {
          status: status as any,
          reviewNotes,
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: 'Invalid type specified' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating storyteller:', error);
    return NextResponse.json(
      { error: 'Failed to update' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/storytellers/[id] - Delete/revoke storyteller
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'storyteller';

    if (type === 'storyteller') {
      // Just update status to REVOKED instead of hard delete
      await prisma.verifiedStoryteller.update({
        where: { id: params.id },
        data: { status: 'REVOKED' },
      });
    } else if (type === 'application') {
      await prisma.storytellerApplication.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
