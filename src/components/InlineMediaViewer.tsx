'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiX, FiEye, FiPlay, FiImage, FiVideo, FiDownload, FiLoader } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface InlineMediaViewerProps {
  actionId: string;
  mediaType: 'demo' | 'proof';
  fileName?: string;
  fileSize?: number;
  mediaFileType?: string; // image/jpeg, video/mp4, etc.
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface MediaData {
  url: string;
  type: string;
  fileName: string;
  fileSize?: number;
}

export default function InlineMediaViewer({
  actionId,
  mediaType,
  fileName = 'media',
  fileSize,
  mediaFileType,
  isOpen,
  onClose,
  className
}: InlineMediaViewerProps) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Performance: Lazy load media only when viewer is opened
  const loadMedia = useCallback(async () => {
    if (!isOpen || mediaData || isLoading) return;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🎥 INLINE VIEWER: Lazy loading ${mediaType} media for action:`, actionId);
      
      const response = await fetch(`/api/actions/${actionId}/media`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5-minute cache
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in again to view media');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view this media');
        }
        if (response.status === 404) {
          throw new Error(mediaType === 'demo' ? 'Demo video not available' : 'Proof media not uploaded yet');
        }
        throw new Error(`Failed to load media (HTTP ${response.status})`);
      }

      const responseData = await response.json();
      const mediaInfo = mediaType === 'demo' ? responseData.demoMedia : responseData.proofMedia;

      if (!mediaInfo || !mediaInfo.url) {
        throw new Error(mediaType === 'demo' ? 'Demo video not available from coach' : 'Please upload your proof media');
      }

      const data: MediaData = {
        url: mediaInfo.url,
        type: mediaInfo.type || mediaFileType || 'video/mp4',
        fileName: mediaInfo.fileName || fileName,
        fileSize: mediaInfo.fileSize || fileSize
      };

      setMediaData(data);
      console.log(`✅ INLINE VIEWER: Media loaded successfully:`, {
        type: data.type,
        hasUrl: !!data.url,
        fileSize: data.fileSize ? `${Math.round(data.fileSize / 1024)}KB` : 'unknown',
        responseTime: responseData.performance?.totalTime || 'unknown'
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Media loading aborted');
        return;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to load media';
      console.error(`❌ INLINE VIEWER: Error loading ${mediaType} media:`, error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, actionId, mediaType, fileName, fileSize, mediaFileType, mediaData, isLoading]);

  // Load media when viewer opens
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, loadMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle video load optimization
  const handleVideoLoad = useCallback(() => {
    setIsMediaLoaded(true);
    if (videoRef.current) {
      // Performance: Set optimal video properties
      videoRef.current.preload = 'metadata';
    }
  }, []);

  // Handle image load optimization
  const handleImageLoad = useCallback(() => {
    setIsMediaLoaded(true);
  }, []);

  // Handle close with cleanup
  const handleClose = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMediaData(null);
    setIsMediaLoaded(false);
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const isVideo = mediaData?.type.startsWith('video/');
  const isImage = mediaData?.type.startsWith('image/');

  return (
    <div className={cn(
      "relative bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",
      "animate-in slide-in-from-top-4 duration-300",
      className
    )}>
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {isVideo ? (
            <FiVideo className="w-5 h-5 text-blue-600" />
          ) : (
            <FiImage className="w-5 h-5 text-blue-600" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">
            {mediaType === 'demo' ? 'Coach Demo Media' : 'Student Proof Submission'}
          </h3>
          {mediaData && (
            <span className="text-xs text-gray-500">
              ({mediaData.fileSize ? `${Math.round(mediaData.fileSize / 1024)}KB` : 'Unknown size'})
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Close media viewer"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-12 bg-gray-50 rounded-lg">
            <div className="text-center space-y-3">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Loading {mediaType === 'demo' ? 'demo' : 'proof'} media...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center space-y-3">
              <div className="text-red-500 text-2xl">⚠️</div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadMedia}
                className="px-3 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {mediaData && !error && (
          <div className="space-y-4">
            {/* Media display */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden">
              {isVideo ? (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto max-h-[60vh] rounded-lg"
                  src={mediaData.url}
                  preload="none" // Performance: Load metadata only when needed
                  onLoadedMetadata={handleVideoLoad}
                  onError={() => setError('Failed to load video. It may be corrupted or in an unsupported format.')}
                  poster="" // No poster for faster loading
                >
                  <source src={mediaData.url} type={mediaData.type} />
                  Your browser does not support video playback.
                </video>
              ) : (
                <img
                  src={mediaData.url}
                  alt={mediaData.fileName}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  loading="lazy" // Performance: Lazy load images
                  onLoad={handleImageLoad}
                  onError={() => setError('Failed to load image. It may be corrupted or in an unsupported format.')}
                />
              )}
              
              {/* Loading overlay for media */}
              {!isMediaLoaded && !error && (
                <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                  <FiLoader className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Media info and download */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mediaData.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {isVideo ? 'Video' : 'Image'} • {mediaData.type}
                </p>
              </div>
              <a
                href={mediaData.url}
                download={mediaData.fileName}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                title="Download media file"
              >
                <FiDownload className="w-3 h-3" />
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 