import { NextResponse } from 'next/server';

// Fallback topics - used when database is unavailable
const fallbackTopics = [
  { id: '1', title: 'Nigerian Tech Startups Raise $500M in 2024', upiScore: 95, trend: 'up' as const, category: 'Business', url: '/business/nigerian-tech-startups-500m-2024' },
  { id: '2', title: 'Davido World Tour 2025 Announced', upiScore: 88, trend: 'up' as const, category: 'Entertainment', url: '/entertainment/davido-world-tour-2025' },
  { id: '3', title: 'Super Eagles AFCON 2025: Finidi Tactics Analysis', upiScore: 82, trend: 'up' as const, category: 'Sports', url: '/sports/super-eagles-afcon-2025-finidi-tactics' },
  { id: '4', title: 'Lagos Fashion Week 2024 Recap', upiScore: 78, trend: 'up' as const, category: 'Lifestyle', url: '/lifestyle/lagos-fashion-week-2024-recap' },
  { id: '5', title: 'iPhone 16 vs Samsung S24: Nigeria Review', upiScore: 72, trend: 'stable' as const, category: 'Technology', url: '/technology/iphone-16-vs-samsung-s24-nigeria' },
];

// Skip database connection - return fallback immediately for fast loading
// Set to true to use database, false for instant static data
const USE_DATABASE = true;

// GET - Fetch active trending topics
export async function GET() {
  // Return fallback immediately for fast page load when database is disabled/unavailable
  if (!USE_DATABASE) {
    return NextResponse.json(fallbackTopics);
  }

  try {
    // Dynamically import prisma to avoid initialization errors
    const { prisma } = await import('@/lib/prisma');
    
    // Add a connection timeout using Promise.race
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 10000)
    );
    
    const queryPromise = prisma.trendingTopic.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: [
        { order: 'asc' },
        { upiScore: 'desc' },
      ],
      take: 10,
    });

    const trendingTopics = await Promise.race([queryPromise, timeoutPromise]) as any[];
    
    console.log('Trending topics from DB:', trendingTopics?.length || 0);

    // If no topics in database, return fallback
    if (!trendingTopics || trendingTopics.length === 0) {
      return NextResponse.json(fallbackTopics);
    }

    // Transform to match frontend TrendingTopic interface
    const formattedTopics = trendingTopics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      url: topic.url,
      category: topic.category,
      upiScore: topic.upiScore,
      trend: topic.trend.toLowerCase() as 'up' | 'down' | 'stable',
    }));

    return NextResponse.json(formattedTopics);
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    // Return fallback data on any error
    return NextResponse.json(fallbackTopics);
  }
}
