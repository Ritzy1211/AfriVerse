import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateUploadSignature } from '@/lib/cloudinary';

// POST /api/admin/media/signature - Generate upload signature for Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { folder = 'afriverse', publicId } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const paramsToSign: Record<string, any> = {
      folder,
      timestamp,
    };

    if (publicId) {
      paramsToSign.public_id = publicId;
    }

    const signature = generateUploadSignature(paramsToSign, timestamp);

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
