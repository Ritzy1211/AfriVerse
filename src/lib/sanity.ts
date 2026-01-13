import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Type for Sanity image source
type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0];

// Sanity configuration
export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
};

// Create Sanity client for data fetching
export const sanityClient = createClient({
  ...config,
  useCdn: true, // Enable CDN for read operations
});

// Create client for write operations (authenticated)
export const sanityWriteClient = createClient({
  ...config,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Required for write operations
});

// Create client for preview mode (draft content)
export const previewClient = createClient({
  ...config,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'previewDrafts',
});

// Get the appropriate client based on preview mode
export const getClient = (preview?: boolean) => 
  preview ? previewClient : sanityClient;

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper to generate image URL with default transformations
export function getImageUrl(
  source: SanityImageSource,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min';
  }
) {
  if (!source) return '';
  
  let imageBuilder = urlFor(source).auto('format');
  
  if (options?.width) imageBuilder = imageBuilder.width(options.width);
  if (options?.height) imageBuilder = imageBuilder.height(options.height);
  if (options?.quality) imageBuilder = imageBuilder.quality(options.quality);
  if (options?.fit) imageBuilder = imageBuilder.fit(options.fit);
  
  return imageBuilder.url();
}

// Utility to check if Sanity is configured
export function isSanityConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.NEXT_PUBLIC_SANITY_DATASET
  );
}
