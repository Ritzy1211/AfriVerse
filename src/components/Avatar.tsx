'use client';

import Image from 'next/image';

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, alt, size = 48, className = '' }: AvatarProps) {
  // Check if the URL is a placeholder that might cause issues with Next.js Image optimization
  const isPlaceholder = src.includes('placehold.co') || src.includes('placeholder');
  
  if (isPlaceholder) {
    // Use unoptimized for placeholder images
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full ${className}`}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
}
