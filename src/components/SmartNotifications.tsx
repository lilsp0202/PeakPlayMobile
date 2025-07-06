"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiSettings, 
  FiRefreshCw, 
  FiFilter, 
  FiCheck, 
  FiX, 
  FiArchive, 
  FiTrash2,
  FiTrendingDown,
  FiTrendingUp,
  FiClock,
  FiMessageCircle,
  FiActivity,
  FiHeart,
  FiTarget,
  FiUser
} from 'react-icons/fi';

interface SmartNotification {
  id: string;
  type: 'NEGATIVE_TREND' | 'POSITIVE_MILESTONE' | 'MISSED_CHECKIN' | 'OVERDUE_FEEDBACK';
  category: 'PHYSICAL' | 'MENTAL' | 'NUTRITION' | 'TECHNIQUE' | 'GENERAL';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  student?: {
    id: string;
    studentName: string;
    academy: string;
  };
  data?: any;
}

interface NotificationPreferences {
  id: string;
  negativeTrends: boolean;
  positiveMilestones: boolean;
  missedCheckIns: boolean;
  overdueFeedback: boolean;
  trendDays: number;
  feedbackDays: number;
  inApp: boolean;
  email: boolean;
  pushNotification: boolean;
}

interface SmartNotificationsProps {
  onClose: () => void;
}

export default function SmartNotifications({ onClose }: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<any>({});

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setMetadata(data.metadata);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const generateNotifications = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/notifications/generate', {
        method: 'POST'
      });
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    } finally {
      setGenerating(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });
      if (response.ok) {
        const updated = await response.json();
        setPreferences(updated);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const markNotifications = async (action: 'mark_read' | 'mark_unread' | 'archive') => {
    if (selectedNotifications.length === 0) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds: selectedNotifications,
          action
        })
      });
      if (response.ok) {
        await fetchNotifications();
        setSelectedNotifications([]);
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const getNotificationIcon = (type: string, category: string) => {
    switch (type) {
      case 'NEGATIVE_TREND':
        return <FiTrendingDown className="w-5 h-5 text-red-500" />;
      case 'POSITIVE_MILESTONE':
        return <FiTrendingUp className="w-5 h-5 text-green-500" />;
      case 'MISSED_CHECKIN':
        return <FiClock className="w-5 h-5 text-orange-500" />;
      case 'OVERDUE_FEEDBACK':
        return <FiMessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'PHYSICAL':
        return <FiActivity className="w-4 h-4" />;
      case 'MENTAL':
        return <FiUser className="w-4 h-4" />;
      case 'NUTRITION':
        return <FiHeart className="w-4 h-4" />;
      case 'TECHNIQUE':
        return <FiTarget className="w-4 h-4" />;
      default:
        return <FiUser className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.isRead) return false;
    if (filter === 'high' && notification.severity !== 'HIGH') return false;
    return true;
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const renderNotifications = () => (
    <div className="space-y-4">
      {/* Header with filters and actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Smart Notifications ({metadata.unread || 0} unread)
          </h3>
          <button
            onClick={generateNotifications}
            disabled={generating}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full sm:w-auto"
          >
            <FiRefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'high' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            High Priority
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600 font-medium">
            {selectedNotifications.length} selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => markNotifications('mark_read')}
              className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 flex-1 sm:flex-none"
            >
              <FiCheck className="w-4 h-4" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={() => markNotifications('archive')}
              className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex-1 sm:flex-none"
            >
              <FiArchive className="w-4 h-4" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3 max-h-[60vh] sm:max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                notification.isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-purple-200 shadow-sm'
              } hover:shadow-md active:scale-95 touch-manipulation`}
              onClick={() => {
                if (selectedNotifications.includes(notification.id)) {
                  setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                } else {
                  setSelectedNotifications(prev => [...prev, notification.id]);
                }
              }}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => {}}
                  className="mt-1 w-4 h-4 sm:w-5 sm:h-5"
                />
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <h4 className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-700' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        getSeverityColor(notification.severity)
                      }`}>
                        {notification.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className={`mt-2 text-sm ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-700'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(notification.category)}
                      <span className="text-xs text-gray-500 capitalize">
                        {notification.category.toLowerCase()}
                      </span>
                    </div>
                    {notification.student && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {notification.student.studentName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNotifications.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <FiBell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {filter === 'all' 
                ? "You're all caught up! No new notifications to show."
                : `No ${filter} notifications to display.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      
      {preferences && (
        <div className="space-y-6">
          {/* Notification Types */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Notification Types</h4>
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.negativeTrends}
                  onChange={(e) => updatePreferences({ negativeTrends: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Negative trends</span>
                  <p className="text-xs text-gray-500 mt-1">Declining performance patterns</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.positiveMilestones}
                  onChange={(e) => updatePreferences({ positiveMilestones: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Positive milestones</span>
                  <p className="text-xs text-gray-500 mt-1">Achievements and improvements</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.missedCheckIns}
                  onChange={(e) => updatePreferences({ missedCheckIns: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Missed check-ins</span>
                  <p className="text-xs text-gray-500 mt-1">Athletes not updating data</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.overdueFeedback}
                  onChange={(e) => updatePreferences({ overdueFeedback: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Overdue feedback</span>
                  <p className="text-xs text-gray-500 mt-1">Reminders to provide feedback</p>
                </div>
              </label>
            </div>
          </div>

          {/* Thresholds */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Alert Thresholds</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trend Detection Days
                </label>
                <select
                  value={preferences.trendDays}
                  onChange={(e) => updatePreferences({ trendDays: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 p-3"
                >
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={4}>4 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How many consecutive days of decline to trigger an alert
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Reminder Days
                </label>
                <select
                  value={preferences.feedbackDays}
                  onChange={(e) => updatePreferences({ feedbackDays: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 p-3"
                >
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                  <option value={10}>10 days</option>
                  <option value={14}>14 days</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Days without feedback before reminder
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Methods */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Delivery Methods</h4>
            <div className="space-y-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.inApp}
                  onChange={(e) => updatePreferences({ inApp: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">In-app notifications</span>
                  <p className="text-xs text-gray-500 mt-1">Show notifications in the app</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) => updatePreferences({ email: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Email notifications</span>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={preferences.pushNotification}
                  onChange={(e) => updatePreferences({ pushNotification: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                />
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">Push notifications</span>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:max-w-4xl sm:w-full sm:max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiBell className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          {/* Mobile tabs */}
          <div className="flex items-center justify-center mt-4 sm:mt-0 sm:space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'preferences'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiSettings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>
            <button
              onClick={onClose}
              className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          {activeTab === 'notifications' ? renderNotifications() : renderPreferences()}
        </div>
      </motion.div>
    </div>
  );
} 