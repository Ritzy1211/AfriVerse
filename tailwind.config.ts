import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // AfriVerse Brand Colors - using CSS variables for dynamic theming
        primary: 'var(--color-primary, #1A1A2E)',
        secondary: 'var(--color-secondary, #F39C12)',
        accent: 'var(--color-accent, #00D9FF)',
        brand: {
          primary: 'var(--color-primary, #1A1A2E)',
          secondary: 'var(--color-secondary, #F39C12)',
          accent: 'var(--color-accent, #00D9FF)',
          dark: '#0F0F0F',
        },
        text: {
          primary: '#2C3E50',
          secondary: '#7F8C8D',
          light: '#E0E0E0',
        }
      },
      fontFamily: {
        sans: ['var(--font-body, Inter)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-display, Poppins)', 'sans-serif'],
        display: ['var(--font-display, Poppins)', 'sans-serif'],
        body: ['var(--font-body, Inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-left': 'slideLeft 30s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        slideLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(0, 217, 255, 0.3)',
      },
    },
  },
  plugins: [],
}

export default config
