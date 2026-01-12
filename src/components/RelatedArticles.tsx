import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, TrendingUp } from 'lucide-react';

interface RelatedArticlesProps {
  articles: Article[];
  title?: string;
  variant?: 'grid' | 'list' | 'compact';
}

export default function RelatedArticles({ 
  articles, 
  title = 'Related Stories',
  variant = 'grid' 
}: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-5">
        <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          {title}
        </h3>
        <div className="space-y-4">
          {articles.slice(0, 5).map((article, index) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
              className="flex gap-3 group"
            >
              <span className="text-2xl font-display font-bold text-gray-200 dark:text-gray-700 group-hover:text-secondary transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-secondary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{article.category.name}</span>
                  <span>•</span>
                  <span>{article.readTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div>
        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>
        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category.slug}/${article.slug}`}
              className="flex gap-4 group"
            >
              <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  className="text-xs font-semibold uppercase"
                  style={{ color: article.category.color }}
                >
                  {article.category.name}
                </span>
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-secondary transition-colors mt-1">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div>
      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.category.slug}/${article.slug}`}
            className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: article.category.color }}
                >
                  {article.category.name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-secondary transition-colors mb-2">
                {article.title}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(article.publishedAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime} min read
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
