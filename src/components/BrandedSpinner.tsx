'use client';

interface BrandedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function BrandedSpinner({ size = 'md', className = '' }: BrandedSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer ring - Amber/Gold */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-secondary border-r-brand-secondary animate-spin" />
      
      {/* Middle ring - Cyan */}
      <div 
        className="absolute inset-0.5 rounded-full border-2 border-transparent border-t-brand-accent border-l-brand-accent animate-spin"
        style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
      />
      
      {/* Inner dot - Pulsing */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Alternative: AfriPulse-inspired spinner with heartbeat effect
export function AfriPulseSpinner({ size = 'md', className = '' }: BrandedSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const barSizes = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${sizeClasses[size]} ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 ${barSizes[size]} rounded-full`}
          style={{
            background: i % 2 === 0 ? '#F39C12' : '#00D9FF',
            animation: 'pulse-bar 1s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes pulse-bar {
          0%, 100% {
            transform: scaleY(0.5);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Full page loading overlay
export function BrandedLoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-brand-primary/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 blur-xl bg-gradient-to-r from-brand-secondary/30 via-brand-accent/30 to-brand-secondary/30 rounded-full animate-pulse" />
        
        {/* Main spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-secondary animate-spin" />
          <div 
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-brand-accent animate-spin"
            style={{ animationDuration: '0.6s', animationDirection: 'reverse' }}
          />
          
          {/* Center logo mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-brand-secondary font-bold text-xl">A</span>
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-white/80 text-sm font-medium tracking-wide">{message}</p>
    </div>
  );
}
