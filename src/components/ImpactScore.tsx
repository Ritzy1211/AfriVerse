'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Award, 
  Users, 
  Globe, 
  DollarSign,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';

interface ImpactScoreProps {
  score: {
    overallScore: number;
    impactLevel: 'EMERGING' | 'GROWING' | 'SIGNIFICANT' | 'MAJOR' | 'TRANSFORMATIVE';
    policyInfluence: number;
    socialChange: number;
    exposureImpact: number;
    economicEffect: number;
    communityEngagement: number;
    verifiedOutcomes?: string[];
    evidenceLinks?: string[];
    verifiedBy?: string;
    verifiedAt?: string;
    communityVotes?: number;
  };
  compact?: boolean;
  showDetails?: boolean;
  articleSlug?: string;
}

const impactLevelConfig = {
  EMERGING: {
    label: 'Emerging Impact',
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-600 dark:text-gray-400',
    description: 'Story recently published, impact developing',
    icon: Sparkles,
  },
  GROWING: {
    label: 'Growing Impact',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    description: 'Starting to gain traction and influence',
    icon: TrendingUp,
  },
  SIGNIFICANT: {
    label: 'Significant Impact',
    color: 'from-amber-400 to-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    description: 'Notable real-world effects observed',
    icon: Award,
  },
  MAJOR: {
    label: 'Major Impact',
    color: 'from-orange-400 to-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    description: 'Significant verified real-world impact',
    icon: Globe,
  },
  TRANSFORMATIVE: {
    label: 'Transformative',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    description: 'Changed policy or society measurably',
    icon: Sparkles,
  },
};

const metricConfig = [
  { key: 'policyInfluence', label: 'Policy Influence', icon: Globe, color: 'text-blue-500' },
  { key: 'socialChange', label: 'Social Change', icon: Users, color: 'text-green-500' },
  { key: 'exposureImpact', label: 'Exposure Impact', icon: Flag, color: 'text-red-500' },
  { key: 'economicEffect', label: 'Economic Effect', icon: DollarSign, color: 'text-amber-500' },
  { key: 'communityEngagement', label: 'Community', icon: Users, color: 'text-purple-500' },
];

