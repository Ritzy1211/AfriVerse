import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Disable caching so spotlights always show latest data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Transform for frontend with populated related articles
    const transformedSpotlights = await Promise.all(
      spotlights.map(async (spotlight) => {
        // Fetch related articles if there are any slugs
        let populatedRelatedArticles: any[] = [];
        
        if (spotlight.relatedArticles && spotlight.relatedArticles.length > 0) {
          const posts = await prisma.post.findMany({
            where: {
              slug: { in: spotlight.relatedArticles },
              status: 'PUBLISHED',
            },
            select: {
              id: true,
              title: true,
              slug: true,
              featuredImage: true,
              category: true,
            },
            take: 4,
          });

          populatedRelatedArticles = posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            image: post.featuredImage || '/assets/images/placeholder.jpg',
            category: post.category,
          }));
        }

        return {
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
          relatedArticles: populatedRelatedArticles,
        };
      })
    );

    return NextResponse.json(transformedSpotlights);
  } catch (error) {
    console.error('Error fetching spotlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spotlights' },
      { status: 500 }
    );
  }
}
