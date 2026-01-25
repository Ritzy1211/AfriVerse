import { Metadata } from 'next';
import Link from 'next/link';
import {
  Activity,
  Building2,
  Globe,
  Users,
  Cpu,
  ArrowLeft,
  Database,
  BarChart3,
  RefreshCw,
  Shield,
  Scale,
  TrendingUp,
  Newspaper,
  MessageSquare,
  LineChart,
  CheckCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AfriPulse Methodology | How We Calculate Sentiment | AfriVerse',
  description: 'Learn how the AfriPulse Index™ calculates sentiment scores for African nations using AI, news analysis, social media monitoring, and economic indicators.',
};

export default function MethodologyPage() {
  const dataSources = [
    {
      icon: Newspaper,
      title: 'News Sources',
      description: 'We analyze over 500 African news outlets, international publications covering Africa, and local language media across all 54 countries.',
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: MessageSquare,
      title: 'Social Media',
      description: 'Real-time sentiment analysis from Twitter/X, Facebook, and local social platforms, weighted by engagement and verified accounts.',
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: LineChart,
      title: 'Economic Indicators',
      description: 'Currency exchange rates, stock market performance, inflation data, and foreign direct investment figures from official sources.',
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Database,
      title: 'Official Reports',
      description: 'Government announcements, policy documents, election data, and international organization reports (IMF, World Bank, AU).',
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
  ];

  const categories = [
    {
      icon: Building2,
      title: 'Economy Score',
      description: 'Measures public and market sentiment toward economic conditions',
      factors: [
        'Currency strength and stability',
        'Stock market performance',
        'Inflation rates and cost of living sentiment',
        'Foreign investment news and announcements',
        'Business confidence indicators',
        'Job market sentiment',
      ],
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: Globe,
      title: 'Politics Score',
      description: 'Tracks confidence in governance and political stability',
      factors: [
        'Government approval ratings',
        'Policy announcement reception',
        'Electoral sentiment and participation',
        'Rule of law indicators',
        'International relations sentiment',
        'Regional cooperation news',
      ],
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-800',
    },
    {
      icon: Users,
      title: 'Social Score',
      description: 'Reflects public mood on quality of life and social issues',
      factors: [
        'Healthcare access sentiment',
        'Education quality discussions',
        'Infrastructure satisfaction',
        'Safety and security perception',
        'Cultural pride and identity',
        'Youth opportunity outlook',
      ],
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
    },
    {
      icon: Cpu,
      title: 'Technology Score',
      description: 'Gauges innovation adoption and digital transformation sentiment',
      factors: [
        'Tech startup ecosystem coverage',
        'Digital infrastructure access',
        'Mobile money and fintech adoption',
        'AI and innovation news',
        'Tech investment announcements',
        'Digital literacy initiatives',
      ],
      color: 'text-cyan-500',
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      border: 'border-cyan-200 dark:border-cyan-800',
    },
  ];

  const principles = [
    {
      icon: Scale,
      title: 'Balanced Weighting',
      description: 'Each source is weighted based on reliability, reach, and verification status. Official sources carry more weight than social media speculation.',
    },
    {
      icon: Shield,
      title: 'Bias Detection',
      description: 'Our AI models are trained to identify and filter out propaganda, fake news, and coordinated inauthentic behavior.',
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Updates',
      description: 'Scores are recalculated hourly to reflect the latest developments and shifting sentiment patterns.',
    },
    {
      icon: BarChart3,
      title: 'Historical Context',
      description: 'Current scores are contextualized against historical data to identify trends and anomalies.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/afripulse"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AfriPulse Index
          </Link>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              AfriPulse Index™ Methodology
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How We Calculate <span className="text-amber-500">African Sentiment</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              The AfriPulse Index™ uses advanced AI and natural language processing to analyze 
              millions of data points daily, providing the most comprehensive view of public 
              sentiment across African nations.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Data Sources
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            We aggregate and analyze data from multiple authoritative sources to ensure 
            accuracy and comprehensiveness.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataSources.map((source, i) => {
              const Icon = source.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className={`w-12 h-12 rounded-xl ${source.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${source.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{source.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{source.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Score Categories */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            The Four Pillars
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            Each country's sentiment is measured across four key dimensions, weighted equally 
            to produce the overall score.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, i) => {
              const Icon = category.icon;
              return (
                <div
                  key={i}
                  className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border-2 ${category.border}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${category.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{category.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.factors.map((factor, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${category.color} flex-shrink-0`} />
                        <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Calculation Formula */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Score Calculation
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 px-6 py-4 bg-slate-100 dark:bg-slate-700 rounded-xl font-mono text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Overall Score = </span>
                  <span className="text-blue-500">E</span>
                  <span className="text-gray-400">+</span>
                  <span className="text-purple-500">P</span>
                  <span className="text-gray-400">+</span>
                  <span className="text-green-500">S</span>
                  <span className="text-gray-400">+</span>
                  <span className="text-cyan-500">T</span>
                  <span className="text-gray-600 dark:text-gray-400"> / 4</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4">
                  <div className="text-4xl font-bold text-blue-500 mb-1">E</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Economy</div>
                </div>
                <div className="p-4">
                  <div className="text-4xl font-bold text-purple-500 mb-1">P</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Politics</div>
                </div>
                <div className="p-4">
                  <div className="text-4xl font-bold text-green-500 mb-1">S</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Social</div>
                </div>
                <div className="p-4">
                  <div className="text-4xl font-bold text-cyan-500 mb-1">T</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Technology</div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Each category score ranges from 0-100, where 0 represents 
                  extremely negative sentiment and 100 represents extremely positive sentiment. 
                  A score of 50 is considered neutral.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, i) => {
              const Icon = principle.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{principle.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{principle.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trend Classification */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Trend Classification
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h3 className="font-bold text-green-700 dark:text-green-400">Rising</h3>
                </div>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Score increased by 5+ points over the past 7 days, indicating improving sentiment.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-red-500 rotate-180" />
                  <h3 className="font-bold text-red-700 dark:text-red-400">Falling</h3>
                </div>
                <p className="text-sm text-red-800 dark:text-red-300">
                  Score decreased by 5+ points over the past 7 days, indicating declining sentiment.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-6 h-6 text-gray-500" />
                  <h3 className="font-bold text-gray-700 dark:text-gray-300">Stable</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score changed less than 5 points in either direction over the past 7 days.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-6 h-6 text-amber-500" />
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">Volatile</h3>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Large swings in score (10+ points) in multiple directions within the past 7 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Explore African Sentiment?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Dive into the AfriPulse Index™ and track real-time sentiment across the continent.
          </p>
          <Link
            href="/afripulse"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <Activity className="w-5 h-5" />
            View Live Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
