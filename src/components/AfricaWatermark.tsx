/**
 * Africa Watermark Component
 * 
 * A subtle Africa continent silhouette used as a background watermark
 * to reinforce the African identity of the platform.
 */

interface AfricaWatermarkProps {
  className?: string;
  opacity?: number;
  color?: string;
  position?: 'left' | 'right' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function AfricaWatermark({
  className = '',
  opacity = 0.05,
  color = 'currentColor',
  position = 'right',
  size = 'lg',
}: AfricaWatermarkProps) {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96',
    xl: 'w-[500px] h-[500px]',
    full: 'w-full h-full',
  };

  const positionClasses = {
    left: 'left-0 -translate-x-1/4',
    right: 'right-0 translate-x-1/4',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 pointer-events-none ${positionClasses[position]} ${sizeClasses[size]} ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Africa Continent SVG */}
      <svg
        viewBox="0 0 512 512"
        fill={color}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M289.5 13.3c-7.7 2.4-15.2 5.4-22.3 9.1l-3.5 1.8-10.5-2.7c-5.8-1.5-11.8-2.6-17.8-3.4l-2.9-.4-2.5 4.2c-4.2 7-7.7 14.4-10.5 22.2l-.7 2-6.8 1.8c-11.8 3.1-23.1 7.8-33.5 14l-2.1 1.3-8.5-3c-5.9-2.1-12-3.7-18.2-4.8l-3-.5-1.2 4.6c-2.3 8.9-3.6 18.1-3.8 27.4l-.1 4.5-5.4 3.8c-8.4 5.9-16 12.8-22.7 20.6l-1.7 2-7.6-.6c-10.5-.8-21.1-.2-31.4 1.8l-2.5.5.5 4.7c1 9.3 3.1 18.4 6.3 27.2l.8 2.2-4.8 5.5c-4.8 5.5-9.1 11.4-12.8 17.7l-1.8 3.1 2.8 3.8c5.5 7.5 11.8 14.3 18.9 20.3l1.8 1.5-1.2 7.8c-2 13.2-2.1 26.6-.2 39.8l.5 3.4-5.8 5.2c-9.2 8.2-17.2 17.5-23.9 27.8l-1.7 2.6 2.4 4.1c4.7 8.1 10.3 15.6 16.6 22.4l1.6 1.7-.8 2.4c-3.8 11.5-5.9 23.5-6.2 35.6l-.1 3 3.4 2.8c6.7 5.5 14 10.3 21.8 14.3l2 1-1.2 6.5c-2.5 13.8-2.8 27.9-.9 41.8l.5 3.5-2.8 4.8c-5.5 9.5-9.8 19.6-12.8 30.2l-.7 2.6 3.5 3.5c6.9 6.9 14.5 13 22.7 18.3l2.1 1.3-.2 3.3c-.5 9.8.2 19.7 2.1 29.4l.9 4.6 4.4.3c8.8.6 17.6.2 26.2-1.2l2.2-.4 2.8 4.2c5.5 8.3 12 15.9 19.3 22.7l1.8 1.7-.3 5.1c-.5 8.5.1 17.1 1.8 25.4l.4 2 4.5 1.8c8.9 3.5 18.2 6 27.7 7.4l2.4.4 1.8 3.5c3.6 7 7.9 13.6 12.8 19.7l1.2 1.5-1.4 5.9c-2.8 11.8-3.8 24-2.9 36l.2 3 4.4 2.2c8.7 4.4 17.9 7.8 27.5 10.2l2.4.6 1.3 2.8c5.2 11.3 12 21.8 20.2 31.1l2.1 2.4 2.7-.9c10.7-3.6 20.8-8.5 30.2-14.6l2.4-1.5 4.6 2.3c7.3 3.6 14.9 6.5 22.8 8.6l3.9 1.1 2.2-3.4c4.4-6.8 8.1-14 11.1-21.5l.7-1.8 6.2.8c10.4 1.3 20.9 1.2 31.2-.2l2.6-.4 2.5 4.3c4.9 8.5 10.7 16.5 17.2 23.8l1.6 1.8 3.9-2.1c7.7-4.1 14.9-8.9 21.6-14.4l1.7-1.4 5.5 2.4c8.7 3.8 17.8 6.6 27.2 8.4l2.4.5 2-3.8c4-7.5 7.2-15.4 9.6-23.6l.6-2 5.2.3c17.3 1 34.6-1.4 50.9-7.2l4.1-1.5-.8-4.3c-1.6-8.6-4.2-16.9-7.8-24.8l-.9-2 3.9-3.4c6.1-5.3 11.7-11.2 16.6-17.6l1.2-1.6 5.4 1.4c8.6 2.2 17.4 3.4 26.3 3.5h2.7l1.2-4.5c2.4-9 3.8-18.2 4.2-27.6l.1-2.4 4.6-2.7c7.2-4.2 13.9-9.1 20.1-14.6l1.5-1.4 4.3 1.7c13.6 5.4 28 8.4 42.5 8.9l3.7.1.3-4.6c.5-9.3-.1-18.7-1.8-27.9l-.4-2.3 3.7-3.2c5.8-5 11.2-10.5 16-16.5l1.2-1.5 4.8.6c7.6 1 15.3 1 22.9 0l1.9-.3.8-4.5c1.6-9.1 2.1-18.3 1.4-27.5l-.2-2.3 4.2-4c6.6-6.3 12.5-13.3 17.6-20.9l1.3-1.9 3.8.8c12.1 2.6 24.5 3.4 36.8 2.4l3.1-.3-.2-4.7c-.4-9.4-1.9-18.7-4.4-27.8l-.6-2.2 3.1-3.4c4.9-5.4 9.3-11.3 13.1-17.5l.9-1.5 4.7 1c7.4 1.6 15 2.4 22.6 2.4h2.9l.4-4.6c.8-9.3.5-18.7-.9-27.9l-.3-2.3 2.8-2.6c8.8-8.2 16.3-17.6 22.2-28l1.5-2.6-2.8-3.5c-5.6-7-12-13.3-19.1-18.8l-1.8-1.4 1.8-6.2c3-10.5 4.5-21.4 4.4-32.3v-2.8l-4.2-2.4c-8.3-4.8-17.2-8.5-26.4-11.2l-2.3-.7.2-5.5c.4-9.2-.3-18.4-2.1-27.4l-.4-2.1 3.3-4.3c5.2-6.8 9.7-14.1 13.4-21.8l.9-1.9-3.3-3.2c-6.5-6.4-13.7-12-21.5-16.8l-2-1.2.6-3c2.3-11.8 2.8-23.9 1.4-35.9l-.3-2.9-4.3-2.2c-8.5-4.4-17.6-7.7-27-9.8l-2.4-.5-.8-4.8c-1.6-9.5-4.3-18.8-8.1-27.6l-1-2.3 2.4-4.8c3.8-7.5 6.8-15.4 9-23.5l.5-2-4.3-2c-8.5-4-17.5-6.9-26.7-8.7l-2.3-.5-1.6-4.3c-3.2-8.4-7.3-16.4-12.3-23.9l-1.2-1.9 2.9-5.4c2.9-5.4 5.3-11.1 7.2-16.9l.5-1.5-4.2-2.7c-8.3-5.3-17.2-9.6-26.5-12.7l-2.4-.8-1.6-2.9c-6.4-11.8-14.4-22.6-23.8-32.1l-2.4-2.4-5 2.7c-9.9 5.4-19 12-27 19.6l-2 1.9-7.4-3.3c-11.7-5.2-24.1-8.8-36.7-10.6l-3.2-.5-2.2-5.2c-4.4-10.4-10-20.2-16.7-29.2l-1.7-2.3-5.1 2.3c-10.1 4.5-19.5 10.3-28 17.2l-2.1 1.7-5.8-2.7c-9.1-4.2-18.7-7.3-28.5-9.2l-2.5-.5-2.2-4.7c-4.4-9.3-9.8-18.1-16.1-26.2l-1.6-2-4.8 2c-9.5 4-18.5 9-26.8 15l-2.1 1.5-6-2.6c-9.5-4.1-19.4-7.1-29.5-9l-2.5-.5-2.5-5.2c-2.5-5.2-5.4-10.2-8.7-14.9l-1.6-2.3-4.9 1.9c-9.7 3.8-18.9 8.6-27.4 14.4l-2.1 1.4-4.5-1.8c-14.1-5.7-29-9.2-44.2-10.3l-3.9-.3-.2 4c-.4 7.8.1 15.6 1.4 23.3l.3 1.9z" />
      </svg>
    </div>
  );
}

