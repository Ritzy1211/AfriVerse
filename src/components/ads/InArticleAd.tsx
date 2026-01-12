'use client';

import AdUnit from './AdUnit';

interface InArticleAdProps {
  className?: string;
}

export default function InArticleAd({ className = '' }: InArticleAdProps) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-6">
        <AdUnit slot="in-article" />
      </div>
    </div>
  );
}
