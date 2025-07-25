"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { FileStorageService } from '@/lib/fileStorage';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface OptimizedMediaViewerProps {
  actionId: string;
  mediaType: 'demo' | 'proof';
  fileName?: string;
  mediaUrl?: string; // Optional: if already loaded
  className?: string;
  showThumbnail?: boolean;
  autoLoad?: boolean; // Default: false for lazy loading
  onMediaLoad?: (mediaData: any) => void;
  onError?: (error: string) => void;
}

interface MediaData {
  url: string;
  type: 'image' | 'video';
  fileName: string;
  fileSize?: number;
  thumbnailUrl?: string;
}

// SUPABASE PRO: Enhanced loading states for better UX
type LoadingState = 'idle' | 'loading' | 'loaded' | 'error' | 'playing';

/**
 * SUPABASE PRO: Optimized media viewer with lazy loading, cached signed URLs,
 * and click-to-play functionality for better performance
 */
export default function OptimizedMediaViewer({
  actionId,
  mediaType,
  fileName,
  mediaUrl,
  className,
  showThumbnail = true,
  autoLoad = false,
  onMediaLoad,
  onError
}: OptimizedMediaViewerProps) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [isVisible, setIsVisible] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [cacheKey, setCacheKey] = useState<string>('');
  
  const elementRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // SUPABASE PRO: IntersectionObserver for lazy loading
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && !isVisible) {
      setIsVisible(true);
      if (autoLoad && !mediaData && loadingState === 'idle') {
        loadMedia();
      }
    }
  }, [isVisible, autoLoad, mediaData, loadingState]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '50px', // Start loading 50px before element is visible
      threshold: 0.1
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      // Cleanup any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [observerCallback]);

  // SUPABASE PRO: Generate cache key for signed URLs
  useEffect(() => {
    const key = `${actionId}-${mediaType}-${Date.now()}`;
    setCacheKey(key);
  }, [actionId, mediaType]);

  // SUPABASE PRO: Enhanced media loading with caching and error handling
  const loadMedia = useCallback(async () => {
    if (loadingState === 'loading' || loadingState === 'loaded') {
      return;
    }

    // If we already have a direct URL, use it
    if (mediaUrl) {
      const type = mediaUrl.includes('video/') || mediaUrl.includes('.mp4') || mediaUrl.includes('.webm') || mediaUrl.includes('.mov') ? 'video' : 'image';
      const data: MediaData = {
        url: mediaUrl,
        type,
        fileName: fileName || `${mediaType}_media`
      };
      setMediaData(data);
      setLoadingState('loaded');
      onMediaLoad?.(data);
      return;
    }

    setLoadingState('loading');

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      console.log(`🎥 SUPABASE PRO: Lazy loading ${mediaType} media for action:`, actionId);
      
      const response = await fetch(`/api/actions/${actionId}/media`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          'X-Cache-Key': cacheKey // SUPABASE PRO: Custom cache header
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch media`);
      }

      const responseData = await response.json();
      const mediaInfo = mediaType === 'demo' ? responseData.demoMedia : responseData.proofMedia;

      if (!mediaInfo || !mediaInfo.url) {
        throw new Error(`${mediaType === 'demo' ? 'Demo video not available' : 'Proof media not uploaded'}`);
      }

      const data: MediaData = {
        url: mediaInfo.url,
        type: mediaInfo.type || 'video',
        fileName: mediaInfo.fileName || fileName || `${mediaType}_media`,
        fileSize: mediaInfo.fileSize,
        thumbnailUrl: mediaInfo.thumbnailUrl
      };

      setMediaData(data);
      setLoadingState('loaded');
      onMediaLoad?.(data);

      console.log(`✅ SUPABASE PRO: Media loaded successfully:`, {
        type: data.type,
        hasUrl: !!data.url,
        hasThumbnail: !!data.thumbnailUrl,
        fileSize: data.fileSize ? `${Math.round(data.fileSize / 1024)}KB` : 'unknown',
        responseTime: responseData.performance?.totalTime || 'unknown'
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Media loading aborted');
        return;
      }

      console.error(`❌ SUPABASE PRO: Error loading ${mediaType} media:`, error);
      setLoadingState('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to load media';
      onError?.(errorMessage);
    }
  }, [actionId, mediaType, fileName, mediaUrl, loadingState, cacheKey, onMediaLoad, onError]);

  // SUPABASE PRO: Click-to-play functionality for videos
  const handlePlayClick = useCallback(() => {
    if (mediaData?.type === 'video') {
      setShowPlayer(true);
      setLoadingState('playing');
      
      // Auto-focus video player when shown
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.focus();
        }
      }, 100);
    } else if (mediaData?.type === 'image') {
      // For images, open in modal
      setShowPlayer(true);
    }
  }, [mediaData]);

  // SUPABASE PRO: Load media on user interaction
  const handleLoadClick = useCallback(() => {
    if (!mediaData && loadingState === 'idle') {
      loadMedia();
    } else if (mediaData) {
      handlePlayClick();
    }
  }, [mediaData, loadingState, loadMedia, handlePlayClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // SUPABASE PRO: Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className={cn(
      "relative bg-gray-100 rounded-lg overflow-hidden",
      "animate-pulse flex items-center justify-center",
      "min-h-[120px] border-2 border-dashed border-gray-300",
      className
    )}>
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-gray-300 rounded-full animate-pulse" />
        <div className="text-sm text-gray-500">
          {loadingState === 'loading' ? 'Loading media...' : `${mediaType === 'demo' ? 'Demo' : 'Proof'} media`}
        </div>
        {loadingState === 'idle' && (
          <button
            onClick={handleLoadClick}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Load {mediaType === 'demo' ? 'Demo' : 'Proof'}
          </button>
        )}
      </div>
    </div>
  );

  // SUPABASE PRO: Render error state
  const renderError = () => (
    <div className={cn(
      "relative bg-red-50 border-2 border-red-200 rounded-lg",
      "flex items-center justify-center min-h-[120px]",
      className
    )}>
      <div className="text-center space-y-2">
        <div className="text-red-500 text-2xl">⚠️</div>
        <div className="text-sm text-red-700">
          Failed to load {mediaType === 'demo' ? 'demo' : 'proof'} media
        </div>
        <button
          onClick={() => {
            setLoadingState('idle');
            loadMedia();
          }}
          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // SUPABASE PRO: Render thumbnail with click-to-play
  const renderThumbnail = () => {
    if (!mediaData) return null;

    const isVideo = mediaData.type === 'video';
    const thumbnailSrc = mediaData.thumbnailUrl || mediaData.url;

    return (
      <div className={cn(
        "relative group cursor-pointer rounded-lg overflow-hidden",
        "hover:shadow-lg transition-all duration-300",
        className
      )}>
        {/* Thumbnail Image */}
        <div className="relative">
          {mediaData.url.startsWith('data:') ? (
            <img
              src={thumbnailSrc}
              alt={mediaData.fileName}
              className="w-full h-full object-cover"
              style={{ maxHeight: '200px' }}
            />
          ) : (
            <Image
              src={thumbnailSrc}
              alt={mediaData.fileName}
              width={400}
              height={200}
              className="w-full h-full object-cover"
              style={{ maxHeight: '200px' }}
              loading="lazy"
              quality={75}
            />
          )}
          
          {/* Play Button Overlay for Videos */}
          {isVideo && (
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-l-[16px] border-l-blue-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
            </div>
          )}

          {/* Click to Enlarge for Images */}
          {!isVideo && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              Click to enlarge
            </div>
          )}
        </div>

        {/* Media Info */}
        <div className="p-3 bg-white border-t">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {mediaData.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {isVideo ? 'Video' : 'Image'} • {mediaData.fileSize ? `${Math.round(mediaData.fileSize / 1024)}KB` : 'Unknown size'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick();
              }}
              className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              {isVideo ? 'Play' : 'View'}
            </button>
          </div>
        </div>

        {/* Click handler for entire thumbnail */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handlePlayClick}
        />
      </div>
    );
  };

  // SUPABASE PRO: Render full media player modal
  const renderMediaPlayer = () => {
    if (!showPlayer || !mediaData) return null;

    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold truncate">{mediaData.fileName}</h3>
            <button
              onClick={() => {
                setShowPlayer(false);
                setLoadingState('loaded');
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Media Content */}
          <div className="p-4">
            {mediaData.type === 'video' ? (
              <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-auto max-h-[60vh] rounded-lg"
                src={mediaData.url}
                onLoadStart={() => console.log('🎥 Video loading started')}
                onCanPlay={() => console.log('✅ Video ready to play')}
                onError={(e) => {
                  console.error('❌ Video error:', e);
                  onError?.('Video playback failed');
                }}
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="relative">
                {mediaData.url.startsWith('data:') ? (
                  <img
                    src={mediaData.url}
                    alt={mediaData.fileName}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  />
                ) : (
                  <Image
                    src={mediaData.url}
                    alt={mediaData.fileName}
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                    quality={90}
                    priority
                  />
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-4 pb-4 text-sm text-gray-600">
            {mediaData.fileSize && (
              <span>File size: {Math.round(mediaData.fileSize / 1024)}KB</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={elementRef} className="w-full">
      {/* SUPABASE PRO: Conditional rendering based on loading state */}
      {loadingState === 'idle' && renderLoadingSkeleton()}
      {loadingState === 'loading' && renderLoadingSkeleton()}
      {loadingState === 'error' && renderError()}
      {(loadingState === 'loaded' || loadingState === 'playing') && mediaData && renderThumbnail()}
      
      {/* SUPABASE PRO: Media player modal */}
      {renderMediaPlayer()}
    </div>
  );
} 