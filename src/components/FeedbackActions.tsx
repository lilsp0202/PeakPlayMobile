"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiCheckSquare, FiClock, FiUser, FiCalendar, FiCheck, FiX, FiUpload, FiEye } from 'react-icons/fi';
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
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'actions'>('feedback');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingActionId, setUploadingActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbackAndActions();
  }, []);

  // PERFORMANCE: Optimized parallel fetch with caching
  const fetchFeedbackAndActions = async (forceRefresh = false) => {
    // Avoid fetching too frequently (cache for 30 seconds)
    const now = Date.now();
    if (!forceRefresh && lastFetch && (now - lastFetch) < 30000) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // PERFORMANCE: Parallel requests with optimized params
      const [feedbackResponse, actionsResponse] = await Promise.all([
        fetch('/api/feedback?limit=15'),
        fetch('/api/actions?limit=15')
      ]);

      if (!feedbackResponse.ok || !actionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [feedbackData, actionsData] = await Promise.all([
        feedbackResponse.json(),
        actionsResponse.json()
      ]);

      // API returns arrays directly, not wrapped in objects
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
      setActions(Array.isArray(actionsData) ? actionsData : []);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching feedback and actions:', error);
      setError('Failed to load feedback and actions');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFeedbackAndActions(true);
    setIsRefreshing(false);
  };

  const handleAcknowledgeFeedback = async (feedbackId: string) => {
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

      if (!response.ok) {
        throw new Error('Failed to acknowledge feedback');
      }

      setFeedback(prev => prev.map(item => 
        item.id === feedbackId 
          ? { ...item, isAcknowledged: true, acknowledgedAt: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });
    }
  };

  // Handler functions
  const handleUploadProof = (actionId: string) => {
    setUploadingActionId(actionId);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (proofData: any) => {
    setShowUploadModal(false);
    setUploadingActionId(null);
    // Refresh the actions list
    fetchFeedbackAndActions();
  };

  const handleCompleteAction = async (actionId: string) => {
    // Add confirmation dialog
    const confirmed = window.confirm("Are you sure you want to mark this action as completed?");
    if (!confirmed) {
      return;
    }

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
          completedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // Refresh the actions list
        await fetchFeedbackAndActions();
      } else {
        throw new Error('Failed to complete action');
      }
    } catch (error) {
      console.error('Error completing action:', error);
      alert('Failed to complete action. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  const viewProofMedia = (mediaUrl: string) => {
    window.open(mediaUrl, '_blank');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-700 border-blue-200';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-2">Error</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchFeedbackAndActions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
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
          <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Feedback</span> ({feedback.length})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-md transition-all text-sm sm:text-base ${
            activeTab === 'actions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckSquare className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Actions</span> ({actions.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feedback' ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3 sm:space-y-4"
          >
            {feedback.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FiMessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No feedback available</p>
                <p className="text-gray-400 text-sm">Check back later for feedback from your coach</p>
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
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white"></div>
                            Acknowledging...
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                            Acknowledge
                          </>
                        )}
                      </motion.button>
                    )}

                    {item.isAcknowledged && (
                      <div className="flex items-center gap-2 text-green-600 text-xs sm:text-sm">
                        <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-3 sm:space-y-4"
          >
            {actions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FiCheckSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No actions available</p>
                <p className="text-gray-400 text-sm">Check back later for new tasks from your coach</p>
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

                  {/* Demo Media Section - Mobile optimized */}
                  {item.demoMediaUrl && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200 mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-indigo-900 mb-2 flex items-center gap-1">
                        🎯 Demo: How to perform this action
                      </h4>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-indigo-700">
                            <span className="break-all font-medium">{item.demoFileName}</span>
                            <span className="text-indigo-600">({item.demoMediaType === 'image' ? 'Image' : 'Video'})</span>
                          </div>
                        </div>
                        
                        {/* Demo Media Preview */}
                        <div className="bg-white rounded-lg p-2 border border-indigo-200">
                          {item.demoMediaType === 'image' ? (
                            <img
                              src={item.demoMediaUrl}
                              alt={item.demoFileName || 'Demo image'}
                              className="w-full max-h-32 sm:max-h-48 object-contain rounded-lg cursor-pointer"
                              onClick={() => viewProofMedia(item.demoMediaUrl!)}
                            />
                          ) : (
                            <video
                              src={item.demoMediaUrl}
                              controls
                              className="w-full max-h-32 sm:max-h-48 rounded-lg"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                        
                        <p className="text-xs text-indigo-600 bg-indigo-100 rounded-md p-2">
                          💡 Watch this demo from your coach to understand exactly how to perform this action
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Proof Media Section - Mobile optimized */}
                  {item.proofMediaUrl && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
                      <h4 className="text-xs sm:text-sm font-medium text-green-900 mb-2">Completion Proof:</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-700">
                          <span className="break-all">{item.proofFileName}</span>
                          <span className="text-green-600">({item.proofMediaType?.includes('image') ? 'Image' : 'Video'})</span>
                        </div>
                        <button
                          onClick={() => viewProofMedia(item.proofMediaUrl!)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors w-full sm:w-auto"
                        >
                          <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                          View
                        </button>
                      </div>
                      {item.proofUploadedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Uploaded: {formatDate(item.proofUploadedAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Mobile-friendly metadata and action buttons */}
                  <div className="space-y-3">
                    {/* Metadata section */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
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

                    {/* Action buttons - Stacked on mobile, inline on desktop */}
                    {!item.isCompleted && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {/* Upload Proof Button */}
                        <motion.button
                          onClick={() => handleUploadProof(item.id)}
                          disabled={!!item.proofMediaUrl}
                          whileHover={!item.proofMediaUrl ? { scale: 1.02 } : {}}
                          whileTap={!item.proofMediaUrl ? { scale: 0.98 } : {}}
                          className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto touch-manipulation ${
                            item.proofMediaUrl 
                              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <FiUpload className="w-4 h-4" />
                          {item.proofMediaUrl ? 'Proof Uploaded' : 'Upload Proof'}
                        </motion.button>
                        
                        {/* Complete Button */}
                        <motion.button
                          onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to mark this action as completed?");
                            if (confirmed) {
                              handleCompleteAction(item.id);
                            }
                          }}
                          disabled={processingIds.has(item.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto touch-manipulation"
                        >
                          {processingIds.has(item.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <FiCheck className="w-4 h-4" />
                              Complete
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}

                    {item.isCompleted && (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FiCheck className="w-4 h-4" />
                        <span>Completed</span>
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
          actionId={uploadingActionId}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => {
            setShowUploadModal(false);
            setUploadingActionId(null);
          }}
          isOpen={showUploadModal}
        />
      )}
    </div>
  );
};

export default FeedbackActions;
