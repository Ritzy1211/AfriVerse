import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';
import { Clock, TrendingUp, Megaphone } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  horizontal?: boolean;
}

export default function ArticleCard({ article, featured = false, horizontal = false }: ArticleCardProps) {
  if (featured) {
    return (
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="group relative block overflow-hidden rounded-lg h-[500px] animate-fade-in"
      >
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-3 mb-3">
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
            {article.trending && (
              <span className="flex items-center gap-1 text-brand-accent text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                TRENDING
              </span>
            )}
            {article.isSponsored && (
              <span className="flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                <Megaphone className="w-3 h-3" />
                SPONSORED
              </span>
            )}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-white mb-3 group-hover:text-brand-accent transition-colors">
            {article.title}
          </h2>
          
          <p className="text-gray-300 mb-4 line-clamp-2">
            {article.excerpt}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span>{article.author.name}</span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min read
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (horizontal) {
    return (
      <Link
        href={`/${article.category.slug}/${article.slug}`}
        className="group flex gap-4 animate-fade-in"
      >
        <div className="relative w-40 h-28 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </span>
            {article.isSponsored && (
              <span className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                <Megaphone className="w-3 h-3" />
                Sponsored
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-brand-accent transition-colors">
            {article.title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.readTime} min</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${article.category.slug}/${article.slug}`}
      className="group block animate-fade-in"
    >
      <div className="relative h-48 rounded-lg overflow-hidden mb-3">
        <Image
          src={article.featuredImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {article.trending && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-brand-accent text-white px-2 py-1 rounded-full text-xs font-bold">
            <TrendingUp className="w-3 h-3" />
            HOT
          </div>
        )}
        {article.isSponsored && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Megaphone className="w-3 h-3" />
            Sponsored
          </div>
        )}
      </div>
      
      <span 
        className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white mb-2"
        style={{ backgroundColor: article.category.color }}
      >
        {article.category.name}
      </span>
      
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-brand-accent transition-colors">
        {article.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {article.excerpt}
      </p>
      
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{article.author.name}</span>
        <span>•</span>
        <span>{formatDate(article.publishedAt)}</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {article.readTime} min
        </span>
      </div>
    </Link>
  );
}
