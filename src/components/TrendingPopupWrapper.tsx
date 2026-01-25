'use client';

import { useEffect, useState } from 'react';
import TrendingPopup from './TrendingPopup';
import { Article } from '@/types';

interface TrendingPopupWrapperProps {
  articles: Article[];
}

export default function TrendingPopupWrapper({ articles }: TrendingPopupWrapperProps) {
  const [popupArticle, setPopupArticle] = useState<Article | null>(null);
  const [popupType, setPopupType] = useState<'trending' | 'sponsored'>('trending');

  useEffect(() => {
    // Find the most important article for the popup
    // Priority: 1. Sponsored + Featured, 2. Sponsored, 3. Featured + Trending, 4. Hot article
    
    const sponsoredFeatured = articles.find(a => a.isSponsored && a.featured);
    const sponsored = articles.find(a => a.isSponsored);
    const featuredTrending = articles.find(a => a.featured && a.trending);
    const hot = articles.find(a => a.trending);

    if (sponsoredFeatured) {
      setPopupArticle(sponsoredFeatured);
      setPopupType('sponsored');
    } else if (sponsored) {
      setPopupArticle(sponsored);
      setPopupType('sponsored');
    } else if (featuredTrending) {
      setPopupArticle(featuredTrending);
      setPopupType('trending');
    } else if (hot) {
      setPopupArticle(hot);
      setPopupType('trending');
    }
  }, [articles]);

  return (
    <TrendingPopup 
      article={popupArticle}
      type={popupType}
      delay={4000} // Show after 4 seconds
      duration={10000} // Display for 10 seconds
    />
  );
}
