"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUsers, 
  FiMessageSquare, 
  FiCheckSquare, 
  FiChevronDown, 
  FiChevronRight,
  FiCheck,
  FiClock,
  FiUser,
  FiImage,
  FiVideo,
  FiUpload,
  FiEye,
  FiCalendar
} from 'react-icons/fi';

interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  teamData: { feedback: any[], actions: any[] };
  isLoading: boolean;
  viewType: 'feedback' | 'actions';
  setViewType: (type: 'feedback' | 'actions') => void;
  expandedItems: string[];
  onToggleItemExpanded: (itemId: string) => void;
}

export default function TeamDetailsModal({
  isOpen,
  onClose,
  team,
  teamData,
  isLoading,
  viewType,
  setViewType,
  expandedItems,
  onToggleItemExpanded
}: TeamDetailsModalProps) {
  // Helper functions for better UX
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewMedia = (mediaUrl: string, fileName?: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow && mediaUrl) {
      newWindow.document.write(`
        <html>
          <head><title>${fileName || 'Team Media'}</title></head>
          <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
            <div style="text-align:center; max-width:90vw;">
              <h2 style="margin-bottom:20px; color:#333;">${fileName || 'Media'}</h2>
              ${mediaUrl.includes('image') || mediaUrl.startsWith('data:image') 
                ? `<img src="${mediaUrl}" style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />` 
                : `<video src="${mediaUrl}" controls style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Your browser does not support video.</video>`
              }
            </div>
          </body>
        </html>
      `);
    }
  };

  if (!isOpen) return null;

  // Group team feedback/actions by creation time and other common fields
  const groupedData = React.useMemo(() => {
    const currentData = viewType === 'feedback' ? teamData.feedback : teamData.actions;
    if (!currentData || currentData.length === 0) return [];

    // Group by title, content/description, category, priority, and creation time (to nearest minute)
    const groups = new Map();
    
    currentData.forEach(item => {
      const createdAt = new Date(item.createdAt);
      const groupKey = `${item.title}-${item.category}-${item.priority}-${Math.floor(createdAt.getTime() / 60000)}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          ...item,
          groupKey,
          memberData: []
        });
      }
      
      groups.get(groupKey).memberData.push({
        studentId: item.studentId,
        student: item.student,
        isAcknowledged: item.isAcknowledged,
        isCompleted: item.isCompleted,
        acknowledgedAt: item.acknowledgedAt,
        completedAt: item.completedAt
      });
    });

    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [teamData, viewType]);

  // Calculate separate counts for feedback and actions
  const feedbackCount = React.useMemo(() => {
    if (!teamData.feedback || teamData.feedback.length === 0) return 0;
    
    const groups = new Map();
    teamData.feedback.forEach(item => {
      const createdAt = new Date(item.createdAt);
      const groupKey = `${item.title}-${item.category}-${item.priority}-${Math.floor(createdAt.getTime() / 60000)}`;
      groups.set(groupKey, true);
    });
    
    return groups.size;
  }, [teamData.feedback]);

  const actionsCount = React.useMemo(() => {
    if (!teamData.actions || teamData.actions.length === 0) return 0;
    
    const groups = new Map();
    teamData.actions.forEach(item => {
      const createdAt = new Date(item.createdAt);
      const groupKey = `${item.title}-${item.category}-${item.priority}-${Math.floor(createdAt.getTime() / 60000)}`;
      groups.set(groupKey, true);
    });
    
    return groups.size;
  }, [teamData.actions]);

  const getStatusColor = (isAcknowledged: boolean, isCompleted?: boolean) => {
    if (viewType === 'feedback') {
      return isAcknowledged ? 'text-green-600' : 'text-orange-600';
    } else {
      return isCompleted ? 'text-green-600' : 'text-orange-600';
    }
  };

  const getStatusIcon = (isAcknowledged: boolean, isCompleted?: boolean) => {
    if (viewType === 'feedback') {
      return isAcknowledged ? <FiCheck className="w-4 h-4" /> : <FiClock className="w-4 h-4" />;
    } else {
      return isCompleted ? <FiCheck className="w-4 h-4" /> : <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (isAcknowledged: boolean, isCompleted?: boolean) => {
    if (viewType === 'feedback') {
      return isAcknowledged ? 'Acknowledged' : 'Pending';
    } else {
      return isCompleted ? 'Completed' : 'Pending';
    }
  };

  const getOverallProgress = (memberData: any[]) => {
    if (memberData.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = memberData.filter(member => 
      viewType === 'feedback' ? member.isAcknowledged : member.isCompleted
    ).length;
    
    return {
      completed,
      total: memberData.length,
      percentage: Math.round((completed / memberData.length) * 100)
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{team?.name} Details</h2>
                <p className="text-white/80">{team?.description}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <motion.button
              onClick={() => setViewType('feedback')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
                viewType === 'feedback'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              <FiMessageSquare className="w-4 h-4 mr-2" />
              Team Feedback ({feedbackCount})
            </motion.button>
            <motion.button
              onClick={() => setViewType('actions')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
                viewType === 'actions'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
              }`}
            >
              <FiCheckSquare className="w-4 h-4 mr-2" />
              Team Actions ({actionsCount})
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Loading {viewType}...</span>
              </div>
            ) : groupedData.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  {viewType === 'feedback' ? (
                    <FiMessageSquare className="w-8 h-8 text-gray-400" />
                  ) : (
                    <FiCheckSquare className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No {viewType} found
                </h3>
                <p className="text-gray-500">
                  This team hasn't received any {viewType} yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedData.map((item) => {
                  const progress = getOverallProgress(item.memberData);
                  
                  return (
                    <motion.div
                      key={item.groupKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Item Header */}
                      <motion.button
                        onClick={() => onToggleItemExpanded(item.groupKey)}
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                        className="w-full p-4 text-left flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${
                              viewType === 'feedback' 
                                ? 'bg-green-500' 
                                : item.priority === 'HIGH' 
                                  ? 'bg-red-500' 
                                  : item.priority === 'MEDIUM' 
                                    ? 'bg-yellow-500' 
                                    : 'bg-blue-500'
                            }`}></div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.category === 'TECHNICAL' ? 'bg-blue-100 text-blue-700' :
                              item.category === 'TACTICAL' ? 'bg-purple-100 text-purple-700' :
                              item.category === 'MENTAL' ? 'bg-green-100 text-green-700' :
                              item.category === 'PHYSICAL' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress: {progress.completed}/{progress.total} members</span>
                              <span>{progress.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progress.percentage === 100 
                                    ? 'bg-green-500' 
                                    : progress.percentage > 50 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {viewType === 'feedback' ? item.content : item.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.createdAt).toLocaleDateString()} • 
                            {viewType === 'actions' && item.dueDate && ` Due: ${new Date(item.dueDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedItems.includes(item.groupKey) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </motion.button>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedItems.includes(item.groupKey) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200 bg-gray-50"
                          >
                            <div className="p-4 space-y-6">
                              {/* Full Content */}
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">
                                  {viewType === 'feedback' ? 'Feedback Details' : 'Action Details'}
                                </h5>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                  {viewType === 'feedback' ? item.content : item.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <FiCalendar className="w-3 h-3" />
                                    <span>Created: {formatDate(item.createdAt)}</span>
                                  </div>
                                  {viewType === 'actions' && item.dueDate && (
                                    <div className="flex items-center gap-1">
                                      <FiClock className="w-3 h-3" />
                                      <span>Due: {formatDate(item.dueDate)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Demo Media (Coach provided) - Enhanced with in-page preview */}
                              {viewType === 'actions' && item.demoMediaUrl && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    {item.demoMediaType === 'image' ? <FiImage className="w-5 h-5 text-blue-600" /> : <FiVideo className="w-5 h-5 text-blue-600" />}
                                    <h6 className="font-semibold text-blue-900">Coach Demo Media</h6>
                                  </div>
                                  
                                  {item.demoMediaType === 'image' ? (
                                    <div className="relative">
                                      <img 
                                        src={item.demoMediaUrl} 
                                        alt="Coach demo"
                                        className="w-full max-w-sm rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => viewMedia(item.demoMediaUrl, item.demoFileName)}
                                      />
                                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                                        Click to enlarge
                                      </div>
                                    </div>
                                  ) : (
                                    <video 
                                      src={item.demoMediaUrl}
                                      controls
                                      className="w-full max-w-sm rounded-lg shadow-md"
                                      preload="metadata"
                                    >
                                      Your browser does not support video.
                                    </video>
                                  )}
                                  
                                  <p className="text-xs text-blue-700 mt-2">
                                    <strong>File:</strong> {item.demoFileName} • 
                                    <strong> Added:</strong> {item.demoUploadedAt ? formatDate(item.demoUploadedAt) : 'N/A'}
                                  </p>
                                </div>
                              )}

                              {/* Team Member Status */}
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-3">
                                  Team Member Progress
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {item.memberData.map((memberData: any) => (
                                    <div
                                      key={memberData.studentId}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                          <FiUser className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-900 block">
                                            {memberData.student.studentName}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {memberData.student.email}
                                          </span>
                                        </div>
                                      </div>
                                      <div className={`flex items-center gap-2 ${
                                        viewType === 'feedback' 
                                          ? getStatusColor(memberData.isAcknowledged)
                                          : getStatusColor(memberData.isCompleted, memberData.isCompleted)
                                      }`}>
                                        {viewType === 'feedback' 
                                          ? getStatusIcon(memberData.isAcknowledged)
                                          : getStatusIcon(memberData.isCompleted, memberData.isCompleted)
                                        }
                                        <span className="text-sm font-medium">
                                          {viewType === 'feedback' 
                                            ? getStatusText(memberData.isAcknowledged)
                                            : getStatusText(memberData.isCompleted, memberData.isCompleted)
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 