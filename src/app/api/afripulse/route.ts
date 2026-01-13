import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache the response for 5 minutes
export const revalidate = 300;

// GET /api/afripulse - Public endpoint to get AfriPulse data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};
    if (country) {
      where.country = country;
    }

    // Get pulse data
    const pulseData = await prisma.afriPulseIndex.findMany({
      where,
      orderBy: { overallScore: 'desc' },
      take: limit,
    });

    // Get trending topics
    const topics = await prisma.afriPulseTopic.findMany({
      orderBy: { mentions: 'desc' },
      take: 10,
    });

    // Calculate continental average
    const allCountries = await prisma.afriPulseIndex.findMany({
      select: { overallScore: true },
    });
    
    const continentalAverage = allCountries.length > 0
      ? Math.round(allCountries.reduce((sum, c) => sum + c.overallScore, 0) / allCountries.length)
      : 0;

    // Get most optimistic and pessimistic countries
    const mostOptimistic = await prisma.afriPulseIndex.findFirst({
      orderBy: { overallScore: 'desc' },
    });

    const mostPessimistic = await prisma.afriPulseIndex.findFirst({
      orderBy: { overallScore: 'asc' },
    });

    return NextResponse.json({
      pulseData,
      topics,
      stats: {
        continentalAverage,
        countriesTracked: allCountries.length,
        mostOptimistic: mostOptimistic ? {
          country: mostOptimistic.countryName,
          flag: mostOptimistic.flagEmoji,
          score: mostOptimistic.overallScore,
        } : null,
        mostPessimistic: mostPessimistic ? {
          country: mostPessimistic.countryName,
          flag: mostPessimistic.flagEmoji,
          score: mostPessimistic.overallScore,
        } : null,
        risingCount: pulseData.filter(c => c.overallTrend === 'RISING').length,
        fallingCount: pulseData.filter(c => c.overallTrend === 'FALLING').length,
      },
    });
  } catch (error) {
    console.error('Error fetching AfriPulse data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AfriPulse data' },
      { status: 500 }
    );
  }
}
