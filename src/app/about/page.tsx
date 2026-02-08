import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Globe, 
  Users, 
  Newspaper, 
  Award, 
  Target, 
  Heart,
  TrendingUp,
  Shield,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Mic,
  Camera,
  PenTool,
  BarChart3,
  Zap,
  Mail,
  Crown,
  Building,
  MessageCircle,
  Star
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | AfriVerse',
  description: 'AfriVerse is Africa\'s premier digital media platform delivering authentic stories, insights, and perspectives that matter. Discover our mission to amplify African voices.',
};

const stats = [
  { label: 'Monthly Readers', value: '2M+', description: 'Engaged readers across Africa and the diaspora' },
  { label: 'Countries Covered', value: '54', description: 'Every African nation represented' },
  { label: 'Stories Published', value: '10K+', description: 'Quality journalism that matters' },
  { label: 'Verified Storytellers', value: '500+', description: 'Trusted voices across the continent' },
];

const values = [
  {
    icon: Shield,
    title: 'Truth & Accuracy',
    description: 'We uphold the highest standards of journalistic integrity. Every story is fact-checked, every source verified, and every claim substantiated.',
    color: 'bg-blue-500',
  },
  {
    icon: Heart,
    title: 'African Excellence',
    description: 'We celebrate African achievement, innovation, and culture. Our platform elevates voices that have historically been underrepresented in global media.',
    color: 'bg-red-500',
  },
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'From our proprietary AfriPulse Index™ to AI-powered content recommendations, we leverage technology to enhance the reader experience.',
    color: 'bg-amber-500',
  },
  {
    icon: Target,
    title: 'Meaningful Impact',
    description: 'We measure success not just in pageviews, but in the real-world impact our journalism creates—policy changes, social movements, and informed citizens.',
    color: 'bg-green-500',
  },
];

const milestones = [
  { year: '2023', title: 'Founded', description: 'AfriVerse launched with a mission to transform African digital media' },
  { year: '2024', title: 'Growth', description: 'Reached 1 million monthly readers and expanded to 30 countries' },
  { year: '2025', title: 'Innovation', description: 'Launched AfriPulse Index™ and Impact Score™ metrics' },
  { year: '2026', title: 'Scale', description: 'Now serving 2M+ readers with 500+ verified storytellers' },
];

const categories = [
  { name: 'Politics', icon: Globe, articles: '2.5K+', color: '#9C27B0' },
  { name: 'Business', icon: BarChart3, articles: '1.8K+', color: '#F39C12' },
  { name: 'Technology', icon: Zap, articles: '1.5K+', color: '#00D9FF' },
  { name: 'Entertainment', icon: Mic, articles: '2K+', color: '#E91E63' },
  { name: 'Sports', icon: Award, articles: '1.2K+', color: '#27AE60' },
  { name: 'Lifestyle', icon: Camera, articles: '1K+', color: '#FF5722' },
];

const leadership = [
  {
    role: 'Editorial',
    title: 'Editorial Excellence',
    description: 'Our editorial team comprises award-winning journalists with decades of combined experience covering African affairs for leading global publications.',
    highlights: ['Award-winning editors', 'Former BBC, CNN, Al Jazeera correspondents', 'Local bureau chiefs across Africa'],
  },
  {
    role: 'Technology',
    title: 'Technology Innovation',
    description: 'Our engineering team builds cutting-edge tools that make AfriVerse the most advanced African media platform.',
    highlights: ['AI-powered recommendations', 'Real-time analytics', 'Mobile-first design'],
  },
  {
    role: 'Community',
    title: 'Storyteller Network',
    description: 'Our verified storytellers are the backbone of AfriVerse, bringing authentic local perspectives from every corner of the continent.',
    highlights: ['Rigorous vetting process', 'Ongoing training programs', 'Fair compensation model'],
  },
];

