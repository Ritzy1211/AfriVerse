import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/ad-placements - Get all ad placements
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const placements = await prisma.adPlacement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ placements });
  } catch (error) {
    console.error('Error fetching ad placements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad placements' },
      { status: 500 }
    );
  }
}

// POST /api/admin/ad-placements - Create a new ad placement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slot,
      type,
      width,
      height,
      isActive,
      imageUrl,
      linkUrl,
      altText,
      adNetworkCode,
      adNetwork,
      categories,
      countries,
      startDate,
      endDate,
    } = body;

    if (!name || !slot) {
      return NextResponse.json(
        { error: 'Name and slot are required' },
        { status: 400 }
      );
    }

    // Check if slot already exists
    const existing = await prisma.adPlacement.findUnique({
      where: { slot },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A placement with this slot already exists' },
        { status: 400 }
      );
    }

    const placement = await prisma.adPlacement.create({
      data: {
        name,
        slot,
        type: type || 'BANNER',
        width: width || null,
        height: height || null,
        isActive: isActive ?? true,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        altText: altText || null,
        adNetworkCode: adNetworkCode || null,
        adNetwork: adNetwork || null,
        categories: categories || [],
        countries: countries || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(placement, { status: 201 });
  } catch (error) {
    console.error('Error creating ad placement:', error);
    return NextResponse.json(
      { error: 'Failed to create ad placement' },
      { status: 500 }
    );
  }
}
