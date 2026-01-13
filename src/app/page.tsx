import { getAllArticles, getTrendingArticles } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import UrbanPulseIndex from '@/components/UrbanPulseIndex';
import AdPlacement from '@/components/AdPlacement';
import NewsletterSignup from '@/components/NewsletterSignup';
import { categories } from '@/data/categories';
import Link from 'next/link';
import { TranslatedSectionHeader, TranslatedTopStoriesHeader } from '@/components/TranslatedContent';
import { BillboardAd, SidebarAds, InArticleAd } from '@/components/ads';
import AfriPulseIndex from '@/components/AfriPulseIndex';
import { Suspense } from 'react';
import { ArticleCardSkeleton } from '@/components/Skeleton';

// Revalidate homepage every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const allArticles = await getAllArticles();
  const trendingArticles = await getTrendingArticles();
  const featuredArticle = allArticles[0];
  const mainArticles = allArticles.slice(1, 5);
  const sideArticles = allArticles.slice(5, 10);

  return (
    <div className="min-h-screen">
      {/* Billboard Ad - Top of page */}
      <BillboardAd />

      {/* Hero Section - Billboard Style */}
      <section className="container mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Article */}
          <div className="lg:col-span-2">
            <ArticleCard article={featuredArticle} featured />
          </div>

          {/* Trending Sidebar - Entrepreneur Style */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4">
              <TranslatedTopStoriesHeader />
              <div className="space-y-4">
                {trendingArticles.slice(0, 4).map((article) => (
                  <ArticleCard key={article.id} article={article} horizontal />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Placement */}
      <section className="container mx-auto px-4 my-8 flex justify-center">
        <AdPlacement slot="header" />
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Articles */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest Articles Grid */}
            <div>
              <TranslatedSectionHeader 
                titleKey="home.latestStories" 
                viewAllLink="/search"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mainArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Category Sections - Billboard Chart Style */}
            {categories.slice(0, 3).map((category) => {
              const categoryArticles = allArticles.filter(
                (a) => a.category.slug === category.slug
              ).slice(0, 3);

              if (categoryArticles.length === 0) return null;

              return (
                <div key={category.id}>
                  <TranslatedSectionHeader 
                    titleKey={category.name}
                    categorySlug={category.slug}
                    icon={category.icon}
                    viewAllLink={`/${category.slug}`}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categoryArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>

                  {/* In-article ad after first category */}
                  {category.id === categories[0].id && (
                    <InArticleAd className="my-8" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* AfriPulse Index - Real-time African Sentiment */}
              <AfriPulseIndex variant="compact" maxCountries={5} />

              {/* Urban Pulse Index */}
              <UrbanPulseIndex />

              {/* Sidebar Ads - Billboard Style */}
              <SidebarAds />

              {/* More Articles */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-4">
                <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-4">
                  Don't Miss
                </h3>
                <div className="space-y-4">
                  {sideArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} horizontal />
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="container mx-auto px-4 my-12">
        <NewsletterSignup variant="hero" />
      </section>

      {/* Bottom Ad */}
      <section className="container mx-auto px-4 my-8 flex justify-center">
        <AdPlacement slot="footer" />
      </section>
    </div>
  );
}
