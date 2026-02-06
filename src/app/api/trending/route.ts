import { NextResponse } from 'next/server';
import { sanityClient, isSanityConfigured } from '@/lib/sanity';
import { groq } from 'next-sanity';

// Configuration flags
const USE_DATABASE = true;
const USE_SANITY = true;
const USE_ARTICLES = true; // Fetch from actual published articles

// Fetch trending articles from Sanity
async function fetchSanityTrending() {
  if (!USE_SANITY || !isSanityConfigured()) {
    return [];
  }

  try {
    const query = groq`
      *[_type == "article" && trending == true && defined(publishedAt)] | order(publishedAt desc) [0...5] {
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

// Fetch latest published articles from database (auto-fetch feature)
async function fetchLatestArticles() {
  if (!USE_ARTICLES) {
    return [];
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database timeout')), 10000)
    );

    const queryPromise = prisma.post.findMany({
      where: {
        status: {
          in: ['PUBLISHED', 'APPROVED'],
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        featured: true,
        publishedAt: true,
      },
    });

    const articles = (await Promise.race([queryPromise, timeoutPromise])) as any[];

    return articles.map((article, index) => ({
      id: `article-${article.id}`,
      title: article.title,
      url: `/${article.category.toLowerCase()}/${article.slug}`,
      category: article.category.charAt(0) + article.category.slice(1).toLowerCase(),
      upiScore: article.featured ? 90 : Math.max(60, 85 - index * 5),
      trend: 'up' as const,
      source: 'articles',
    }));
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

// Cache the response for 60 seconds (revalidate every minute)
export const revalidate = 60;

// GET - Fetch active trending topics from all sources
export async function GET() {
  try {
    // Fetch from all sources in parallel
    const [sanityTopics, dbTopics, articleTopics] = await Promise.all([
      fetchSanityTrending(),
      fetchDatabaseTrending(),
      fetchLatestArticles(),
    ]);

    console.log(`Trending: ${sanityTopics.length} from Sanity, ${dbTopics.length} from Database, ${articleTopics.length} from Articles`);

    // Priority: Database (manual/TrendingTopic) > Auto-fetched articles > Sanity
    // Database topics are curated by admin, so they take highest priority
    let combinedTopics: any[] = [];
    
    if (dbTopics.length > 0) {
      // If there are manually curated topics in TrendingTopic table, use ONLY those
      combinedTopics = [...dbTopics];
    } else if (articleTopics.length > 0) {
      // Fall back to auto-fetched articles from Post table
      combinedTopics = [...articleTopics];
    } else if (sanityTopics.length > 0) {
      // Last resort: Sanity topics
      combinedTopics = [...sanityTopics];
    }

    // Remove duplicates (same title)
    const uniqueTopics = combinedTopics.filter(
      (topic, index, self) =>
        index === self.findIndex((t) => t.title.toLowerCase() === topic.title.toLowerCase())
    );

    // Sort by upiScore (highest first)
    uniqueTopics.sort((a, b) => b.upiScore - a.upiScore);

    // Limit to 5 topics
    const finalTopics = uniqueTopics.slice(0, 5);

    // If still no topics, return empty array (no placeholders)
    if (finalTopics.length === 0) {
      return NextResponse.json([], {
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
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }
}
