'use client';

import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  colorScheme?: 'dark' | 'light' | 'green' | 'gold';
  className?: string;
  showTagline?: boolean;
}

const sizeConfig = {
  xs: { symbol: 18, fontSize: '0.75rem', gap: 6, lineTop: 7, lineWidth: 8, lineHeight: 1, dotTop: 10, dotSize: 2 },
  sm: { symbol: 25, fontSize: '1rem', gap: 8, lineTop: 10, lineWidth: 11, lineHeight: 2, dotTop: 14, dotSize: 3 },
  md: { symbol: 35, fontSize: '1.25rem', gap: 10, lineTop: 14, lineWidth: 16, lineHeight: 2, dotTop: 20, dotSize: 4 },
  lg: { symbol: 45, fontSize: '1.5rem', gap: 12, lineTop: 18, lineWidth: 20, lineHeight: 3, dotTop: 26, dotSize: 5 },
  xl: { symbol: 60, fontSize: '2rem', gap: 16, lineTop: 24, lineWidth: 27, lineHeight: 3, dotTop: 34, dotSize: 6 },
};

export default function Logo({ 
  size = 'md', 
  variant = 'full',
  colorScheme = 'dark',
  className = '',
  showTagline = false
}: LogoProps) {
  const config = sizeConfig[size];
  const triangleHeight = config.symbol * 0.875;
  const triangleHalf = config.symbol / 2;

  // Color schemes
  const colors = {
    dark: {
      triangle: '#D4AF37', // Gold
      inner: '#1A1A1A',    // Warm Black
      text: 'text-gray-900 dark:text-white',
      accent: 'text-[#D4AF37]',
      tagline: 'text-gray-500 dark:text-gray-400'
    },
    light: {
      triangle: '#1B4332', // Deep Green
      inner: '#FAFAFA',    // Off White
      text: 'text-gray-900',
      accent: 'text-[#1B4332]',
      tagline: 'text-gray-500'
    },
    green: {
      triangle: '#D4AF37', // Gold
      inner: '#1B4332',    // Deep Green
      text: 'text-white',
      accent: 'text-[#D4AF37]',
      tagline: 'text-gray-300'
    },
    gold: {
      triangle: '#1A1A1A', // Warm Black
      inner: '#D4AF37',    // Gold
      text: 'text-[#1A1A1A]',
      accent: 'text-white',
      tagline: 'text-[#1A1A1A]/70'
    }
  };

  const scheme = colors[colorScheme];

  // Symbol Component
  const Symbol = () => (
    <div 
      className="relative flex-shrink-0"
      style={{ width: config.symbol, height: config.symbol }}
    >
      {/* Triangle */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${triangleHalf}px solid transparent`,
          borderRight: `${triangleHalf}px solid transparent`,
          borderBottom: `${triangleHeight}px solid ${scheme.triangle}`,
        }}
      />
      {/* Horizontal Line */}
      <div
        className="absolute rounded-sm"
        style={{
          top: config.lineTop,
          left: '50%',
          transform: 'translateX(-50%)',
          width: config.lineWidth,
          height: config.lineHeight,
          backgroundColor: scheme.inner,
        }}
      />
      {/* Dot */}
      <div
        className="absolute rounded-full"
        style={{
          top: config.dotTop,
          left: '50%',
          transform: 'translateX(-50%)',
          width: config.dotSize,
          height: config.dotSize,
          backgroundColor: scheme.inner,
        }}
      />
    </div>
  );

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={className}>
        <Symbol />
      </div>
    );
  }

  // Wordmark only variant
  if (variant === 'wordmark') {
    return (
      <div className={className}>
        <span 
          className={`font-headline font-extrabold ${scheme.text}`}
          style={{ fontSize: config.fontSize, letterSpacing: '-0.02em' }}
        >
          Afri<span className={scheme.accent}>Verse</span>
        </span>
        {showTagline && (
          <p className={`text-xs ${scheme.tagline} -mt-0.5`}>
            Africa's Voice, Amplified
          </p>
        )}
      </div>
    );
  }

  // Full logo (default)
  return (
    <div className={`flex items-center ${className}`} style={{ gap: config.gap }}>
      <Symbol />
      <div>
        <span 
          className={`font-headline font-extrabold ${scheme.text}`}
          style={{ fontSize: config.fontSize, letterSpacing: '-0.02em' }}
        >
          Afri<span className={scheme.accent}>Verse</span>
        </span>
        {showTagline && (
          <p className={`text-xs ${scheme.tagline} -mt-0.5`}>
            Africa's Voice, Amplified
          </p>
        )}
      </div>
    </div>
  );
}

// App Icon component for favicons and social avatars
export function AppIcon({ 
  size = 80, 
  variant = 'primary',
  rounded = 'lg'
}: { 
  size?: number;
  variant?: 'primary' | 'dark' | 'light' | 'gold' | 'circle';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}) {
  const triangleSize = size * 0.45;
  const triangleHeight = triangleSize * 0.875;
  const triangleHalf = triangleSize / 2;
  
  const variants = {
    primary: { bg: 'bg-gradient-to-br from-[#1B4332] to-[#0D251C]', triangle: '#D4AF37', inner: '#1B4332' },
    dark: { bg: 'bg-[#1A1A1A]', triangle: '#D4AF37', inner: '#1A1A1A' },
    light: { bg: 'bg-[#FAFAFA]', triangle: '#1B4332', inner: '#FAFAFA' },
    gold: { bg: 'bg-gradient-to-br from-[#D4AF37] to-[#B8960F]', triangle: '#1A1A1A', inner: '#D4AF37' },
    circle: { bg: 'bg-gradient-to-br from-[#1B4332] to-[#0D251C]', triangle: '#D4AF37', inner: '#1B4332' },
  };

  const v = variants[variant];
  const borderRadius = variant === 'circle' ? '50%' : 
    rounded === 'full' ? '50%' : 
    rounded === 'lg' ? '22%' : 
    rounded === 'md' ? '15%' : '8%';

  return (
    <div 
      className={`${v.bg} flex items-center justify-center`}
      style={{ 
        width: size, 
        height: size, 
        borderRadius,
      }}
    >
      <div className="relative" style={{ width: triangleSize, height: triangleSize }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${triangleHalf}px solid transparent`,
            borderRight: `${triangleHalf}px solid transparent`,
            borderBottom: `${triangleHeight}px solid ${v.triangle}`,
          }}
        />
        <div
          className="absolute rounded-sm"
          style={{
            top: triangleSize * 0.36,
            left: '50%',
            transform: 'translateX(-50%)',
            width: triangleSize * 0.45,
            height: triangleSize * 0.06,
            backgroundColor: v.inner,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: triangleSize * 0.52,
            left: '50%',
            transform: 'translateX(-50%)',
            width: triangleSize * 0.11,
            height: triangleSize * 0.11,
            backgroundColor: v.inner,
          }}
        />
      </div>
    </div>
  );
}
