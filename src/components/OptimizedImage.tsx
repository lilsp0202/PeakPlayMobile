"use client";
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onClick,
  fallbackSrc = '/icons/icon-192x192.png'
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle base64 data URLs by falling back to img tag
  const isDataUrl = src.startsWith('data:');
  const imageSrc = error ? fallbackSrc : src;

  if (isDataUrl) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100",
            onClick && "cursor-pointer hover:opacity-90",
            className
          )}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          onClick={onClick}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            objectFit: 'cover'
          }}
        />
      </div>
    );
  }

  // Use Next.js Image for URLs
  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          "transition-all duration-300",
          loading ? "opacity-0" : "opacity-100",
          onClick && "cursor-pointer hover:scale-105",
          "object-cover"
        )}
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onClick={onClick}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
} 