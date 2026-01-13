import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBySlug, getRelatedArticles } from '@/data/articles';
import { formatDate } from '@/lib/utils';
import AdPlacement from '@/components/AdPlacement';
import SocialShare from '@/components/SocialShare';
import RelatedArticles from '@/components/RelatedArticles';
import ReadingProgress from '@/components/ReadingProgress';
import Comments from '@/components/Comments';
import Avatar from '@/components/Avatar';
import { Clock, Bookmark } from 'lucide-react';
import type { Metadata } from 'next';
import { BillboardAd, SidebarAds, InArticleAd } from '@/components/ads';

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const article = await getArticleBySlug(slug, category);
  
  if (!article) {
    return {
      title: 'Article Not Found',
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug, category } = await params;
  const article = await getArticleBySlug(slug, category);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article);
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
            </div>

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

            {/* Related Articles */}
            <RelatedArticles articles={relatedArticles} title="Related Stories" />

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