export default function ImpactScore({ score, compact = false, showDetails = true, articleSlug }: ImpactScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const config = impactLevelConfig[score.impactLevel];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor}`}>
        <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
          <span className="text-white text-xs font-bold">{score.overallScore}</span>
        </div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${config.bgColor}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl font-bold">{score.overallScore}</span>
            </div>
            <div>
              <h3 className={`font-bold ${config.textColor}`}>
                Impact Score™
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.label}
              </p>
            </div>
          </div>
          <Icon className={`w-6 h-6 ${config.textColor}`} />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {config.description}
        </p>

        {/* Metric Bars */}
        <div className="space-y-2">
          {metricConfig.map(({ key, label, icon: MetricIcon, color }) => (
            <div key={key} className="flex items-center gap-2">
              <MetricIcon className={`w-4 h-4 ${color} flex-shrink-0`} />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-24 flex-shrink-0">{label}</span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-500`}
                  style={{ width: `${score[key as keyof typeof score] || 0}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8 text-right">
                {score[key as keyof typeof score] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (score.verifiedOutcomes?.length || score.communityVotes) && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span>View Details</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              {/* Verified Outcomes */}
              {score.verifiedOutcomes && score.verifiedOutcomes.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Verified Outcomes
                  </h4>
                  <ul className="space-y-2">
                    {score.verifiedOutcomes.map((outcome, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence Links */}
              {score.evidenceLinks && score.evidenceLinks.length > 0 && (
                <div className="pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Evidence Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {score.evidenceLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Source {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Info */}
              {score.verifiedBy && (
                <div className="pt-4 text-xs text-gray-500 dark:text-gray-500">
                  Verified by {score.verifiedBy} {score.verifiedAt && `on ${new Date(score.verifiedAt).toLocaleDateString()}`}
                </div>
              )}

              {/* Community Votes */}
              {score.communityVotes !== undefined && score.communityVotes > 0 && (
                <div className="pt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{score.communityVotes.toLocaleString()} community confirmations</span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Report Impact CTA */}
      {articleSlug && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-800/30">
          <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Report real-world impact you&apos;ve observed
          </button>
        </div>
      )}
    </div>
  );
}

// Compact badge for article cards
export function ImpactBadge({ level, score }: { level: string; score: number }) {
  const config = impactLevelConfig[level as keyof typeof impactLevelConfig] || impactLevelConfig.EMERGING;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
        <span className="text-white text-[10px] font-bold">{score}</span>
      </div>
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
}

// Impact Score component that fetches from API
export function ImpactScoreFromAPI({ 
  articleId, 
  compact = false, 
  showDetails = true,
  showReportForm = true,
}: { 
  articleId: string;
  compact?: boolean;
  showDetails?: boolean;
  showReportForm?: boolean;
}) {
  const [score, setScore] = useState<ImpactScoreProps['score'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingReport, setShowingReport] = useState(false);
  const [reportData, setReportData] = useState({
    impactType: 'policy_change',
    description: '',
    evidenceLink: '',
    reporterContact: '',
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const fetchScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/impact?articleId=${articleId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No impact score exists yet
          setScore(null);
          return;
        }
        throw new Error('Failed to fetch impact score');
      }
      
      const data = await response.json();
      
      // Map API response to component interface
      setScore({
        overallScore: data.overallScore || 0,
        impactLevel: data.impactLevel || 'EMERGING',
        policyInfluence: data.policyInfluence || 0,
        socialChange: data.socialChange || 0,
        exposureImpact: data.exposureImpact || 0,
        economicEffect: data.economicEffect || 0,
        communityEngagement: data.communityEngagement || 0,
        verifiedOutcomes: data.verifiedOutcomes || [],
        evidenceLinks: data.evidenceLinks || [],
        verifiedBy: data.verifiedBy,
        verifiedAt: data.verifiedAt,
        communityVotes: data.communityVotes || 0,
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching impact score:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);

    try {
      const response = await fetch('/api/impact/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          ...reportData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setReportSuccess(true);
      setShowingReport(false);
      setReportData({
        impactType: 'policy_change',
        description: '',
        evidenceLink: '',
        reporterContact: '',
      });

      // Refresh score after report
      setTimeout(() => {
        fetchScore();
        setReportSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load impact score</span>
          <button 
            onClick={fetchScore}
            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // If no score exists, show placeholder or report form
  if (!score) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            No impact data available yet for this article.
          </p>
          {showReportForm && (
            <button
              onClick={() => setShowingReport(true)}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 mx-auto"
            >
              <Flag className="w-4 h-4" />
              Report impact you've observed
            </button>
          )}
        </div>

        {showingReport && (
          <ImpactReportForm
            reportData={reportData}
            setReportData={setReportData}
            onSubmit={handleReportSubmit}
            onCancel={() => setShowingReport(false)}
            submitting={submittingReport}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <ImpactScore 
        score={score} 
        compact={compact} 
        showDetails={showDetails}
        articleSlug={articleId}
      />
      
      {reportSuccess && (
        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Thank you! Your impact report has been submitted for review.
        </div>
      )}

      {showReportForm && !showingReport && (
        <button
          onClick={() => setShowingReport(true)}
          className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-2"
        >
          <Flag className="w-4 h-4" />
          Report additional impact
        </button>
      )}

      {showingReport && (
        <div className="mt-4">
          <ImpactReportForm
            reportData={reportData}
            setReportData={setReportData}
            onSubmit={handleReportSubmit}
            onCancel={() => setShowingReport(false)}
            submitting={submittingReport}
          />
        </div>
      )}
    </div>
  );
}

// Impact Report Form Component
function ImpactReportForm({
  reportData,
  setReportData,
  onSubmit,
  onCancel,
  submitting,
}: {
  reportData: {
    impactType: string;
    description: string;
    evidenceLink: string;
    reporterContact: string;
  };
  setReportData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Flag className="w-4 h-4 text-amber-500" />
        Report Real-World Impact
      </h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type of Impact *
        </label>
        <select
          required
          value={reportData.impactType}
          onChange={(e) => setReportData({ ...reportData, impactType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
        >
          <option value="policy_change">Policy Change</option>
          <option value="social_movement">Social Movement</option>
          <option value="media_coverage">Media Coverage/Exposure</option>
          <option value="economic_impact">Economic Impact</option>
          <option value="community_action">Community Action</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Describe the Impact *
        </label>
        <textarea
          required
          rows={3}
          value={reportData.description}
          onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
          placeholder="Describe the real-world impact you observed..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Evidence Link (optional)
        </label>
        <input
          type="url"
          value={reportData.evidenceLink}
          onChange={(e) => setReportData({ ...reportData, evidenceLink: e.target.value })}
          placeholder="https://example.com/evidence"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Email (for verification, optional)
        </label>
        <input
          type="email"
          value={reportData.reporterContact}
          onChange={(e) => setReportData({ ...reportData, reporterContact: e.target.value })}
          placeholder="your@email.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !reportData.description}
          className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Report
            </>
          )}
        </button>
      </div>
    </form>
  );
}
