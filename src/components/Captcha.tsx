'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import Script from 'next/script';

// ============================================
// reCAPTCHA v2 Checkbox Component
// ============================================

interface ReCaptchaV2Props {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

export function ReCaptchaV2({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal',
}: ReCaptchaV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const renderCaptcha = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || widgetIdRef.current !== null) return;

    try {
      widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
      });
    } catch (error) {
      console.error('reCAPTCHA render error:', error);
    }
  }, [siteKey, theme, size, onVerify, onExpire, onError]);

  useEffect(() => {
    if (isLoaded && window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderCaptcha();
    }
  }, [isLoaded, renderCaptcha]);

  // Reset captcha when needed
  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  }, []);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=explicit`}
        onLoad={() => {
          setIsLoaded(true);
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            renderCaptcha();
          }
        }}
      />
      <div ref={containerRef} className="g-recaptcha" />
    </>
  );
}

// ============================================
// reCAPTCHA v3 (Invisible) Component
// ============================================

interface ReCaptchaV3Props {
  siteKey: string;
  action?: string;
}

export function useReCaptchaV3({ siteKey, action = 'login' }: ReCaptchaV3Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load reCAPTCHA v3 script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      setIsReady(true);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [siteKey]);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!isReady || !window.grecaptcha) {
      console.warn('reCAPTCHA not ready');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execute error:', error);
      return null;
    }
  }, [isReady, siteKey, action]);

  return { isReady, executeRecaptcha };
}

// ============================================
// Simple reCAPTCHA Wrapper for Login Form
// ============================================

interface CaptchaProps {
  siteKey: string;
  type: 'v2' | 'v3';
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
}

export default function Captcha({
  siteKey,
  type,
  onVerify,
  onExpire,
  theme = 'dark',
}: CaptchaProps) {
  if (!siteKey) {
    return null; // Don't render if no site key
  }

  if (type === 'v2') {
    return (
      <ReCaptchaV2
        siteKey={siteKey}
        onVerify={onVerify}
        onExpire={onExpire}
        theme={theme}
        size="normal"
      />
    );
  }

  // For v3, we use a hook instead - this component just shows a badge notice
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      Protected by reCAPTCHA.{' '}
      <a 
        href="https://policies.google.com/privacy" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:text-gray-700 dark:hover:text-gray-300"
      >
        Privacy
      </a>
      {' • '}
      <a 
        href="https://policies.google.com/terms" 
        target="_blank" 
        rel="noopener noreferrer"
        className="underline hover:text-gray-700 dark:hover:text-gray-300"
      >
        Terms
      </a>
    </div>
  );
}

// Type declaration for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: string;
          size?: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId: number) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      ready: (callback: () => void) => void;
    };
  }
}
