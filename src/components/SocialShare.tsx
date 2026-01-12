'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link2, Mail, MessageCircle, Check } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  excerpt?: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
  className?: string;
}

export default function SocialShare({ 
  url, 
  title, 
  excerpt = '', 
  variant = 'horizontal',
  className = '' 
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-[#1DA1F2] hover:text-white',
      bgColor: 'bg-[#1DA1F2]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
      bgColor: 'bg-[#1877F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
      bgColor: 'bg-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white',
      bgColor: 'bg-[#25D366]',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedExcerpt}%0A%0ARead more: ${encodedUrl}`,
      color: 'hover:bg-gray-700 hover:text-white',
      bgColor: 'bg-gray-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (href: string, name: string) => {
    // Open in popup for better UX
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      href,
      `share-${name}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
  };

  // Floating sidebar variant (for article pages)
  if (variant === 'floating') {
    return (
      <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2 ${className}`}>
        <span className="text-xs text-gray-500 font-medium mb-1 text-center">Share</span>
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href, link.name)}
            className={`p-3 rounded-full bg-white shadow-lg border border-gray-100 text-gray-600 transition-all duration-200 ${link.color}`}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-5 h-5" />
          </button>
        ))}
        <button
          onClick={copyToClipboard}
          className="p-3 rounded-full bg-white shadow-lg border border-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-all duration-200"
          title="Copy link"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Link2 className="w-5 h-5" />}
        </button>
      </div>
    );
  }

  // Vertical variant (for sidebars)
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Share this article</span>
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href, link.name)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200 ${link.color}`}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{link.name}</span>
          </button>
        ))}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-all duration-200"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Link2 className="w-5 h-5" />
              <span className="text-sm font-medium">Copy Link</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Share:</span>
      {shareLinks.map((link) => (
        <button
          key={link.name}
          onClick={() => handleShare(link.href, link.name)}
          className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200 ${link.color}`}
          title={`Share on ${link.name}`}
        >
          <link.icon className="w-4 h-4" />
        </button>
      ))}
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-all duration-200"
        title="Copy link"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
