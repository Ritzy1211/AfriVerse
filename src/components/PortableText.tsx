import { PortableText as BasePortableText, PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/sanity';
import type { PortableTextBlock } from '@portabletext/types';

// Custom components for rendering Portable Text
const portableTextComponents: Partial<PortableTextComponents> = {
  types: {
    // Image block
    image: ({ value }: { value: any }) => {
      if (!value?.asset) return null;
      
      return (
        <figure className="my-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={getImageUrl(value, { width: 1200, quality: 80 })}
              alt={value.alt || ''}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    
    // YouTube embed
    youtube: ({ value }: { value: { url?: string; caption?: string } }) => {
      if (!value?.url) return null;
      
      // Extract video ID from YouTube URL
      const videoId = value.url.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      )?.[1];
      
      if (!videoId) return null;
      
      return (
        <figure className="my-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    
    // Twitter/X embed
    twitter: ({ value }: { value: { url?: string } }) => {
      if (!value?.url) return null;
      
      return (
        <div className="my-8 flex justify-center">
          <blockquote className="twitter-tweet">
            <a href={value.url}>View tweet</a>
          </blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        </div>
      );
    },
    
    // Code block
    code: ({ value }: { value: { code?: string; language?: string; filename?: string } }) => {
      if (!value?.code) return null;
      
      return (
        <div className="my-8">
          {value.filename && (
            <div className="rounded-t-lg bg-gray-800 px-4 py-2 text-sm text-gray-300">
              {value.filename}
            </div>
          )}
          <pre className={`overflow-x-auto rounded-${value.filename ? 'b' : ''}lg bg-gray-900 p-4`}>
            <code className={`language-${value.language || 'text'} text-sm text-gray-100`}>
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
    
    // Callout box
    callout: ({ value }: { value: { type?: string; title?: string; text?: string } }) => {
      const colors = {
        info: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100',
        success: 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-100',
        error: 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-100',
      };
      
      const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        error: '❌',
      };
      
      const type = (value.type || 'info') as keyof typeof colors;
      
      return (
        <div className={`my-8 rounded-lg border-l-4 p-4 ${colors[type]}`}>
          {value.title && (
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <span>{icons[type]}</span>
              <span>{value.title}</span>
            </div>
          )}
          {value.text && <p className="m-0">{value.text}</p>}
        </div>
      );
    },
    
    // Table
    table: ({ value }: { value: { caption?: string; rows?: Array<{ cells?: string[] }> } }) => {
      if (!value?.rows?.length) return null;
      
      return (
        <figure className="my-8 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700">
            <tbody>
              {value.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-100 dark:bg-gray-800 font-semibold' : ''}>
                  {row.cells?.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-200 px-4 py-2 dark:border-gray-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  
  marks: {
    // External link
    link: ({ children, value }: any) => {
      const target = value?.openInNewTab ? '_blank' : undefined;
      const rel = target === '_blank' ? 'noopener noreferrer' : undefined;
      
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-primary underline hover:no-underline"
        >
          {children}
        </a>
      );
    },
    
    // Internal link
    internalLink: ({ children, value }: any) => {
      if (!value?.reference) return <>{children}</>;
      
      const { _type, slug } = value.reference;
      let href = '/';
      
      if (_type === 'article' && slug?.current) {
        href = `/${slug.current}`;
      } else if (_type === 'category' && slug?.current) {
        href = `/${slug.current}`;
      } else if (_type === 'author' && slug?.current) {
        href = `/author/${slug.current}`;
      }
      
      return (
        <Link href={href} className="text-primary underline hover:no-underline">
          {children}
        </Link>
      );
    },
    
    // Highlight
    highlight: ({ children }: any) => (
      <mark className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{children}</mark>
    ),
    
    // Code inline
    code: ({ children }: any) => (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-800">
        {children}
      </code>
    ),
  },
  
  block: {
    // Headings
    h2: ({ children }) => (
      <h2 className="mb-4 mt-8 text-2xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 text-xl font-bold">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-2 mt-4 text-lg font-bold">{children}</h4>
    ),
    
    // Blockquote
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-gray-600 dark:text-gray-300">
        {children}
      </blockquote>
    ),
    
    // Normal paragraph
    normal: ({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
  },
  
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
    ),
  },
  
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
};

// Portable Text component wrapper
interface PortableTextProps {
  value: PortableTextBlock[];
  className?: string;
}

export function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value) return null;
  
  return (
    <div className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      <BasePortableText value={value} components={portableTextComponents} />
    </div>
  );
}
