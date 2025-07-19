"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUsers, 
  FiMessageSquare, 
  FiCheckSquare, 
  FiUser, 
  FiClock, 
  FiCheck
} from 'react-icons/fi';

interface TeamModalProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
  teamFeedback: any[];
  teamActions: any[];
  onAcknowledge: (itemId: string, type: 'feedback' | 'actions') => void;
  onComplete: (actionId: string) => void;
}

export default function TeamModal({ 
  team, 
  isOpen, 
  onClose, 
  teamFeedback, 
  teamActions, 
  onAcknowledge, 
  onComplete 
}: TeamModalProps) {
  const [activeView, setActiveView] = useState<'feedback' | 'actions'>('feedback');
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [statsUpdated, setStatsUpdated] = useState(false);

  if (!team) return null;

  const handleAcknowledgeWithAnimation = async (itemId: string, type: 'feedback' | 'actions') => {
    setProcessingItems(prev => new Set(prev).add(itemId));
    
    try {
      await onAcknowledge(itemId, type);
      
      // Add success animation
      setCompletedItems(prev => new Set(prev).add(itemId));
      
      // Trigger stats update animation
      setStatsUpdated(true);
      setTimeout(() => setStatsUpdated(false), 1000);
      
      // Remove from processing and completed after animation
      setTimeout(() => {
        setProcessingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCompleteWithAnimation = async (actionId: string) => {
    setProcessingItems(prev => new Set(prev).add(actionId));
    
    try {
      await onComplete(actionId);
      
      // Add success animation
      setCompletedItems(prev => new Set(prev).add(actionId));
      
      // Trigger stats update animation
      setStatsUpdated(true);
      setTimeout(() => setStatsUpdated(false), 1000);
      
      // Remove from processing and completed after animation
      setTimeout(() => {
        setProcessingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Error completing action:', error);
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }
  };

  // Confetti component
  const ConfettiEffect = ({ itemId }: { itemId: string }) => {
    const confettiColors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: Math.random() * 50 - 25,
              y: Math.random() * 50 - 25,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              rotate: Math.random() * 360
            }}
            transition={{ 
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: confettiColors[i % confettiColors.length],
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    );
  };

  const stats = {
    totalFeedback: teamFeedback.length,
    acknowledgedFeedback: teamFeedback.filter(item => item.isAcknowledged).length,
    totalActions: teamActions.length,
    completedActions: teamActions.filter(item => item.isCompleted).length,
    pendingItems: [
      ...teamFeedback.filter(item => !item.isAcknowledged),
      ...teamActions.filter(item => !item.isCompleted)
    ].length
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-2 top-4 bottom-4 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header - Mobile Optimized */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <FiUsers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{team.name}</h2>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <FiUser className="w-3 h-3 text-white/80" />
                      <span className="text-white/90 text-xs">
                        {team.coach?.name} • {(team as any)._count?.members || 0} members
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm min-h-[44px] min-w-[44px]"
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Stats Grid - Mobile Compact */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <motion.div 
                  animate={statsUpdated ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="bg-white/20 rounded-lg p-2.5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <FiMessageSquare className="w-3 h-3 text-white/90" />
                      <span className="text-white/90 font-medium text-xs">Feedback</span>
                    </div>
                    <motion.span 
                      animate={statsUpdated ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="text-sm font-bold text-white"
                    >
                      {stats.acknowledgedFeedback}/{stats.totalFeedback}
                    </motion.span>
                  </div>
                  <div className="mt-1.5 w-full bg-white/20 rounded-full h-1">
                    <motion.div 
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalFeedback > 0 ? (stats.acknowledgedFeedback / stats.totalFeedback) * 100 : 0}%` }}
                      animate={statsUpdated ? { 
                        boxShadow: ['0 0 0 0 rgba(255, 255, 255, 0.4)', '0 0 0 4px rgba(255, 255, 255, 0)', '0 0 0 0 rgba(255, 255, 255, 0)']
                      } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={statsUpdated ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="bg-white/20 rounded-lg p-2.5 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <FiCheckSquare className="w-3 h-3 text-white/90" />
                      <span className="text-white/90 font-medium text-xs">Actions</span>
                    </div>
                    <motion.span 
                      animate={statsUpdated ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="text-sm font-bold text-white"
                    >
                      {stats.completedActions}/{stats.totalActions}
                    </motion.span>
                  </div>
                  <div className="mt-1.5 w-full bg-white/20 rounded-full h-1">
                    <motion.div 
                      className="bg-white h-1 rounded-full transition-all duration-500"
                      style={{ width: `${stats.totalActions > 0 ? (stats.completedActions / stats.totalActions) * 100 : 0}%` }}
                      animate={statsUpdated ? { 
                        boxShadow: ['0 0 0 0 rgba(255, 255, 255, 0.4)', '0 0 0 4px rgba(255, 255, 255, 0)', '0 0 0 0 rgba(255, 255, 255, 0)']
                      } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Pending Items Alert - Mobile Compact */}
              {stats.pendingItems > 0 && (
                <motion.div 
                  animate={statsUpdated ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-2 bg-orange-500/20 border border-orange-300/30 rounded-lg p-2 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-3 h-3 text-orange-200" />
                    <span className="text-orange-200 font-medium text-xs">
                      {stats.pendingItems} pending item{stats.pendingItems > 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation Tabs - Mobile Optimized */}
            <div className="p-3 border-b border-gray-100">
              <div className="flex bg-gray-50 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('feedback')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md transition-all font-medium text-xs min-h-[44px] ${
                    activeView === 'feedback'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiMessageSquare className="w-3.5 h-3.5" />
                  <span>Feedback</span>
                  {teamFeedback.length > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[18px] text-center">
                      {teamFeedback.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveView('actions')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-md transition-all font-medium text-xs min-h-[44px] ${
                    activeView === 'actions'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FiCheckSquare className="w-3.5 h-3.5" />
                  <span>Actions</span>
                  {teamActions.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-semibold min-w-[18px] text-center">
                      {teamActions.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content - Mobile Optimized */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <AnimatePresence mode="wait">
                  {activeView === 'feedback' && (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {teamFeedback.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiMessageSquare className="w-5 h-5 text-blue-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">No feedback yet</h3>
                          <p className="text-gray-500 text-xs">Your team feedback will appear here</p>
                        </div>
                      ) : (
                        teamFeedback.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: completedItems.has(item.id) ? [1, 1.02, 1] : 1,
                              boxShadow: completedItems.has(item.id) 
                                ? ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                                : '0 0 0 0 rgba(34, 197, 94, 0)'
                            }}
                            transition={{ 
                              delay: idx * 0.1,
                              scale: { duration: 0.6, ease: "easeInOut" },
                              boxShadow: { duration: 1, ease: "easeInOut" }
                            }}
                            className={`p-3 rounded-lg border transition-all duration-500 relative ${
                              item.isAcknowledged || completedItems.has(item.id)
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 shadow-sm'
                            }`}
                          >
                            {completedItems.has(item.id) && <ConfettiEffect itemId={item.id} />}
                            
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h4>
                                <p className="text-gray-600 mt-1 text-xs leading-relaxed">{item.content}</p>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center space-x-2 flex-wrap gap-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    item.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {item.priority}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <div className="relative">
                                  {completedItems.has(item.id) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10"
                                    >
                                      <FiCheck className="w-3 h-3 text-white" />
                                    </motion.div>
                                  )}
                                  
                                  {!item.isAcknowledged && (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      animate={completedItems.has(item.id) ? { scale: [1, 1.1, 1] } : {}}
                                      transition={{ duration: 0.3 }}
                                      onClick={() => handleAcknowledgeWithAnimation(item.id, 'feedback')}
                                      className={`bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1.5 font-medium shadow-sm min-h-[44px] text-xs ${
                                        processingItems.has(item.id) || completedItems.has(item.id)
                                          ? 'opacity-50 cursor-not-allowed'
                                          : ''
                                      }`}
                                      disabled={processingItems.has(item.id) || completedItems.has(item.id)}
                                    >
                                      {processingItems.has(item.id) ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      ) : (
                                        <FiCheck className="w-3.5 h-3.5" />
                                      )}
                                      <span>Acknowledge</span>
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}

                  {activeView === 'actions' && (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {teamActions.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <FiCheckSquare className="w-5 h-5 text-green-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-1">No actions yet</h3>
                          <p className="text-gray-500 text-xs">Your team actions will appear here</p>
                        </div>
                      ) : (
                        teamActions.map((item, idx) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              scale: completedItems.has(item.id) ? [1, 1.02, 1] : 1,
                              boxShadow: completedItems.has(item.id) 
                                ? ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 10px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)']
                                : '0 0 0 0 rgba(34, 197, 94, 0)'
                            }}
                            transition={{ 
                              delay: idx * 0.1,
                              scale: { duration: 0.6, ease: "easeInOut" },
                              boxShadow: { duration: 1, ease: "easeInOut" }
                            }}
                            className={`p-3 rounded-lg border transition-all duration-500 relative ${
                              item.isCompleted || completedItems.has(item.id)
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 shadow-sm'
                            }`}
                          >
                            {completedItems.has(item.id) && <ConfettiEffect itemId={item.id} />}
                            
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm leading-tight">{item.title}</h4>
                                <p className="text-gray-600 mt-1 text-xs leading-relaxed">{item.description}</p>
                              </div>

                              {/* Demo Media Section - Mobile optimized */}
                              {item.demoMediaUrl && (
                                <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                                  <h5 className="text-xs font-medium text-indigo-900 mb-2 flex items-center gap-1">
                                    🎯 Demo: How to perform this action
                                  </h5>
                                  <div className="space-y-2">
                                    <div className="flex flex-col gap-1 text-xs text-indigo-700">
                                      <span className="font-medium truncate">{item.demoFileName}</span>
                                      <span className="text-indigo-600">({item.demoMediaType === 'image' ? 'Image' : 'Video'})</span>
                                    </div>
                                    
                                    {/* Demo Media Preview */}
                                    <div className="bg-white rounded-lg p-1 border border-indigo-200">
                                      {item.demoMediaType === 'image' ? (
                                        <img
                                          src={item.demoMediaUrl}
                                          alt={item.demoFileName || 'Demo image'}
                                          className="w-full max-h-24 object-contain rounded cursor-pointer"
                                        />
                                      ) : (
                                        <video
                                          src={item.demoMediaUrl}
                                          controls
                                          className="w-full max-h-24 rounded"
                                          preload="metadata"
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      )}
                                    </div>
                                    
                                    <p className="text-xs text-indigo-600 bg-indigo-100 rounded p-1">
                                      💡 Watch this demo from your coach
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center space-x-2 flex-wrap gap-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    item.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                    item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {item.priority}
                                  </span>
                                  {item.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(item.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="relative">
                                  {completedItems.has(item.id) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10"
                                    >
                                      <FiCheck className="w-3 h-3 text-white" />
                                    </motion.div>
                                  )}
                                  
                                  {!item.isCompleted && (
                                    <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      animate={completedItems.has(item.id) ? { scale: [1, 1.1, 1] } : {}}
                                      transition={{ duration: 0.3 }}
                                      onClick={() => handleCompleteWithAnimation(item.id)}
                                      className={`bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1.5 font-medium shadow-sm min-h-[44px] text-xs ${
                                        processingItems.has(item.id) || completedItems.has(item.id)
                                          ? 'opacity-50 cursor-not-allowed'
                                          : ''
                                      }`}
                                      disabled={processingItems.has(item.id) || completedItems.has(item.id)}
                                    >
                                      {processingItems.has(item.id) ? (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                      ) : (
                                        <FiCheck className="w-3.5 h-3.5" />
                                      )}
                                      <span>Complete</span>
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 