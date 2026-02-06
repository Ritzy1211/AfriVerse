import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

// Roles that can manage spotlights
const CAN_MANAGE_SPOTLIGHTS = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// GET /api/admin/spotlights/[id] - Get a single spotlight
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const spotlight = await prisma.spotlight.findUnique({
      where: { id },
    });

    if (!spotlight) {
      return NextResponse.json({ error: 'Spotlight not found' }, { status: 404 });
    }

    return NextResponse.json(spotlight);
  } catch (error) {
    console.error('Error fetching spotlight:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spotlight' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/spotlights/[id] - Update a spotlight
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!CAN_MANAGE_SPOTLIGHTS.includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if spotlight exists
    const existing = await prisma.spotlight.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Spotlight not found' }, { status: 404 });
    }

    const {
      title,
      subtitle,
      quote,
      quoteHighlight,
      mediaType,
      mediaUrl,
      thumbnailUrl,
      linkUrl,
      linkText,
      overlayPosition,
      textColor,
      highlightColor,
      placement,
      categorySlug,
      isActive,
      priority,
      startDate,
      endDate,
      relatedArticles,
    } = body;

    const spotlight = await prisma.spotlight.update({
      where: { id },
      data: {
        title,
        subtitle,
        quote,
        quoteHighlight,
        mediaType,
        mediaUrl,
        thumbnailUrl,
        linkUrl,
        linkText,
        overlayPosition,
        textColor,
        highlightColor,
        placement,
        categorySlug,
        isActive,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        relatedArticles: relatedArticles || [],
      },
    });

    // Revalidate so spotlight changes appear immediately
    revalidateTag('spotlights');
    revalidatePath('/', 'layout');

    return NextResponse.json(spotlight);
  } catch (error) {
    console.error('Error updating spotlight:', error);
    return NextResponse.json(
      { error: 'Failed to update spotlight' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/spotlights/[id] - Delete a spotlight
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!CAN_MANAGE_SPOTLIGHTS.includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id } = await params;

    // Check if spotlight exists
    const existing = await prisma.spotlight.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Spotlight not found' }, { status: 404 });
    }

    await prisma.spotlight.delete({
      where: { id },
    });

    // Revalidate so deletion reflects immediately
    revalidateTag('spotlights');
    revalidatePath('/', 'layout');

    return NextResponse.json({ message: 'Spotlight deleted successfully' });
  } catch (error) {
    console.error('Error deleting spotlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete spotlight' },
      { status: 500 }
    );
  }
}
