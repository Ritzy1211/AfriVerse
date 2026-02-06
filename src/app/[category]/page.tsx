import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/data/categories';
import { getArticlesByCategory } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import type { Metadata } from 'next';
import { BillboardAd, SidebarAds, InArticleAd } from '@/components/ads';
import Link from 'next/link';

// Revalidate category pages every 10 seconds for faster updates
export const revalidate = 10;

const ARTICLES_PER_PAGE = 9;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  
  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | AfriVerse`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { page } = await searchParams;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const allArticles = await getArticlesByCategory(category.slug);
  
  // Pagination
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const articles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Billboard Ad - Top of category */}
      <BillboardAd />

      {/* Category Header - Clean, No Hero */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <span 
              className="text-4xl p-3 rounded-xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {category.description}
              </p>
            </div>
          </div>

          {/* Subcategories/Genres Filter */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href={`/${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors text-white"
                style={{ backgroundColor: category.color }}
              >
                All {category.name}
              </Link>
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${category.slug}/${sub.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <span>{sub.icon}</span>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2">
            {articles.length > 0 ? (
              <div className="space-y-8">
                {/* Featured Article */}
                <ArticleCard article={articles[0]} featured />

                {/* Grid of Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.slice(1, 5).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* In-Article Ad after first few articles */}
                {articles.length > 5 && <InArticleAd className="my-8" />}

                {/* Rest of Articles */}
                {articles.length > 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.slice(5).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No articles in this category yet. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Sidebar Ads - Billboard Style */}
              <SidebarAds />
              
              {/* Category Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6">
                <h3 className="text-lg font-headline font-bold text-gray-900 dark:text-white mb-4">
                  About {category.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  {allArticles.length} article{allArticles.length !== 1 ? 's' : ''} in this category
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/${category.slug}`}
          className="mt-12"
        />
      </div>
    </div>
  );
}
