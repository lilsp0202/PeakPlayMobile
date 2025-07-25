"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiUpload, FiPlay, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import ActionProofUpload from "./ActionProofUpload";
import OptimizedMediaViewer from "./OptimizedMediaViewer";
import InlineMediaViewer from "./InlineMediaViewer";

interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
  team?: {
    name: string;
  };
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  // Student proof upload fields (URLs lazy-loaded via API)
  proofMediaType?: string;
  proofFileName?: string;
  proofUploadedAt?: string;
  proofFileSize?: number;
  proofUploadMethod?: string;
  // Coach demo media fields (URLs lazy-loaded via API)
  demoMediaType?: string;
  demoFileName?: string;
  demoUploadedAt?: string;
  demoFileSize?: number;
  demoUploadMethod?: string;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
  team?: {
    name: string;
  };
}

interface TrackPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface TrackResponse {
  data: (FeedbackItem | ActionItem)[];
  totalTime: number;
  count: number;
  pagination: TrackPagination;
}

const FeedbackActions = () => {
  const { data: session, status, update: updateSession } = useSession();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'actions'>('feedback');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [authRetryCount, setAuthRetryCount] = useState(0);
  
  // PERFORMANCE: Track API pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8); // PERFORMANCE: Smaller initial page size for faster load
  const [trackPagination, setTrackPagination] = useState<TrackPagination | null>(null);
    const [filters, setFilters] = useState({
    student: 'all',
    category: 'all',
    priority: 'all',
    status: 'all',
    dateRange: 'week'  // PERFORMANCE: Start with 'week' for faster initial load, coaches can expand if needed
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loadingType, setLoadingType] = useState<'feedback' | 'actions' | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<{ totalTime?: number } | null>(null);
  
  // PERFORMANCE: Client-side caching to prevent redundant API calls
  const [dataCache, setDataCache] = useState<{
    feedback: { data: FeedbackItem[], pagination: TrackPagination, timestamp: number } | null,
    actions: { data: ActionItem[], pagination: TrackPagination, timestamp: number } | null
  }>({ feedback: null, actions: null });
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingActionId, setUploadingActionId] = useState<string | null>(null);
  
  // Video modal state (kept for backwards compatibility)
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    url: string;
    type: string;
    fileName: string;
  } | null>(null);

  // Inline media viewer state - optimized for performance
  const [openInlineViewers, setOpenInlineViewers] = useState<Set<string>>(new Set());

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showVideoModal) {
        setShowVideoModal(false);
      }
    };

    if (showVideoModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  // Ref to track if fetch is in progress to prevent duplicate requests
  const fetchInProgress = useRef(false);

  // PERFORMANCE: Memoized filtered data
  const unreadFeedback = useMemo(() => 
    feedback.filter(item => !item.isAcknowledged), 
    [feedback]
  );
  
  const pendingActions = useMemo(() => 
    actions.filter(item => !item.isCompleted), 
    [actions]
  );

  // Enhanced session refresh handler
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Attempting session refresh...');
      await updateSession();
      setAuthRetryCount(0);
      return true;
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      setAuthRetryCount(prev => prev + 1);
      return false;
    }
  }, [updateSession]);

  // Handle authentication errors with automatic refresh
  const handleAuthError = useCallback(async () => {
    if (authRetryCount < 2) {
      console.log(`🔄 Authentication error - attempting refresh (${authRetryCount + 1}/2)`);
      const refreshSuccess = await refreshSession();
      if (refreshSuccess) {
        setTimeout(() => fetchData(activeTab, true), 1000);
        return;
      }
    }
    
    setError('Your session has expired. Please sign in again to continue.');
    setIsLoading(false);
  }, [authRetryCount, refreshSession, activeTab]);

  // PERFORMANCE: Enhanced fetch function with role-based API selection and caching
  const fetchData = useCallback(async (type: 'feedback' | 'actions', forceRefresh = false, page = 1) => {
    if (status !== 'authenticated' || !session) {
      if (status === 'unauthenticated') {
        setError('Authentication required - please sign in');
      }
      setIsLoading(false);
      fetchInProgress.current = false;
      return;
    }

    // PERFORMANCE: Check cache first (unless forced refresh)
    const now = Date.now();
    const cached = dataCache[type];
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`🚀 Using cached ${type} data (${Math.round((now - cached.timestamp) / 1000)}s old)`);
      if (type === 'feedback') {
        setFeedback(cached.data as FeedbackItem[]);
      } else {
        setActions(cached.data as ActionItem[]);
      }
      setTrackPagination(cached.pagination);
      setIsLoading(false);
      fetchInProgress.current = false;
      return;
    }

    // Avoid fetching too frequently unless forced
    if (!forceRefresh && lastFetch && (now - lastFetch) < 15000) {
      fetchInProgress.current = false;
      return;
    }

    // Prevent multiple simultaneous requests
    if (fetchInProgress.current && !forceRefresh) {
      console.log('🔒 Request already in progress, skipping duplicate request');
      return;
    }

    fetchInProgress.current = true;

    try {
      setLoadingType(type);
      if (page === 1) {
      setIsLoading(true);
      }
      setError(null);
      
      const userRole = (session.user as any)?.role;
      console.log(`🚀 Fetching ${type} data for ${userRole}...`);

      let response: Response;

      if (userRole === 'COACH') {
        // Use Track API for coaches (existing behavior)
        const queryParams = new URLSearchParams({
          type,
          page: page.toString(),
          limit: pageSize.toString(),
          student: filters.student,
          category: filters.category,
          priority: filters.priority,
          status: filters.status,
          dateRange: filters.dateRange
        });

        response = await fetch(`/api/track?${queryParams}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

        if (response.status === 401) {
          console.log('🔐 Authentication error detected - handling...');
        fetchInProgress.current = false;
        await handleAuthError();
        return;
      }

        if (!response.ok) {
          throw new Error(`Track API error: ${response.status}`);
        }

        const trackData: TrackResponse = await response.json();
        console.log(`✅ Coach ${type} data fetched in ${trackData.totalTime}ms - ${trackData.count}/${trackData.pagination.total} items`);
        
        // Update performance metrics
        setPerformanceMetrics({ totalTime: trackData.totalTime });
        
        // Update pagination state
        setTrackPagination(trackData.pagination);
        setCurrentPage(page);
        
        // Update data based on type
        if (type === 'feedback') {
          setFeedback(trackData.data as FeedbackItem[]);
        } else {
          setActions(trackData.data as ActionItem[]);
        }
        
        // PERFORMANCE: Update cache for faster subsequent loads
        setDataCache(prev => ({
          ...prev,
          [type]: {
            data: trackData.data,
            pagination: trackData.pagination,
            timestamp: now
          }
        }));
      } else {
        // PERFORMANCE: Use new optimized Actions API for athletes with pagination
        if (type === 'feedback') {
          response = await fetch('/api/feedback', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

          if (response.status === 401) {
            console.log('🔐 Authentication error detected - handling...');
        fetchInProgress.current = false;
        await handleAuthError();
        return;
      }

          if (!response.ok) {
            throw new Error(`Feedback API error: ${response.status}`);
          }

          const feedbackData = await response.json();
          console.log(`✅ Athlete feedback data fetched - ${feedbackData.length} items`);
          setFeedback(feedbackData);
          
          // Set mock pagination for athletes (no pagination in direct API)
          const mockPagination = {
            page: 1,
            limit: pageSize,
            total: feedbackData.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
          };
          setTrackPagination(mockPagination);
          
          // PERFORMANCE: Update cache for athletes
          setDataCache(prev => ({
            ...prev,
            feedback: {
              data: feedbackData,
              pagination: mockPagination,
              timestamp: now
            }
          }));
        } else {
          // PERFORMANCE: Use new optimized Actions API with pagination and filters
          const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: pageSize.toString(),
            category: filters.category !== 'all' ? filters.category : '',
            priority: filters.priority !== 'all' ? filters.priority : '',
            status: filters.status !== 'all' ? filters.status : ''
          });

          // Remove empty params
          for (const [key, value] of queryParams.entries()) {
            if (!value) queryParams.delete(key);
          }

          const apiUrl = `/api/actions${queryParams.toString() ? `?${queryParams}` : ''}`;
          
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (response.status === 401) {
            console.log('🔐 Authentication error detected - handling...');
            fetchInProgress.current = false;
            await handleAuthError();
            return;
          }

          if (!response.ok) {
            throw new Error(`Actions API error: ${response.status}`);
          }

          const actionsResult = await response.json();
          console.log(`✅ Athlete actions data fetched - ${actionsResult.actions?.length || 0}/${actionsResult.pagination?.total || 0} items`);
          
          // PERFORMANCE: Handle new API format with actions and pagination
          const actionsData = actionsResult.actions || actionsResult || [];
          const paginationData = actionsResult.pagination || {
            total: actionsData.length,
            totalPages: 1,
            currentPage: 1,
            hasNext: false,
            hasPrev: false
          };
          
          setActions(actionsData);
          setTrackPagination(paginationData);
          setCurrentPage(page);
          
          // PERFORMANCE: Update cache for athlete actions
          setDataCache(prev => ({
            ...prev,
            actions: {
              data: actionsData,
              pagination: paginationData,
              timestamp: now
            }
          }));
        }
      }

      // Reset retry counts on success
      setRetryCount(0);
      setAuthRetryCount(0);
      setLastFetch(now);

      console.log(`🎉 ${type} data loaded successfully for ${userRole}`);
    } catch (error) {
      console.error(`❌ Error fetching ${type} data:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else if (error.message.includes('Session expired') || error.message.includes('401')) {
          fetchInProgress.current = false;
          await handleAuthError();
          return;
        } else {
          setError(`Failed to load ${type}: ${error.message}`);
        }
      } else {
        setError(`Failed to load ${type} data`);
      }
      
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      fetchInProgress.current = false;
    }
  }, [lastFetch, status, session, handleAuthError, pageSize, filters]);

  // Wait for session to be ready before attempting to fetch
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      console.log('✅ Session authenticated, fetching track data...');
      fetchData(activeTab);
    } else if (status === 'unauthenticated') {
      console.log('❌ User not authenticated');
      setError('Please sign in to view feedback and actions');
      setIsLoading(false);
    } else if (status === 'loading') {
      console.log('⏳ Session loading...');
      setIsLoading(true);
    }
  }, [status, session, activeTab, fetchData]);

  // Handle tab changes with data fetching
  const handleTabChange = useCallback((newTab: 'feedback' | 'actions') => {
    setActiveTab(newTab);
    setCurrentPage(1); // Reset to first page
    fetchData(newTab, true, 1);
  }, [fetchData]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && trackPagination && newPage <= trackPagination.totalPages) {
      fetchData(activeTab, false, newPage);
    }
  }, [activeTab, trackPagination, fetchData]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setCurrentPage(1); // Reset to first page when filters change
    // Debounce the API call
    setTimeout(() => fetchData(activeTab, true, 1), 300);
  }, [activeTab, fetchData]);

  // Manual refresh with exponential backoff
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setAuthRetryCount(0);
    
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    if (delay > 1000) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await fetchData(activeTab, true, currentPage);
    setIsRefreshing(false);
  }, [fetchData, retryCount, activeTab, currentPage]);

  // Handle sign in redirect
  const handleSignIn = useCallback(() => {
    signIn();
  }, []);

  // Handle sign out and refresh
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/auth/signin' });
  }, []);

  // PERFORMANCE: Optimized acknowledge function with optimistic updates
  const handleAcknowledgeFeedback = useCallback(async (feedbackId: string) => {
    if (status !== 'authenticated' || !session) {
      setError('Please sign in to acknowledge feedback');
      return;
    }

    // Optimistic update
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
        : item
    ));

    setProcessingIds(prev => new Set(prev).add(feedbackId));
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          feedbackId, 
          isAcknowledged: true 
        }),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        // Revert optimistic update on error
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId 
            ? { ...item, isAcknowledged: false, acknowledgedAt: undefined }
            : item
        ));
        throw new Error('Failed to acknowledge feedback');
      }
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });
    }
  }, [status, session]);

  // Handler functions
  const handleUploadProof = useCallback((actionId: string) => {
    setUploadingActionId(actionId);
    setShowUploadModal(true);
  }, []);

  const handleUploadSuccess = useCallback((proofData: any) => {
    setShowUploadModal(false);
    setUploadingActionId(null);
    // Refresh the actions list
    fetchData('actions', true, currentPage);
  }, [fetchData, currentPage]);

  // PERFORMANCE: Optimized complete action with optimistic updates
  const handleCompleteAction = useCallback(async (actionId: string) => {
    if (status !== 'authenticated' || !session) {
      setError('Please sign in to complete actions');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to mark this action as completed?");
    if (!confirmed) {
      return;
    }

    // Optimistic update
    const completedAt = new Date().toISOString();
    setActions(prev => prev.map(item => 
      item.id === actionId 
        ? { ...item, isCompleted: true, completedAt }
        : item
    ));

    setProcessingIds(prev => new Set([...prev, actionId]));
    
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId,
          isCompleted: true,
          completedAt
        }),
      });

      if (response.status === 401) {
        throw new Error('Session expired. Please sign in again.');
      }

      if (!response.ok) {
        // Revert optimistic update on error
        setActions(prev => prev.map(item => 
          item.id === actionId 
            ? { ...item, isCompleted: false, completedAt: undefined }
            : item
        ));
        throw new Error('Failed to complete action');
      }
    } catch (error) {
      console.error('Error completing action:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to complete action. Please try again.');
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  }, [status, session]);

  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);

  // PERFORMANCE OPTIMIZED: Lazy-load media URLs only when user requests viewing
  const viewProofMedia = async (actionId: string, mediaType: 'demo' | 'proof', fileName?: string) => {
    if (loadingMedia === `${actionId}-${mediaType}`) {
      return;
    }

    setLoadingMedia(`${actionId}-${mediaType}`);
    
    try {
      console.log(`🎥 LAZY LOAD: Fetching ${mediaType} media URL for action:`, actionId);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter 3-second timeout for better UX
      
      const response = await fetch(`/api/actions/${actionId}/media`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 min cache
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Media fetch failed:', { status: response.status, error: errorData });
        
        if (response.status === 401) {
          alert('❌ Please log in again to view media.');
          window.location.href = '/auth/signin';
          return;
        }
        
        if (response.status === 403) {
          alert('❌ You do not have permission to view this media.');
          return;
        }
        
        if (response.status === 404) {
          alert(`❌ ${mediaType === 'demo' ? 'Demo video not available.' : 'Proof media not uploaded yet.'}`);
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to fetch media'}`);
      }
      
      const mediaData = await response.json();
      const mediaInfo = mediaType === 'demo' ? mediaData.demoMedia : mediaData.proofMedia;
      
      console.log(`🎥 Media URL loaded in ${mediaData.performance?.totalTime || 'unknown'}ms:`, {
        hasMediaInfo: !!mediaInfo,
        mediaType: mediaType,
        hasUrl: !!mediaInfo?.url,
        type: mediaInfo?.type,
        fileName: mediaInfo?.fileName,
        fileSize: mediaInfo?.fileSize ? `${Math.round(mediaInfo.fileSize / 1024)}KB` : 'unknown'
      });
      
      if (!mediaInfo || !mediaInfo.url || mediaInfo.url === 'base64_data_processed' || mediaInfo.url === 'base64_stored') {
        alert(`❌ ${mediaType === 'demo' ? 'Demo video not available from coach.' : 'Please upload your proof media.'}`);
        return;
      }

      setCurrentMedia({
        url: mediaInfo.url,
        type: mediaInfo.type || 'video/mp4',
        fileName: mediaInfo.fileName || `${mediaType}_${fileName || 'media'}`
      });
      setShowVideoModal(true);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        alert(`❌ Media loading timed out. Please try again.`);
      } else {
        console.error(`❌ Error viewing ${mediaType} media:`, error);
        alert(`Failed to load ${mediaType} media. Please try again.`);
      }
    } finally {
      setLoadingMedia(null);
    }
  };

  // Inline media viewer handlers - optimized for performance
  const openInlineViewer = useCallback((actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    setOpenInlineViewers(prev => new Set(prev).add(viewerId));
  }, []);

  const closeInlineViewer = useCallback((actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    setOpenInlineViewers(prev => {
      const newSet = new Set(prev);
      newSet.delete(viewerId);
      return newSet;
    });
  }, []);

  const isInlineViewerOpen = useCallback((actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    return openInlineViewers.has(viewerId);
  }, [openInlineViewers]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-indigo-700 font-medium">Loading session...</p>
      </div>
    );
  }

  // Authentication error state
  if (error && error.includes('session')) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-red-50 to-orange-100 rounded-xl">
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={handleSignIn}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }
    
    return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      {/* Header with tabs and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                <button
              onClick={() => handleTabChange('feedback')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
                activeTab === 'feedback'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Feedback
              {unreadFeedback.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {unreadFeedback.length}
                </span>
              )}
                </button>
                <button
              onClick={() => handleTabChange('actions')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
                activeTab === 'actions'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Actions
              {pendingActions.length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingActions.length}
                </span>
              )}
              </button>
          </div>
          
          {/* Performance indicator */}
          {performanceMetrics?.totalTime && (
            <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              Loaded in {performanceMetrics.totalTime}ms
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filter toggle - only show for coaches */}
          {(session?.user as any)?.role === 'COACH' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiFilter className="w-4 h-4" />
            </button>
          )}

          {/* Refresh button */}
        <button
          onClick={handleRefresh}
            disabled={isRefreshing || loadingType !== null}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
        </div>
      </div>

      {/* Filters - only show for coaches */}
      <AnimatePresence>
        {showFilters && (session?.user as any)?.role === 'COACH' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="MENTAL">Mental</option>
                  <option value="NUTRITIONAL">Nutritional</option>
                  <option value="TACTICAL">Tactical</option>
                </select>
        </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="all">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'feedback' ? (
                    <>
                      <option value="pending">Pending</option>
                      <option value="acknowledged">Acknowledged</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="acknowledged">Acknowledged</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value={5}>5 items</option>
                  <option value={10}>10 items</option>
                  <option value={20}>20 items</option>
                  <option value={50}>50 items</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && !error.includes('session') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        <button
            onClick={handleRefresh}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
        </button>
      </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feedback' ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* PERFORMANCE: Skeleton loader for better UX during initial load */}
            {isLoading && feedback.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Loading indicator for subsequent loads */}
                {loadingType === 'feedback' && (
                  <div className="text-center py-6 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-blue-700 text-sm">Loading feedback...</p>
                  </div>
                )}
              </>
            )}

            {feedback.length === 0 && !isLoading && !loadingType ? (
              <div className="text-center py-8 text-gray-500">
                <p>{(session?.user as any)?.role === 'COACH' ? 'No feedback found for the selected filters.' : 'No feedback found.'}</p>
              </div>
            ) : (
              feedback.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'HIGH' 
                              ? 'bg-red-100 text-red-700'
                              : item.priority === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                        {item.priority}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {item.category}
                          </span>
                    </div>
                  </div>

                      <p className="text-gray-600 text-sm">{item.content}</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                        <span>From: {item.coach.name} ({item.coach.academy})</span>
                        {item.team && <span>Team: {item.team.name}</span>}
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {!item.isAcknowledged && (
                      <motion.button
                        onClick={() => handleAcknowledgeFeedback(item.id)}
                        disabled={processingIds.has(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm w-full sm:w-auto justify-center"
                      >
                        {processingIds.has(item.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" />
                            <span>Acknowledge</span>
                          </>
                        )}
                      </motion.button>
                    )}

                    {item.isAcknowledged && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FiCheck className="w-4 h-4" />
                        <span>Acknowledged</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* PERFORMANCE: Skeleton loader for better UX during initial load */}
            {isLoading && actions.length === 0 ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Loading indicator for subsequent loads */}
                {loadingType === 'actions' && (
                  <div className="text-center py-6 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-orange-700 text-sm">Loading actions...</p>
                  </div>
                )}
              </>
            )}
            
            {actions.length === 0 && !isLoading && !loadingType ? (
              <div className="text-center py-8 text-gray-500">
                <p>{(session?.user as any)?.role === 'COACH' ? 'No actions found for the selected filters.' : 'No actions found.'}</p>
              </div>
            ) : (
              actions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{item.title}</h3>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.priority === 'HIGH' 
                                ? 'bg-red-100 text-red-700'
                                : item.priority === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                        {item.priority}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {item.category}
                            </span>
                            {item.isCompleted && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Completed
                              </span>
                            )}
                      </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        
                        <div className="flex flex-col sm:flex-row gap-2 text-xs text-gray-500">
                          <span>From: {item.coach.name} ({item.coach.academy})</span>
                          {item.team && <span>Team: {item.team.name}</span>}
                          {item.dueDate && (
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          )}
                          <span>
                            Created: {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                    </div>
                    </div>
                  </div>

                    {/* Media preview - PERFORMANCE: Check for media metadata availability */}
                    {(item.demoMediaType || item.proofMediaType) && (
                      <div className="flex gap-2">
                        {item.demoMediaType && item.demoFileName && (
                          <button
                            onClick={() => openInlineViewer(item.id, 'demo')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                          >
                            <FiPlay className="w-3 h-3" />
                            <span>{isInlineViewerOpen(item.id, 'demo') ? 'Hide Demo' : 'View Demo'}</span>
                            {item.demoFileSize && (
                              <span className="text-xs opacity-75">
                                ({Math.round(item.demoFileSize / 1024)}KB)
                              </span>
                            )}
                          </button>
                        )}
                        
                        {item.proofMediaType && item.proofFileName && (
                          <button
                            onClick={() => openInlineViewer(item.id, 'proof')}
                            className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                          >
                            <FiEye className="w-3 h-3" />
                            <span>{isInlineViewerOpen(item.id, 'proof') ? 'Hide Proof' : 'View Proof'}</span>
                            {item.proofFileSize && (
                              <span className="text-xs opacity-75">
                                ({Math.round(item.proofFileSize / 1024)}KB)
                              </span>
                            )}
                          </button>
                        )}
                        </div>
                      )}

                    {/* Action buttons - PERFORMANCE: Check for media metadata not URLs */}
                    {!item.isCompleted && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {!item.proofMediaType && (
                          <button
                            onClick={() => handleUploadProof(item.id)}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
                          >
                            <FiUpload className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Upload Proof</span>
                          </button>
                        )}
                        <motion.button
                          onClick={() => handleCompleteAction(item.id)}
                          disabled={processingIds.has(item.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                        >
                          {processingIds.has(item.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Complete</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {item.isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FiCheck className="w-4 h-4" />
                        <span>Completed {item.completedAt && `on ${new Date(item.completedAt).toLocaleDateString()}`}</span>
                      </div>
                    )}
                  </div>

                  {/* Inline Media Viewers - Performance Optimized */}
                  {item.demoMediaType && item.demoFileName && (
                    <InlineMediaViewer
                      actionId={item.id}
                      mediaType="demo"
                      fileName={item.demoFileName}
                      fileSize={item.demoFileSize}
                      mediaFileType={item.demoMediaType}
                      isOpen={isInlineViewerOpen(item.id, 'demo')}
                      onClose={() => closeInlineViewer(item.id, 'demo')}
                      className="mt-4"
                    />
                  )}

                  {item.proofMediaType && item.proofFileName && (
                    <InlineMediaViewer
                      actionId={item.id}
                      mediaType="proof"
                      fileName={item.proofFileName}
                      fileSize={item.proofFileSize}
                      mediaFileType={item.proofMediaType}
                      isOpen={isInlineViewerOpen(item.id, 'proof')}
                      onClose={() => closeInlineViewer(item.id, 'proof')}
                      className="mt-4"
                    />
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination - only show for coaches */}
      {trackPagination && trackPagination.totalPages > 1 && (session?.user as any)?.role === 'COACH' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, trackPagination.total)} of {trackPagination.total} items
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!trackPagination.hasPrevPage || loadingType !== null}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-2 text-sm">
              Page {currentPage} of {trackPagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!trackPagination.hasNextPage || loadingType !== null}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && uploadingActionId && (
        <ActionProofUpload
          actionId={uploadingActionId}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
          isOpen={showUploadModal}
        />
      )}

      {/* Optimized Media Modal */}
      {showVideoModal && currentMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentMedia.fileName}</h3>
                <p className="text-sm text-gray-600">
                  {currentMedia.type.startsWith('video/') ? 'Video' : 'Image'} • Click to interact
                </p>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-inner p-4">
                {currentMedia.type.startsWith('video/') ? (
                  <video 
                    controls 
                    className="w-full h-auto max-h-[60vh] rounded-lg shadow-lg"
                    src={currentMedia.url}
                    preload="metadata"
                    poster=""
                  >
                    <source src={currentMedia.url} type={currentMedia.type} />
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <img 
                    src={currentMedia.url} 
                    alt={currentMedia.fileName}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-lg"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="mt-4 flex justify-center">
                <a
                  href={currentMedia.url}
                  download={currentMedia.fileName}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackActions;
