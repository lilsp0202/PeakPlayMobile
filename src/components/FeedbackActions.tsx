"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiCheckSquare, FiClock, FiUser, FiCalendar, FiCheck, FiX, FiUpload, FiEye, FiRefreshCw, FiAlertCircle, FiLogIn, FiImage, FiVideo } from 'react-icons/fi';
import ActionProofUpload from './ActionProofUpload';

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
  // Student proof upload fields
  proofMediaUrl?: string;
  proofMediaType?: string;
  proofFileName?: string;
  proofUploadedAt?: string;
  // Coach demo media fields
  demoMediaUrl?: string;
  demoMediaType?: string;
  demoFileName?: string;
  demoUploadedAt?: string;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
  team?: {
    name: string;
  };
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
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingActionId, setUploadingActionId] = useState<string | null>(null);

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
        // Retry the original request after successful refresh
        setTimeout(() => fetchFeedbackAndActions(true), 1000);
        return;
      }
    }
    
    // If refresh failed or max retries reached, show sign-in prompt
    setError('Your session has expired. Please sign in again to continue.');
    setIsLoading(false);
  }, [authRetryCount, refreshSession]);

  // Wait for session to be ready before attempting to fetch
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      console.log('✅ Session authenticated, fetching feedback and actions...');
      fetchFeedbackAndActions();
    } else if (status === 'unauthenticated') {
      console.log('❌ User not authenticated');
      setError('Please sign in to view feedback and actions');
      setIsLoading(false);
    } else if (status === 'loading') {
      console.log('⏳ Session loading...');
      setIsLoading(true);
    }
  }, [status, session]);

  // PERFORMANCE: Enhanced fetch with request deduplication to prevent database connection exhaustion
  const fetchFeedbackAndActions = useCallback(async (forceRefresh = false) => {
    if (status !== 'authenticated' || !session) {
      if (status === 'unauthenticated') {
        setError('Authentication required - please sign in');
      }
      setIsLoading(false);
      fetchInProgress.current = false;
      return;
    }

    // Avoid fetching too frequently (cache for 20 seconds on normal load, allow force refresh)
    const now = Date.now();
    if (!forceRefresh && lastFetch && (now - lastFetch) < 20000) { // PERFORMANCE: Reduced from 30 seconds to 20 seconds
      fetchInProgress.current = false;
      return;
    }

    // CRITICAL: Prevent multiple simultaneous requests to avoid database connection pool exhaustion
    if (fetchInProgress.current && !forceRefresh) {
      console.log('🔒 Request already in progress, skipping duplicate request');
      return;
    }

    fetchInProgress.current = true;

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 Fetching feedback and actions...');

      // SEQUENTIAL REQUESTS: Fetch feedback first, then actions to prevent connection pool exhaustion
      // Create separate controllers for each request with longer timeouts
      console.log('📝 Fetching feedback...');
      const feedbackResponse = await fetch('/api/feedback?limit=5', { // PERFORMANCE: Reduced from 10 to 5
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      // Check for authentication errors early
      if (feedbackResponse.status === 401) {
        console.log('🔐 Authentication error detected in feedback - handling...');
        fetchInProgress.current = false;
        await handleAuthError();
        return;
      }

      if (!feedbackResponse.ok) {
        throw new Error(`Feedback API error: ${feedbackResponse.status}`);
      }

      const feedbackData = await feedbackResponse.json();
      console.log(`✅ Feedback fetched: ${feedbackData.length || 0} items`);
      
      // Update feedback immediately for faster perceived performance
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);

      // PERFORMANCE: Increase delay between requests to prevent database overload
      await new Promise(resolve => setTimeout(resolve, 200)); // Increased from 100ms to 200ms

      console.log('⚡ Fetching actions...');
      const actionsResponse = await fetch('/api/actions?limit=5', { // PERFORMANCE: Reduced from 10 to 5
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (actionsResponse.status === 401) {
        console.log('🔐 Authentication error detected in actions - handling...');
        fetchInProgress.current = false;
        await handleAuthError();
        return;
      }

      if (!actionsResponse.ok) {
        console.error(`Actions API error: ${actionsResponse.status} ${actionsResponse.statusText}`);
        throw new Error(`Actions API error: ${actionsResponse.status}`);
      }

      const actionsData = await actionsResponse.json();
      console.log(`✅ Actions fetched: ${actionsData.length || 0} items`);

      // Reset retry count on success
      setRetryCount(0);
      setAuthRetryCount(0);
      
      // Update actions
      setActions(Array.isArray(actionsData) ? actionsData : []);
      setLastFetch(now);

      console.log('🎉 All data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching feedback and actions:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. The server is taking longer than expected. Please try again.');
        } else if (error.message.includes('Session expired') || error.message.includes('401')) {
          fetchInProgress.current = false;
          await handleAuthError();
          return;
        } else {
          setError(`Failed to load data: ${error.message}`);
        }
      } else {
        setError('Failed to load feedback and actions');
      }
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [lastFetch, status, session, handleAuthError]);

  // Manual refresh with exponential backoff
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Reset auth retry count on manual refresh
    setAuthRetryCount(0);
    
    // Exponential backoff delay based on retry count
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    if (delay > 1000) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    await fetchFeedbackAndActions(true);
    setIsRefreshing(false);
  }, [fetchFeedbackAndActions, retryCount]);

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
    fetchFeedbackAndActions(true);
  }, [fetchFeedbackAndActions]);

  // PERFORMANCE: Optimized complete action with optimistic updates
  const handleCompleteAction = useCallback(async (actionId: string) => {
    if (status !== 'authenticated' || !session) {
      setError('Please sign in to complete actions');
      return;
    }

    // Add confirmation dialog
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

  const viewMedia = (mediaUrl: string, fileName?: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow && mediaUrl) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${fileName || 'Media Viewer'}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { margin: 0; padding: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .viewer-container { display: flex; flex-direction: column; min-height: 100vh; }
              .viewer-header { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              .viewer-title { margin: 0; color: #374151; font-size: 18px; font-weight: 600; }
              .viewer-controls { display: flex; gap: 8px; }
              .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
              .btn-close { background: #ef4444; color: white; }
              .btn-close:hover { background: #dc2626; }
              .btn-download { background: #3b82f6; color: white; }
              .btn-download:hover { background: #2563eb; }
              .viewer-content { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; }
              .media-container { text-align: center; max-width: 95vw; max-height: 85vh; }
              .media-item { max-width: 100%; max-height: 85vh; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .viewer-footer { background: #fff; border-top: 1px solid #e5e7eb; padding: 12px 20px; text-align: center; color: #6b7280; font-size: 12px; }
              @media (max-width: 768px) { 
                .viewer-header { padding: 10px 15px; }
                .viewer-title { font-size: 16px; }
                .btn { padding: 6px 12px; font-size: 12px; }
                .viewer-content { padding: 15px; }
              }
            </style>
          </head>
          <body>
            <div class="viewer-container">
              <div class="viewer-header">
                <h1 class="viewer-title">${fileName || 'Media Viewer'}</h1>
                <div class="viewer-controls">
                  <button class="btn btn-download" onclick="downloadMedia()">Download</button>
                  <button class="btn btn-close" onclick="window.close()">Close</button>
                </div>
              </div>
              <div class="viewer-content">
                <div class="media-container">
                  ${mediaUrl.includes('image') || mediaUrl.startsWith('data:image') 
                    ? `<img src="${mediaUrl}" class="media-item" alt="${fileName || 'Media'}" onclick="toggleFullscreen(this)" style="cursor: zoom-in;" />` 
                    : `<video src="${mediaUrl}" controls class="media-item" preload="metadata">Your browser does not support video playback.</video>`
                  }
                </div>
              </div>
              <div class="viewer-footer">
                Click image to zoom • Press ESC to close • PeakPlay Media Viewer
              </div>
            </div>
            <script>
              function downloadMedia() {
                const link = document.createElement('a');
                link.href = '${mediaUrl}';
                link.download = '${fileName || 'media-file'}';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              
              function toggleFullscreen(img) {
                if (!document.fullscreenElement) {
                  img.requestFullscreen().catch(err => {
                    console.log('Fullscreen not supported');
                  });
                  img.style.cursor = 'zoom-out';
                } else {
                  document.exitFullscreen();
                  img.style.cursor = 'zoom-in';
                }
              }
              
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    window.close();
                  }
                }
              });
              
              document.addEventListener('fullscreenchange', function() {
                const img = document.querySelector('img');
                if (img) {
                  img.style.cursor = document.fullscreenElement ? 'zoom-out' : 'zoom-in';
                }
              });
            </script>
          </body>
        </html>
      `);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'training':
        return 'bg-blue-100 text-blue-700';
      case 'preparation':
        return 'bg-purple-100 text-purple-700';
      case 'recovery':
        return 'bg-green-100 text-green-700';
      case 'nutrition':
        return 'bg-orange-100 text-orange-700';
      case 'mental':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // PERFORMANCE: Show loading only on initial load or when no cached data
  if (status === 'loading') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading session...</span>
        </div>
      </div>
    );
  }

  if (isLoading && !feedback.length && !actions.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Feedback & Actions</h3>
          <div className="flex space-x-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
          Loading your feedback and actions...
          <br />
          <span className="text-xs text-gray-400">
            Initial load may take a few moments while we optimize your data
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('session') || error.includes('Authentication') || error.includes('sign in');
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <FiAlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <div className="text-red-600 text-lg mb-2">Unable to Load</div>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthError ? (
              <>
                <button
                  onClick={handleSignIn}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FiLogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Sign Out & Refresh
              </button>
              </>
            ) : (
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  isRefreshing 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Retrying...' : 'Try Again'}
            </button>
          )}
        <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
              Refresh Page
        </button>
        </div>
          {retryCount > 0 && !isAuthError && (
            <p className="text-sm text-gray-500 mt-4">
              Retry attempt: {retryCount}/5
            </p>
          )}
          {isAuthError && authRetryCount > 0 && (
            <p className="text-sm text-gray-500 mt-4">
              Session refresh attempts: {authRetryCount}/2
            </p>
          )}
      </div>
        </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Feedback & Actions</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
            isRefreshing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
              </div>
              
      {/* Performance indicator */}
      {lastFetch > 0 && (
        <div className="text-xs text-gray-500 text-right">
          Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </div>
      )}

      {/* Tab Navigation - Mobile optimized */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md transition-all text-sm sm:text-base ${
            activeTab === 'feedback'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Feedback</span>
          {unreadFeedback.length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {unreadFeedback.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md transition-all text-sm sm:text-base ${
            activeTab === 'actions'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Actions</span>
          {pendingActions.length > 0 && (
            <span className="bg-orange-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {pendingActions.length}
            </span>
          )}
        </button>
      </div>

      {/* Content Area */}
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
            {feedback.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FiMessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No feedback available</p>
                <p className="text-gray-400 text-sm">Check back later for feedback from your coach</p>
                {status === 'authenticated' && session && (
                  <button
                    onClick={() => fetchFeedbackAndActions(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Refresh Feedback
                  </button>
                )}
              </div>
            ) : (
              feedback.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border-2 border-blue-200 p-3 sm:p-4 shadow-sm"
                >
                  {/* Mobile-friendly header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{item.coach.name}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base leading-relaxed">{item.content}</p>

                  {/* Mobile-friendly metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.team && (
                        <div className="flex items-center gap-1">
                          <span>Team: {item.team.name}</span>
                        </div>
                      )}
                    </div>

                    {!item.isAcknowledged && (
                      <motion.button
                        onClick={() => handleAcknowledgeFeedback(item.id)}
                        disabled={processingIds.has(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        {processingIds.has(item.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Acknowledge</span>
                          </>
                        )}
                      </motion.button>
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
            {/* Show loading indicator if actions are still loading */}
            {isLoading && actions.length === 0 && (
                  <div className="text-center py-6 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-orange-700 text-sm">Loading actions...</p>
                <p className="text-orange-600 text-xs mt-1">This may take a moment due to database optimization</p>
                  </div>
            )}
            
            {!isLoading && actions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FiCheckSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No actions available</p>
                <p className="text-gray-400 text-sm">Check back later for new tasks from your coach</p>
                {status === 'authenticated' && session && (
                  <button
                    onClick={() => fetchFeedbackAndActions(true)}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Refresh Actions
                  </button>
                )}
              </div>
            ) : (
              actions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border-2 p-3 sm:p-4 transition-all ${
                    item.isCompleted 
                      ? 'border-green-200 bg-green-50/50' 
                      : item.dueDate && isOverdue(item.dueDate)
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-orange-200 shadow-sm'
                  }`}
                >
                  {/* Mobile-friendly header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </div>
                      {item.dueDate && isOverdue(item.dueDate) && !item.isCompleted && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          OVERDUE
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{item.coach.name}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-700 mb-3 text-sm sm:text-base leading-relaxed">{item.description}</p>

                  {/* Demo media display */}
                  {item.demoMediaUrl && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        {item.demoMediaType?.startsWith('image') ? <FiImage className="w-5 h-5 text-blue-600" /> : <FiVideo className="w-5 h-5 text-blue-600" />}
                        <h4 className="text-sm font-semibold text-blue-900">Coach Demo Media</h4>
                      </div>
                      
                      {item.demoMediaType?.startsWith('image') ? (
                        <div className="relative">
                          <img 
                            src={item.demoMediaUrl} 
                            alt="Coach demo"
                            className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                            onClick={() => viewMedia(item.demoMediaUrl, item.demoFileName)}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Click to enlarge
                          </div>
                        </div>
                      ) : item.demoMediaType?.startsWith('video') ? (
                        <video 
                          src={item.demoMediaUrl}
                          controls
                          className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-md"
                          preload="metadata"
                          style={{ maxHeight: '200px' }}
                        >
                          Your browser does not support video.
                        </video>
                      ) : (
                        <button
                          onClick={() => viewMedia(item.demoMediaUrl, item.demoFileName)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <FiEye className="w-4 h-4" />
                          View demo ({item.demoFileName})
                        </button>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-blue-700">
                          <strong>File:</strong> {item.demoFileName}
                        </p>
                        <p className="text-xs text-blue-700">
                          <strong>Uploaded:</strong> {item.demoUploadedAt ? formatDate(item.demoUploadedAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Proof media display */}
                  {item.proofMediaUrl && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-3">
                        <FiUpload className="w-5 h-5 text-green-600" />
                        <h4 className="text-sm font-semibold text-green-900">Student Proof Submission</h4>
                        {item.isCompleted && <FiCheck className="w-4 h-4 text-green-600" />}
                      </div>
                      
                      {item.proofMediaType?.startsWith('image') ? (
                        <div className="relative">
                          <img 
                            src={item.proofMediaUrl} 
                            alt="Student proof"
                            className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                            onClick={() => viewMedia(item.proofMediaUrl, item.proofFileName)}
                          />
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            Click to enlarge
                          </div>
                        </div>
                      ) : item.proofMediaType?.startsWith('video') ? (
                        <video 
                          src={item.proofMediaUrl}
                          controls
                          className="w-full max-w-xs sm:max-w-sm rounded-lg shadow-md"
                          preload="metadata"
                          style={{ maxHeight: '200px' }}
                        >
                          Your browser does not support video.
                        </video>
                      ) : (
                        <button
                          onClick={() => viewMedia(item.proofMediaUrl, item.proofFileName)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <FiEye className="w-4 h-4" />
                          View proof ({item.proofFileName})
                        </button>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-green-700">
                          <strong>File:</strong> {item.proofFileName}
                        </p>
                        <p className="text-xs text-green-700">
                          <strong>Submitted:</strong> {item.proofUploadedAt ? formatDate(item.proofUploadedAt) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Mobile-friendly metadata and actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.dueDate && (
                        <div className={`flex items-center gap-1 ${isOverdue(item.dueDate) && !item.isCompleted ? 'text-red-600 font-medium' : ''}`}>
                          <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Due: {formatDate(item.dueDate)}</span>
                        </div>
                      )}
                      {item.team && (
                        <div className="flex items-center gap-1">
                          <span>Team: {item.team.name}</span>
                        </div>
                      )}
                    </div>

                    {!item.isCompleted && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {!item.proofMediaUrl && (
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
                      <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm">
                        <FiCheck className="w-4 h-4" />
                        <span>Completed {item.completedAt ? formatDate(item.completedAt) : ''}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      {showUploadModal && uploadingActionId && (
        <ActionProofUpload
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadingActionId(null);
          }}
          actionId={uploadingActionId}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default FeedbackActions;