/**
 * Africa Pattern Background
 * A repeating pattern of small Africa continent shapes
 */
export function AfricaPatternBackground({
  className = '',
  opacity = 0.03,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="africa-pattern"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M60 10 C65 15, 70 20, 72 30 C74 40, 70 50, 68 55 C66 60, 70 65, 72 70 C74 75, 70 85, 65 90 C60 95, 55 92, 50 88 C45 84, 40 80, 38 75 C36 70, 38 65, 42 60 C46 55, 44 50, 42 45 C40 40, 45 35, 50 30 C55 25, 55 15, 60 10 Z"
              fill="currentColor"
              transform="scale(0.8)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#africa-pattern)" />
      </svg>
    </div>
  );
}

/**
 * Animated Africa Outline
 * An animated outline that traces the continent
 */
export function AfricaOutline({
  className = '',
  color = '#F59E0B', // amber-500
  strokeWidth = 2,
  animated = true,
}: {
  className?: string;
  color?: string;
  strokeWidth?: number;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={`${className}`}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M50 5 C58 8, 65 12, 70 20 C75 28, 78 38, 76 48 C74 58, 70 65, 72 75 C74 85, 68 95, 60 105 C52 112, 42 110, 35 102 C28 94, 22 85, 20 75 C18 65, 22 55, 28 48 C34 41, 32 32, 35 24 C38 16, 44 10, 50 5 Z"
        className={animated ? 'animate-draw-africa' : ''}
        style={{
          strokeDasharray: 400,
          strokeDashoffset: animated ? 400 : 0,
        }}
      />
    </svg>
  );
}
