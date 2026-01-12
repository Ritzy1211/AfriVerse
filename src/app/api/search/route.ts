import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllArticles } from '@/data/articles';

// GET /api/search - Full-text search across posts and articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const source = searchParams.get('source'); // 'posts', 'articles', or 'all'

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Query must be at least 2 characters',
      });
    }

    const searchQuery = query.trim().toLowerCase();
    const skip = (page - 1) * limit;
    const results: any[] = [];

    // Search database posts
    if (source !== 'articles') {
      const postWhere: any = {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: searchQuery, mode: 'insensitive' } },
          { excerpt: { contains: searchQuery, mode: 'insensitive' } },
          { content: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { hasSome: [searchQuery] } },
        ],
      };

      if (category && category !== 'all') {
        postWhere.category = category.toLowerCase();
      }

      const dbPosts = await prisma.post.findMany({
        where: postWhere,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
      });

      // Transform posts to match article format
      const transformedPosts = dbPosts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        featuredImage: post.featuredImage,
        author: post.author?.name || 'AfriVerse',
        authorImage: post.author?.image,
        publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        readTime: post.readingTime,
        source: 'database',
        relevance: calculateRelevance(searchQuery, post.title, post.excerpt || '', post.content),
      }));

      results.push(...transformedPosts);
    }

    // Search markdown articles
    if (source !== 'posts') {
      try {
        const articles = await getAllArticles();
        
        const matchingArticles = articles.filter(article => {
          const titleMatch = article.title.toLowerCase().includes(searchQuery);
          const excerptMatch = article.excerpt?.toLowerCase().includes(searchQuery);
          const contentMatch = article.content?.toLowerCase().includes(searchQuery);
          const tagsMatch = article.tags?.some(tag => 
            tag.toLowerCase().includes(searchQuery)
          );
          // Handle category as either string or object with slug
          const articleCategory = article.category && typeof article.category === 'object' 
            ? (article.category as { slug?: string }).slug 
            : String(article.category);
          const categoryMatch = !category || category === 'all' || 
            articleCategory?.toLowerCase() === category.toLowerCase();

          return categoryMatch && (titleMatch || excerptMatch || contentMatch || tagsMatch);
        }).map(article => ({
          ...article,
          publishedAt: article.publishedAt.toISOString(),
          source: 'markdown',
          relevance: calculateRelevance(
            searchQuery, 
            article.title, 
            article.excerpt || '', 
            article.content || ''
          ),
        }));

        results.push(...matchingArticles);
      } catch (error) {
        console.error('Error searching markdown articles:', error);
      }
    }

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Paginate results
    const total = results.length;
    const paginatedResults = results.slice(skip, skip + limit);

    return NextResponse.json({
      results: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query: searchQuery,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// Calculate search relevance score
function calculateRelevance(
  query: string, 
  title: string, 
  excerpt: string, 
  content: string
): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const lowerExcerpt = excerpt?.toLowerCase() || '';
  const lowerContent = content?.toLowerCase() || '';

  // Title matches are most important
  if (lowerTitle === lowerQuery) score += 100;
  else if (lowerTitle.startsWith(lowerQuery)) score += 80;
  else if (lowerTitle.includes(lowerQuery)) score += 50;

  // Excerpt matches
  if (lowerExcerpt.includes(lowerQuery)) score += 30;

  // Content matches (with frequency bonus)
  const contentMatches = (lowerContent.match(new RegExp(lowerQuery, 'gi')) || []).length;
  score += Math.min(contentMatches * 2, 20); // Cap at 20 points

  return score;
}
