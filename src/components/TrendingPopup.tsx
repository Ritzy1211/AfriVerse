'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, TrendingUp, Sparkles } from 'lucide-react';
import { Article } from '@/types';

interface TrendingPopupProps {
  article: Article | null;
  type?: 'trending' | 'sponsored';
  delay?: number; // Delay before showing (ms)
  duration?: number; // How long to show (ms)
  onClose?: () => void;
}

export default function TrendingPopup({ 
  article, 
  type = 'trending',
  delay = 3000, 
  duration = 8000,
  onClose 
}: TrendingPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!article || dismissed) return;

    // Check if user has already seen this popup in this session
    const seenKey = `trending_popup_seen_${article.id}`;
    if (sessionStorage.getItem(seenKey)) {
      return;
    }

    // Show popup after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem(seenKey, 'true');
    }, delay);

    return () => clearTimeout(showTimer);
  }, [article, delay, dismissed]);

  useEffect(() => {
    if (!isVisible || dismissed) return;

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(hideTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, duration, dismissed]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      setDismissed(true);
      onClose?.();
    }, 300);
  };

  if (!article || !isVisible) return null;

  const isTrending = type === 'trending';
  const gradientClass = isTrending 
    ? 'from-orange-500 to-red-600' 
    : 'from-purple-500 to-pink-600';
  const labelBgClass = isTrending
    ? 'bg-gradient-to-r from-orange-500 to-red-500'
    : 'bg-gradient-to-r from-purple-500 to-pink-500';

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out ${
        isExiting 
          ? 'translate-x-full opacity-0' 
          : 'translate-x-0 opacity-100'
      }`}
      style={{ 
        animation: isExiting ? undefined : 'slideInRight 0.4s ease-out'
      }}
    >
      <Link href={`/${article.category.slug}/${article.slug}`}>
        <div className="group relative w-80 h-36 rounded-xl overflow-hidden shadow-2xl cursor-pointer transform hover:scale-[1.02] transition-transform duration-200">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${gradientClass}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
          </div>

          {/* Content */}
          <div className="relative h-full p-4 flex flex-col justify-between">
            {/* Top Row - Label & Close */}
            <div className="flex items-start justify-between">
              <div className={`${labelBgClass} px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg`}>
                {isTrending ? (
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                )}
                <span className="text-white text-xs font-bold uppercase tracking-wide">
                  {isTrending ? 'Trending' : 'Sponsored'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
                className="w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Bottom - Article Info */}
            <div>
              <span 
                className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-white mb-1.5"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
              <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-orange-300 transition-colors">
                {article.title}
              </h3>
            </div>
          </div>

          {/* Animated Border Glow */}
          <div className={`absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r ${gradientClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className={`h-full bg-gradient-to-r ${gradientClass}`}
              style={{
                animation: `shrinkWidth ${duration}ms linear forwards`
              }}
            />
          </div>
        </div>
      </Link>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
