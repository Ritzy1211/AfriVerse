import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to validate ObjectId format
function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// GET /api/admin/ad-placements/[id] - Get single ad placement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const placement = await prisma.adPlacement.findUnique({
      where: { id: params.id },
    });

    if (!placement) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
    }

    return NextResponse.json(placement);
  } catch (error) {
    console.error('Error fetching ad placement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad placement' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/ad-placements/[id] - Update ad placement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();

    const existing = await prisma.adPlacement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
    }

    // If slot is being changed, check for duplicates
    if (body.slot && body.slot !== existing.slot) {
      const duplicate = await prisma.adPlacement.findUnique({
        where: { slot: body.slot },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: 'A placement with this slot already exists' },
          { status: 400 }
        );
      }
    }

    const placement = await prisma.adPlacement.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        slot: body.slot ?? existing.slot,
        type: body.type ?? existing.type,
        width: body.width !== undefined ? body.width : existing.width,
        height: body.height !== undefined ? body.height : existing.height,
        isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        linkUrl: body.linkUrl !== undefined ? body.linkUrl : existing.linkUrl,
        altText: body.altText !== undefined ? body.altText : existing.altText,
        adNetworkCode: body.adNetworkCode !== undefined ? body.adNetworkCode : existing.adNetworkCode,
        adNetwork: body.adNetwork !== undefined ? body.adNetwork : existing.adNetwork,
        categories: body.categories ?? existing.categories,
        countries: body.countries ?? existing.countries,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
      },
    });

    return NextResponse.json(placement);
  } catch (error) {
    console.error('Error updating ad placement:', error);
    return NextResponse.json(
      { error: 'Failed to update ad placement' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ad-placements/[id] - Delete ad placement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const existing = await prisma.adPlacement.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
    }

    await prisma.adPlacement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Ad placement deleted' });
  } catch (error) {
    console.error('Error deleting ad placement:', error);
    return NextResponse.json(
      { error: 'Failed to delete ad placement' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ad-placements/[id]/stats - Record impression or click
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This can be called without auth for tracking
    if (!isValidObjectId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // 'impression' or 'click'

    if (!action || !['impression', 'click'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const placement = await prisma.adPlacement.update({
      where: { id: params.id },
      data: {
        [action === 'impression' ? 'impressions' : 'clicks']: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating ad stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
