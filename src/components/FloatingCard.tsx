'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FloatingCard({ children, delay = 0, className = '' }: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 25;
    const y = (e.clientY - rect.top - rect.height / 2) / 25;
    
    setMousePosition({ x: -y, y: x });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      className={`
        transform-gpu transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'}
        ${className}
      `}
      style={{
        perspective: '1000px',
        transitionDelay: isVisible ? '0ms' : `${delay}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative h-full transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? `rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg) scale(1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
        }}
      >
        {/* Card with 3D shadow effect */}
        <div
          className="relative h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: isHovered
              ? `
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                0 0 0 1px rgba(0, 217, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `
              : `
                0 10px 40px -10px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(0, 0, 0, 0.05)
              `,
          }}
        >
          {/* Glossy reflection effect */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)',
              opacity: isHovered ? 1 : 0,
            }}
          />
          
          {/* Accent border glow on hover */}
          <div
            className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 0 2px rgba(0, 217, 255, 0.3)',
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full p-6">
            {children}
          </div>
        </div>

        {/* 3D bottom edge effect */}
        <div
          className="absolute bottom-0 left-2 right-2 h-2 rounded-b-xl transition-all duration-200"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.2))',
            transform: 'translateZ(-10px) translateY(8px)',
            filter: 'blur(4px)',
            opacity: isHovered ? 0.8 : 0.5,
          }}
        />
      </div>
    </div>
  );
}
