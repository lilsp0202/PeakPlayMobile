"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

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

  useEffect(() => {
    fetchFeedback();
  }, [studentId]);

  const fetchFeedback = async () => {
    try {
      const url = studentId ? `/api/feedback?studentId=${studentId}` : '/api/feedback';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MENTAL': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'NUTRITIONAL': return 'bg-green-100 text-green-800 border-green-200';
      case 'TACTICAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = feedback.filter(f => !f.isRead).length;
  const recentFeedback = feedback.slice(0, 3); // Show only 3 most recent in preview

  return (
    <>
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Coach Feedback</h3>
                <p className="text-sm text-gray-600">Performance insights from your coach</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </div>
            )}
          </div>

          {/* Feedback Preview */}
          <div className="space-y-3">
            {feedback.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No feedback yet</p>
                <p className="text-gray-400 text-xs">Your coach will share performance insights here</p>
              </div>
            ) : (
              <>
                {/* Clean Preview List - Only Skill and Priority */}
                <div className="space-y-3">
                  {recentFeedback.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleFeedbackClick(item)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 ${
                        !item.isRead && !isCoachView ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {/* Numbered bullet point */}
                          <div className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-semibold">{index + 1}</span>
                          </div>
                          
                          {/* Skill Category Badge */}
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium border ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          
                          {/* Priority Badge */}
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          
                          {/* New Badge */}
                          {!item.isRead && !isCoachView && (
                            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-red-100 text-red-600 border border-red-200">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {feedback.length > 3 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full text-center py-3 text-sm text-indigo-600 hover:text-indigo-900 font-medium border-t border-gray-200 mt-4 hover:bg-gray-50 transition-colors"
                  >
                    View All Feedback ({feedback.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal for expanded view */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[80vh] w-full overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFeedback ? 'Feedback Details' : 'All Coach Feedback'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFeedback(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {selectedFeedback ? (
                // Single feedback detail view
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedFeedback.title}</h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`text-sm px-3 py-1 rounded-full border ${getCategoryColor(selectedFeedback.category)}`}>
                          {selectedFeedback.category}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full border ${getPriorityColor(selectedFeedback.priority)}`}>
                          {selectedFeedback.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">{selectedFeedback.content}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <p>From: <span className="font-medium">{selectedFeedback.coach.name}</span> • {selectedFeedback.coach.academy}</p>
                      <p>{formatDate(selectedFeedback.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // All feedback list view
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedFeedback(item)}
                      className={`p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        !item.isRead && !isCoachView ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <span className={`text-sm px-3 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            <span className={`text-sm px-3 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            {!item.isRead && !isCoachView && (
                              <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full border border-red-200">
                                NEW
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                          <p className="text-gray-600 mb-3 line-clamp-3">{item.content}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              {item.coach.name} • {item.coach.academy}
                            </p>
                            <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 