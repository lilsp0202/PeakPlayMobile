"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ActionProofUpload from "./ActionProofUpload";
import { FiUpload, FiEye, FiDownload } from "react-icons/fi";

interface Action {
  id: string;
  title: string;
  description: string;
  category: 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
  notes?: string;
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
}

interface CoachActionsProps {
  studentId?: string;
  isCoachView?: boolean;
}

export default function CoachActions({ studentId, isCoachView = false }: CoachActionsProps) {
  const { data: session } = useSession();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingActionId, setUploadingActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchActions();
  }, [studentId]);

  const fetchActions = async () => {
    try {
      setLoading(true);
      
      // Use a shorter timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const url = studentId ? `/api/actions?studentId=${studentId}` : '/api/actions';
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      } else if (response.status === 404) {
        // Student profile not found - this is ok, just show no actions
        setActions([]);
      } else if (response.status === 401) {
        // Unauthorized - user might need to log in again
        console.error("Unauthorized access to actions");
        setActions([]);
      } else {
        console.error("Failed to fetch actions:", response.status);
        setActions([]);
      }
    } catch (error: any) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Actions request timeout - showing empty state");
        // Don't show error for timeout, just show empty state
        setActions([]);
      } else {
        console.error("Error fetching actions:", error);
        // Don't set error state, just show empty actions
        setActions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAction = async (actionId: string, isCompleted: boolean = false, notes: string = '') => {
    try {
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          actionId, 
          isCompleted,
          isAcknowledged: true,
          notes: notes.trim() || undefined
        }),
      });

      if (response.ok) {
        setActions(prev => 
          prev.map(action => action.id === actionId ? { 
            ...action, 
            isAcknowledged: true, 
            isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : action.completedAt,
            acknowledgedAt: new Date().toISOString(),
            notes: notes.trim() || action.notes
          } : action)
        );
      }
    } catch (error) {
      console.error("Error acknowledging action:", error);
    }
  };

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
    setCompletionNotes(action.notes || '');
    setShowModal(true);
  };

  const handleComplete = async () => {
    if (selectedAction) {
      await acknowledgeAction(selectedAction.id, true, completionNotes);
      setShowModal(false);
      setSelectedAction(null);
      setCompletionNotes('');
    }
  };

  const handleUploadProof = (actionId: string) => {
    setUploadingActionId(actionId);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (proofData: any) => {
    // Update the action with the new proof data
    setActions(prev => 
      prev.map(action => 
        action.id === uploadingActionId ? {
          ...action,
          proofMediaUrl: proofData.proofMediaUrl,
          proofMediaType: proofData.proofMediaType,
          proofFileName: proofData.proofFileName,
          proofUploadedAt: proofData.proofUploadedAt,
        } : action
      )
    );
    setShowUploadModal(false);
    setUploadingActionId(null);
    // Refresh actions to get updated data
    fetchActions();
  };

  const handleViewProof = (action: Action) => {
    if (action.proofMediaUrl) {
      // Create a modal or new window to view the media
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        if (action.proofMediaType === 'image') {
          newWindow.document.write(`
            <html>
              <head><title>Action Proof - ${action.proofFileName}</title></head>
              <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <div style="text-align:center;">
                  <h2 style="margin-bottom:20px; color:#333;">Action: ${action.title}</h2>
                  <img src="${action.proofMediaUrl}" style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
                  <p style="margin-top:20px; color:#666;">Uploaded: ${new Date(action.proofUploadedAt!).toLocaleString()}</p>
                </div>
              </body>
            </html>
          `);
        } else {
          newWindow.document.write(`
            <html>
              <head><title>Action Proof - ${action.proofFileName}</title></head>
              <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <div style="text-align:center;">
                  <h2 style="margin-bottom:20px; color:#333;">Action: ${action.title}</h2>
                  <video controls style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                    <source src="${action.proofMediaUrl}" type="${action.proofMediaType === 'video' ? 'video/mp4' : action.proofMediaType}">
                    Your browser does not support the video tag.
                  </video>
                  <p style="margin-top:20px; color:#666;">Uploaded: ${new Date(action.proofUploadedAt!).toLocaleString()}</p>
                </div>
              </body>
            </html>
          `);
        }
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MENTAL': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'NUTRITIONAL': return 'bg-green-100 text-green-700 border-green-200';
      case 'TACTICAL': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (action: Action) => {
    if (action.isCompleted) return 'bg-green-100 text-green-700 border-green-200';
    if (action.isAcknowledged) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getStatusText = (action: Action) => {
    if (action.isCompleted) return 'Completed';
    if (action.isAcknowledged) return 'Acknowledged';
    return 'Pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDueDate = (dateString: string) => {
    const due = new Date(dateString);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
        <div className="p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingActions = actions.filter(a => !a.isCompleted);
  const completedActions = actions.filter(a => a.isCompleted);

  return (
    <>
      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="p-4 sm:p-6">
          {/* Header - Mobile Optimized */}
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-start sm:items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actions</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Tasks and drills from your coach</p>
              </div>
            </div>
            {pendingActions.length > 0 && (
              <div className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0">
                {pendingActions.length}
              </div>
            )}
          </div>

          {/* Action Preview - Mobile Optimized */}
          <div className="space-y-3">
            {actions.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No actions assigned yet</p>
                <p className="text-gray-400 text-xs">Your coach will assign tasks and drills here</p>
              </div>
            ) : (
              <>
                {/* Quick Stats - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-base sm:text-lg font-bold text-orange-600">{pendingActions.length}</div>
                    <div className="text-xs text-orange-700">Pending</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-base sm:text-lg font-bold text-green-600">{completedActions.length}</div>
                    <div className="text-xs text-green-700">Completed</div>
                  </div>
                </div>

                {/* Recent Actions Preview - Mobile Optimized */}
                <div className="space-y-2 sm:space-y-3">
                  {actions.slice(0, 3).map((action, index) => (
                    <div
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className={`p-3 sm:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 active:scale-[0.98] touch-manipulation ${
                        !action.isCompleted ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Mobile-optimized badges */}
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-xs sm:text-[8px] font-semibold">{index + 1}</span>
                            </div>
                            
                            <span className={`px-1.5 py-0.5 rounded-full text-xs sm:text-[8px] font-medium border ${getCategoryColor(action.category)}`}>
                              <span className="hidden sm:inline">{action.category}</span>
                              <span className="sm:hidden">{action.category.slice(0, 3)}</span>
                            </span>
                            
                            <span className={`px-1.5 py-0.5 rounded-full text-xs sm:text-[8px] font-medium border ${getPriorityColor(action.priority)}`}>
                              <span className="hidden sm:inline">{action.priority}</span>
                              <span className="sm:hidden">{action.priority.slice(0, 1)}</span>
                            </span>
                            
                            <span className={`px-1.5 py-0.5 rounded-full text-xs sm:text-[8px] font-medium border ${getStatusColor(action)}`}>
                              <span className="hidden sm:inline">{getStatusText(action)}</span>
                              <span className="sm:hidden">{getStatusText(action).slice(0, 4)}</span>
                            </span>

                            {action.dueDate && (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs sm:text-[8px] font-medium ${
                                new Date(action.dueDate) < new Date() ? 'bg-red-100 text-red-600 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                              }`}>
                                <span className="hidden sm:inline">{formatDueDate(action.dueDate)}</span>
                                <span className="sm:hidden">
                                  {new Date(action.dueDate) < new Date() ? 'Late' : 'Due'}
                                </span>
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1">
                            {action.title}
                          </h4>
                          
                          {/* Mobile date display */}
                          <p className="text-xs text-gray-500 sm:hidden">
                            {formatDate(action.createdAt)}
                          </p>
                        </div>
                        
                        {/* Arrow indicator */}
                        <div className="flex-shrink-0 ml-2">
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {actions.length > 3 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full text-center py-3 text-sm text-indigo-600 hover:text-indigo-900 font-medium border-t border-gray-200 mt-3 sm:mt-4 hover:bg-gray-50 transition-colors touch-manipulation"
                  >
                    View All Actions ({actions.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal for expanded view - Mobile Optimized */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[95vh] sm:max-h-[80vh] w-full overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {selectedAction ? 'Action Details' : 'All Actions'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAction(null);
                    setCompletionNotes('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2 touch-manipulation"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(80vh-140px)]">
              {selectedAction ? (
                // Single action detail view - Mobile Optimized
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                        {selectedAction.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                        <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getCategoryColor(selectedAction.category)}`}>
                          {selectedAction.category}
                        </span>
                        <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getPriorityColor(selectedAction.priority)}`}>
                          <span className="hidden sm:inline">{selectedAction.priority} Priority</span>
                          <span className="sm:hidden">{selectedAction.priority}</span>
                        </span>
                        <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getStatusColor(selectedAction)}`}>
                          {getStatusText(selectedAction)}
                        </span>
                        {selectedAction.dueDate && (
                          <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full ${
                            new Date(selectedAction.dueDate) < new Date() ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'
                          }`}>
                            {formatDueDate(selectedAction.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Task Description:</h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {selectedAction.description}
                    </p>
                  </div>

                  {/* Demo Media Section */}
                  {selectedAction.demoMediaUrl && (
                    <div className="bg-indigo-50 rounded-lg p-4 sm:p-6 border border-indigo-200">
                      <h4 className="text-sm font-medium text-indigo-900 mb-3">
                        🎯 Demo: How to perform this action
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedAction.demoMediaType === 'image' ? (
                              <FiEye className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            )}
                            <div>
                              <p className="text-sm font-medium text-indigo-900">{selectedAction.demoFileName}</p>
                              <p className="text-xs text-indigo-700">
                                Demo from your coach
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Media Preview */}
                        <div className="bg-white rounded-lg p-3 border border-indigo-200">
                          {selectedAction.demoMediaType === 'image' ? (
                            <img
                              src={selectedAction.demoMediaUrl}
                              alt={selectedAction.demoFileName || 'Demo image'}
                              className="w-full max-h-64 sm:max-h-80 object-contain rounded-lg"
                            />
                          ) : (
                            <video
                              src={selectedAction.demoMediaUrl}
                              controls
                              className="w-full max-h-64 sm:max-h-80 rounded-lg"
                              preload="metadata"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                        
                        <p className="text-xs text-indigo-600 bg-indigo-100 rounded-md p-2">
                          💡 Watch this demo to understand exactly how your coach wants you to perform this action
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedAction.notes && (
                    <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Your Notes:</h4>
                      <p className="text-blue-800 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                        {selectedAction.notes}
                      </p>
                    </div>
                  )}

                  {/* Proof Media Section */}
                  {selectedAction.proofMediaUrl && (
                    <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                      <h4 className="text-sm font-medium text-green-900 mb-3">Completion Proof:</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {selectedAction.proofMediaType === 'image' ? (
                            <FiEye className="w-5 h-5 text-green-600" />
                          ) : (
                            <FiEye className="w-5 h-5 text-purple-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-green-900">{selectedAction.proofFileName}</p>
                            <p className="text-xs text-green-700">
                              Uploaded: {new Date(selectedAction.proofUploadedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewProof(selectedAction)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <FiEye className="w-4 h-4" />
                          View
                        </button>
                      </div>
                    </div>
                  )}

                  {!isCoachView && !selectedAction.isCompleted && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                      <h4 className="text-sm font-medium text-orange-900 mb-3">Add Completion Notes (Optional):</h4>
                      <textarea
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Add any notes about your progress or completion of this task..."
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm"
                        rows={3}
                      />
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                        {!selectedAction.proofMediaUrl && (
                          <button
                            onClick={() => handleUploadProof(selectedAction.id)}
                            className="flex-1 bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation flex items-center justify-center gap-2"
                          >
                            <FiUpload className="w-4 h-4" />
                            Upload Proof
                          </button>
                        )}
                        <button
                          onClick={handleComplete}
                          className="flex-1 bg-green-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                        >
                          Mark as Completed
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-gray-600 space-y-2 sm:space-y-0">
                      <p className="truncate">
                        <span className="font-medium">{selectedAction.coach.name}</span>
                        <span className="hidden sm:inline"> • {selectedAction.coach.academy}</span>
                      </p>
                      <p className="text-right">{formatDate(selectedAction.createdAt)}</p>
                    </div>
                    <div className="sm:hidden mt-1">
                      <p className="text-xs text-gray-500 truncate">{selectedAction.coach.academy}</p>
                    </div>
                  </div>
                </div>
              ) : (
                // All actions list view - Mobile Optimized
                <div className="space-y-3 sm:space-y-4">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      onClick={() => setSelectedAction(action)}
                      className={`p-4 sm:p-5 rounded-lg border cursor-pointer transition-all hover:shadow-md active:scale-[0.98] touch-manipulation ${
                        !action.isCompleted ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                            <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getCategoryColor(action.category)}`}>
                              <span className="hidden sm:inline">{action.category}</span>
                              <span className="sm:hidden">{action.category.slice(0, 4)}</span>
                            </span>
                            <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getPriorityColor(action.priority)}`}>
                              <span className="hidden sm:inline">{action.priority}</span>
                              <span className="sm:hidden">{action.priority.slice(0, 1)}</span>
                            </span>
                            <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full border ${getStatusColor(action)}`}>
                              <span className="hidden sm:inline">{getStatusText(action)}</span>
                              <span className="sm:hidden">{getStatusText(action).slice(0, 4)}</span>
                            </span>
                            {action.dueDate && (
                              <span className={`text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full ${
                                new Date(action.dueDate) < new Date() ? 'bg-red-100 text-red-600 border-red-200' : 'bg-blue-100 text-blue-600 border-blue-200'
                              }`}>
                                <span className="hidden sm:inline">{formatDueDate(action.dueDate)}</span>
                                <span className="sm:hidden">
                                  {new Date(action.dueDate) < new Date() ? 'Late' : 'Due'}
                                </span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
                            {action.title}
                          </h4>
                          <p className="text-gray-600 mb-2 sm:mb-3 line-clamp-2 text-xs sm:text-sm">
                            {action.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0">
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              <span className="font-medium">{action.coach.name}</span>
                              <span className="hidden sm:inline"> • {action.coach.academy}</span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">{formatDate(action.createdAt)}</p>
                          </div>
                          {/* Mobile academy display */}
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-400 truncate">{action.coach.academy}</p>
                          </div>
                        </div>
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 ml-2 sm:ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </>
  );
} 