import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

// POST /api/admin/posts/bulk - Perform bulk actions on posts
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'AUTHOR';
    const canBulkEdit = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);
    
    if (!canBulkEdit) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, postIds, data } = body;

    if (!action || !postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and post IDs are required' },
        { status: 400 }
      );
    }

    let result: { success: boolean; count: number; message: string };

    switch (action) {
      case 'publish':
        // Bulk publish posts
        const publishResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { 
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
        });
        result = {
          success: true,
          count: publishResult.count,
          message: `${publishResult.count} post(s) published successfully`,
        };
        break;

      case 'unpublish':
        // Bulk unpublish (set to draft)
        const unpublishResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { 
            status: 'DRAFT',
            publishedAt: null,
          },
        });
        result = {
          success: true,
          count: unpublishResult.count,
          message: `${unpublishResult.count} post(s) unpublished`,
        };
        break;

      case 'archive':
        // Bulk archive posts
        const archiveResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: 'ARCHIVED' },
        });
        result = {
          success: true,
          count: archiveResult.count,
          message: `${archiveResult.count} post(s) archived`,
        };
        break;

      case 'delete':
        // Bulk delete posts
        const deleteResult = await prisma.post.deleteMany({
          where: { id: { in: postIds } },
        });
        result = {
          success: true,
          count: deleteResult.count,
          message: `${deleteResult.count} post(s) deleted permanently`,
        };
        break;

      case 'changeCategory':
        // Bulk change category
        if (!data?.category) {
          return NextResponse.json(
            { error: 'Category is required for this action' },
            { status: 400 }
          );
        }
        const categoryResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { category: data.category },
        });
        result = {
          success: true,
          count: categoryResult.count,
          message: `${categoryResult.count} post(s) moved to ${data.category}`,
        };
        break;

      case 'setFeatured':
        // Bulk set featured
        const featuredResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { featured: data?.featured ?? true },
        });
        result = {
          success: true,
          count: featuredResult.count,
          message: `${featuredResult.count} post(s) ${data?.featured ? 'featured' : 'unfeatured'}`,
        };
        break;

      case 'setPremium':
        // Bulk set premium
        const premiumResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { isPremium: data?.isPremium ?? true },
        });
        result = {
          success: true,
          count: premiumResult.count,
          message: `${premiumResult.count} post(s) ${data?.isPremium ? 'set as premium' : 'set as free'}`,
        };
        break;

      case 'assignAuthor':
        // Bulk assign author
        if (!data?.authorId) {
          return NextResponse.json(
            { error: 'Author ID is required for this action' },
            { status: 400 }
          );
        }
        const authorResult = await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { authorId: data.authorId },
        });
        result = {
          success: true,
          count: authorResult.count,
          message: `${authorResult.count} post(s) reassigned`,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Revalidate caches
    revalidateTag('articles');
    revalidatePath('/', 'layout');

    return NextResponse.json(result);

  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
