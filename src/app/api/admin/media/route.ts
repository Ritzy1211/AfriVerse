import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

// GET /api/admin/media - Get all media
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const type = searchParams.get('type');
    const folder = searchParams.get('folder');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (folder) {
      where.folder = folder;
    }

    // Get media with pagination
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST /api/admin/media - Save uploaded media info to database
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      url,
      publicId,
      type,
      format,
      width,
      height,
      bytes,
      folder,
      altText,
      caption,
    } = body;

    // Validate required fields
    if (!url || !publicId) {
      return NextResponse.json(
        { error: 'URL and publicId are required' },
        { status: 400 }
      );
    }

    // Create media record
    const media = await prisma.media.create({
      data: {
        url,
        publicId,
        type: type || 'image',
        format: format || 'jpg',
        width: width || 0,
        height: height || 0,
        bytes: bytes || 0,
        folder: folder || 'afriverse',
        altText: altText || '',
        caption: caption || '',
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Error saving media:', error);
    return NextResponse.json(
      { error: 'Failed to save media' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/media - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const publicId = searchParams.get('publicId');

    if (!id && !publicId) {
      return NextResponse.json(
        { error: 'ID or publicId is required' },
        { status: 400 }
      );
    }

    // Find the media record
    const media = id 
      ? await prisma.media.findUnique({ where: { id } })
      : await prisma.media.findFirst({ where: { publicId: publicId! } });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(media.publicId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: media.id },
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}
