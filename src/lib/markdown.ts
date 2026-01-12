import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';
import { Article, Category, Author } from '@/types';
import { categories } from '@/data/categories';

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

// Default author
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
function getCategory(slug: string): Category {
  return categories.find(c => c.slug === slug) || categories[0];
}

export interface ArticleFrontmatter {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorImage?: string;
  date: string;
  image: string;
  readTime?: string;
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
}

/**
 * Get all article slugs from the content directory
 */
export function getArticleSlugs(): { category: string; slug: string }[] {
  const slugs: { category: string; slug: string }[] = [];
  
  // Check if content directory exists
  if (!fs.existsSync(contentDirectory)) {
    console.warn('Content directory does not exist:', contentDirectory);
    return slugs;
  }
  
  // Get all category folders
  const categories = fs.readdirSync(contentDirectory);
  
  for (const category of categories) {
    const categoryPath = path.join(contentDirectory, category);
    
    // Skip if not a directory
    if (!fs.statSync(categoryPath).isDirectory()) continue;
    
    // Get all markdown files in category
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
    
    for (const file of files) {
      slugs.push({
        category,
        slug: file.replace(/\.md$/, '')
      });
    }
  }
  
  return slugs;
}

/**
 * Get a single article by category and slug
 */
export async function getArticleBySlug(
  category: string,
  slug: string
): Promise<Article | null> {
  try {
    const filePath = path.join(contentDirectory, category, `${slug}.md`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const frontmatter = data as ArticleFrontmatter;
    
    // Process markdown to HTML
    const processedContent = await remark()
      .use(html, { sanitize: false })
      .process(content);
    const contentHtml = processedContent.toString();
    
    // Calculate reading time if not provided
    const stats = readingTime(content);
    const readTimeMinutes = frontmatter.readTime 
      ? parseInt(frontmatter.readTime.match(/\d+/)?.[0] || '5') 
      : Math.ceil(stats.minutes);
    
    // Generate unique ID from slug
    const id = `${category}-${slug}`;
    
    return {
      id,
      slug,
      title: frontmatter.title,
      excerpt: frontmatter.excerpt,
      content: contentHtml,
      category: getCategory(frontmatter.category || category),
      author: getAuthor(frontmatter.author),
      featuredImage: frontmatter.image,
      publishedAt: new Date(frontmatter.date),
      readTime: readTimeMinutes,
      tags: frontmatter.tags || [],
      views: Math.floor(Math.random() * 10000) + 1000,
      featured: frontmatter.featured || false,
      trending: frontmatter.trending || false,
    };
  } catch (error) {
    console.error(`Error reading article ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Get all articles from markdown files
 */
export async function getAllArticles(): Promise<Article[]> {
  const slugs = getArticleSlugs();
  const articles: Article[] = [];
  
  for (const { category, slug } of slugs) {
    const article = await getArticleBySlug(category, slug);
    if (article) {
      articles.push(article);
    }
  }
  
  // Sort by date (newest first)
  return articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.filter(article => article.category.slug === category);
}

/**
 * Get featured articles
 */
export async function getFeaturedArticles(): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.filter(article => article.featured);
}

/**
 * Get trending articles
 */
export async function getTrendingArticles(): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.filter(article => article.trending);
}

/**
 * Get related articles (same category, excluding current)
 */
export async function getRelatedArticles(
  currentSlug: string,
  category: string,
  limit: number = 3
): Promise<Article[]> {
  const categoryArticles = await getArticlesByCategory(category);
  return categoryArticles
    .filter(article => article.slug !== currentSlug)
    .slice(0, limit);
}

/**
 * Get latest articles
 */
export async function getLatestArticles(limit: number = 10): Promise<Article[]> {
  const allArticles = await getAllArticles();
  return allArticles.slice(0, limit);
}

/**
 * Search articles by query
 */
export async function searchArticles(query: string): Promise<Article[]> {
  const allArticles = await getAllArticles();
  const lowerQuery = query.toLowerCase();
  
  return allArticles.filter(article => 
    article.title.toLowerCase().includes(lowerQuery) ||
    article.excerpt.toLowerCase().includes(lowerQuery) ||
    article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    article.author.name.toLowerCase().includes(lowerQuery)
  );
}
