import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Briefcase, 
  MapPin, 
  Clock,
  Users,
  Heart,
  Zap,
  Globe,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Building,
  Laptop,
  Coffee,
  Plane
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers at AfriVerse | Join Our Team',
  description: 'Join AfriVerse and help shape the future of African digital media. Explore open positions in journalism, technology, design, and more.',
};

const openPositions = [
  {
    title: 'Senior Editor - Politics',
    department: 'Editorial',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    description: 'Lead our political coverage across West Africa with deep expertise in governance and policy analysis.',
  },
  {
    title: 'Full Stack Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and scale our platform using Next.js, TypeScript, and modern cloud infrastructure.',
  },
  {
    title: 'Business Reporter',
    department: 'Editorial',
    location: 'Nairobi, Kenya',
    type: 'Full-time',
    description: 'Cover East Africa\'s dynamic business ecosystem, from startups to major corporations.',
  },
  {
    title: 'Product Designer',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Shape the user experience of Africa\'s leading digital media platform.',
  },
  {
    title: 'Social Media Manager',
    department: 'Marketing',
    location: 'Accra, Ghana',
    type: 'Full-time',
    description: 'Grow our social presence and engage with our community of millions.',
  },
  {
    title: 'Data Journalist',
    department: 'Editorial',
    location: 'Remote',
    type: 'Contract',
    description: 'Transform complex data into compelling visual stories about Africa.',
  },
];

const benefits = [
  {
    icon: Laptop,
    title: 'Remote-First',
    description: 'Work from anywhere in Africa or around the world.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Budget',
    description: 'Annual learning stipend for courses, conferences, and books.',
  },
  {
    icon: Heart,
    title: 'Health Coverage',
    description: 'Comprehensive health insurance for you and your family.',
  },
  {
    icon: Coffee,
    title: 'Flexible Hours',
    description: 'We trust you to manage your time effectively.',
  },
  {
    icon: Users,
    title: 'Team Retreats',
    description: 'Annual gatherings to connect and collaborate in person.',
  },
  {
    icon: Plane,
    title: 'Paid Time Off',
    description: 'Generous vacation policy to rest and recharge.',
  },
];

const values = [
  {
    title: 'Impact-Driven',
    description: 'Every story we tell has the potential to change narratives and shape futures.',
  },
  {
    title: 'Diverse & Inclusive',
    description: 'We celebrate the richness of Africa\'s cultures and perspectives.',
  },
  {
    title: 'Innovation-Focused',
    description: 'We embrace new technologies and approaches to storytelling.',
  },
  {
    title: 'Excellence Always',
    description: 'We hold ourselves to the highest standards in everything we do.',
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-brand-dark">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-primary via-brand-primary to-brand-dark text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4 text-brand-accent" />
              <span>Join Our Team</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6">
              Build the Future of{' '}
              <span className="text-brand-accent">African Media</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join a passionate team dedicated to amplifying African voices 
              and reshaping how the world sees our continent.
            </p>
            <Link 
              href="#positions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition-colors"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-1">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-1">12</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-1">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remote-First</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-brand-accent mb-1">4.8★</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Glassdoor Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Our Culture
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              What makes working at AfriVerse special.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => (
              <div 
                key={value.title}
                className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Benefits & Perks
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              We take care of our team so they can focus on great work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div 
                key={benefit.title}
                className="flex items-start gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-white mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find your next opportunity at AfriVerse.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {openPositions.map((position, index) => (
              <div 
                key={index}
                className="group p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-brand-accent/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-accent transition-colors">
                      {position.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {position.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Building className="w-3 h-3" />
                        {position.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {position.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`mailto:careers@afriverse.africa?subject=Application: ${position.title}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg font-medium hover:bg-brand-accent/90 transition-colors text-sm whitespace-nowrap"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
              Don&apos;t See Your Role?
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              We&apos;re always looking for talented people. Send us your resume 
              and tell us how you&apos;d like to contribute.
            </p>
            <Link 
              href="mailto:careers@afriverse.africa?subject=General Application"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-primary rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Send Your Resume
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
