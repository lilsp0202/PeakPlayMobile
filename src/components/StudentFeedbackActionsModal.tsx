"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUser, 
  FiMessageSquare, 
  FiCheckSquare, 
  FiClock, 
  FiCheck,
  FiEye,
  FiCalendar,
  FiTag,
  FiAlertCircle,
  FiLoader
} from 'react-icons/fi';

interface StudentFeedbackActionsModalProps {
  student: any;
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackItem {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  createdAt: string;
  isAcknowledged: boolean;
  coachName: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
  coachName: string;
}

export default function StudentFeedbackActionsModal({ 
  student, 
  isOpen, 
  onClose 
}: StudentFeedbackActionsModalProps) {
  const [activeView, setActiveView] = useState<'feedback' | 'actions'>('feedback');
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData();
    }
  }, [isOpen, student]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Fetch feedback
      const feedbackResponse = await fetch(`/api/feedback?studentId=${student.id}`, {
        credentials: 'include',
      });
      
      // Fetch actions
      const actionsResponse = await fetch(`/api/actions?studentId=${student.id}`, {
        credentials: 'include',
      });

      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(Array.isArray(feedbackData) ? feedbackData : (feedbackData.data || []));
      }

      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        setActions(Array.isArray(actionsData) ? actionsData : (actionsData?.actions || []));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (feedbackId: string) => {
    setProcessingItems(prev => new Set(prev).add(feedbackId));
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedbackId, 
          isAcknowledged: true 
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setFeedback(prev => prev.map(item => 
          item.id === feedbackId ? { ...item, isAcknowledged: true } : item
        ));
      }
    } catch (error) {
      console.error('Error acknowledging feedback:', error);
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });
    }
  };

  const handleComplete = async (actionId: string) => {
    setProcessingItems(prev => new Set(prev).add(actionId));
    
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actionId, 
          isCompleted: true 
        }),
        credentials: 'include',
      });

      if (response.ok) {
        setActions(prev => prev.map(item => 
          item.id === actionId ? { ...item, isCompleted: true } : item
        ));
      }
    } catch (error) {
      console.error('Error completing action:', error);
    } finally {
      setProcessingItems(prev => {
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
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MENTAL':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NUTRITIONAL':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'TACTICAL':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const FeedbackCard: React.FC<{ item: FeedbackItem }> = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all duration-200 ${
        item.isAcknowledged ? 'bg-gray-50 border-gray-200' : 'border-green-200 bg-green-50/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{item.content}</p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
              {item.priority}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <FiUser className="w-3 h-3 mr-1" />
              {item.coachName}
            </span>
            <span className="flex items-center">
              <FiClock className="w-3 h-3 mr-1" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {!item.isAcknowledged && (
          <motion.button
            onClick={() => handleAcknowledge(item.id)}
            disabled={processingItems.has(item.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-3 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {processingItems.has(item.id) ? (
              <FiLoader className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <FiCheck className="w-3 h-3 mr-1" />
                Acknowledge
              </>
            )}
          </motion.button>
        )}
        
        {item.isAcknowledged && (
          <div className="ml-3 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg flex items-center">
            <FiCheck className="w-3 h-3 mr-1" />
            Acknowledged
          </div>
        )}
      </div>
    </motion.div>
  );

  const ActionCard: React.FC<{ item: ActionItem }> = ({ item }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all duration-200 ${
        item.isCompleted ? 'bg-gray-50 border-gray-200' : 'border-orange-200 bg-orange-50/30'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(item.category)}`}>
              {item.category}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
              {item.priority}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <FiUser className="w-3 h-3 mr-1" />
              {item.coachName}
            </span>
            <span className="flex items-center">
              <FiCalendar className="w-3 h-3 mr-1" />
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {!item.isCompleted && (
          <motion.button
            onClick={() => handleComplete(item.id)}
            disabled={processingItems.has(item.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-3 px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {processingItems.has(item.id) ? (
              <FiLoader className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <FiCheck className="w-3 h-3 mr-1" />
                Complete
              </>
            )}
          </motion.button>
        )}
        
        {item.isCompleted && (
          <div className="ml-3 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg flex items-center">
            <FiCheck className="w-3 h-3 mr-1" />
            Completed
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <FiUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {student.studentName || student.name}
                  </h2>
                  <p className="text-sm text-gray-600">Feedback & Actions</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex bg-gray-50 rounded-lg p-1">
              <button
                onClick={() => setActiveView('feedback')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md transition-all font-medium text-xs min-h-[44px] ${
                  activeView === 'feedback'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiMessageSquare className="w-3.5 h-3.5" />
                <span>Feedback</span>
                {feedback.length > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[18px] text-center">
                    {feedback.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveView('actions')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md transition-all font-medium text-xs min-h-[44px] ${
                  activeView === 'actions'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiCheckSquare className="w-3.5 h-3.5" />
                <span>Actions</span>
                {actions.length > 0 && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[18px] text-center">
                    {actions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-200px)] p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeView === 'feedback' && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {feedback.length > 0 ? (
                      feedback.map((item) => (
                        <FeedbackCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No feedback available</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeView === 'actions' && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {actions.length > 0 ? (
                      actions.map((item) => (
                        <ActionCard key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FiCheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No actions assigned</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 