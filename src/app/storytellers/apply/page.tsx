import { Metadata } from 'next';
import { StorytellerApplicationForm, BadgeProgression } from '@/components/VerifiedStoryteller';
import { Shield, CheckCircle, Users, Globe, Award, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Become a Verified Storyteller | AfriVerse',
  description: 'Join our network of trusted African voices. Apply to become a Verified Storyteller and amplify your impact across the continent.',
};

export default function StorytellerApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Verified Storyteller Network
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tell Africa's Story with <span className="text-amber-500">Credibility</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Join an exclusive network of verified journalists, writers, and content creators 
              shaping authentic African narratives for global audiences.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Why Become a Verified Storyteller?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Verified Badge
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a distinctive verification badge that appears on all your articles, 
                establishing trust with readers instantly.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Impact Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access detailed analytics showing how your stories create real-world impact, 
                with our exclusive Impact Score™ system.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Global Reach
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your stories are prioritized in our recommendations and featured to our 
                growing international readership.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Community Access
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow verified storytellers, participate in exclusive events, 
                and collaborate on impactful projects.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Badge Progression
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Advance through Bronze, Silver, Gold, and Platinum tiers based on your 
                impact, unlocking new benefits at each level.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Priority Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get dedicated editorial support, faster review times, and direct access 
                to our editorial team for your stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Badge Levels Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Badge Levels
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              Progress through our badge system as you create impactful content
            </p>
            <BadgeProgression currentBadge={undefined} articlesCount={0} />
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Apply Now
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Fill out the form below to begin your verification journey
          </p>
          <StorytellerApplicationForm />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  What are the requirements to become verified?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We look for writers with a proven track record in journalism or content creation, 
                  subject matter expertise in African topics, and a commitment to accurate, 
                  ethical reporting.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  How long does the verification process take?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our editorial team reviews applications within 5-7 business days. 
                  You'll receive an email notification once a decision has been made.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Can my verification be revoked?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Verification can be suspended or revoked if our editorial standards are violated, 
                  including spreading misinformation, plagiarism, or ethical breaches.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  How do I advance to higher badge levels?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Badge progression is based on your Impact Score™ and the number of verified 
                  impact articles you've published. Each level unlocks additional benefits and recognition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
