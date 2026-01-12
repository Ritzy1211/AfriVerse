import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/storytellers/[id] - Get specific storyteller public profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First try to find by storyteller ID
    let storyteller = await prisma.verifiedStoryteller.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // If not found, try by userId
    if (!storyteller) {
      storyteller = await prisma.verifiedStoryteller.findUnique({
        where: { userId: params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    if (!storyteller) {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 });
    }

    // Only return verified/featured storytellers publicly
    if (storyteller.status !== 'VERIFIED' && storyteller.status !== 'FEATURED') {
      return NextResponse.json({ error: 'Storyteller not found' }, { status: 404 });
    }

    // Get their impactful articles
    const impactfulArticles = await prisma.post.findMany({
      where: {
        authorId: storyteller.userId,
        status: 'PUBLISHED',
        impactScore: { isNot: null },
      },
      include: {
        impactScore: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Sort by impact score manually and take top 5
    const sortedArticles = impactfulArticles
      .sort((a, b) => (b.impactScore?.overallScore || 0) - (a.impactScore?.overallScore || 0))
      .slice(0, 5);

    return NextResponse.json({
      storyteller,
      impactfulArticles: sortedArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        impactScore: a.impactScore?.overallScore,
        impactLevel: a.impactScore?.level,
      })),
    });
  } catch (error) {
    console.error('Error fetching storyteller:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storyteller' },
      { status: 500 }
    );
  }
}
