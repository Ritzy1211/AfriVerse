'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  Shield,
  Star,
  Award,
  Crown,
  Globe,
  Sparkles,
  BadgeCheck,
  FileText,
  Users,
  TrendingUp,
  Verified,
  Calendar,
  MapPin,
  ExternalLink,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type StorytellerBadge = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'AMBASSADOR';
type StorytellerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

interface Storyteller {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image?: string;
    bio?: string;
    location?: string;
  };
  status: StorytellerStatus;
  badge: StorytellerBadge;
  expertise: string[];
  regions: string[];
  languages: string[];
  impactArticles: number;
  totalViews: number;
  communityScore: number;
  verifiedDate: string;
  featuredWork?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

interface VerifiedStorytellerBadgeProps {
  badge: StorytellerBadge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface StorytellerProfileCardProps {
  storyteller: Storyteller;
  variant?: 'compact' | 'full';
  className?: string;
}

interface ApplicationFormProps {
  onSubmit?: (data: any) => void;
  className?: string;
}

const badgeConfig = {
  BRONZE: {
    icon: Shield,
    color: 'text-amber-700',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300 dark:border-amber-700',
    gradient: 'from-amber-600 to-amber-800',
    label: 'Bronze Storyteller',
    description: 'Emerging voice in African storytelling',
    requirement: '5+ verified impact articles',
  },
  SILVER: {
    icon: Star,
    color: 'text-gray-600 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-300 dark:border-gray-600',
    gradient: 'from-gray-400 to-gray-600',
    label: 'Silver Storyteller',
    description: 'Established contributor with consistent impact',
    requirement: '20+ verified impact articles',
  },
  GOLD: {
    icon: Award,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-400 dark:border-yellow-600',
    gradient: 'from-yellow-400 to-yellow-600',
    label: 'Gold Storyteller',
    description: 'Influential voice shaping African narratives',
    requirement: '50+ verified impact articles',
  },
  PLATINUM: {
    icon: Crown,
    color: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    border: 'border-slate-400 dark:border-slate-500',
    gradient: 'from-slate-400 to-slate-600',
    label: 'Platinum Storyteller',
    description: 'Elite storyteller with continental influence',
    requirement: '100+ verified impact articles',
  },
  AMBASSADOR: {
    icon: Globe,
    color: 'text-emerald-600',
    bg: 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30',
    border: 'border-emerald-400 dark:border-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
    label: 'AfriVerse Ambassador',
    description: 'Global representative of African stories',
    requirement: 'By invitation only',
  },
};

// Main Badge Component
export function VerifiedStorytellerBadge({
  badge,
  size = 'md',
  showLabel = false,
  className = '',
}: VerifiedStorytellerBadgeProps) {
  const config = badgeConfig[badge];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizes = {
    sm: 'p-0.5',
    md: 'p-1',
    lg: 'p-1.5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      title={`${config.label} - ${config.description}`}
    >
      <div className={`${config.bg} ${config.border} border rounded-full ${containerSizes[size]}`}>
        <Icon className={`${sizeClasses[size]} ${config.color}`} />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Compact Author Badge (for article cards)
export function AuthorBadge({
  name,
  image,
  badge,
  verified = true,
  className = '',
}: {
  name: string;
  image?: string;
  badge?: StorytellerBadge;
  verified?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative">
        {image ? (
          <Image
            src={image}
            alt={name}
            width={24}
            height={24}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {name.charAt(0)}
            </span>
          </div>
        )}
        {verified && badge && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <VerifiedStorytellerBadge badge={badge} size="sm" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{name}</span>
      {verified && !badge && (
        <BadgeCheck className="w-4 h-4 text-blue-500" />
      )}
    </div>
  );
}

// Full Profile Card
export function StorytellerProfileCard({
  storyteller,
  variant = 'compact',
  className = '',
}: StorytellerProfileCardProps) {
  const config = badgeConfig[storyteller.badge];
  const Icon = config.icon;

  if (variant === 'compact') {
    return (
      <Link
        href={`/author/${storyteller.userId}`}
        className={`block p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {storyteller.user.image ? (
              <Image
                src={storyteller.user.image}
                alt={storyteller.user.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {storyteller.user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <VerifiedStorytellerBadge badge={storyteller.badge} size="md" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white truncate">
                {storyteller.user.name}
              </span>
              <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {storyteller.expertise.slice(0, 2).join(' • ')}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // Full variant
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Banner */}
      <div className={`h-20 bg-gradient-to-r ${config.gradient}`} />
      
      {/* Profile Section */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-10">
          <div className="relative">
            {storyteller.user.image ? (
              <Image
                src={storyteller.user.image}
                alt={storyteller.user.name}
                width={80}
                height={80}
                className="rounded-xl object-cover border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center border-4 border-white dark:border-gray-800">
                <span className="text-2xl font-bold text-white">
                  {storyteller.user.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute -bottom-2 -right-2">
              <VerifiedStorytellerBadge badge={storyteller.badge} size="lg" />
            </div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {storyteller.user.name}
              </h3>
              <BadgeCheck className="w-5 h-5 text-blue-500" />
            </div>
            <p className={`text-sm ${config.color} font-medium`}>{config.label}</p>
          </div>
        </div>

        {/* Bio */}
        {storyteller.bio && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {storyteller.bio}
          </p>
        )}

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {storyteller.expertise.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {storyteller.impactArticles}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Impact Stories</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(storyteller.totalViews / 1000).toFixed(1)}K
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Views</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {storyteller.communityScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Community Score</div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {storyteller.user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {storyteller.user.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Verified {new Date(storyteller.verifiedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Social Links */}
        {storyteller.socialLinks && (
          <div className="mt-4 flex items-center gap-3">
            {storyteller.socialLinks.twitter && (
              <a href={storyteller.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-500">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {storyteller.socialLinks.linkedin && (
              <a href={storyteller.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {storyteller.socialLinks.website && (
              <a href={storyteller.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-500">
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* View Profile Button */}
        <Link
          href={`/author/${storyteller.userId}`}
          className="mt-4 block w-full py-2 text-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
}

// Badge Progression Display
export function BadgeProgression({
  currentBadge,
  articlesCount,
  className = '',
}: {
  currentBadge?: StorytellerBadge;
  articlesCount: number;
  className?: string;
}) {
  const badges: StorytellerBadge[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'AMBASSADOR'];
  const thresholds = { BRONZE: 5, SILVER: 20, GOLD: 50, PLATINUM: 100, AMBASSADOR: Infinity };
  const currentIndex = currentBadge ? badges.indexOf(currentBadge) : -1;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 ${className}`}>
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-amber-500" />
        Badge Progression
      </h3>
      
      <div className="space-y-3">
        {badges.map((badge, index) => {
          const config = badgeConfig[badge];
          const Icon = config.icon;
          const isUnlocked = index <= currentIndex;
          const isCurrent = badge === currentBadge;
          const threshold = thresholds[badge];
          const progress = Math.min((articlesCount / threshold) * 100, 100);

          return (
            <div key={badge} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isUnlocked ? config.bg : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Icon className={`w-5 h-5 ${isUnlocked ? config.color : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                    {config.label}
                    {isCurrent && <span className="ml-2 text-xs text-amber-500">(Current)</span>}
                  </span>
                  <span className="text-xs text-gray-500">
                    {badge === 'AMBASSADOR' ? 'Invite only' : `${threshold} articles`}
                  </span>
                </div>
                {badge !== 'AMBASSADOR' && (
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isUnlocked ? `bg-gradient-to-r ${config.gradient}` : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${isUnlocked ? 100 : progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Application Form
export function StorytellerApplicationForm({ onSubmit, className = '' }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    city: '',
    expertise: [] as string[],
    languages: [] as string[],
    bio: '',
    credentials: '',
    portfolioLinks: [] as string[],
    portfolioInput: '',
    linkedIn: '',
    twitter: '',
    whyJoin: '',
    sampleWork: '',
    references: [] as string[],
    referenceInput: '',
  });
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<'not_applied' | 'applied' | 'verified' | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Check existing application status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/storytellers/apply');
        if (response.ok) {
          const data = await response.json();
          setApplicationStatus(data.status);
          if (data.application) {
            setExistingApplication(data.application);
          }
          if (data.storyteller) {
            setExistingApplication(data.storyteller);
          }
        }
      } catch (err) {
        console.error('Error checking application status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const expertiseOptions = [
    'Business & Economy',
    'Politics & Governance',
    'Technology & Innovation',
    'Culture & Entertainment',
    'Sports',
    'Climate & Environment',
    'Health & Wellness',
    'Education',
    'Social Issues',
  ];

  const countryOptions = [
    'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Egypt', 'Ethiopia', 
    'Tanzania', 'Rwanda', 'Senegal', 'Morocco', 'Uganda', 'Cameroon',
    'Ivory Coast', 'Angola', 'Mozambique', 'Zimbabwe', 'Botswana', 'Other'
  ];

  const languageOptions = ['English', 'French', 'Arabic', 'Swahili', 'Portuguese', 'Hausa', 'Yoruba', 'Amharic', 'Zulu'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/storytellers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          city: formData.city,
          languages: formData.languages,
          expertise: formData.expertise,
          bio: formData.bio,
          credentials: formData.credentials,
          portfolioLinks: formData.portfolioLinks,
          linkedIn: formData.linkedIn,
          twitter: formData.twitter,
          whyJoin: formData.whyJoin,
          sampleWork: formData.sampleWork,
          references: formData.references,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
      setApplicationStatus('applied');
      onSubmit?.(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter((v) => v !== value));
    } else {
      setter([...array, value]);
    }
  };

  const addToList = (list: string[], value: string, setter: (arr: string[]) => void, inputSetter: (s: string) => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputSetter('');
    }
  };

  // Loading state
  if (checkingStatus) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 text-center ${className}`}>
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Checking application status...</p>
      </div>
    );
  }

  // Already verified
  if (applicationStatus === 'verified') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <BadgeCheck className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're Already Verified!</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Congratulations! You're a verified storyteller on AfriVerse.
        </p>
        <Link
          href="/writer"
          className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          Go to Writer Dashboard
        </Link>
      </div>
    );
  }

  // Application pending
  if (applicationStatus === 'applied' || submitted) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-8 text-center ${className}`}>
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {submitted ? '🎉 Application Submitted!' : 'Application Under Review'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {submitted 
            ? "Thank you for applying! We've sent a confirmation email with all the details."
            : "Your application is being reviewed by our editorial team."}
        </p>
        {submitted && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              📧 <strong>Check your inbox!</strong> You should receive a confirmation email shortly. 
              Our team will review your application within 5-7 business days.
            </p>
          </div>
        )}
        {existingApplication && (
          <div className="text-left bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Application Details:</p>
            <p className="text-sm"><strong>Status:</strong> {existingApplication.status}</p>
            <p className="text-sm"><strong>Submitted:</strong> {new Date(existingApplication.createdAt).toLocaleDateString()}</p>
            {existingApplication.expertise && (
              <p className="text-sm"><strong>Expertise:</strong> {existingApplication.expertise.join(', ')}</p>
            )}
          </div>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Verified className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Become a Verified Storyteller</h2>
        </div>
        <p className="text-white/80 text-sm">
          Join our network of trusted African voices and amplify your impact
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Your full name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            We'll send application updates to this email
          </p>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Country *
          </label>
          <select
            required
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Select your country</option>
            {countryOptions.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            City
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g., Lagos, Nairobi, Cape Town"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Areas of Expertise * (Select up to 3)
          </label>
          <div className="flex flex-wrap gap-2">
            {expertiseOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  formData.expertise.length < 3 || formData.expertise.includes(option)
                    ? toggleArrayValue(formData.expertise, option, (arr) =>
                        setFormData({ ...formData, expertise: arr })
                      )
                    : null
                }
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  formData.expertise.includes(option)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Languages *
          </label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  toggleArrayValue(formData.languages, option, (arr) =>
                    setFormData({ ...formData, languages: arr })
                  )
                }
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  formData.languages.includes(option)
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Bio / About You *
          </label>
          <textarea
            required
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself and your experience in journalism/content creation..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Why Join */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Why do you want to become a Verified Storyteller? *
          </label>
          <textarea
            required
            rows={4}
            value={formData.whyJoin}
            onChange={(e) => setFormData({ ...formData, whyJoin: e.target.value })}
            placeholder="Tell us about your passion for African storytelling and the impact you want to make..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Sample Work */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Link to Your Best Work *
          </label>
          <input
            type="url"
            required
            value={formData.sampleWork}
            onChange={(e) => setFormData({ ...formData, sampleWork: e.target.value })}
            placeholder="https://example.com/your-best-article"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Portfolio Links */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Portfolio Links
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={formData.portfolioInput}
              onChange={(e) => setFormData({ ...formData, portfolioInput: e.target.value })}
              placeholder="https://your-portfolio.com"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => addToList(
                formData.portfolioLinks, 
                formData.portfolioInput, 
                (arr) => setFormData({ ...formData, portfolioLinks: arr }),
                () => setFormData(prev => ({ ...prev, portfolioInput: '' }))
              )}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Add
            </button>
          </div>
          {formData.portfolioLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.portfolioLinks.map((link, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  {new URL(link).hostname}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      portfolioLinks: formData.portfolioLinks.filter((_, idx) => idx !== i)
                    })}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Credentials */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Credentials / Qualifications
          </label>
          <input
            type="text"
            value={formData.credentials}
            onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
            placeholder="e.g., Journalism degree, Press Card, Publications"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Social Links (Optional)
          </label>
          <div className="space-y-2">
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="Twitter/X profile URL"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <input
              type="url"
              value={formData.linkedIn}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              placeholder="LinkedIn profile URL"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading ||
            !formData.country ||
            formData.expertise.length === 0 ||
            formData.languages.length === 0 ||
            !formData.bio ||
            !formData.whyJoin ||
            !formData.sampleWork
          }
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Application'
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By submitting, you agree to our verification process and{' '}
          <Link href="/terms" className="text-amber-500 hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </form>
  );
}

// Featured Storytellers Grid (with static data)
export function FeaturedStorytellers({
  storytellers,
  title = 'Featured Storytellers',
  className = '',
}: {
  storytellers: Storyteller[];
  title?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {storytellers.map((storyteller) => (
          <StorytellerProfileCard key={storyteller.id} storyteller={storyteller} variant="compact" />
        ))}
      </div>
    </div>
  );
}

// Featured Storytellers Grid (fetches from API)
export function FeaturedStorytellersFromAPI({
  title = 'Featured Storytellers',
  limit = 6,
  className = '',
}: {
  title?: string;
  limit?: number;
  className?: string;
}) {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorytellers = async () => {
      try {
        const response = await fetch(`/api/storytellers?limit=${limit}&featured=true`);
        if (!response.ok) throw new Error('Failed to fetch storytellers');
        const data = await response.json();
        
        // Map API response to component's Storyteller interface
        const mappedStorytellers: Storyteller[] = (data.storytellers || []).map((st: any) => ({
          id: st.id,
          name: st.user?.name || 'Anonymous',
          avatar: st.user?.image || '/assets/images/default-avatar.png',
          badge: st.badgeLevel?.toLowerCase() || 'bronze',
          specialization: st.expertise || [],
          articlesCount: st.articlesPublished || 0,
          impactScore: 0,
          region: st.country || 'Africa',
          verified: st.status === 'VERIFIED',
        }));
        
        setStorytellers(mappedStorytellers);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching featured storytellers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorytellers();
  }, [limit]);

  if (loading) {
    return (
      <div className={className}>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || storytellers.length === 0) {
    return (
      <div className={className}>
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {error || 'No featured storytellers yet. Be the first to join!'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {storytellers.map((storyteller) => (
          <StorytellerProfileCard key={storyteller.id} storyteller={storyteller} variant="compact" />
        ))}
      </div>
    </div>
  );
}
