import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles, getArticlesByCategory } from '@/data/articles';
import { getCategoryBySlug, getSubcategoryBySlug } from '@/data/categories';
import { formatDate } from '@/lib/utils';
import AdPlacement from '@/components/AdPlacement';
import SocialShare from '@/components/SocialShare';
import RelatedArticles from '@/components/RelatedArticles';
import ReadingProgress from '@/components/ReadingProgress';
import Comments from '@/components/Comments';
import Avatar from '@/components/Avatar';
import ArticleCard from '@/components/ArticleCard';
import Pagination from '@/components/Pagination';
import { Clock, Bookmark, Megaphone } from 'lucide-react';
import type { Metadata } from 'next';
import { BillboardAd, SidebarAds, InArticleAd } from '@/components/ads';

const ARTICLES_PER_PAGE = 9;

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params;
  
  // First check if slug is a subcategory
  const categoryData = getCategoryBySlug(category);
  if (categoryData) {
    const subcategory = getSubcategoryBySlug(category, slug);
    if (subcategory) {
      return {
        title: `${subcategory.name} - ${categoryData.name} | AfriVerse`,
        description: subcategory.description || `Explore the latest ${subcategory.name} content on AfriVerse`,
      };
    }
  }
  
  // Otherwise treat as article
  const article = await getArticleBySlug(slug, category);
  
  if (!article) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${article.title} | AfriVerse`,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author.name],
      images: [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage],
    },
  };
}

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug, category } = await params;
  const { page } = await searchParams;
  
  // First check if this is a subcategory page
  const categoryData = getCategoryBySlug(category);
  if (categoryData) {
    const subcategory = getSubcategoryBySlug(category, slug);
    if (subcategory) {
      // Render subcategory page
      return <SubcategoryPage 
        category={categoryData} 
        subcategory={subcategory} 
        currentPage={Math.max(1, parseInt(page || '1', 10))}
      />;
    }
  }
  
  // Otherwise render article page
  const article = await getArticleBySlug(slug, category);

  if (!article) {
    notFound();
  }

  return <ArticlePage article={article} />;
}

// Subcategory Page Component
async function SubcategoryPage({ 
  category, 
  subcategory, 
  currentPage 
}: { 
  category: NonNullable<ReturnType<typeof getCategoryBySlug>>;
  subcategory: NonNullable<ReturnType<typeof getSubcategoryBySlug>>;
  currentPage: number;
}) {
  // Get all articles for this category and filter by subcategory
  let allArticles = await getArticlesByCategory(category.slug);
  allArticles = allArticles.filter(article => article.subcategory?.slug === subcategory.slug);
  
  // Pagination
  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const articles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Billboard Ad */}
      <BillboardAd />

      {/* Subcategory Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
              Home
            </Link>
            <span>/</span>
            <Link 
              href={`/${category.slug}`} 
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              {category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {subcategory.name}
            </span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <span 
              className="text-4xl p-3 rounded-xl"
              style={{ backgroundColor: `${subcategory.color || category.color}20` }}
            >
              {subcategory.icon || category.icon}
            </span>
            <div>
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white">
                {subcategory.name}
              </h1>
              {subcategory.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {subcategory.description}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Part of <Link href={`/${category.slug}`} className="text-brand-primary hover:underline">{category.name}</Link>
              </p>
            </div>
          </div>

          {/* All Subcategories/Genres Filter */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                href={`/${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                All {category.name}
              </Link>
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${category.slug}/${sub.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    sub.slug === subcategory.slug
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={sub.slug === subcategory.slug ? { backgroundColor: sub.color || category.color } : {}}
                >
                  <span>{sub.icon}</span>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles Grid */}
          <div className="lg:flex-1">
            {articles.length > 0 ? (
              <div className="space-y-8">
                {/* Featured first article if on first page */}
                {currentPage === 1 && articles[0] && (
                  <ArticleCard article={articles[0]} featured />
                )}

                {/* Grid of Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(currentPage === 1 ? articles.slice(1, 5) : articles.slice(0, 4)).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* In-Article Ad after first few articles */}
                {articles.length > 5 && <InArticleAd className="my-8" />}

                {/* Rest of Articles */}
                {articles.length > (currentPage === 1 ? 5 : 4) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(currentPage === 1 ? articles.slice(5) : articles.slice(4)).map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <span className="text-6xl mb-4 block">{subcategory.icon || '📰'}</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No articles yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  We&apos;re working on bringing you the best {subcategory.name} content.
                </p>
                <Link
                  href={`/${category.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                >
                  Browse all {category.name}
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/${category.slug}/${subcategory.slug}`}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            <SidebarAds />
            
            {/* Other Subcategories */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                More in {category.name}
              </h3>
              <div className="space-y-2">
                {category.subcategories?.filter(s => s.slug !== subcategory.slug).map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/${category.slug}/${sub.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span 
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
                      style={{ backgroundColor: `${sub.color || category.color}20` }}
                    >
                      {sub.icon}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{sub.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Article Page Component
async function ArticlePage({ article }: { article: Awaited<ReturnType<typeof getArticleBySlug>> }) {
  if (!article) return null;
  
  const relatedArticles = await getRelatedArticles(article, 6);
  const shareUrl = `https://afriverse.africa/${article.category.slug}/${article.slug}`;

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress color="#F39C12" />

      {/* Billboard Ad - Top of article */}
      <BillboardAd />
      
      <article className="min-h-screen">
      {/* Article Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-brand-dark py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <Link href="/" className="hover:text-brand-accent transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link 
                href={`/${article.category.slug}`}
                className="hover:text-brand-accent transition-colors"
              >
                {article.category.name}
              </Link>
              <span>/</span>
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {article.title.slice(0, 40)}...
              </span>
            </nav>

            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-6">
              <span 
                className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
              {article.trending && (
                <span className="px-4 py-1.5 bg-brand-accent text-white rounded-full text-sm font-bold">
                  🔥 TRENDING
                </span>
              )}
              {article.isSponsored && (
                <span className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm font-bold">
                  <Megaphone className="w-4 h-4" />
                  SPONSORED
                </span>
              )}
            </div>

            {/* Sponsored Content Banner */}
            {article.isSponsored && (
              <div className="flex items-center gap-4 p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                {article.sponsorLogo && (
                  <Image
                    src={article.sponsorLogo}
                    alt={article.sponsorName || 'Sponsor'}
                    width={60}
                    height={40}
                    className="object-contain"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Sponsored Content
                  </p>
                  {article.sponsorName && (
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      Brought to you by {article.sponsorName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-6 text-balance">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-balance">
              {article.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <Avatar
                  src={article.author.avatar}
                  alt={article.author.name}
                  size={48}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {article.author.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {article.author.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                <span>{formatDate(article.publishedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min read
                </span>
                {article.views && (
                  <>
                    <span>•</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-8">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12 prose-headings:font-headline prose-a:text-brand-accent prose-strong:text-gray-900 dark:prose-strong:text-white">
              <div 
                className="text-gray-800 dark:text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* In-Article Ad */}
            <InArticleAd className="my-8" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-brand-accent hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Share Buttons */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mb-12">
              <SocialShare 
                url={shareUrl} 
                title={article.title} 
                excerpt={article.excerpt}
              />
            </div>

            {/* Floating Share Buttons (Desktop) */}
            <SocialShare 
              url={shareUrl} 
              title={article.title} 
              excerpt={article.excerpt}
              variant="floating"
            />

            {/* Author Bio */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mb-12">
              <div className="flex gap-4">
                <Avatar
                  src={article.author.avatar}
                  alt={article.author.name}
                  size={80}
                  className="flex-shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {article.author.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {article.author.role}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {article.author.bio}
                  </p>
                  <Link 
                    href={`/author/${article.author.id}`}
                    className="text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                  >
                    View all articles →
                  </Link>
                </div>
              </div>
            </div>

            {/* Related Content Section - Featured */}
            <div className="mb-12">
              <RelatedArticles 
                articles={relatedArticles} 
                title="Related Content" 
                variant="featured"
              />
            </div>

            {/* Comments Section */}
            <Comments articleSlug={article.slug} articleTitle={article.title} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              {/* Save Article */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition-colors">
                <Bookmark className="w-5 h-5" />
                Save for Later
              </button>

              {/* Sidebar Ads - Billboard Style */}
              <SidebarAds />

              {/* Popular in Category */}
              <RelatedArticles 
                articles={relatedArticles} 
                title={`Popular in ${article.category.name}`}
                variant="compact"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
    </>
  );
}
