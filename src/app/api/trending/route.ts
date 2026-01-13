import { NextResponse } from 'next/server';
import { sanityClient, isSanityConfigured } from '@/lib/sanity';
import { groq } from 'next-sanity';

// Fallback topics - used when both database and Sanity are unavailable
const fallbackTopics = [
  { id: '1', title: 'Nigerian Tech Startups Raise $500M in 2024', upiScore: 95, trend: 'up' as const, category: 'Business', url: '/business/nigerian-tech-startups-500m-2024', source: 'fallback' },
  { id: '2', title: 'Davido World Tour 2025 Announced', upiScore: 88, trend: 'up' as const, category: 'Entertainment', url: '/entertainment/davido-world-tour-2025', source: 'fallback' },
  { id: '3', title: 'Super Eagles AFCON 2025: Finidi Tactics Analysis', upiScore: 82, trend: 'up' as const, category: 'Sports', url: '/sports/super-eagles-afcon-2025-finidi-tactics', source: 'fallback' },
  { id: '4', title: 'Lagos Fashion Week 2024 Recap', upiScore: 78, trend: 'up' as const, category: 'Lifestyle', url: '/lifestyle/lagos-fashion-week-2024-recap', source: 'fallback' },
  { id: '5', title: 'iPhone 16 vs Samsung S24: Nigeria Review', upiScore: 72, trend: 'stable' as const, category: 'Technology', url: '/technology/iphone-16-vs-samsung-s24-nigeria', source: 'fallback' },
];

// Configuration flags
const USE_DATABASE = true;
const USE_SANITY = true;

// Fetch trending articles from Sanity
async function fetchSanityTrending() {
  if (!USE_SANITY || !isSanityConfigured()) {
    return [];
  }

  try {
    const query = groq`
      *[_type == "article" && trending == true && defined(publishedAt)] | order(publishedAt desc) [0...10] {
        _id,
        title,
        "slug": slug.current,
        "category": category->name,
        "categorySlug": category->slug.current,
        impactScore
      }
    `;

    const articles = await sanityClient.fetch(query);

    return articles.map((article: any) => ({
      id: `sanity-${article._id}`,
      title: article.title,
      url: `/${article.categorySlug}/${article.slug}`,
      category: article.category || 'News',
      upiScore: article.impactScore || 80,
      trend: 'up' as const,
      source: 'sanity',
    }));
  } catch (error) {
    console.error('Error fetching Sanity trending:', error);
    return [];
  }
}

// Fetch trending topics from database (Admin Panel)
async function fetchDatabaseTrending() {
  if (!USE_DATABASE) {
    return [];
  }

  try {
    const { prisma } = await import('@/lib/prisma');

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

    const trendingTopics = (await Promise.race([queryPromise, timeoutPromise])) as any[];

    return trendingTopics.map((topic) => ({
      id: `db-${topic.id}`,
      title: topic.title,
      url: topic.url,
      category: topic.category,
      upiScore: topic.upiScore,
      trend: topic.trend.toLowerCase() as 'up' | 'down' | 'stable',
      source: 'database',
    }));
  } catch (error) {
    console.error('Error fetching database trending:', error);
    return [];
  }
}

// Cache the response for 60 seconds (revalidate every minute)
export const revalidate = 60;

// GET - Fetch active trending topics from both sources
export async function GET() {
  try {
    // Fetch from both sources in parallel
    const [sanityTopics, dbTopics] = await Promise.all([
      fetchSanityTrending(),
      fetchDatabaseTrending(),
    ]);

    console.log(`Trending: ${sanityTopics.length} from Sanity, ${dbTopics.length} from Database`);

    // Combine both sources - database topics take priority (appear first)
    const combinedTopics = [...dbTopics, ...sanityTopics];

    // Remove duplicates (same title)
    const uniqueTopics = combinedTopics.filter(
      (topic, index, self) =>
        index === self.findIndex((t) => t.title.toLowerCase() === topic.title.toLowerCase())
    );

    // Sort by upiScore (highest first)
    uniqueTopics.sort((a, b) => b.upiScore - a.upiScore);

    // Limit to 10 topics
    const finalTopics = uniqueTopics.slice(0, 10);

    // If no topics from either source, return fallback
    if (finalTopics.length === 0) {
      return NextResponse.json(fallbackTopics, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      });
    }

    // Remove source field before sending to frontend
    const cleanTopics = finalTopics.map(({ source, ...rest }) => rest);

    return NextResponse.json(cleanTopics, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json(fallbackTopics, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }
}
