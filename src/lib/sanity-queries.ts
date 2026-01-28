import { groq } from 'next-sanity';
import { sanityClient, getClient } from './sanity';
import type {
  ArticleCard,
  ArticleFull,
  SanityCategory,
  SanityAuthor,
  SanityTag,
  SanitySiteSettings,
  CategoryWithCount,
  AuthorWithCount,
} from '@/types/sanity';

// ============================================
// GROQ Queries
// ============================================

// Article projections for reuse
const articleCardProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt,
  readTime,
  featured,
  trending,
  "author": author->{
    name,
    "slug": slug.current,
    avatar
  },
  "category": category->{
    name,
    "slug": slug.current,
    color,
    icon
  }
}`;

const articleFullProjection = groq`{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  body,
  publishedAt,
  readTime,
  featured,
  trending,
  impactScore,
  seoTitle,
  seoDescription,
  "author": author->{
    _id,
    name,
    "slug": slug.current,
    avatar,
    bio,
    role,
    socialLinks
  },
  "category": category->{
    _id,
    name,
    "slug": slug.current,
    color,
    icon,
    description
  },
  "tags": tags[]->{
    name,
    "slug": slug.current
  }
}`;

// ============================================
// Article Queries
// ============================================

/**
 * Get all articles with pagination
 */
export async function getArticles(
  options: {
    limit?: number;
    offset?: number;
    preview?: boolean;
  } = {}
): Promise<ArticleCard[]> {
  const { limit = 10, offset = 0, preview = false } = options;
  
  const query = groq`
    *[_type == "article" && defined(publishedAt)] | order(publishedAt desc) [${offset}...${offset + limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query);
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
  categorySlug: string,
  options: {
    limit?: number;
    offset?: number;
    preview?: boolean;
  } = {}
): Promise<ArticleCard[]> {
  const { limit = 10, offset = 0, preview = false } = options;
  
  const query = groq`
    *[_type == "article" && category->slug.current == $categorySlug && defined(publishedAt)] 
    | order(publishedAt desc) [${offset}...${offset + limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query, { categorySlug });
}

/**
 * Get articles by author
 */
export async function getArticlesByAuthor(
  authorSlug: string,
  options: {
    limit?: number;
    offset?: number;
    preview?: boolean;
  } = {}
): Promise<ArticleCard[]> {
  const { limit = 10, offset = 0, preview = false } = options;
  
  const query = groq`
    *[_type == "article" && author->slug.current == $authorSlug && defined(publishedAt)] 
    | order(publishedAt desc) [${offset}...${offset + limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query, { authorSlug });
}

/**
 * Get single article by slug
 */
export async function getArticleBySlug(
  slug: string,
  preview: boolean = false
): Promise<ArticleFull | null> {
  const query = groq`
    *[_type == "article" && slug.current == $slug][0]
    ${articleFullProjection}
  `;
  
  return getClient(preview).fetch(query, { slug });
}

/**
 * Get featured articles
 */
export async function getFeaturedArticles(
  limit: number = 5,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && featured == true && defined(publishedAt)] 
    | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query);
}

/**
 * Get trending articles
 */
export async function getTrendingArticles(
  limit: number = 5,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && trending == true && defined(publishedAt)] 
    | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query);
}

/**
 * Get latest articles
 */
export async function getLatestArticles(
  limit: number = 10,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && defined(publishedAt)] 
    | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query);
}

/**
 * Get related articles based on category and tags
 */
export async function getRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  limit: number = 4,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && slug.current != $currentSlug && category->slug.current == $categorySlug && defined(publishedAt)] 
    | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query, { currentSlug, categorySlug });
}

/**
 * Search articles
 */
export async function searchArticles(
  searchTerm: string,
  limit: number = 20,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && defined(publishedAt) && (
      title match $searchTerm + "*" ||
      excerpt match $searchTerm + "*" ||
      pt::text(body) match $searchTerm + "*"
    )] | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query, { searchTerm });
}

/**
 * Get total article count
 */
export async function getArticleCount(categorySlug?: string): Promise<number> {
  const filter = categorySlug
    ? `_type == "article" && category->slug.current == $categorySlug && defined(publishedAt)`
    : `_type == "article" && defined(publishedAt)`;
  
  const query = groq`count(*[${filter}])`;
  
  return sanityClient.fetch(query, { categorySlug });
}

/**
 * Get all article slugs (for static generation)
 */
export async function getAllArticleSlugs(): Promise<{ category: string; slug: string }[]> {
  const query = groq`
    *[_type == "article" && defined(publishedAt)] {
      "slug": slug.current,
      "category": category->slug.current
    }
  `;
  
  return sanityClient.fetch(query);
}

// ============================================
// Category Queries
// ============================================

/**
 * Get all categories
 */
export async function getCategories(): Promise<SanityCategory[]> {
  const query = groq`
    *[_type == "category"] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      icon,
      featuredImage,
      order
    }
  `;
  
  return sanityClient.fetch(query);
}

/**
 * Get categories with article count
 */
