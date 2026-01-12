import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/impact/[postId] - Get impact score for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const impactScore = await prisma.impactScore.findUnique({
      where: { postId: params.postId },
      include: {
        reports: {
          where: { verified: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!impactScore) {
      return NextResponse.json({ error: 'Impact score not found' }, { status: 404 });
    }

    return NextResponse.json(impactScore);
  } catch (error) {
    console.error('Error fetching impact score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch impact score' },
      { status: 500 }
    );
  }
}
