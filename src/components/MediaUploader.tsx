'use client';

import { useState, useCallback, useEffect } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { Upload, X, Image as ImageIcon, Loader2, Check, Trash2 } from 'lucide-react';

interface MediaUploaderProps {
  onUpload: (url: string, publicId?: string) => void;
  onClose?: () => void;
  folder?: string;
  maxFiles?: number;
  showLibrary?: boolean;
}

interface UploadResult {
  info: {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

export default function MediaUploader({
  onUpload,
  onClose,
  folder = 'afriverse',
  maxFiles = 1,
  showLibrary = true,
}: MediaUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [recentUploads, setRecentUploads] = useState<Array<{
    url: string;
    publicId: string;
  }>>([]);

  // Fix: Reset body overflow when component unmounts or widget closes
  const resetBodyOverflow = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      resetBodyOverflow();
    };
  }, [resetBodyOverflow]);

  const handleUploadSuccess = useCallback((result: UploadResult) => {
    const { secure_url, public_id } = result.info;
    
    // Reset body overflow after upload
    resetBodyOverflow();
    
    // Add to recent uploads
    setRecentUploads(prev => [{
      url: secure_url,
      publicId: public_id,
    }, ...prev].slice(0, 12));

    // If single select, immediately use the image
    if (maxFiles === 1) {
      onUpload(secure_url, public_id);
      onClose?.();
    }
  }, [maxFiles, onUpload, onClose, resetBodyOverflow]);

  const handleSelectFromRecent = (url: string, publicId: string) => {
    setSelectedImage(url);
    onUpload(url, publicId);
    onClose?.();
  };

  return (
    <div className="space-y-6">
      {/* Upload Widget */}
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
        <CldUploadWidget
          uploadPreset="afriverse_unsigned"
          options={{
            folder,
            maxFiles,
            sources: ['local', 'url', 'camera', 'unsplash'],
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            maxFileSize: 10000000, // 10MB
            cropping: true,
            croppingAspectRatio: 16 / 9,
            showSkipCropButton: true,
            styles: {
              palette: {
                window: '#ffffff',
                windowBorder: '#e5e7eb',
                tabIcon: '#f59e0b',
                menuIcons: '#6b7280',
                textDark: '#1f2937',
                textLight: '#f3f4f6',
                link: '#f59e0b',
                action: '#f59e0b',
                inactiveTabIcon: '#9ca3af',
                error: '#ef4444',
                inProgress: '#f59e0b',
                complete: '#10b981',
                sourceBg: '#f9fafb',
              },
            },
          }}
          onSuccess={(result) => handleUploadSuccess(result as UploadResult)}
          onClose={() => {
            // Fix: Reset body overflow when widget closes
            resetBodyOverflow();
          }}
          onError={() => {
            // Fix: Reset body overflow on error too
            resetBodyOverflow();
          }}
        >
          {({ open, isLoading }) => (
            <button
              type="button"
              onClick={() => open?.()}
              disabled={isLoading}
              className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors disabled:opacity-50"
            >
              <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700">
                {isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
              <div className="text-center">
                <p className="font-medium">{isLoading ? 'Loading...' : 'Click to upload'}</p>
                <p className="text-sm text-gray-500">
                  or drag and drop
                </p>
              </div>
              <p className="text-xs text-gray-400">
                PNG, JPG, GIF, WebP up to 10MB
              </p>
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recent Uploads
          </h4>
          <div className="grid grid-cols-4 gap-3">
            {recentUploads.map((upload, index) => (
              <button
                key={upload.publicId}
                type="button"
                onClick={() => handleSelectFromRecent(upload.url, upload.publicId)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === upload.url
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <img
                  src={upload.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedImage === upload.url && (
                  <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-amber-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter image URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (input.value) {
                  onUpload(input.value);
                  onClose?.();
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
              if (input?.value) {
                onUpload(input.value);
                onClose?.();
              }
            }}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm"
          >
            Use URL
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple Image Preview Component
export function ImagePreview({
  src,
  alt,
  onRemove,
  className = '',
}: {
  src: string;
  alt: string;
  onRemove?: () => void;
  className?: string;
}) {
  if (!src) return null;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
