'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/utils';
import { Article } from '@/types';

interface MoreNewsProps {
  articles: Article[];
  currentArticleId?: string;
  title?: string;
  className?: string;
}

export default function MoreNews({ 
  articles, 
  currentArticleId,
  title = "MORE NEWS",
  className = ""
}: MoreNewsProps) {
  // Filter out current article and limit to 6
  const filteredArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 6);

  if (filteredArticles.length === 0) return null;

  return (
    <section className={`py-12 ${className}`}>
      {/* Section Header with Line */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-headline font-black text-gray-900 dark:text-white uppercase tracking-tight whitespace-nowrap">
          {title}
        </h2>
        <div className="flex-1 h-[3px] bg-gray-900 dark:bg-white"></div>
      </div>

      {/* Articles List */}
      <div className="space-y-0">
        {filteredArticles.map((article, index) => (
          <div key={article.id}>
            {/* Article Item */}
            <Link 
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex gap-5 py-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-4 px-4 rounded-lg"
            >
              {/* Image */}
              <div className="relative w-[180px] h-[120px] md:w-[220px] md:h-[140px] flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                {/* Category & Time */}
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {formatDistanceToNow(article.publishedAt)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-headline font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-accent transition-colors line-clamp-2 mb-2">
                  {article.title}
                </h3>

                {/* Author */}
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {article.author.name}
                </p>
              </div>
            </Link>

            {/* Divider Line (except after last item) */}
            {index < filteredArticles.length - 1 && (
              <div className="border-b border-gray-200 dark:border-gray-700"></div>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Link 
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold uppercase text-sm tracking-wider rounded-full hover:bg-brand-accent dark:hover:bg-brand-accent dark:hover:text-white transition-colors"
        >
          View All Stories
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// Compact version for sidebars
export function MoreNewsCompact({ 
  articles, 
  currentArticleId,
  title = "LATEST",
  className = ""
}: MoreNewsProps) {
  const filteredArticles = articles
    .filter(article => article.id !== currentArticleId)
    .slice(0, 5);

  if (filteredArticles.length === 0) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-lg font-headline font-black text-gray-900 dark:text-white uppercase tracking-tight">
          {title}
        </h3>
        <div className="flex-1 h-[2px] bg-gray-900 dark:bg-white"></div>
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {filteredArticles.map((article, index) => (
          <div key={article.id}>
            <Link 
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex gap-3"
            >
              {/* Small Image */}
              <div className="relative w-[70px] h-[70px] flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span 
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: article.category.color }}
                >
                  {article.category.name}
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-accent transition-colors line-clamp-2 mt-0.5">
                  {article.title}
                </h4>
              </div>
            </Link>

            {/* Divider */}
            {index < filteredArticles.length - 1 && (
              <div className="border-b border-gray-100 dark:border-gray-700 mt-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
