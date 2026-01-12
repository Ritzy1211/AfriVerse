import { NextResponse } from 'next/server';
import { getAllArticles } from '@/data/articles';

export async function GET() {
  try {
    const articles = await getAllArticles();
    
    // Return serialized articles (dates converted to strings)
    const serializedArticles = articles.map(article => ({
      ...article,
      publishedAt: article.publishedAt.toISOString(),
    }));
    
    return NextResponse.json(serializedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
