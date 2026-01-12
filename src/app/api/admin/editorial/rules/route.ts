import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all publishing rules
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const rules = await prisma.publishingRule.findMany({
      orderBy: { category: 'asc' }
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching publishing rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publishing rules' },
      { status: 500 }
    );
  }
}

// POST - Create or update publishing rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can modify publishing rules' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      category,
      requiresReview,
      minWordCount,
      maxWordCount,
      requiresFeaturedImage,
      requiresExcerpt,
      requiresMetaDescription,
      requiredTags,
      autoPublishTrusted,
      notifyOnSubmission,
    } = body;

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const rule = await prisma.publishingRule.upsert({
      where: { category },
      update: {
        requiresReview: requiresReview ?? true,
        minWordCount: minWordCount ?? 300,
        maxWordCount,
        requiresFeaturedImage: requiresFeaturedImage ?? true,
        requiresExcerpt: requiresExcerpt ?? true,
        requiresMetaDescription: requiresMetaDescription ?? true,
        requiredTags: requiredTags ?? 2,
        autoPublishTrusted: autoPublishTrusted ?? false,
        notifyOnSubmission: notifyOnSubmission || [],
      },
      create: {
        category,
        requiresReview: requiresReview ?? true,
        minWordCount: minWordCount ?? 300,
        maxWordCount,
        requiresFeaturedImage: requiresFeaturedImage ?? true,
        requiresExcerpt: requiresExcerpt ?? true,
        requiresMetaDescription: requiresMetaDescription ?? true,
        requiredTags: requiredTags ?? 2,
        autoPublishTrusted: autoPublishTrusted ?? false,
        notifyOnSubmission: notifyOnSubmission || [],
      }
    });

    return NextResponse.json({
      message: 'Publishing rule saved',
      rule,
    });
  } catch (error) {
    console.error('Error saving publishing rule:', error);
    return NextResponse.json(
      { error: 'Failed to save publishing rule' },
      { status: 500 }
    );
  }
}

// DELETE - Delete publishing rule
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only Super Admin can delete publishing rules' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    await prisma.publishingRule.delete({
      where: { category }
    });

    return NextResponse.json({ message: 'Publishing rule deleted' });
  } catch (error) {
    console.error('Error deleting publishing rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete publishing rule' },
      { status: 500 }
    );
  }
}
