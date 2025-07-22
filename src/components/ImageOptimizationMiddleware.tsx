"use client";
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedMediaProps {
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
  mediaType?: string; // 'image' | 'video'
  style?: React.CSSProperties;
}

/**
 * PERFORMANCE: Optimized media component that handles both images and videos
 * with proper Next.js Image optimization, lazy loading, and error handling
 */
export function OptimizedMedia({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onClick,
  fallbackSrc = '/icons/icon-192x192.png',
  mediaType,
  style
}: OptimizedMediaProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(() => {
    setError(true);
    setLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, []);

  // Determine if this is a video based on file extension or mediaType
  const isVideo = mediaType === 'video' || 
    src.toLowerCase().includes('.mp4') || 
    src.toLowerCase().includes('.webm') || 
    src.toLowerCase().includes('.mov');

  // PERFORMANCE: Handle base64 images (legacy support)
  const isBase64 = src.startsWith('data:');

  if (isVideo) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={style}>
        <video
          src={src}
          controls
          className="w-full h-full object-cover"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          onError={handleError}
          onLoadedData={handleLoad}
          onClick={onClick}
        >
          Your browser does not support video.
        </video>
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Loading video...</div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Failed to load video</div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-gray-100", className)} style={style}>
        <Image
          src={fallbackSrc}
          alt="Fallback image"
          width={width}
          height={height}
          className="object-cover"
          sizes={sizes}
          quality={quality}
          onClick={onClick}
        />
      </div>
    );
  }

  if (isBase64) {
    // PERFORMANCE: For base64 images, use regular img tag to avoid Next.js processing
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={style}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            ...style
          }}
          onError={handleError}
          onLoad={handleLoad}
          onClick={onClick}
        />
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)} style={style}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={cn("object-cover", fill ? "absolute inset-0" : "")}
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
      {loading && (
        <div className={cn(
          "bg-gray-200 animate-pulse rounded-lg flex items-center justify-center",
          fill ? "absolute inset-0" : `w-[${width}px] h-[${height}px]`
        )}>
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
    </div>
  );
}

/**
 * PERFORMANCE: Optimized avatar component for user images
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallbackSrc = '/icons/icon-192x192.png'
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackSrc?: string;
}) {
  return (
    <OptimizedMedia
      src={src || fallbackSrc}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full", className)}
      sizes="(max-width: 768px) 80px, 60px"
      quality={80}
      fallbackSrc={fallbackSrc}
    />
  );
}

/**
 * PERFORMANCE: Optimized thumbnail component for preview images
 */
export function OptimizedThumbnail({
  src,
  alt,
  width = 120,
  height = 90,
  className,
  onClick
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <OptimizedMedia
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("cursor-pointer transition-transform hover:scale-105", className)}
      sizes="(max-width: 768px) 150px, 120px"
      quality={70}
      onClick={onClick}
    />
  );
}

export default OptimizedMedia; 