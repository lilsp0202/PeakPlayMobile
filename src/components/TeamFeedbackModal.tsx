"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiMessageSquare, FiSend, FiUser } from 'react-icons/fi';

interface TeamFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  onCreateFeedback: (feedbackData: any) => void;
}

export default function TeamFeedbackModal({
  isOpen,
  onClose,
  team,
  onCreateFeedback
}: TeamFeedbackModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateFeedback(formData);
      setFormData({
        title: '',
        content: '',
        category: 'GENERAL',
        priority: 'MEDIUM'
      });
      onClose();
    } catch (error) {
      console.error('Error creating team feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'TECHNICAL', label: 'Technical', color: 'bg-blue-100 text-blue-700' },
    { value: 'TACTICAL', label: 'Tactical', color: 'bg-purple-100 text-purple-700' },
    { value: 'MENTAL', label: 'Mental', color: 'bg-green-100 text-green-700' },
    { value: 'PHYSICAL', label: 'Physical', color: 'bg-orange-100 text-orange-700' },
    { value: 'GENERAL', label: 'General', color: 'bg-gray-100 text-gray-700' }
  ];

  const priorities = [
    { value: 'HIGH', label: 'High Priority', color: 'bg-red-100 text-red-700' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'LOW', label: 'Low Priority', color: 'bg-blue-100 text-blue-700' }
  ];

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Team Feedback</h2>
                <p className="text-white/80">Send feedback to {team?.name}</p>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Team Members Preview */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Team Members ({team?.members?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2">
              {team?.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200"
                >
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">{member.student.studentName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter feedback title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your feedback for the team..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  Send to Team
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 