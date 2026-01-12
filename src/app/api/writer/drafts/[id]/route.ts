import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific draft (only if owned by writer)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const draft = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id, // MUST be owned by this writer
      },
    });

    if (!draft) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article: draft });
  } catch (error) {
    console.error('Error fetching draft:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update a draft (only if owned by writer AND is editable)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // First check if the article exists and is owned by this writer
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if article is in an editable state
    const editableStatuses = ['DRAFT', 'CHANGES_REQUESTED'];
    if (!editableStatuses.includes(existingPost.status)) {
      return NextResponse.json(
        { error: 'This article cannot be edited. It may be under review or already published.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, excerpt, content, categoryId, suggestedImages, editorNotes, tags } = body;

    // Update the draft
    const updatedDraft = await prisma.post.update({
      where: { id },
      data: {
        title: title?.trim() || existingPost.title,
        excerpt: excerpt?.trim() || null,
        content: content || existingPost.content,
        category: categoryId || existingPost.category,
        tags: tags || existingPost.tags,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'Draft updated successfully',
      article: updatedDraft,
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a draft (only if DRAFT status)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if the article exists, is owned by this writer, and is a draft
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        authorId: session.user.id,
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only allow deleting drafts
    if (existingPost.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only drafts can be deleted. Contact an editor for other articles.' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
