'use client';

import { useState } from 'react';
import { Sparkles, Clock, List, ChevronDown, ChevronUp, Volume2, Loader2 } from 'lucide-react';

interface ArticleSummarizerProps {
  content: string;
  title: string;
}

interface Summary {
  bulletPoints: string[];
  tldr: string;
  fullReadTime: number;
  summaryReadTime: number;
}

export default function ArticleSummarizer({ content, title }: ArticleSummarizerProps) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (summary) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setExpanded(true);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Failed to connect to summarizer');
    } finally {
      setLoading(false);
    }
  };

  const speakSummary = () => {
    if (!summary || typeof window === 'undefined') return;
    
    const text = `Here's a quick summary of ${title}. ${summary.bulletPoints.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={generateSummary}
        disabled={loading}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {loading ? 'Generating Summary...' : summary ? 'AI Summary' : 'Read in 30 Seconds'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {summary 
                ? `${summary.summaryReadTime} min read • ${summary.bulletPoints.length} key points`
                : 'AI-powered quick summary'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          ) : (
            <>
              {summary && (
                <span className="text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Save {summary.fullReadTime - summary.summaryReadTime} min
                </span>
              )}
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </>
          )}
        </div>
      </button>

      {/* Error */}
      {error && (
        <div className="px-4 pb-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Summary Content */}
      {expanded && summary && (
        <div className="px-4 pb-4 border-t border-purple-200 dark:border-purple-800">
          {/* TLDR */}
          <div className="mt-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              TL;DR
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {summary.tldr}
            </p>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <List className="w-3 h-3" /> KEY POINTS
            </p>
            <ul className="space-y-2">
              {summary.bulletPoints.map((point, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="flex-shrink-0 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={speakSummary}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Volume2 className="w-3 h-3" />
              Listen
            </button>
            <span className="text-xs text-gray-400">
              Full article: {summary.fullReadTime} min read
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
