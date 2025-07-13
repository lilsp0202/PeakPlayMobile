"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiCheckSquare, FiClock, FiUser, FiCalendar, FiCheck, FiX } from 'react-icons/fi';

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

  useEffect(() => {
    fetchFeedbackAndActions();
  }, []);

  const fetchFeedbackAndActions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [feedbackResponse, actionsResponse] = await Promise.all([
        fetch('/api/feedback'),
        fetch('/api/actions')
      ]);

      if (!feedbackResponse.ok || !actionsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const feedbackData = await feedbackResponse.json();
      const actionsData = await actionsResponse.json();

      // API returns arrays directly, not wrapped in objects
      setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
      setActions(Array.isArray(actionsData) ? actionsData : []);
    } catch (error) {
      console.error('Error fetching feedback and actions:', error);
      setError('Failed to load feedback and actions');
    } finally {
      setIsLoading(false);
    }
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

  const handleCompleteAction = async (actionId: string) => {
    setProcessingIds(prev => new Set(prev).add(actionId));
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          actionId, 
          isCompleted: true 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete action');
      }

      setActions(prev => prev.map(item => 
        item.id === actionId 
          ? { ...item, isCompleted: true, completedAt: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      console.error('Error completing action:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <FiX className="w-12 h-12 mx-auto mb-2" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
        <button
          onClick={fetchFeedbackAndActions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'feedback'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiMessageSquare className="w-4 h-4" />
          Feedback ({feedback.length})
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'actions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckSquare className="w-4 h-4" />
          Actions ({actions.length})
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
            className="space-y-4"
          >
            {feedback.length === 0 ? (
              <div className="text-center py-12">
                <FiMessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No feedback available</p>
                <p className="text-gray-400 text-sm">Check back later for updates from your coach</p>
              </div>
            ) : (
              feedback.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border-2 p-4 transition-all ${
                    item.isAcknowledged 
                      ? 'border-gray-200 opacity-75' 
                      : 'border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiUser className="w-4 h-4" />
                      <span>{item.coach.name}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-3">{item.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
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
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {processingIds.has(item.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            Acknowledging...
                          </>
                        ) : (
                          <>
                            <FiCheck className="w-4 h-4" />
                            Acknowledge
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {actions.length === 0 ? (
              <div className="text-center py-12">
                <FiCheckSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No actions available</p>
                <p className="text-gray-400 text-sm">Check back later for new tasks from your coach</p>
              </div>
            ) : (
              actions.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg border-2 p-4 transition-all ${
                    item.isCompleted 
                      ? 'border-green-200 bg-green-50/50' 
                      : item.dueDate && isOverdue(item.dueDate)
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-orange-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiUser className="w-4 h-4" />
                      <span>{item.coach.name}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-3">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
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
                      <motion.button
                        onClick={() => handleCompleteAction(item.id)}
                        disabled={processingIds.has(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
    </div>
  );
};

export default FeedbackActions;
