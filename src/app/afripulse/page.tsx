import { Metadata } from 'next';
import AfriPulseIndex from '@/components/AfriPulseIndex';
import { Activity, Info, TrendingUp, Globe, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AfriPulse Index™ | Real-time African Sentiment Tracker | AfriVerse',
  description: 'Track real-time sentiment across African nations with the AfriPulse Index™. Monitor economy, politics, social, and tech scores for key African countries.',
};

export default function AfriPulsePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              AfriPulse Index™
              <span className="px-2 py-0.5 bg-amber-500 text-slate-900 rounded text-xs font-bold">LIVE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Real-Time African <span className="text-amber-500">Sentiment Tracker</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              The first comprehensive index tracking public sentiment across economy, politics, 
              social issues, and technology for African nations. Updated in real-time from 
              news sources, social media, and economic indicators.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>54 Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>4 Indicators</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Updated Hourly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="container mx-auto px-4 py-12">
        <AfriPulseIndex variant="full" showTopics={true} maxCountries={10} />
      </section>

      {/* Methodology Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Our Methodology
              </h2>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                The AfriPulse Index™ is calculated using a proprietary algorithm that analyzes 
                multiple data sources to generate sentiment scores for each African nation across 
                four key dimensions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 text-sm">💼</span>
                    Economy Score
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Based on currency strength, stock market performance, inflation rates, 
                    foreign investment news, and business sentiment indicators.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 text-sm">🏛️</span>
                    Politics Score
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Derived from governance indicators, policy announcements, electoral 
                    sentiment, and public confidence in leadership.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 text-sm">👥</span>
                    Social Score
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Measures public mood on social issues, cultural events, community 
                    sentiment, and quality of life indicators.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 text-sm">💻</span>
                    Tech Score
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Tracks startup ecosystem health, digital adoption rates, tech 
                    investment news, and innovation sentiment.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Data Sources
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                <li>Major African news outlets and wire services</li>
                <li>Social media sentiment analysis (Twitter/X, Facebook, TikTok)</li>
                <li>Official government announcements and statistics</li>
                <li>International economic indicators (World Bank, IMF, AfDB)</li>
                <li>AfriVerse reader engagement and feedback</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Trend Indicators
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-green-500 font-bold mb-1">↗ RISING</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Score increased by 3+ points this week
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-gray-500 font-bold mb-1">→ STABLE</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Score changed by less than 3 points
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-red-500 font-bold mb-1">↘ FALLING</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Score decreased by 3+ points this week
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-amber-500 font-bold mb-1">⟷ VOLATILE</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Significant swings in both directions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Want to Contribute to AfriPulse?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Become a Verified Storyteller and help shape the narrative around African sentiment. 
            Your impactful stories directly influence our index.
          </p>
          <Link
            href="/storytellers/apply"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Apply to Become Verified
          </Link>
        </div>
      </section>
    </div>
  );
}
