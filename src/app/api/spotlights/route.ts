import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/spotlights - Get active spotlights (public API)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || 'homepage';
    const categorySlug = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '3');

    const now = new Date();

    // Build where clause
    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    // Filter by placement
    if (placement) {
      where.placement = placement;
    }

    // Filter by category if provided
    if (categorySlug) {
      where.OR = [
        { categorySlug },
        { categorySlug: null }, // Include global spotlights
      ];
    }

    const spotlights = await prisma.spotlight.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Transform for frontend
    const transformedSpotlights = spotlights.map(spotlight => ({
      id: spotlight.id,
      title: spotlight.title,
      subtitle: spotlight.subtitle,
      quote: spotlight.quote,
      quoteHighlight: spotlight.quoteHighlight,
      mediaType: spotlight.mediaType.toLowerCase(),
      mediaUrl: spotlight.mediaUrl,
      thumbnailUrl: spotlight.thumbnailUrl,
      linkUrl: spotlight.linkUrl,
      linkText: spotlight.linkText,
      overlayPosition: spotlight.overlayPosition,
      textColor: spotlight.textColor,
      highlightColor: spotlight.highlightColor,
      relatedArticles: spotlight.relatedArticles,
    }));

    return NextResponse.json(transformedSpotlights);
  } catch (error) {
    console.error('Error fetching spotlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spotlights' },
      { status: 500 }
    );
  }
}
