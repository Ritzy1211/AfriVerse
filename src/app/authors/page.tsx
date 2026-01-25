import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Users, 
  PenTool, 
  Award, 
  Globe,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Mic,
  Camera,
  Video,
  FileText
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Authors & Writers | AfriVerse',
  description: 'Meet the talented journalists, writers, and storytellers behind AfriVerse. Our diverse team brings authentic African perspectives to global audiences.',
};

const featuredAuthors = [
  {
    name: 'Editorial Team',
    role: 'News & Analysis',
    bio: 'Our core editorial team brings decades of combined experience from leading news organizations across Africa.',
    articles: '2,500+',
    specialties: ['Breaking News', 'Investigative', 'Analysis'],
  },
  {
    name: 'Tech Bureau',
    role: 'Technology & Innovation',
    bio: 'Dedicated to covering Africa\'s booming tech ecosystem, from startups to digital transformation.',
    articles: '1,200+',
    specialties: ['Startups', 'AI/ML', 'Fintech'],
  },
  {
    name: 'Sports Desk',
    role: 'Sports Coverage',
    bio: 'Comprehensive coverage of African sports, from local leagues to international competitions.',
    articles: '1,800+',
    specialties: ['Football', 'Athletics', 'Basketball'],
  },
  {
    name: 'Culture & Lifestyle',
    role: 'Entertainment & Arts',
    bio: 'Celebrating African creativity through music, film, fashion, and contemporary art coverage.',
    articles: '1,500+',
    specialties: ['Music', 'Film', 'Fashion'],
  },
];

const authorTypes = [
  {
    icon: PenTool,
    title: 'Staff Writers',
    description: 'Full-time journalists dedicated to in-depth reporting and daily news coverage.',
    count: '25+',
  },
  {
    icon: Mic,
    title: 'Contributors',
    description: 'Expert voices from various fields bringing specialized knowledge and perspectives.',
    count: '150+',
  },
  {
    icon: Camera,
    title: 'Photojournalists',
    description: 'Visual storytellers capturing the essence of African life through powerful imagery.',
    count: '30+',
  },
  {
    icon: Video,
    title: 'Multimedia Creators',
    description: 'Video producers and podcast hosts expanding our digital storytelling formats.',
    count: '20+',
  },
];

const stats = [
  { label: 'Total Writers', value: '500+' },
  { label: 'Countries Represented', value: '42' },
  { label: 'Languages', value: '15+' },
  { label: 'Stories Published', value: '10K+' },
];

export default function AuthorsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4 text-brand-accent" />
              <span>Our Storytellers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6">
              The Voices Behind{' '}
              <span className="text-brand-accent">AfriVerse</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our diverse network of journalists, writers, and storytellers brings 
              authentic African perspectives to millions of readers worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50 -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Author Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Our Writing Community
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A diverse team united by a passion for African storytelling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {authorTypes.map((type) => (
              <div 
                key={type.title}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-4">
                  <type.icon className="w-6 h-6 text-brand-accent" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {type.count}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teams */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Editorial Teams
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Specialized desks covering every aspect of African life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featuredAuthors.map((author) => (
              <div 
                key={author.name}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-accent to-brand-primary flex items-center justify-center text-white font-bold text-xl">
                    {author.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {author.name}
                    </h3>
                    <p className="text-brand-accent font-medium">{author.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {author.bio}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {author.specialties.map((specialty) => (
                      <span 
                        key={specialty}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {author.articles} articles
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">
              Join Our Writing Team
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Are you a talented writer with a passion for African stories? 
              We&apos;re always looking for new voices to join our community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/storytellers/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition-colors"
              >
                <PenTool className="w-5 h-5" />
                Become a Storyteller
              </Link>
              <Link 
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
              >
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
