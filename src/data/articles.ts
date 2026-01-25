import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { Article, Author } from '@/types';
import { categories } from './categories';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';

// Content directory path
const contentDirectory = path.join(process.cwd(), 'content/articles');

// Authors database
const authors: Record<string, Author> = {
  'Amara Okonkwo': {
    id: '1',
    name: 'Amara Okonkwo',
    avatar: 'https://placehold.co/100x100/00D9FF/FFFFFF?text=AO',
    bio: 'Entertainment and culture journalist covering African music and arts',
    role: 'Entertainment Editor',
    socialLinks: { twitter: '@amaraokonkwo' },
  },
  'Emeka Nwankwo': {
    id: '2',
    name: 'Emeka Nwankwo',
    avatar: 'https://placehold.co/100x100/F39C12/FFFFFF?text=EN',
    bio: 'Business and technology analyst specializing in African startups',
    role: 'Business Editor',
    socialLinks: { twitter: '@emekanwankwo' },
  },
  'Zainab Bello': {
    id: '3',
    name: 'Zainab Bello',
    avatar: 'https://placehold.co/100x100/E91E63/FFFFFF?text=ZB',
    bio: 'Fashion and lifestyle writer covering African design and culture',
    role: 'Lifestyle Editor',
    socialLinks: { twitter: '@zainabbello' },
  },
  'Chidi Okafor': {
    id: '4',
    name: 'Chidi Okafor',
    avatar: 'https://placehold.co/100x100/27AE60/FFFFFF?text=CO',
    bio: 'Sports journalist covering African football and athletics',
    role: 'Sports Editor',
    socialLinks: { twitter: '@chidiokafor' },
  },
  'Tunde Fashola': {
    id: '5',
    name: 'Tunde Fashola',
    avatar: 'https://placehold.co/100x100/9C27B0/FFFFFF?text=TF',
    bio: 'Technology reviewer and gadget enthusiast',
    role: 'Tech Writer',
    socialLinks: { twitter: '@tundefashola' },
  },
  'Dr. Funke Adeyemi': {
    id: '6',
    name: 'Dr. Funke Adeyemi',
    avatar: 'https://placehold.co/100x100/FF5722/FFFFFF?text=FA',
    bio: 'Economist and policy analyst',
    role: 'Opinion Contributor',
    socialLinks: { twitter: '@drfunkeadeyemi' },
  },
};

// Default author for unknown authors
const defaultAuthor: Author = {
  id: '0',
  name: 'AfriVerse Staff',
  avatar: 'https://placehold.co/100x100/1A1A2E/FFFFFF?text=UG',
  bio: 'AfriVerse editorial team',
  role: 'Staff Writer',
};

// Helper to get author
function getAuthor(name: string): Author {
  return authors[name] || { ...defaultAuthor, name };
}

// Helper to get category
function getCategory(slug: string) {
  return categories.find(c => c.slug === slug) || categories[0];
}

// Get all article slugs from markdown files
function getArticleSlugs(): { category: string; slug: string }[] {
  const slugs: { category: string; slug: string }[] = [];
  
  if (!fs.existsSync(contentDirectory)) {
    return slugs;
  }
  
  const categoryFolders = fs.readdirSync(contentDirectory);
  
  for (const category of categoryFolders) {
    const categoryPath = path.join(contentDirectory, category);
    
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      slugs.push({
        category,
        slug: file.replace(/\.md$/, '')
      });
    }
  }
  
  return slugs;
}

// Process markdown to HTML
async function processMarkdown(content: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(content);
  return result.toString();
}

// Transform database post to Article format
function transformPostToArticle(post: any): Article {
  const categoryData = getCategory(post.category);
  
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: categoryData,
    author: {
      id: post.author?.id || '0',
      name: post.author?.name || 'AfriVerse Staff',
      avatar: post.author?.image || 'https://placehold.co/100x100/1A1A2E/FFFFFF?text=TA',
      bio: post.author?.bio || 'AfriVerse editorial team',
      role: post.author?.jobTitle || 'Staff Writer',
      socialLinks: {
        twitter: post.author?.twitter,
        linkedin: post.author?.linkedin,
        instagram: post.author?.instagram,
      },
    },
    featuredImage: post.featuredImage || 'https://placehold.co/800x450/1A1A2E/FFFFFF?text=Talk+Africa',
    publishedAt: post.publishedAt || post.createdAt,
    readTime: post.readingTime || 5,
    tags: post.tags || [],
    views: post.views || 0,
    featured: post.featured || false,
    trending: post.featured || false,
    isPremium: post.isPremium || false,
    isSponsored: post.isSponsored || false,
    sponsorName: post.sponsorName || null,
    sponsorLogo: post.sponsorLogo || null,
  };
}