export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
  const query = groq`
    *[_type == "category"] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      icon,
      featuredImage,
      order,
      "articleCount": count(*[_type == "article" && references(^._id) && defined(publishedAt)])
    }
  `;
  
  return sanityClient.fetch(query);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<SanityCategory | null> {
  const query = groq`
    *[_type == "category" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      description,
      color,
      icon,
      featuredImage,
      order
    }
  `;
  
  return sanityClient.fetch(query, { slug });
}

// ============================================
// Author Queries
// ============================================

/**
 * Get all authors
 */
export async function getAuthors(): Promise<SanityAuthor[]> {
  const query = groq`
    *[_type == "author"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      avatar,
      bio,
      role,
      socialLinks,
      featured
    }
  `;
  
  return sanityClient.fetch(query);
}

/**
 * Get featured authors (storytellers)
 */
export async function getFeaturedAuthors(): Promise<AuthorWithCount[]> {
  const query = groq`
    *[_type == "author" && featured == true] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      avatar,
      bio,
      role,
      socialLinks,
      featured,
      "articleCount": count(*[_type == "article" && references(^._id) && defined(publishedAt)])
    }
  `;
  
  return sanityClient.fetch(query);
}

/**
 * Get author by slug
 */
export async function getAuthorBySlug(slug: string): Promise<SanityAuthor | null> {
  const query = groq`
    *[_type == "author" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      avatar,
      bio,
      role,
      email,
      socialLinks,
      featured
    }
  `;
  
  return sanityClient.fetch(query, { slug });
}

// ============================================
// Tag Queries
// ============================================

/**
 * Get all tags
 */
export async function getTags(): Promise<SanityTag[]> {
  const query = groq`
    *[_type == "tag"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }
  `;
  
  return sanityClient.fetch(query);
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(
  tagSlug: string,
  limit: number = 20,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && $tagSlug in tags[]->slug.current && defined(publishedAt)] 
    | order(publishedAt desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query, { tagSlug });
}

// ============================================
// Site Settings Queries
// ============================================

/**
 * Get site settings
 */
export async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  const query = groq`
    *[_type == "siteSettings"][0] {
      _id,
      title,
      description,
      logo,
      favicon,
      socialLinks,
      defaultSeoImage,
      newsletter,
      footer
    }
  `;
  
  return sanityClient.fetch(query);
}

// ============================================
// AfriPulse / Trending Data
// ============================================

/**
 * Get articles for AfriPulse Index (with impact scores)
 */
export async function getAfriPulseArticles(
  limit: number = 10,
  preview: boolean = false
): Promise<ArticleCard[]> {
  const query = groq`
    *[_type == "article" && defined(impactScore) && defined(publishedAt)] 
    | order(impactScore desc) [0...${limit}]
    ${articleCardProjection}
  `;
  
  return getClient(preview).fetch(query);
}

// ============================================
// Spotlight Queries
// ============================================

/**
 * Get active spotlights by placement
 */
export async function getSpotlights(
  placement?: 'homepage' | 'category' | 'article' | 'global',
  categorySlug?: string,
  preview: boolean = false
) {
  const now = new Date().toISOString();
  
  let filter = `_type == "spotlight" && isActive == true`;
  
  // Add date filters
  filter += ` && (startDate == null || startDate <= "${now}")`;
  filter += ` && (endDate == null || endDate >= "${now}")`;
  
  // Add placement filter
  if (placement) {
    if (placement === 'category' && categorySlug) {
      filter += ` && placement == "category" && category->slug.current == "${categorySlug}"`;
    } else if (placement === 'article') {
      filter += ` && (placement == "article" || placement == "global")`;
    } else {
      filter += ` && placement == "${placement}"`;
    }
  }
  
  const query = groq`
    *[${filter}] | order(priority desc, _createdAt desc) [0...5] {
      _id,
      title,
      quote,
      quoteHighlight,
      subtitle,
      mediaType,
      "mediaUrl": select(
        mediaType == "video" => videoUrl,
        mediaType == "image" => image.asset->url
      ),
      "thumbnailUrl": select(
        mediaType == "video" => videoThumbnail.asset->url,
        image.asset->url
      ),
      linkUrl,
      linkText,
      overlayPosition,
      highlightColor,
      textColor,
      placement,
      "relatedArticles": relatedArticles[]->{
        _id,
        title,
        "image": mainImage.asset->url,
        "slug": slug.current,
        "category": category->slug.current
      }
    }
  `;
  
  return getClient(preview).fetch(query);
}

/**
 * Get a single spotlight by ID
 */
export async function getSpotlightById(
  id: string,
  preview: boolean = false
) {
  const query = groq`
    *[_type == "spotlight" && _id == $id][0] {
      _id,
      title,
      quote,
      quoteHighlight,
      subtitle,
      mediaType,
      "mediaUrl": select(
        mediaType == "video" => videoUrl,
        mediaType == "image" => image.asset->url
      ),
      "thumbnailUrl": select(
        mediaType == "video" => videoThumbnail.asset->url,
        image.asset->url
      ),
      linkUrl,
      linkText,
      overlayPosition,
      highlightColor,
      textColor,
      placement,
      "relatedArticles": relatedArticles[]->{
        _id,
        title,
        "image": mainImage.asset->url,
        "slug": slug.current,
        "category": category->slug.current
      }
    }
  `;
  
  return getClient(preview).fetch(query, { id });
}
