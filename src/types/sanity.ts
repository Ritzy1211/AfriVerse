// TypeScript types for Sanity documents

import type { PortableTextBlock } from '@portabletext/types';

// Base Sanity document interface
export interface SanityDocument {
  _id: string;
  _rev: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
}

// Sanity image asset reference
export interface SanityImageAsset {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
  caption?: string;
}

// Sanity slug
export interface SanitySlug {
  _type: 'slug';
  current: string;
}

// Sanity reference
export interface SanityReference {
  _ref: string;
  _type: 'reference';
}

// Author document
export interface SanityAuthor extends SanityDocument {
  _type: 'author';
  name: string;
  slug: SanitySlug;
  avatar?: SanityImageAsset;
  bio?: string;
  role?: string;
  email?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
  featured?: boolean;
}

// Category document
export interface SanityCategory extends SanityDocument {
  _type: 'category';
  name: string;
  slug: SanitySlug;
  description?: string;
  color?: string;
  icon?: string;
  featuredImage?: SanityImageAsset;
  order?: number;
}

// Tag document
export interface SanityTag extends SanityDocument {
  _type: 'tag';
  name: string;
  slug: SanitySlug;
  description?: string;
}

// Article document
export interface SanityArticle extends SanityDocument {
  _type: 'article';
  title: string;
  slug: SanitySlug;
  excerpt: string;
  mainImage: SanityImageAsset;
  body: PortableTextBlock[];
  author: SanityReference;
  category: SanityReference;
  tags?: SanityReference[];
  publishedAt?: string;
  readTime?: number;
  featured?: boolean;
  trending?: boolean;
  impactScore?: number;
  seoTitle?: string;
  seoDescription?: string;
}

// Expanded article with resolved references
export interface SanityArticleExpanded extends Omit<SanityArticle, 'author' | 'category' | 'tags'> {
  author: SanityAuthor;
  category: SanityCategory;
  tags?: SanityTag[];
}

// Site settings singleton
export interface SanitySiteSettings extends SanityDocument {
  _type: 'siteSettings';
  title?: string;
  description?: string;
  logo?: SanityImageAsset;
  favicon?: SanityImageAsset;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  defaultSeoImage?: SanityImageAsset;
  newsletter?: {
    heading?: string;
    subheading?: string;
    enabled?: boolean;
  };
  footer?: {
    copyright?: string;
    tagline?: string;
  };
}

// Query result types for common use cases

// Article card display (minimal data)
export interface ArticleCard {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  mainImage: SanityImageAsset;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  trending: boolean;
  author: {
    name: string;
    slug: string;
    avatar?: SanityImageAsset;
  };
  category: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
}

// Full article for detail page
export interface ArticleFull extends ArticleCard {
  body: PortableTextBlock[];
  tags: Array<{
    name: string;
    slug: string;
  }>;
  impactScore?: number;
  seoTitle?: string;
  seoDescription?: string;
}

// Author with article count
export interface AuthorWithCount extends SanityAuthor {
  articleCount: number;
}

// Category with article count
export interface CategoryWithCount extends SanityCategory {
  articleCount: number;
}
