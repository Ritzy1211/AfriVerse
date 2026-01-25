// Type definitions for AfriVerse

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category;
  subcategory?: Subcategory;
  author: Author;
  featuredImage: string;
  publishedAt: Date;
  readTime: number;
  tags: string[];
  views?: number;
  featured?: boolean;
  trending?: boolean;
  isPremium?: boolean;
  isSponsored?: boolean;
  sponsorName?: string | null;
  sponsorLogo?: string | null;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  subcategories?: Subcategory[];
}

export interface TrendingTopic {
  id: string;
  title: string;
  upiScore: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  url: string;
}

export interface UserPreferences {
  interests: string[];
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'pidgin';
  savedArticles: string[];
  readingHistory: string[];
}

export interface AdPlacement {
  id: string;
  type: 'banner' | 'native' | 'sidebar' | 'video';
  position: string;
  size: string;
  content?: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}
