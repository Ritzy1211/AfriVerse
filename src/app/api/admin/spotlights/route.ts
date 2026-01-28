import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Roles that can manage spotlights
const CAN_MANAGE_SPOTLIGHTS = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];

// GET /api/admin/spotlights - Get all spotlights
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const placement = searchParams.get('placement');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (placement && placement !== 'all') {
      where.placement = placement;
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Get spotlights with pagination
    const [spotlights, total] = await Promise.all([
      prisma.spotlight.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.spotlight.count({ where }),
    ]);

    return NextResponse.json({
      spotlights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching spotlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spotlights' },
      { status: 500 }
    );
  }
}

// POST /api/admin/spotlights - Create a new spotlight
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    if (!CAN_MANAGE_SPOTLIGHTS.includes(userRole)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
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

    // Validate required fields
    if (!title || !mediaUrl) {
      return NextResponse.json(
        { error: 'Title and media URL are required' },
        { status: 400 }
      );
    }

    const spotlight = await prisma.spotlight.create({
      data: {
        title,
        subtitle,
        quote,
        quoteHighlight,
        mediaType: mediaType || 'IMAGE',
        mediaUrl,
        thumbnailUrl,
        linkUrl,
        linkText,
        overlayPosition: overlayPosition || 'left',
        textColor: textColor || '#FFFFFF',
        highlightColor: highlightColor || '#00D9FF',
        placement: placement || 'homepage',
        categorySlug,
        isActive: isActive ?? true,
        priority: priority || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        relatedArticles: relatedArticles || [],
        createdBy: session.user.id,
        createdByName: session.user.name || session.user.email || 'Unknown',
      },
    });

    return NextResponse.json(spotlight, { status: 201 });
  } catch (error) {
    console.error('Error creating spotlight:', error);
    return NextResponse.json(
      { error: 'Failed to create spotlight' },
      { status: 500 }
    );
  }
}
