import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Tech',
    slug: 'tech',
    description: 'Technology, startups, and innovation',
    color: '#00D9FF',
    icon: '💻',
    subcategories: [
      { id: 'tech-1', name: 'Startups', slug: 'startups', icon: '🚀' },
      { id: 'tech-2', name: 'Mobile', slug: 'mobile', icon: '📱' },
      { id: 'tech-3', name: 'AI & Data', slug: 'ai-data', icon: '🤖' },
      { id: 'tech-4', name: 'Fintech', slug: 'fintech', icon: '💳' },
      { id: 'tech-5', name: 'Reviews', slug: 'reviews', icon: '⭐' },
    ],
  },
  {
    id: '2',
    name: 'Culture',
    slug: 'culture',
    description: 'Art, entertainment, and lifestyle',
    color: '#F39C12',
    icon: '🎭',
    subcategories: [
      { id: 'culture-1', name: 'Film & TV', slug: 'film-tv', icon: '🎬' },
      { id: 'culture-2', name: 'Art', slug: 'art', icon: '🎨' },
      { id: 'culture-3', name: 'Fashion', slug: 'fashion', icon: '👗' },
      { id: 'culture-4', name: 'Food', slug: 'food', icon: '🍽️' },
    ],
  },
  {
    id: '3',
    name: 'Business',
    slug: 'business',
    description: 'Finance, entrepreneurship, and economics',
    color: '#27AE60',
    icon: '💼',
    subcategories: [
      { id: 'biz-1', name: 'Finance', slug: 'finance', icon: '📊' },
      { id: 'biz-2', name: 'Entrepreneurship', slug: 'entrepreneurship', icon: '💡' },
      { id: 'biz-3', name: 'Markets', slug: 'markets', icon: '📈' },
      { id: 'biz-4', name: 'Real Estate', slug: 'real-estate', icon: '🏢' },
    ],
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    description: 'Football, basketball, and more',
    color: '#E74C3C',
    icon: '⚽',
    subcategories: [
      { id: 'sports-1', name: 'Football', slug: 'football', icon: '⚽' },
      { id: 'sports-2', name: 'Basketball', slug: 'basketball', icon: '🏀' },
      { id: 'sports-3', name: 'Athletics', slug: 'athletics', icon: '🏃' },
      { id: 'sports-4', name: 'Boxing/MMA', slug: 'combat-sports', icon: '🥊' },
    ],
  },
  {
    id: '5',
    name: 'Politics',
    slug: 'politics',
    description: 'Governance, policy, and current affairs',
    color: '#9B59B6',
    icon: '🏛️',
    subcategories: [
      { id: 'pol-1', name: 'Elections', slug: 'elections', icon: '🗳️' },
      { id: 'pol-2', name: 'Policy', slug: 'policy', icon: '📜' },
      { id: 'pol-3', name: 'Opinion', slug: 'opinion', icon: '💬' },
      { id: 'pol-4', name: 'International', slug: 'international', icon: '🌍' },
    ],
  },
  {
    id: '6',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Fashion, food, travel, and wellness',
    color: '#E91E63',
    icon: '✨',
    subcategories: [
      { id: 'life-1', name: 'Travel', slug: 'travel', icon: '✈️' },
      { id: 'life-2', name: 'Wellness', slug: 'wellness', icon: '🧘' },
      { id: 'life-3', name: 'Relationships', slug: 'relationships', icon: '💕' },
      { id: 'life-4', name: 'Home', slug: 'home', icon: '🏡' },
    ],
  },
  {
    id: '7',
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Music, movies, celebrities, and pop culture',
    color: '#8B5CF6',
    icon: '🎬',
    subcategories: [
      { id: 'ent-1', name: 'Music', slug: 'music', icon: '🎵', color: '#FF6B35' },
      { id: 'ent-2', name: 'Movies & TV', slug: 'movies-tv', icon: '🎬', color: '#E74C3C' },
      { id: 'ent-3', name: 'Celebrities', slug: 'celebrities', icon: '⭐', color: '#F39C12' },
      { id: 'ent-4', name: 'Events', slug: 'events', icon: '🎪', color: '#00D4AA' },
      { id: 'ent-5', name: 'Gaming', slug: 'gaming', icon: '🎮', color: '#9B59B6' },
      { id: 'ent-6', name: 'Comedy', slug: 'comedy', icon: '😂', color: '#FFD93D' },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}

export function getSubcategoryBySlug(categorySlug: string, subcategorySlug: string) {
  const category = getCategoryBySlug(categorySlug);
  if (!category?.subcategories) return undefined;
  return category.subcategories.find(sub => sub.slug === subcategorySlug);
}
