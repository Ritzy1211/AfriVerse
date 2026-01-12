import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

// Helper function to upload an image
export async function uploadImage(
  file: string | Buffer,
  options?: {
    folder?: string;
    publicId?: string;
    transformation?: any[];
  }
) {
  try {
    const result = await cloudinary.uploader.upload(
      typeof file === 'string' ? file : `data:image/png;base64,${file.toString('base64')}`,
      {
        folder: options?.folder || 'afriverse',
        public_id: options?.publicId,
        transformation: options?.transformation,
        resource_type: 'image',
      }
    );

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Helper function to delete an image
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

// Helper function to get image URL with transformations
export function getImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
) {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'fill',
    quality: options?.quality || 'auto',
    format: options?.format || 'auto',
    secure: true,
  });
}

// Generate upload signature for direct browser uploads
export function generateUploadSignature(
  paramsToSign: Record<string, any>,
  timestamp: number
) {
  return cloudinary.utils.api_sign_request(
    { ...paramsToSign, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );
}
