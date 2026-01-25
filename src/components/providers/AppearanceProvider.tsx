'use client';

import { useEffect, useState } from 'react';

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  theme: string;
}

const defaultSettings: AppearanceSettings = {
  primaryColor: '#1A1A2E',
  secondaryColor: '#F39C12',
  accentColor: '#00D9FF',
  headingFont: 'Plus Jakarta Sans',
  bodyFont: 'Plus Jakarta Sans',
  theme: 'light',
};

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  }
  return '0 0 0';
}

export default function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadAppearance() {
      try {
        const response = await fetch('/api/appearance');
        if (response.ok) {
          const settings: AppearanceSettings = await response.json();
          applySettings(settings);
        }
      } catch (error) {
        console.error('Error loading appearance settings:', error);
        // Apply defaults
        applySettings(defaultSettings);
      } finally {
        setLoaded(true);
      }
    }

    function applySettings(settings: AppearanceSettings) {
      const root = document.documentElement;
      
      // Apply color variables
      if (settings.primaryColor) {
        root.style.setProperty('--color-primary', settings.primaryColor);
        root.style.setProperty('--color-primary-rgb', hexToRgb(settings.primaryColor));
      }
      
      if (settings.secondaryColor) {
        root.style.setProperty('--color-secondary', settings.secondaryColor);
        root.style.setProperty('--color-secondary-rgb', hexToRgb(settings.secondaryColor));
      }
      
      if (settings.accentColor) {
        root.style.setProperty('--color-accent', settings.accentColor);
        root.style.setProperty('--color-accent-rgb', hexToRgb(settings.accentColor));
      }

      // Apply font variables
      if (settings.headingFont) {
        root.style.setProperty('--font-display', `"${settings.headingFont}", system-ui, sans-serif`);
      }
      
      if (settings.bodyFont) {
        root.style.setProperty('--font-body', `"${settings.bodyFont}", system-ui, sans-serif`);
      }

      // Apply theme
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      }
      // 'system' theme is handled by the browser's prefers-color-scheme
    }

    loadAppearance();
  }, []);

  // Optionally add a loading state or just render children immediately
  return <>{children}</>;
}
