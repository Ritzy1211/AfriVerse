import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Import latest articles to trending topics
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { limit = 5 } = body;

    // Fetch latest published articles
    const articles = await prisma.post.findMany({
      where: {
        status: {
          in: ['PUBLISHED', 'APPROVED'],
        },
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: Math.min(limit, 5), // Max 5
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        featured: true,
      },
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'No published articles found to import' },
        { status: 404 }
      );
    }

    // Get current max order
    const maxOrderResult = await prisma.trendingTopic.aggregate({
      _max: { order: true },
    });
    let currentOrder = (maxOrderResult._max.order || 0) + 1;

    // Create trending topics from articles
    const createdTopics = [];
    for (const article of articles) {
      // Check if already exists
      const existing = await prisma.trendingTopic.findFirst({
        where: {
          OR: [
            { title: article.title },
            { url: `/${article.category.toLowerCase()}/${article.slug}` },
          ],
        },
      });

      if (!existing) {
        const topic = await prisma.trendingTopic.create({
          data: {
            title: article.title,
            url: `/${article.category.toLowerCase()}/${article.slug}`,
            category: article.category.charAt(0) + article.category.slice(1).toLowerCase(),
            upiScore: article.featured ? 90 : 75,
            trend: 'UP',
            isActive: true,
            order: currentOrder++,
          },
        });
        createdTopics.push(topic);
      }
    }

    return NextResponse.json({
      message: `Imported ${createdTopics.length} articles to trending`,
      imported: createdTopics.length,
      skipped: articles.length - createdTopics.length,
      topics: createdTopics,
    });
  } catch (error) {
    console.error('Error importing articles to trending:', error);
    return NextResponse.json(
      { error: 'Failed to import articles' },
      { status: 500 }
    );
  }
}

// GET - Get available articles to import
export async function GET() {
  try {
    const articles = await prisma.post.findMany({
      where: {
        status: {
          in: ['PUBLISHED', 'APPROVED'],
        },
      },
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        featured: true,
        publishedAt: true,
      },
    });

    // Check which ones are already in trending
    const existingUrls = await prisma.trendingTopic.findMany({
      select: { url: true },
    });
    const existingUrlSet = new Set(existingUrls.map(t => t.url));

    const articlesWithStatus = articles.map(article => ({
      ...article,
      url: `/${article.category.toLowerCase()}/${article.slug}`,
      alreadyTrending: existingUrlSet.has(`/${article.category.toLowerCase()}/${article.slug}`),
    }));

    return NextResponse.json(articlesWithStatus);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json([], { status: 500 });
  }
}
