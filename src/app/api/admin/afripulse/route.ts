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

// GET /api/admin/afripulse - Get all AfriPulse data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    const where: any = {};
    if (country) {
      where.country = country;
    }

    const pulseData = await prisma.afriPulseIndex.findMany({
      where,
      orderBy: { lastUpdated: 'desc' },
    });

    // Get trending topics
    const topics = await prisma.afriPulseTopic.findMany({
      orderBy: { mentions: 'desc' },
      take: 10,
    });

    return NextResponse.json({ pulseData, topics });
  } catch (error) {
    console.error('Error fetching AfriPulse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AfriPulse data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/afripulse - Create new country entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as string, 'EDITOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      country,
      countryName,
      flagEmoji,
      economyScore,
      politicsScore,
      socialScore,
      techScore,
      economyTrend,
      politicsTrend,
      socialTrend,
      techTrend,
      topStory,
      topStoryUrl,
      keyIndicators,
    } = body;

    // Validate required fields
    if (!country || !countryName) {
      return NextResponse.json(
        { error: 'Country code and name are required' },
        { status: 400 }
      );
    }

    // Check if country already exists
    const existing = await prisma.afriPulseIndex.findUnique({
      where: { country },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Country already exists in AfriPulse Index' },
        { status: 409 }
      );
    }

    // Calculate overall score and trend
    const overallScore = Math.round(
      (economyScore + politicsScore + socialScore + techScore) / 4
    );

    const determineTrend = (trends: string[]): string => {
      const risingCount = trends.filter((t) => t === 'RISING').length;
      const fallingCount = trends.filter((t) => t === 'FALLING').length;
      if (risingCount >= 3) return 'RISING';
      if (fallingCount >= 3) return 'FALLING';
      if (risingCount > 0 && fallingCount > 0) return 'VOLATILE';
      return 'STABLE';
    };

    const overallTrend = determineTrend([economyTrend, politicsTrend, socialTrend, techTrend]);

    const pulseEntry = await prisma.afriPulseIndex.create({
      data: {
        country,
        countryName,
        flagEmoji: flagEmoji || '',
        economyScore: economyScore || 50,
        politicsScore: politicsScore || 50,
        socialScore: socialScore || 50,
        techScore: techScore || 50,
        overallScore,
        economyTrend: (economyTrend || 'STABLE') as any,
        politicsTrend: (politicsTrend || 'STABLE') as any,
        socialTrend: (socialTrend || 'STABLE') as any,
        techTrend: (techTrend || 'STABLE') as any,
        overallTrend: overallTrend as any,
        topStory: topStory || null,
        topStoryUrl: topStoryUrl || null,
        keyIndicators: keyIndicators || [],
      },
    });

    return NextResponse.json(pulseEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating AfriPulse entry:', error);
    return NextResponse.json(
      { error: 'Failed to create AfriPulse entry' },
      { status: 500 }
    );
  }
}
