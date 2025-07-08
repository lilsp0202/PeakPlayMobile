"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageSquare, FiCheckSquare, FiClock, FiTrendingUp, FiFilter, FiExternalLink } from "react-icons/fi";

interface StudentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    studentName: string;
    username: string;
    sport: string;
    age?: number;
    email?: string;
  };
}

interface Feedback {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
}

interface Action {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate?: string;
  isCompleted: boolean;
  isAcknowledged: boolean;
  completedAt?: string;
  acknowledgedAt?: string;
  notes?: string;
  createdAt: string;
  coach: {
    name: string;
    academy: string;
  };
}

export default function StudentProgressModal({ isOpen, onClose, student }: StudentProgressModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'actions'>('overview');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const categories = ['ALL', 'GENERAL', 'TECHNICAL', 'MENTAL', 'NUTRITIONAL', 'TACTICAL'];
  const statusOptions = ['ALL', 'PENDING', 'ACKNOWLEDGED', 'COMPLETED'];

  useEffect(() => {
    if (isOpen && student.id) {
      fetchData();
    }
  }, [isOpen, student.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch feedback
      const feedbackResponse = await fetch(`/api/feedback?studentId=${student.id}`);
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        setFeedback(feedbackData);
      }

      // Fetch actions
      const actionsResponse = await fetch(`/api/actions?studentId=${student.id}`);
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        setActions(actionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredFeedback = () => {
    let filtered = feedback;
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getFilteredActions = () => {
    let filtered = actions;
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'PENDING') {
        filtered = filtered.filter(item => !item.isAcknowledged && !item.isCompleted);
      } else if (filterStatus === 'ACKNOWLEDGED') {
        filtered = filtered.filter(item => item.isAcknowledged && !item.isCompleted);
      } else if (filterStatus === 'COMPLETED') {
        filtered = filtered.filter(item => item.isCompleted);
      }
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getOverviewStats = () => {
    const totalFeedback = feedback.length;
    const unreadFeedback = feedback.filter(f => !f.isRead).length;
    const totalActions = actions.length;
    const pendingActions = actions.filter(a => !a.isAcknowledged && !a.isCompleted).length;
    const completedActions = actions.filter(a => a.isCompleted).length;
    const overdueActions = actions.filter(a => 
      a.dueDate && 
      new Date(a.dueDate) < new Date() && 
      !a.isCompleted
    ).length;

    return {
      totalFeedback,
      unreadFeedback,
      totalActions,
      pendingActions,
      completedActions,
      overdueActions
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'text-blue-600 bg-blue-100';
      case 'MENTAL': return 'text-purple-600 bg-purple-100';
      case 'NUTRITIONAL': return 'text-green-600 bg-green-100';
      case 'TACTICAL': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = getOverviewStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="inline-block w-full max-w-6xl p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Progress Tracking</h3>
                  <p className="text-blue-100">
                    {student.studentName} (@{student.username}) • {student.sport}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex px-6">
              {[
                { id: 'overview', label: 'Overview', icon: FiTrendingUp },
                { id: 'feedback', label: 'Feedback', icon: FiMessageSquare },
                { id: 'actions', label: 'Actions', icon: FiCheckSquare }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'feedback' && (
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {feedback.length}
                    </span>
                  )}
                  {tab.id === 'actions' && (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                      {actions.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <FiMessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</div>
                        <div className="text-sm text-gray-600">Total Feedback</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <FiClock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">{stats.unreadFeedback}</div>
                        <div className="text-sm text-gray-600">Unread</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <FiCheckSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{stats.totalActions}</div>
                        <div className="text-sm text-gray-600">Total Actions</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <FiClock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-yellow-600">{stats.pendingActions}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4 text-center">
                        <FiCheckSquare className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-emerald-600">{stats.completedActions}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <FiClock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-red-600">{stats.overdueActions}</div>
                        <div className="text-sm text-gray-600">Overdue</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
                      <div className="space-y-3">
                        {[...feedback.slice(0, 3), ...actions.slice(0, 3)]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((item) => (
                            <div key={`${'title' in item ? 'feedback' : 'action'}-${item.id}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              {'content' in item ? (
                                <FiMessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                              ) : (
                                <FiCheckSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-600">{formatDate(item.createdAt)}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'feedback' && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiFilter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                      </div>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Feedback List */}
                    <div className="space-y-4">
                      {getFilteredFeedback().map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{item.title}</h5>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              {!item.isRead && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.createdAt)} • by {item.coach.name}
                          </div>
                        </div>
                      ))}
                      {getFilteredFeedback().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No feedback found matching the selected filters.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'actions' && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FiFilter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                      </div>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Actions List */}
                    <div className="space-y-4">
                      {getFilteredActions().map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{item.title}</h5>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                                {item.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                              {item.isCompleted ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                                  Completed
                                </span>
                              ) : item.isAcknowledged ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">
                                  Acknowledged
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div>
                              {formatDate(item.createdAt)} • by {item.coach.name}
                            </div>
                            {item.dueDate && (
                              <div className={`${
                                new Date(item.dueDate) < new Date() && !item.isCompleted 
                                  ? 'text-red-600 font-medium' 
                                  : 'text-gray-500'
                              }`}>
                                Due: {formatDate(item.dueDate)}
                              </div>
                            )}
                          </div>
                          {item.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <span className="font-medium text-blue-800">Student Notes:</span> {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                      {getFilteredActions().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No actions found matching the selected filters.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 