const testimonials = [
  {
    quote: "AfriVerse has become my go-to source for understanding Africa beyond the headlines. The depth of analysis is unmatched.",
    author: "Dr. Amina Osei",
    role: "Professor of African Studies",
  },
  {
    quote: "Finally, a platform that tells African stories from an African perspective. This is the future of continental media.",
    author: "Kwame Mensah",
    role: "Tech Entrepreneur, Ghana",
  },
  {
    quote: "The quality of journalism here rivals any major global publication. AfriVerse proves African media can compete on the world stage.",
    author: "Fatima Al-Hassan",
    role: "Media Analyst",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-primary via-[#1a1a3e] to-brand-dark text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(243,156,18,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,217,255,0.1),transparent_50%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              <Globe className="w-4 h-4 text-brand-accent" />
              <span>Africa&apos;s Premier Digital Media Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-headline font-bold mb-6 leading-tight">
              Amplifying{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-[#00D9FF]">
                African Voices
              </span>
              <br />
              Globally
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              AfriVerse is on a mission to redefine how Africa&apos;s stories are told. 
              We combine world-class journalism with cutting-edge technology to deliver 
              news, insights, and perspectives that matter.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/storytellers/apply"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-xl font-semibold hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/25"
              >
                Join Our Network
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-white dark:text-brand-dark"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 -mt-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
                  <Target className="w-4 h-4" />
                  Our Mission
                </div>
                
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Journalism That{' '}
                  <span className="text-brand-accent">Empowers</span>
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  For too long, Africa&apos;s narrative has been shaped by external voices. 
                  AfriVerse exists to change that. We provide a platform where African journalists, 
                  writers, and thought leaders can share authentic stories with global audiences.
                </p>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Our commitment goes beyond publishing—we invest in training, 
                  technology, and fair compensation to build a sustainable ecosystem 
                  for quality African journalism.
                </p>

                <div className="space-y-4">
                  {[
                    'Local perspectives on global issues',
                    'Investigative journalism that drives change',
                    'Celebrating African innovation and success',
                    'Building bridges between Africa and the world',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-dark p-1">
                  <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-brand-primary/50 to-brand-dark flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-brand-accent/20 flex items-center justify-center">
                        <Globe className="w-16 h-16 text-brand-accent" />
                      </div>
                      <blockquote className="text-2xl md:text-3xl font-headline font-bold text-white mb-4 italic">
                        &ldquo;Africa rising, stories thriving&rdquo;
                      </blockquote>
                      <p className="text-gray-300">— AfriVerse Founding Principle</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 px-6 py-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">40%</div>
                      <div className="text-sm text-gray-500">YoY Growth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
              <Heart className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Principles That Guide Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              These core values shape every story we publish and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => (
              <div 
                key={value.title}
                className="group relative p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-xl ${value.color} flex items-center justify-center mb-6`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
              <MessageCircle className="w-4 h-4" />
              What People Say
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-accent text-brand-accent" />
                  ))}
                </div>
                <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary flex items-center justify-center text-white font-bold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
              <Newspaper className="w-4 h-4" />
              Our Coverage
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive African News
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              From breaking news to in-depth analysis, we cover every aspect of African life.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/${category.name.toLowerCase()}`}
                className="group p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <category.icon className="w-6 h-6" style={{ color: category.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.articles} articles</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              Our Journey
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Building Africa&apos;s Media Future
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-brand-accent to-brand-primary hidden md:block" />
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={milestone.year} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="text-brand-accent font-bold text-lg mb-1">{milestone.year}</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">{milestone.title}</div>
                        <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                      </div>
                    </div>
                    
                    {/* Center Dot */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-brand-accent border-4 border-white dark:border-brand-dark shadow" />
                    
                    <div className="hidden md:block w-5/12" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 rounded-full text-brand-accent text-sm font-semibold mb-6">
              <Users className="w-4 h-4" />
              Our Team
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              World-Class Talent
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A diverse team united by a passion for African storytelling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {leadership.map((team) => (
              <div 
                key={team.role}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-accent/10 flex items-center justify-center mb-6">
                  {team.role === 'Editorial' && <PenTool className="w-7 h-7 text-brand-accent" />}
                  {team.role === 'Technology' && <Zap className="w-7 h-7 text-brand-accent" />}
                  {team.role === 'Community' && <Users className="w-7 h-7 text-brand-accent" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {team.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {team.description}
                </p>
                <ul className="space-y-2">
                  {team.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
              Trusted by leading organizations
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 max-w-4xl mx-auto opacity-60">
            {['Media Partners', 'Tech Partners', 'NGO Partners', 'Academic Partners'].map((partner) => (
              <div key={partner} className="flex items-center gap-2 text-gray-400">
                <Building className="w-6 h-6" />
                <span className="font-medium">{partner}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-brand-primary via-[#1a1a3e] to-brand-dark text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(243,156,18,0.15),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6">
              Be Part of the Story
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Whether you&apos;re a reader, writer, or brand partner, there&apos;s a place 
              for you in the AfriVerse community.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/storytellers/apply"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-xl font-semibold hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/25"
              >
                <PenTool className="w-5 h-5" />
                Become a Storyteller
              </Link>
              <Link 
                href="/subscribe/premium"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-primary rounded-xl font-semibold hover:bg-gray-100 transition-all"
              >
                <Crown className="w-5 h-5" />
                Subscribe Premium
              </Link>
              <Link 
                href="/media-kit"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <Mail className="w-5 h-5" />
                Advertise With Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
