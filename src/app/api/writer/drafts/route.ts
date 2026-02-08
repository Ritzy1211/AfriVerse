import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Create a new draft
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug: providedSlug, excerpt, content, categoryId, suggestedImages, editorNotes, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Use provided slug or generate from title
    const baseSlug = (providedSlug && providedSlug.trim()) 
      ? providedSlug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check for existing slugs and make unique
    const existingSlugs = await prisma.post.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the draft - status is ALWAYS DRAFT for writers
    const draft = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content || '',
        category: categoryId || 'general',
        authorId: session.user.id,
        status: 'DRAFT', // Writers can ONLY create drafts
        metaTitle: title.trim(),
        metaDescription: excerpt?.trim() || null,
        tags: tags || [],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Draft saved successfully',
      draft,
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    );
  }
}
