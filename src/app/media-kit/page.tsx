import Link from 'next/link';
import { 
  Download, 
  Users, 
  Eye, 
  TrendingUp, 
  Clock, 
  Globe, 
  Smartphone,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  Target,
  Award,
  FileText,
  ArrowRight
} from 'lucide-react';
import type { Metadata } from 'next';
import AdvertisingCheckout from '@/components/AdvertisingCheckout';
import AfricaWatermark from '@/components/AfricaWatermark';

export const metadata: Metadata = {
  title: 'Media Kit | AfriVerse - Advertising Partnership',
  description: 'Download the AfriVerse media kit. Learn about our audience demographics, ad formats, pricing, and partnership opportunities.',
};

// Audience Demographics
const demographics = {
  age: [
    { range: '18-24', percentage: 28 },
    { range: '25-34', percentage: 37 },
    { range: '35-44', percentage: 22 },
    { range: '45+', percentage: 13 },
  ],
  gender: [
    { label: 'Male', percentage: 52 },
    { label: 'Female', percentage: 48 },
  ],
  location: [
    { country: 'Nigeria', percentage: 45 },
    { country: 'Ghana', percentage: 15 },
    { country: 'Kenya', percentage: 12 },
    { country: 'South Africa', percentage: 10 },
    { country: 'Other Africa', percentage: 10 },
    { country: 'Diaspora', percentage: 8 },
  ],
  interests: [
    'Technology & Innovation',
    'Business & Finance',
    'Entertainment & Culture',
    'Politics & Current Affairs',
    'Sports',
    'Lifestyle & Fashion',
  ],
};

// Traffic Stats
const trafficStats = [
  { icon: Users, label: 'Monthly Unique Visitors', value: '2.4M+', growth: '+18%' },
  { icon: Eye, label: 'Monthly Page Views', value: '8.5M+', growth: '+24%' },
  { icon: Clock, label: 'Avg. Time on Site', value: '3:45', growth: '+12%' },
  { icon: TrendingUp, label: 'Pages per Session', value: '4.2', growth: '+8%' },
  { icon: Smartphone, label: 'Mobile Traffic', value: '72%', growth: '+5%' },
  { icon: Globe, label: 'Countries Reached', value: '120+', growth: '' },
];

// Ad Formats & Pricing
const adFormats = [
  {
    name: 'Billboard',
    dimensions: '970×250',
    placement: 'Top of page, maximum visibility',
    cpm: '$12-18',
    available: ['Homepage', 'Category Pages'],
  },
  {
    name: 'Leaderboard',
    dimensions: '728×90',
    placement: 'Header & in-content',
    cpm: '$8-12',
    available: ['All Pages'],
  },
  {
    name: 'Medium Rectangle',
    dimensions: '300×250',
    placement: 'Sidebar, high engagement',
    cpm: '$10-15',
    available: ['Article Pages', 'Category Pages'],
  },
  {
    name: 'Half Page',
    dimensions: '300×600',
    placement: 'Sticky sidebar',
    cpm: '$15-22',
    available: ['Article Pages'],
  },
  {
    name: 'In-Article',
    dimensions: '728×90 / Responsive',
    placement: 'Within article content',
    cpm: '$10-14',
    available: ['Article Pages'],
  },
  {
    name: 'Mobile Banner',
    dimensions: '320×50',
    placement: 'Mobile header/footer',
    cpm: '$6-10',
    available: ['Mobile Site'],
  },
  {
    name: 'Native Content',
    dimensions: 'Custom',
    placement: 'Integrated with editorial',
    cpm: 'Custom',
    available: ['Homepage', 'Category Feeds'],
  },
];

// Sponsored Content Packages
const contentPackages = [
  {
    id: 'sponsored-article',
    name: 'Sponsored Article',
    price: '$499',
    includes: [
      'Full-length branded article',
      'Homepage feature (24 hours)',
      'Social media promotion (3 posts)',
      'Newsletter inclusion',
      '30-day hosting',
    ],
  },
  {
    id: 'content-series',
    name: 'Content Series',
    price: '$1,999',
    includes: [
      '4 sponsored articles',
      'Dedicated landing page',
      'Category page feature',
      'Social campaign (12 posts)',
      'Newsletter spotlight',
      '90-day hosting',
    ],
  },
  {
    id: 'brand-takeover',
    name: 'Brand Takeover',
    price: '$4,999',
    includes: [
      'Homepage takeover (1 week)',
      '6 sponsored articles',
      'Custom content hub',
      'Video integration',
      'Full social campaign',
      'Dedicated account manager',
    ],
  },
];