// Get all articles from database
async function getArticlesFromDatabase(): Promise<Article[]> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            jobTitle: true,
            twitter: true,
            linkedin: true,
            instagram: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return posts.map(transformPostToArticle);
  } catch (error) {
    console.error('Error fetching articles from database:', error);
    return [];
  }
}

// Get all articles from markdown files
async function getArticlesFromMarkdown(): Promise<Article[]> {
  const slugs = getArticleSlugs();
  const articles: Article[] = [];
  
  for (const { category, slug } of slugs) {
    const article = await getArticleBySlug(slug, category);
    if (article) {
      articles.push(article);
    }
  }
  
  return articles;
}

// Internal function to fetch all articles
async function _getAllArticles(): Promise<Article[]> {
  // Fetch from both sources in parallel
  const [dbArticles, mdArticles] = await Promise.all([
    getArticlesFromDatabase(),
    getArticlesFromMarkdown(),
  ]);
  
  // Combine articles, avoiding duplicates by slug
  const articleMap = new Map<string, Article>();
  
  // Database articles take priority (admin-created posts)
  for (const article of dbArticles) {
    articleMap.set(article.slug, article);
  }
  
  // Add markdown articles only if not already in database
  for (const article of mdArticles) {
    if (!articleMap.has(article.slug)) {
      articleMap.set(article.slug, article);
    }
  }
  
  const articles = Array.from(articleMap.values());
  
  // Sort: Sponsored posts first (pinned), then by date (newest first)
  return articles.sort((a, b) => {
    // Sponsored posts always come first
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    
    // Among sponsored posts, sort by date
    // Among non-sponsored posts, also sort by date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

// Cached version - revalidates every 60 seconds
export const getAllArticles = unstable_cache(
  _getAllArticles,
  ['all-articles'],
  { revalidate: 60, tags: ['articles'] }
);

// Get a single article by slug (checks database first, then markdown files)
export async function getArticleBySlug(slug: string, categorySlug?: string): Promise<Article | null> {
  // First, try to fetch from database
  try {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            jobTitle: true,
            twitter: true,
            linkedin: true,
            instagram: true,
          },
        },
      },
    });

    if (post) {
      return transformPostToArticle(post);
    }
  } catch (error) {
    console.error(`Error fetching article from database:`, error);
  }

  // Fall back to markdown files
  try {
    let filePath: string | null = null;
    let foundCategory = categorySlug;
    
    if (categorySlug) {
      filePath = path.join(contentDirectory, categorySlug, `${slug}.md`);
    } else {
      // Search in all categories
      const slugs = getArticleSlugs();
      const found = slugs.find(s => s.slug === slug);
      if (found) {
        filePath = path.join(contentDirectory, found.category, `${slug}.md`);
        foundCategory = found.category;
      }
    }
    
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // Process markdown to HTML
    const contentHtml = await processMarkdown(content);
    
    // Parse read time
    const readTimeMatch = data.readTime?.match(/(\d+)/);
    const readTime = readTimeMatch ? parseInt(readTimeMatch[1]) : 5;
    
    return {
      id: `${foundCategory}-${slug}`,
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: contentHtml,
      category: getCategory(data.category || foundCategory || 'technology'),
      author: getAuthor(data.author),
      featuredImage: data.image,
      publishedAt: new Date(data.date),
      readTime,
      tags: data.tags || [],
      views: Math.floor(Math.random() * 10000) + 1000,
      trending: data.trending || false,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

// Get trending articles
export async function getTrendingArticles(limit: number = 5): Promise<Article[]> {
  const allArticles = await getAllArticles();
  
  // Include featured posts from database as trending
  return allArticles
    .filter(article => article.trending || article.featured)
    .slice(0, limit);
}

// Get articles by category
export async function getArticlesByCategory(categorySlug: string, limit?: number): Promise<Article[]> {
  const allArticles = await getAllArticles();
  const filtered = allArticles.filter(article => article.category.slug === categorySlug);
  
  // Sort: Sponsored posts first (pinned), then by date
  const sorted = filtered.sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
}

// Get related articles
export async function getRelatedArticles(article: Article, limit: number = 3): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles
    .filter(a => 
      a.id !== article.id && 
      (a.category.id === article.category.id || 
       a.tags.some(tag => article.tags.includes(tag)))
    )
    .slice(0, limit);
}

// Get all authors
export function getAllAuthors(): Author[] {
  return Object.values(authors);
}

// Get author by ID
export function getAuthorById(id: string): Author | null {
  const author = Object.values(authors).find(a => a.id === id);
  return author || null;
}

// Get articles by author
export async function getArticlesByAuthor(authorId: string, limit?: number): Promise<Article[]> {
  const allArticles = await getAllArticles();
  const filtered = allArticles.filter(article => article.author.id === authorId);
  
  // Sort: Sponsored posts first (pinned), then by date
  const sorted = filtered.sort((a, b) => {
    if (a.isSponsored && !b.isSponsored) return -1;
    if (!a.isSponsored && b.isSponsored) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
}
