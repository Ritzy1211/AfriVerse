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

  // Floating sidebar variant (for article pages) - positioned in left margin, outside content
  // Only visible on very wide screens (1536px+) where there's actual margin space
  // Styled like Legit.ng with branded colored icons
  if (variant === 'floating') {
    const floatingShareLinks = [
      {
        name: 'Facebook',
        icon: Facebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        color: '#1877F2',
      },
      {
        name: 'Messenger',
        icon: MessageCircle,
        href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
        color: '#0099FF',
      },
      {
        name: 'Twitter',
        icon: Twitter,
        href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        color: '#000000',
      },
      {
        name: 'WhatsApp',
        icon: MessageCircle,
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        color: '#25D366',
      },
      {
        name: 'LinkedIn',
        icon: Linkedin,
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`,
        color: '#0A66C2',
      },
    ];

    return (
      <div className={`fixed left-0 top-1/4 z-40 hidden 2xl:flex flex-col items-center ${className}`}>
        {floatingShareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href, link.name)}
            className="p-4 transition-all duration-200 hover:scale-110 hover:opacity-80"
            style={{ color: link.color }}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-6 h-6" strokeWidth={1.5} fill={link.name === 'Twitter' ? 'currentColor' : 'none'} />
          </button>
        ))}
        <button
          onClick={copyToClipboard}
          className="p-4 text-gray-500 transition-all duration-200 hover:scale-110 hover:text-gray-700"
          title="Copy link"
        >
          {copied ? <Check className="w-6 h-6 text-green-500" /> : <Link2 className="w-6 h-6" strokeWidth={1.5} />}
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
