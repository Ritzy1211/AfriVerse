'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Volume2, VolumeX, ExternalLink } from 'lucide-react';

export interface SpotlightData {
  id: string;
  title: string;
  subtitle?: string;
  quote?: string;
  quoteHighlight?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  linkUrl?: string;
  linkText?: string;
  overlayPosition?: 'left' | 'center' | 'right';
  textColor?: string;
  highlightColor?: string;
  relatedArticles?: Array<{
    id: string;
    title: string;
    image: string;
    slug: string;
    category: string;
  }>;
}

interface SpotlightProps {
  data: SpotlightData;
  sectionTitle?: string;
  className?: string;
}

export default function Spotlight({ 
  data, 
  sectionTitle = "SPOTLIGHT",
  className = "" 
}: SpotlightProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const highlightColor = data.highlightColor || '#00D9FF';
  const textColor = data.textColor || '#FFFFFF';

  // Parse quote to highlight specific words
  const renderQuote = () => {
    if (!data.quote) return null;
    
    if (data.quoteHighlight) {
      const parts = data.quote.split(new RegExp(`(${data.quoteHighlight})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === data.quoteHighlight?.toLowerCase() ? (
          <span 
            key={i} 
            className="px-2 py-1"
            style={{ backgroundColor: highlightColor, color: '#000' }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    }
    return data.quote;
  };

  const overlayClasses = {
    left: 'items-start text-left pl-8 md:pl-16',
    center: 'items-center text-center px-8',
    right: 'items-end text-right pr-8 md:pr-16',
  };

  return (
    <section className={`py-8 ${className}`}>
      {/* Section Header with Line */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-headline font-black text-gray-900 dark:text-white uppercase tracking-tight whitespace-nowrap">
            {sectionTitle}
          </h2>
          <div className="flex-1 h-[3px] bg-gray-900 dark:bg-white"></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Spotlight - Takes 2/3 width on desktop */}
          <div className="lg:col-span-2">
            <div 
              className="relative w-full overflow-hidden rounded-xl group"
              style={{ minHeight: '500px', height: '60vh', maxHeight: '700px' }}
            >
              {/* Background Media */}
              {data.mediaType === 'video' ? (
                <>
                  {/* Video Thumbnail/Poster */}
                  {!isPlaying && (
                    <Image
                      src={data.thumbnailUrl || data.mediaUrl}
                      alt={data.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  {/* Video Player */}
                  {isPlaying && (
                    <video
                      src={data.mediaUrl}
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {/* Play Button Overlay */}
                  {!isPlaying && (
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 md:w-12 md:h-12 text-gray-900 ml-1" fill="currentColor" />
                      </div>
                    </button>
                  )}
                  {/* Video Controls */}
                  {isPlaying && (
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  )}
                </>
              ) : (
                <Image
                  src={data.mediaUrl}
                  alt={data.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-[5]"></div>

              {/* Quote/Text Overlay */}
              <div 
                className={`absolute inset-0 flex flex-col justify-center z-10 ${overlayClasses[data.overlayPosition || 'left']}`}
              >
                {data.quote && (
                  <blockquote 
                    className="text-3xl md:text-5xl lg:text-6xl font-headline font-black leading-tight max-w-2xl"
                    style={{ color: textColor }}
                  >
                    "{renderQuote()}"
                  </blockquote>
                )}
                
                {data.subtitle && (
                  <p 
                    className="mt-4 text-lg md:text-xl font-medium opacity-90"
                    style={{ color: textColor }}
                  >
                    {data.subtitle}
                  </p>
                )}

                {data.linkUrl && (
                  <Link
                    href={data.linkUrl}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors w-fit"
                  >
                    {data.linkText || 'Read More'}
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Title Badge */}
              <div className="absolute bottom-4 left-4 z-20">
                <span 
                  className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded"
                  style={{ backgroundColor: highlightColor, color: '#000' }}
                >
                  {data.title}
                </span>
              </div>
            </div>
          </div>

          {/* Related/Sidebar Content - Takes 1/3 width */}
          <div className="lg:col-span-1">
            {data.relatedArticles && data.relatedArticles.length > 0 ? (
              <div className="space-y-4 h-full flex flex-col">
                {data.relatedArticles.slice(0, 4).map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/${article.category}/${article.slug}`}
                    className="group flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-1"
                  >
                    <div className="relative w-[100px] h-[80px] flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-brand-accent transition-colors line-clamp-3">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Placeholder when no related articles */
              <div 
                className="h-full rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: `${highlightColor}10`,
                  border: `2px dashed ${highlightColor}40`,
                  minHeight: '500px'
                }}
              >
                <div className="text-center p-8">
                  <div 
                    className="text-6xl mb-4"
                    style={{ color: highlightColor }}
                  >
                    ▲
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    AfriVerse Spotlight
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple version without sidebar
export function SpotlightFull({ 
  data, 
  sectionTitle = "SPOTLIGHT",
  className = "" 
}: SpotlightProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const highlightColor = data.highlightColor || '#00D9FF';
  const textColor = data.textColor || '#FFFFFF';

  const renderQuote = () => {
    if (!data.quote) return null;
    
    if (data.quoteHighlight) {
      const parts = data.quote.split(new RegExp(`(${data.quoteHighlight})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === data.quoteHighlight?.toLowerCase() ? (
          <span 
            key={i} 
            className="px-2 py-1"
            style={{ backgroundColor: highlightColor, color: '#000' }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      );
    }
    return data.quote;
  };

  return (
    <section className={`py-8 ${className}`}>
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-headline font-black text-gray-900 dark:text-white uppercase tracking-tight whitespace-nowrap">
            {sectionTitle}
          </h2>
          <div className="flex-1 h-[3px] bg-gray-900 dark:bg-white"></div>
        </div>
      </div>

      {/* Full Width Spotlight */}
      <div className="container mx-auto px-4">
        <div 
          className="relative w-full overflow-hidden rounded-xl group"
          style={{ minHeight: '500px', height: '60vh', maxHeight: '800px' }}
        >
          {/* Background */}
          {data.mediaType === 'video' ? (
            <>
              {!isPlaying && (
                <Image
                  src={data.thumbnailUrl || data.mediaUrl}
                  alt={data.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {isPlaying && (
                <video
                  src={data.mediaUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors z-10"
                >
                  <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-gray-900 ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
              {isPlaying && (
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-6 right-6 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-20"
                >
                  {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                </button>
              )}
            </>
          ) : (
            <Image
              src={data.mediaUrl}
              alt={data.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[5]"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-start text-left pl-8 md:pl-16 lg:pl-24 z-10">
            {data.quote && (
              <blockquote 
                className="text-4xl md:text-6xl lg:text-7xl font-headline font-black leading-tight max-w-3xl"
                style={{ color: textColor }}
              >
                "{renderQuote()}"
              </blockquote>
            )}
            
            {data.subtitle && (
              <p 
                className="mt-6 text-xl md:text-2xl font-medium opacity-90 max-w-xl"
                style={{ color: textColor }}
              >
                — {data.subtitle}
              </p>
            )}

            {data.linkUrl && (
              <Link
                href={data.linkUrl}
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors"
              >
                {data.linkText || 'Read Full Story'}
                <ExternalLink className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Title Badge */}
          <div className="absolute bottom-6 left-6 z-20">
            <span 
              className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded"
              style={{ backgroundColor: highlightColor, color: '#000' }}
            >
              {data.title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
