import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Tech',
    slug: 'tech',
    description: 'Technology, startups, and innovation',
    color: '#00D9FF',
    icon: '💻',
  },
  {
    id: '2',
    name: 'Culture',
    slug: 'culture',
    description: 'Music, art, entertainment, and lifestyle',
    color: '#F39C12',
    icon: '🎭',
  },
  {
    id: '3',
    name: 'Business',
    slug: 'business',
    description: 'Finance, entrepreneurship, and economics',
    color: '#27AE60',
    icon: '💼',
  },
  {
    id: '4',
    name: 'Sports',
    slug: 'sports',
    description: 'Football, basketball, and more',
    color: '#E74C3C',
    icon: '⚽',
  },
  {
    id: '5',
    name: 'Politics',
    slug: 'politics',
    description: 'Governance, policy, and current affairs',
    color: '#9B59B6',
    icon: '🏛️',
  },
  {
    id: '6',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Fashion, food, travel, and wellness',
    color: '#E91E63',
    icon: '✨',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(cat => cat.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}
