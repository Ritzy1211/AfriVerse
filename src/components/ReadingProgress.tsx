'use client';

import { useState, useEffect } from 'react';

interface ReadingProgressProps {
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export default function ReadingProgress({ 
  color = '#F39C12', 
  height = 4,
  showPercentage = false 
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      // Get the article content element or use document body
      const article = document.querySelector('article') || document.body;
      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = articleRect.height;
      
      // Calculate scroll position relative to article
      const windowHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      
      // Start showing progress when article comes into view
      if (scrollPosition > articleTop - windowHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      
      // Calculate progress
      const totalScrollable = articleHeight - windowHeight;
      const scrolledInArticle = scrollPosition - articleTop + windowHeight / 2;
      const percentage = Math.min(Math.max((scrolledInArticle / totalScrollable) * 100, 0), 100);
      
      setProgress(percentage);
    };

    // Initial calculation
    updateProgress();

    // Add scroll listener with throttle
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-[100] transition-opacity duration-300"
        style={{ 
          height: `${height}px`,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div 
          className="h-full transition-all duration-150 ease-out"
          style={{ 
            width: `${progress}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />
      </div>

      {/* Optional Percentage Badge */}
      {showPercentage && progress > 0 && progress < 100 && (
        <div 
          className="fixed bottom-6 right-6 z-50 px-3 py-2 rounded-full text-sm font-bold text-white shadow-lg transition-all duration-300"
          style={{ backgroundColor: color }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </>
  );
}
