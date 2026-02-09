'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Volume2, Globe, Sparkles, BookOpen } from 'lucide-react';

interface Slang {
  id: string;
  slang: string;
  meaning: string;
  example: string;
  country: string;
  countryCode: string;
  flag: string;
  pronunciation: string;
  category: string;
}

interface SlangPopupProps {
  delay?: number; // Delay before showing popup (ms)
  showOnce?: boolean; // Only show once per session
}

export default function AfricanSlangPopup({ delay = 5000, showOnce = true }: SlangPopupProps) {
  const [slang, setSlang] = useState<Slang | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const calculateDisplayTime = useCallback((slangData: Slang) => {
    // Base time of 8 seconds
    // Add extra time based on content length
    const baseTime = 8000;
    const meaningLength = slangData.meaning.length;
    const exampleLength = slangData.example.length;
    const totalLength = meaningLength + exampleLength;
    
    // Add ~50ms per character, max 15 seconds total
    const extraTime = Math.min(totalLength * 30, 7000);
    return baseTime + extraTime;
  }, []);

  const closePopup = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
    }, 500);
  }, []);

  const speakSlang = useCallback(() => {
    if (slang && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const text = `${slang.slang}. ${slang.meaning}. Example: ${slang.example}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, [slang]);

  useEffect(() => {
    // Check if already shown in this session
    if (showOnce) {
      const shown = sessionStorage.getItem('slangPopupShown');
      if (shown) {
        setHasShown(true);
        return;
      }
    }

    const showTimer = setTimeout(async () => {
      try {
        const response = await fetch('/api/slang?daily=true');
        const data = await response.json();
        
        if (data.success && data.slang) {
          setSlang(data.slang);
          setIsVisible(true);
          
          if (showOnce) {
            sessionStorage.setItem('slangPopupShown', 'true');
          }

          // Auto-close after calculated time
          const displayTime = calculateDisplayTime(data.slang);
          const closeTimer = setTimeout(() => {
            closePopup();
          }, displayTime);

          return () => clearTimeout(closeTimer);
        }
      } catch (error) {
        console.error('Failed to fetch slang:', error);
      }
    }, delay);

    return () => clearTimeout(showTimer);
  }, [delay, showOnce, calculateDisplayTime, closePopup]);

  if (!isVisible || !slang || hasShown) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={closePopup}
    >
      {/* 3D Card Container */}
      <div 
        className={`relative max-w-md w-full transition-all duration-700 ${
          isExiting 
            ? 'transform scale-95 opacity-0 translate-y-8' 
            : 'transform scale-100 opacity-100 translate-y-0'
        }`}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card with 3D effect */}
        <div 
          className="relative bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden"
          style={{
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.4),
              0 12px 24px -8px rgba(0, 0, 0, 0.3),
              0 4px 8px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            transform: 'rotateX(2deg) rotateY(-1deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Animated gradient border */}
          <div 
            className="absolute inset-0 rounded-3xl p-[2px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6, #06b6d4, #f97316)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 4s ease infinite'
            }}
          >
            <div className="absolute inset-[2px] bg-white dark:bg-gray-800 rounded-3xl" />
          </div>

          {/* Content */}
          <div className="relative p-6 z-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Daily African Slang
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-lg">{slang.flag}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{slang.country}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Immediately hide the popup
                  setIsVisible(false);
                  setIsExiting(false);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110"
                aria-label="Close popup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slang Word */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 
                  className="text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 2px 10px rgba(249, 115, 22, 0.2)'
                  }}
                >
                  "{slang.slang}"
                </h2>
                <button
                  onClick={speakSlang}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                /{slang.pronunciation}/
              </p>
            </div>

            {/* Category Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300"
              >
                {slang.category}
              </span>
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300"
              >
                <Globe className="w-3 h-3" />
                {slang.countryCode}
              </span>
            </div>

            {/* Meaning */}
            <div 
              className="p-4 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(236, 72, 153, 0.08))',
                border: '1px solid rgba(249, 115, 22, 0.15)'
              }}
            >
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {slang.meaning}
                </p>
              </div>
            </div>

            {/* Example */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-semibold">
                Example Usage
              </p>
              <p className="text-gray-600 dark:text-gray-300 italic text-lg">
                {slang.example}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Powered by</span>
                <span className="text-xs font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  AfriVerse
                </span>
              </div>
              <a
                href="/slang"
                className="text-xs font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              >
                Explore More Slangs →
              </a>
            </div>
          </div>

          {/* Decorative elements */}
          <div 
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.5), transparent 70%)'
            }}
          />
          <div 
            className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5), transparent 70%)'
            }}
          />
        </div>

        {/* 3D Shadow Layer */}
        <div 
          className="absolute inset-x-4 -bottom-2 h-full rounded-3xl -z-10"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
            filter: 'blur(20px)',
            transform: 'translateY(10px) scale(0.95)'
          }}
        />
      </div>

      {/* CSS Keyframes */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
