import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { categories } from '@/data/categories';

// GET - Fetch a single article by ID for the writer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch the article - writer can only view their own articles
    const article = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id, // Ensure writer can only access their own articles
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        status: true,
        category: true,
        tags: true,
        metaTitle: true,
        metaDescription: true,
        featuredImage: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Fetch editorial review separately
    const editorialReview = await prisma.editorialReview.findFirst({
      where: { postId: id },
      select: {
        id: true,
        status: true,
        priority: true,
        notes: true,
        createdAt: true,
        reviewedAt: true,
        feedbackHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });

    // Try to get reviewer info if reviewerId exists
    let reviewerInfo = null;
    if (editorialReview) {
      const reviewData = await prisma.editorialReview.findFirst({
        where: { id: editorialReview.id },
        select: { reviewerId: true },
      });
      
      if (reviewData?.reviewerId) {
        reviewerInfo = await prisma.user.findUnique({
          where: { id: reviewData.reviewerId },
          select: { id: true, name: true, image: true },
        });
      }
    }

    // Get category info from static data
    let categoryInfo = null;
    if (article.category) {
      const cat = categories.find(c => c.slug === article.category);
      if (cat) {
        categoryInfo = {
          id: cat.slug,
          name: cat.name,
          slug: cat.slug,
        };
      }
    }

    return NextResponse.json({
      article: {
        ...article,
        category: categoryInfo,
        editorialReview: editorialReview ? {
          ...editorialReview,
          feedback: editorialReview.feedbackHistory?.[0]?.content || editorialReview.notes || null,
          submittedAt: editorialReview.createdAt,
          reviewer: reviewerInfo,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update an article (only if DRAFT or CHANGES_REQUESTED)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First, check if the article exists and belongs to the writer
    const existingArticle = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Only allow editing if status is DRAFT or CHANGES_REQUESTED
    if (!['DRAFT', 'CHANGES_REQUESTED'].includes(existingArticle.status)) {
      return NextResponse.json(
        { error: 'Cannot edit article in current status' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, categoryId, tags } = body;

    // Update the article
    const updatedArticle = await prisma.post.update({
      where: { id },
      data: {
        title: title?.trim() || existingArticle.title,
        slug: slug?.trim() || existingArticle.slug,
        excerpt: excerpt?.trim() || null,
        content: content || existingArticle.content,
        category: categoryId || existingArticle.category,
        tags: tags || existingArticle.tags,
        metaTitle: title?.trim() || existingArticle.metaTitle,
        metaDescription: excerpt?.trim() || existingArticle.metaDescription,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Article updated successfully',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an article (only if DRAFT)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // First, check if the article exists and belongs to the writer
    const existingArticle = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Only allow deleting drafts
    if (existingArticle.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft articles' },
        { status: 403 }
      );
    }

    // Delete any associated editorial review first
    await prisma.editorialReview.deleteMany({
      where: { postId: id },
    });

    // Delete the article
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
