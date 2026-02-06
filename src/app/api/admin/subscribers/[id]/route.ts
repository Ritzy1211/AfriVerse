import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/subscribers/[id] - Update subscriber
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isPremium, status, name } = body;

    const updateData: any = {};
    
    if (isPremium !== undefined) {
      updateData.isPremium = isPremium;
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    if (name !== undefined) {
      updateData.name = name;
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to update subscriber' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subscribers/[id] - Delete subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.subscriber.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Subscriber deleted' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscriber' },
      { status: 500 }
    );
  }
}
