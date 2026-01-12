'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Send,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  excerpt: string;
  status: string;
  category?: { name: string };
  createdAt: string;
  submittedAt: string;
  editorialReview?: {
    status: string;
    priority: string;
    reviewer?: { name: string; image: string };
    submittedAt: string;
  };
}

export default function SubmittedPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchSubmissions = async () => {
    try {
      // Fetch articles that are in the review pipeline
      const statuses = statusFilter || 'PENDING_REVIEW,IN_REVIEW';
      const res = await fetch(`/api/writer/articles?status=${statuses}`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { 
      label: string; 
      color: string; 
      bg: string;
      icon: any;
      description: string;
      step: number;
    }> = {
      PENDING_REVIEW: {
        label: 'In Queue',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        icon: Clock,
        description: 'Waiting for an editor to pick up your article',
        step: 1,
      },
      IN_REVIEW: {
        label: 'Under Review',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Eye,
        description: 'An editor is currently reviewing your article',
        step: 2,
      },
      CHANGES_REQUESTED: {
        label: 'Revision Needed',
        color: 'text-red-600',
        bg: 'bg-red-50',
        icon: AlertTriangle,
        description: 'Editor has requested changes',
        step: 2,
      },
      APPROVED: {
        label: 'Approved',
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: CheckCircle,
        description: 'Your article has been approved for publication',
        step: 3,
      },
    };
    return statuses[status] || { 
      label: status, 
      color: 'text-slate-600', 
      bg: 'bg-slate-100', 
      icon: FileText,
      description: '',
      step: 0,
    };
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submitted Articles</h1>
        <p className="text-slate-500 text-sm mt-1">Track the status of your submissions</p>
      </div>

      {/* Workflow Explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h3 className="font-semibold text-slate-900 mb-4">Editorial Workflow</h3>
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200"></div>
          
          {/* Steps */}
          {[
            { label: 'Submitted', icon: Send },
            { label: 'In Review', icon: Eye },
            { label: 'Approved', icon: CheckCircle },
            { label: 'Published', icon: CheckCircle },
          ].map((step, index) => (
            <div key={index} className="relative flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-600 mt-2 font-medium">{step.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4 text-center">
          Once submitted, your article will be reviewed by our editorial team. You'll be notified of any updates.
        </p>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Send className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No submissions yet</h3>
            <p className="text-slate-500 mb-4">Articles you submit for review will appear here</p>
            <Link
              href="/writer/compose"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              Write an Article
            </Link>
          </div>
        ) : (
          submissions.map((submission) => {
            const statusInfo = getStatusInfo(submission.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div 
                key={submission.id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl ${statusInfo.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color} inline-block mb-2`}>
                            {statusInfo.label}
                          </span>
                          <h3 className="text-lg font-semibold text-slate-900">{submission.title}</h3>
                          {submission.excerpt && (
                            <p className="text-slate-600 text-sm mt-1 line-clamp-2">{submission.excerpt}</p>
                          )}
                        </div>
                        <Link
                          href={`/writer/articles/${submission.id}`}
                          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                        >
                          View <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                        {submission.category && (
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                            {submission.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Submitted {new Date(submission.editorialReview?.submittedAt || submission.createdAt).toLocaleDateString()}
                        </span>
                        {submission.editorialReview?.reviewer && (
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Reviewer: {submission.editorialReview.reviewer.name}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-3">{statusInfo.description}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-100">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      submission.status === 'APPROVED' ? 'bg-green-500 w-full' :
                      submission.status === 'IN_REVIEW' ? 'bg-blue-500 w-2/3' :
                      submission.status === 'PENDING_REVIEW' ? 'bg-amber-500 w-1/3' :
                      'bg-slate-300 w-0'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Help Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 What to expect</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Most articles are reviewed within 24-48 hours</li>
          <li>• You cannot edit articles while they're under review</li>
          <li>• If changes are requested, you'll receive detailed feedback</li>
          <li>• Once approved, editors handle scheduling and publication</li>
        </ul>
      </div>
    </div>
  );
}
