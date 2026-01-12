import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/afripulse/topics/detect - Auto-detect trending topics from articles
export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch recent articles
    const articles = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: startDate }
      },
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        excerpt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 100
    });

    // Extract and count topics from tags and titles
    const topicCounts: Record<string, {
      count: number;
      category: string;
      articles: string[];
    }> = {};

    // Common trending topic patterns
    const trendingPatterns: Record<string, string> = {
      'afcon': 'SPORTS',
      'world cup': 'SPORTS',
      'champions league': 'SPORTS',
      'premier league': 'SPORTS',
      'election': 'POLITICS',
      'president': 'POLITICS',
      'government': 'POLITICS',
      'protest': 'POLITICS',
      'inflation': 'ECONOMY',
      'naira': 'ECONOMY',
      'dollar': 'ECONOMY',
      'oil': 'ECONOMY',
      'fuel': 'ECONOMY',
      'startup': 'TECHNOLOGY',
      'fintech': 'TECHNOLOGY',
      'ai': 'TECHNOLOGY',
      'crypto': 'TECHNOLOGY',
      'bitcoin': 'TECHNOLOGY',
      'grammy': 'ENTERTAINMENT',
      'oscar': 'ENTERTAINMENT',
      'afrobeats': 'ENTERTAINMENT',
      'nollywood': 'ENTERTAINMENT',
      'davido': 'ENTERTAINMENT',
      'burna boy': 'ENTERTAINMENT',
      'wizkid': 'ENTERTAINMENT',
      'health': 'SOCIAL',
      'education': 'SOCIAL',
      'university': 'SOCIAL',
    };

    articles.forEach(article => {
      // Check tags
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => {
          const normalizedTag = tag.toLowerCase().trim();
          if (normalizedTag.length > 2) {
            if (!topicCounts[normalizedTag]) {
              topicCounts[normalizedTag] = {
                count: 0,
                category: detectCategory(normalizedTag, article.category || ''),
                articles: []
              };
            }
            topicCounts[normalizedTag].count++;
            topicCounts[normalizedTag].articles.push(article.title);
          }
        });
      }

      // Check for trending patterns in title
      const titleLower = article.title.toLowerCase();
      Object.entries(trendingPatterns).forEach(([pattern, category]) => {
        if (titleLower.includes(pattern)) {
          const key = pattern.charAt(0).toUpperCase() + pattern.slice(1);
          if (!topicCounts[key]) {
            topicCounts[key] = { count: 0, category, articles: [] };
          }
          topicCounts[key].count++;
          if (!topicCounts[key].articles.includes(article.title)) {
            topicCounts[key].articles.push(article.title);
          }
        }
      });
    });

    // Sort by count and get top topics
    const detectedTopics = Object.entries(topicCounts)
      .filter(([_, data]) => data.count >= 2) // At least 2 mentions
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        category: data.category,
        articleCount: data.count,
        sampleArticles: data.articles.slice(0, 3),
        suggestedSentiment: 60 // Default neutral-positive
      }))
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, 15);

    // Get existing topics to compare
    const existingTopics = await prisma.afriPulseTopic.findMany({
      where: { isActive: true },
      select: { topic: true }
    });
    const existingNames = existingTopics.map(t => t.topic.toLowerCase());

    // Mark which topics are new
    const topicsWithStatus = detectedTopics.map(topic => ({
      ...topic,
      isNew: !existingNames.includes(topic.name.toLowerCase()),
      exists: existingNames.includes(topic.name.toLowerCase())
    }));

    return NextResponse.json({
      success: true,
      data: {
        detectedTopics: topicsWithStatus,
        totalArticlesAnalyzed: articles.length,
        analysisDate: new Date(),
        days
      }
    });
  } catch (error) {
    console.error('Error detecting topics:', error);
    return NextResponse.json(
      { error: 'Failed to detect topics' },
      { status: 500 }
    );
  }
}

// POST /api/admin/afripulse/topics/detect - Create a detected topic
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, sentiment } = body;

    if (!name) {
      return NextResponse.json({ error: 'Topic name is required' }, { status: 400 });
    }

    // Check if topic already exists
    const existing = await prisma.afriPulseTopic.findFirst({
      where: { topic: { equals: name, mode: 'insensitive' } }
    });

    if (existing) {
      return NextResponse.json({ error: 'Topic already exists' }, { status: 409 });
    }

    // Create new topic
    const newTopic = await prisma.afriPulseTopic.create({
      data: {
        topic: name,
        category: category || 'SOCIAL',
        sentimentScore: sentiment || 60,
        mentions: 1,
        engagement: 0,
        trend: 'STABLE',
        isActive: true,
        relatedArticles: [],
      }
    });

    return NextResponse.json({
      success: true,
      data: newTopic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

function detectCategory(tag: string, articleCategory: string): string {
  const tagLower = tag.toLowerCase();
  
  // Map based on keywords
  if (['football', 'soccer', 'afcon', 'sports', 'match', 'game', 'player'].some(k => tagLower.includes(k))) {
    return 'SPORTS';
  }
  if (['tech', 'startup', 'fintech', 'ai', 'digital', 'software'].some(k => tagLower.includes(k))) {
    return 'TECHNOLOGY';
  }
  if (['business', 'economy', 'finance', 'market', 'trade', 'money'].some(k => tagLower.includes(k))) {
    return 'ECONOMY';
  }
  if (['politics', 'government', 'election', 'president', 'minister'].some(k => tagLower.includes(k))) {
    return 'POLITICS';
  }
  if (['music', 'film', 'movie', 'artist', 'celebrity', 'entertainment'].some(k => tagLower.includes(k))) {
    return 'ENTERTAINMENT';
  }
  
  // Fallback to article category
  const categoryMap: Record<string, string> = {
    'business': 'ECONOMY',
    'technology': 'TECHNOLOGY',
    'politics': 'POLITICS',
    'sports': 'SPORTS',
    'entertainment': 'ENTERTAINMENT',
    'lifestyle': 'SOCIAL'
  };
  
  return categoryMap[articleCategory.toLowerCase()] || 'SOCIAL';
}
