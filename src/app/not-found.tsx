'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, Newspaper } from 'lucide-react';
import { categories } from '@/data/categories';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-brand-dark flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] md:text-[240px] font-display font-black text-gray-100 dark:text-gray-800 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center animate-pulse">
              <Newspaper className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off. 
          It might have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link 
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Search Articles
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Popular Categories */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Or explore our popular categories:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-secondary hover:text-secondary transition-colors"
              >
                {category.icon} {category.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-12 p-4 bg-secondary/10 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Fun fact:</strong> The term &quot;404&quot; comes from the room number at CERN 
            where the original web servers were located. When a file wasn&apos;t found, 
            it was said to be &quot;not found in room 404.&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
