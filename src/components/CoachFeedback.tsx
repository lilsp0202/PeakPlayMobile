"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiUser, FiCalendar, FiArrowRight, FiEye, FiStar, FiTrendingUp, FiTarget, FiAward, FiHeart, FiX, FiChevronRight } from "react-icons/fi";

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
}

interface CoachFeedbackProps {
  studentId?: string;
  isCoachView?: boolean;
}

export default function CoachFeedback({ studentId, isCoachView = false }: CoachFeedbackProps) {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [studentId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const url = studentId ? `/api/feedback?studentId=${studentId}` : '/api/feedback';
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else if (response.status === 404) {
        // No feedback found, that's okay
        setFeedback([]);
      } else {
        console.error("Failed to fetch feedback:", response.status);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Feedback request timeout");
      } else {
      console.error("Error fetching feedback:", error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (feedbackId: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId, isRead: true }),
      });

      if (response.ok) {
        setFeedback(prev => 
          prev.map(f => f.id === feedbackId ? { ...f, isRead: true } : f)
        );
      }
    } catch (error) {
      console.error("Error marking feedback as read:", error);
    }
  };

  const handleFeedbackClick = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setShowModal(true);
    if (!feedbackItem.isRead && !isCoachView) {
      markAsRead(feedbackItem.id);
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'TECHNICAL': 
        return { 
          color: 'bg-gradient-to-br from-blue-500 to-blue-600', 
          lightColor: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <FiTarget className="w-3 h-3 sm:w-4 sm:h-4" />,
          label: 'Technical Skills'
        };
      case 'MENTAL': 
        return { 
          color: 'bg-gradient-to-br from-purple-500 to-purple-600', 
          lightColor: 'bg-purple-50 border-purple-200 text-purple-800',
          icon: <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />,
          label: 'Mental Focus'
        };
      case 'NUTRITIONAL': 
        return { 
          color: 'bg-gradient-to-br from-green-500 to-green-600', 
          lightColor: 'bg-green-50 border-green-200 text-green-800',
          icon: <FiHeart className="w-3 h-3 sm:w-4 sm:h-4" />,
          label: 'Nutrition'
        };
      case 'TACTICAL': 
        return { 
          color: 'bg-gradient-to-br from-orange-500 to-orange-600', 
          lightColor: 'bg-orange-50 border-orange-200 text-orange-800',
          icon: <FiAward className="w-3 h-3 sm:w-4 sm:h-4" />,
          label: 'Game Strategy'
        };
      default: 
        return { 
          color: 'bg-gradient-to-br from-gray-500 to-gray-600', 
          lightColor: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: <FiMessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />,
          label: 'General'
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'HIGH': 
        return { 
          color: 'bg-red-100 text-red-800 border-red-300', 
          icon: '🔥',
          label: 'High Priority'
        };
      case 'MEDIUM': 
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
          icon: '⚡',
          label: 'Medium Priority'
        };
      case 'LOW': 
        return { 
          color: 'bg-green-100 text-green-800 border-green-300', 
          icon: '✨',
          label: 'Low Priority'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-300', 
          icon: '📝',
          label: 'Standard'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getDetailedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = feedback.filter(f => !f.isRead).length;
  const recentFeedback = feedback.slice(0, 3);

  return (
    <>
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="p-4 sm:p-6">
          {/* Enhanced Header - Mobile Optimized */}
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiMessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full min-w-[1.25rem] sm:min-w-[1.5rem] h-5 sm:h-6 flex items-center justify-center shadow-md">
                    {unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Coach Feedback</h3>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                  <FiStar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500 flex-shrink-0" />
                  <span className="truncate">Performance insights from your coach</span>
                </p>
              </div>
            </div>
            
            {feedback.length > 0 && (
              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{feedback.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            )}
          </div>

          {/* Enhanced Feedback Preview - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {feedback.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiMessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No feedback yet</h4>
                <p className="text-gray-500 text-sm px-4 max-w-sm mx-auto">
                  Your coach will share personalized performance insights and guidance here to help you improve your game.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="space-y-3">
                  {recentFeedback.map((item, index) => {
                    const categoryConfig = getCategoryConfig(item.category);
                    const priorityConfig = getPriorityConfig(item.priority);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleFeedbackClick(item)}
                        className={`group relative p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-indigo-300 active:scale-[0.98] touch-manipulation ${
                          !item.isRead && !isCoachView 
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {/* New indicator */}
                        {!item.isRead && !isCoachView && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Category Icon */}
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${categoryConfig.color}`}>
                            <span className="text-white">
                              {categoryConfig.icon}
                            </span>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Mobile-optimized badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                              <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-medium border ${categoryConfig.lightColor}`}>
                                {categoryConfig.icon}
                                <span className="ml-1 hidden sm:inline">{categoryConfig.label}</span>
                                <span className="ml-1 sm:hidden">{categoryConfig.label.split(' ')[0]}</span>
                              </span>
                              
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityConfig.color}`}>
                                <span className="mr-1">{priorityConfig.icon}</span>
                                <span className="hidden sm:inline">{priorityConfig.label}</span>
                                <span className="sm:hidden">{priorityConfig.label.split(' ')[0]}</span>
                              </span>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2">
                              {item.title}
                            </h4>
                            
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.content}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 min-w-0 flex-1">
                                <FiUser className="w-3 h-3 flex-shrink-0" />
                                <span className="font-medium truncate">{item.coach.name}</span>
                                <span className="hidden sm:inline">•</span>
                                <FiCalendar className="w-3 h-3 flex-shrink-0 hidden sm:inline" />
                                <span className="hidden sm:inline">{formatDate(item.createdAt)}</span>
                              </div>
                              
                              <div className="flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                <span className="text-xs font-medium mr-1 hidden sm:inline">View details</span>
                                <FiChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                            
                            {/* Mobile date display */}
                            <div className="sm:hidden mt-2 text-xs text-gray-500">
                              {formatDate(item.createdAt)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {feedback.length > 3 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowModal(true)}
                    className="w-full text-center py-4 sm:py-4 text-sm text-indigo-600 hover:text-indigo-900 font-medium border-t-2 border-gray-100 mt-4 sm:mt-6 hover:bg-indigo-50 transition-all duration-200 rounded-b-xl touch-manipulation"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FiEye className="w-4 h-4" />
                      <span>View All Feedback ({feedback.length})</span>
                      <FiArrowRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Modal - Mobile Optimized */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-5xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden shadow-2xl"
            >
              {/* Modal Header - Mobile Optimized */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                        {selectedFeedback ? 'Feedback Details' : 'All Coach Feedback'}
                      </h2>
                      <p className="text-indigo-100 text-xs sm:text-sm">
                        {selectedFeedback ? 'Detailed view' : `${feedback.length} total feedback items`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFeedback(null);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0 ml-2 touch-manipulation"
                  >
                    <FiX className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content - Mobile Optimized */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-180px)]">
                {selectedFeedback ? (
                  // Single feedback detailed view - Mobile Optimized
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {(() => {
                        const categoryConfig = getCategoryConfig(selectedFeedback.category);
                        const priorityConfig = getPriorityConfig(selectedFeedback.priority);
                        
                        return (
                          <>
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig.color}`}>
                              {categoryConfig.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">{selectedFeedback.title}</h3>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium border ${categoryConfig.lightColor}`}>
                                  {categoryConfig.icon}
                                  <span className="ml-1">{categoryConfig.label}</span>
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm font-medium border ${priorityConfig.color}`}>
                                  <span className="mr-1">{priorityConfig.icon}</span>
                                  {priorityConfig.label}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                          {selectedFeedback.content}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedFeedback.coach.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{selectedFeedback.coach.academy}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">{getDetailedDate(selectedFeedback.createdAt)}</span>
                            <span className="sm:hidden">{formatDate(selectedFeedback.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // All feedback grid view - Mobile Optimized
                  <div className="space-y-3 sm:space-y-4">
                    {feedback.map((item, index) => {
                      const categoryConfig = getCategoryConfig(item.category);
                      const priorityConfig = getPriorityConfig(item.priority);
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedFeedback(item)}
                          className={`group p-4 sm:p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg active:scale-[0.98] touch-manipulation ${
                            !item.isRead && !isCoachView 
                              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' 
                              : 'bg-white border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig.color}`}>
                              {categoryConfig.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                                <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs font-medium border ${categoryConfig.lightColor}`}>
                                  {categoryConfig.icon}
                                  <span className="ml-1 hidden sm:inline">{categoryConfig.label}</span>
                                  <span className="ml-1 sm:hidden">{categoryConfig.label.split(' ')[0]}</span>
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityConfig.color}`}>
                                  <span className="mr-1">{priorityConfig.icon}</span>
                                  <span className="hidden sm:inline">{priorityConfig.label}</span>
                                  <span className="sm:hidden">{priorityConfig.label.split(' ')[0]}</span>
                                </span>
                                {!item.isRead && !isCoachView && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-600 border border-red-200">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                    NEW
                                  </span>
                                )}
                              </div>
                              
                              <h4 className="font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors text-sm sm:text-base line-clamp-2">
                                {item.title}
                              </h4>
                              
                              <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 text-xs sm:text-sm">
                                {item.content}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500 min-w-0 flex-1">
                                  <FiUser className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="font-medium truncate">{item.coach.name}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline truncate">{item.coach.academy}</span>
                                </div>
                                <div className="flex items-center text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
                                  <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span>{formatDate(item.createdAt)}</span>
                                </div>
                              </div>
                              
                              {/* Mobile academy display */}
                              <div className="sm:hidden mt-2 text-xs text-gray-500 truncate">
                                {item.coach.academy}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 