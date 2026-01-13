'use client';

import React from 'react';

// Skeleton for article cards
export function ArticleCardSkeleton({ featured = false, horizontal = false }: { featured?: boolean; horizontal?: boolean }) {
  if (featured) {
    return (
      <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-soft animate-pulse">
        <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700" />
        <div className="p-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className="flex gap-4 animate-pulse">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-soft animate-pulse">
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// Skeleton for the trending ticker
export function TrendingTickerSkeleton() {
  return (
    <div className="bg-brand-secondary text-white overflow-hidden py-2 animate-pulse">
      <div className="container mx-auto px-4 flex items-center gap-4">
        <div className="w-32 h-4 bg-white/20 rounded" />
        <div className="flex-1 flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-white/20 rounded w-48" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for the homepage
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Trending Ticker Skeleton */}
      <TrendingTickerSkeleton />
      
      {/* Hero Section Skeleton */}
      <section className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ArticleCardSkeleton featured />
          </div>
          <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <ArticleCardSkeleton key={i} horizontal />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Generic skeleton wrapper
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

export default Skeleton;
