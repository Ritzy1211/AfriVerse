import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/comments - Get all comments for moderation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // PENDING, APPROVED, SPAM, DELETED
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { authorEmail: { contains: search, mode: 'insensitive' } },
        { articleTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get comments with pagination
    const [comments, total, statusCounts] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
      // Get status counts for tabs
      prisma.comment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Transform status counts
    const counts = {
      all: 0,
      PENDING: 0,
      APPROVED: 0,
      SPAM: 0,
      DELETED: 0,
    };
    
    statusCounts.forEach((item) => {
      counts[item.status as keyof typeof counts] = item._count;
      counts.all += item._count;
    });

    return NextResponse.json({
      comments,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/comments - Update comment status (approve/reject/spam)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, action } = body;

    // Handle bulk actions
    if (ids && Array.isArray(ids) && ids.length > 0) {
      let updateData: any = {};
      
      switch (action) {
        case 'approve':
          updateData.status = 'APPROVED';
          break;
        case 'spam':
          updateData.status = 'SPAM';
          break;
        case 'delete':
          updateData.status = 'DELETED';
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      await prisma.comment.updateMany({
        where: { id: { in: ids } },
        data: updateData,
      });

      return NextResponse.json({
        message: `${ids.length} comment(s) ${action}d successfully`,
      });
    }

    // Handle single comment update
    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    let updateData: any = {};
    
    switch (action) {
      case 'approve':
        updateData.status = 'APPROVED';
        break;
      case 'spam':
        updateData.status = 'SPAM';
        break;
      case 'delete':
        updateData.status = 'DELETED';
        break;
      case 'restore':
        updateData.status = 'PENDING';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: `Comment ${action}d successfully`,
      comment: updatedComment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/comments - Permanently delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Delete replies first
    await prisma.comment.deleteMany({
      where: { parentId: id },
    });

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted permanently' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