export default function MediaKitPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      {/* Africa Watermark - Global */}
      <div className="fixed top-1/2 right-0 -translate-y-1/2 translate-x-1/4 pointer-events-none z-0 opacity-[0.02]">
        <AfricaWatermark position="right" size="xl" opacity={1} className="text-gray-900 dark:text-white" />
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 overflow-hidden">
        {/* Africa Watermark in Hero */}
        <AfricaWatermark 
          position="right" 
          size="xl" 
          opacity={0.08} 
          className="text-amber-500"
        />
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              Media Kit 2026
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6">
              Partner with <span className="text-amber-400">AfriVerse</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Africa's leading digital publication reaching millions of engaged readers across the continent and diaspora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/media-kit/AfriVerse-MediaKit-2026.pdf"
                download
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-gray-900 rounded-xl font-bold hover:bg-amber-400 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Full Media Kit (PDF)
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
              >
                Contact Sales Team
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Traffic & Audience Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Audience & Traffic
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our engaged audience represents Africa's most influential consumers, decision-makers, and trendsetters.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {trafficStats.map((stat) => (
              <div 
                key={stat.label} 
                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm"
              >
                <stat.icon className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {stat.label}
                </div>
                {stat.growth && (
                  <span className="text-xs text-green-500 font-medium">
                    {stat.growth} YoY
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demographics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Audience Demographics
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Premium audience with high purchasing power
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Age Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Age Distribution
              </h3>
              <div className="space-y-3">
                {demographics.age.map((item) => (
                  <div key={item.range}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.range}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Split */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                Gender Split
              </h3>
              <div className="flex items-center justify-center gap-8 py-6">
                {demographics.gender.map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      {item.percentage}%
                    </div>
                    <div className="text-sm text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-500" />
                Top Locations
              </h3>
              <div className="space-y-2">
                {demographics.location.map((item) => (
                  <div key={item.country} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.country}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                Top Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {demographics.interests.map((interest) => (
                  <span 
                    key={interest}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Formats & Pricing */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Display Ad Formats & Rates
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Premium placements with guaranteed viewability
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Format</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Dimensions</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Placement</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">CPM Rate</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {adFormats.map((format) => (
                  <tr key={format.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">{format.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                        {format.dimensions}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {format.placement}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{format.cpm}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {format.available.map((loc) => (
                          <span key={loc} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                            {loc}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sponsored Content Packages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Sponsored Content Packages
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Native content that resonates with our audience
            </p>
          </div>

          <AdvertisingCheckout packages={contentPackages} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Why Advertise with AfriVerse?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Award,
                title: 'Premium Audience',
                description: 'High-income, educated professionals and decision-makers',
              },
              {
                icon: Target,
                title: 'Brand Safety',
                description: 'All content is editorial-reviewed and brand-safe',
              },
              {
                icon: BarChart3,
                title: 'Transparent Reporting',
                description: 'Real-time analytics and detailed campaign reports',
              },
              {
                icon: Users,
                title: 'Dedicated Support',
                description: 'Personal account manager for all campaigns',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-headline font-bold mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-gray-400 mb-8">
                  Our advertising team is ready to help you create a customized campaign that meets your objectives and budget.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a href="mailto:advertise@afriverse.africa" className="font-medium hover:text-amber-400">
                        advertise@afriverse.africa
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <a href="tel:+2349122719293" className="font-medium hover:text-amber-400">
                        +234 91 227 19293
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Office</p>
                      <p className="font-medium">Abuja, Nigeria</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-8">
                <h3 className="font-bold text-xl mb-6">Quick Inquiry</h3>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                      <option value="" className="text-gray-900">Select Budget Range</option>
                      <option value="500-2000" className="text-gray-900">$500 - $2,000</option>
                      <option value="2000-5000" className="text-gray-900">$2,000 - $5,000</option>
                      <option value="5000-10000" className="text-gray-900">$5,000 - $10,000</option>
                      <option value="10000+" className="text-gray-900">$10,000+</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      placeholder="Tell us about your campaign goals..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Send Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
