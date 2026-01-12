import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAuthorById, getArticlesByAuthor, getAllAuthors } from '@/data/articles';
import ArticleCard from '@/components/ArticleCard';
import Avatar from '@/components/Avatar';
import { Twitter, Mail, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface AuthorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { id } = await params;
  const author = getAuthorById(id);

  if (!author) {
    return { title: 'Author Not Found' };
  }

  return {
    title: `${author.name} - Author at AfriVerse`,
    description: `Read articles by ${author.name}, ${author.role} at AfriVerse. ${author.bio}`,
    openGraph: {
      title: `${author.name} - AfriVerse`,
      description: author.bio,
      type: 'profile',
      images: [{ url: author.avatar, width: 200, height: 200 }],
    },
  };
}

export async function generateStaticParams() {
  const authors = getAllAuthors();
  return authors.map((author) => ({ id: author.id }));
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;
  const author = getAuthorById(id);

  if (!author) {
    notFound();
  }

  const articles = await getArticlesByAuthor(id);
  const totalArticles = articles.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Author Header */}
      <div className="bg-gradient-to-b from-primary to-primary/90 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/20">
                <Avatar
                  src={author.avatar}
                  alt={author.name}
                  size={160}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-lg">✍️</span>
              </div>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                {author.name}
              </h1>
              <p className="text-secondary font-semibold text-lg mb-4">
                {author.role}
              </p>
              <p className="text-white/80 text-lg max-w-2xl mb-6">
                {author.bio}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{totalArticles}</div>
                  <div className="text-sm text-white/60">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Total Views</div>
                </div>
              </div>

              {/* Social Links */}
              {author.socialLinks && (
                <div className="flex justify-center md:justify-start gap-3">
                  {author.socialLinks.twitter && (
                    <a
                      href={`https://twitter.com/${author.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 rounded-full hover:bg-[#1DA1F2] transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  <a
                    href={`mailto:${author.name.toLowerCase().replace(' ', '.')}@afriverse.ng`}
                    className="p-3 bg-white/10 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Articles by {author.name}
          </h2>
          <span className="text-gray-500 dark:text-gray-400">
            {totalArticles} article{totalArticles !== 1 ? 's' : ''}
          </span>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">
              No articles published yet.
            </p>
          </div>
        )}
      </div>

      {/* All Authors Link */}
      <div className="text-center pb-12">
        <Link
          href="/authors"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          View All Authors
        </Link>
      </div>
    </div>
  );
}
