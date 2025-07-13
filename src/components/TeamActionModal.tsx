"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiCheckSquare, FiSend, FiUser, FiCalendar } from 'react-icons/fi';

interface TeamActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  onCreateAction: (actionData: any) => void;
}

export default function TeamActionModal({
  isOpen,
  onClose,
  team,
  onCreateAction
}: TeamActionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TRAINING',
    priority: 'MEDIUM',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAction(formData);
      setFormData({
        title: '',
        description: '',
        category: 'TRAINING',
        priority: 'MEDIUM',
        dueDate: ''
      });
      onClose();
    } catch (error) {
      console.error('Error creating team action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'TRAINING', label: 'Training', color: 'bg-blue-100 text-blue-700' },
    { value: 'PREPARATION', label: 'Preparation', color: 'bg-purple-100 text-purple-700' },
    { value: 'RECOVERY', label: 'Recovery', color: 'bg-green-100 text-green-700' },
    { value: 'NUTRITION', label: 'Nutrition', color: 'bg-orange-100 text-orange-700' },
    { value: 'MENTAL', label: 'Mental', color: 'bg-pink-100 text-pink-700' },
    { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-700' }
  ];

  const priorities = [
    { value: 'HIGH', label: 'High Priority', color: 'bg-red-100 text-red-700' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'LOW', label: 'Low Priority', color: 'bg-blue-100 text-blue-700' }
  ];

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FiCheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Team Action</h2>
                <p className="text-white/80">Assign action to {team?.name}</p>
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

        {/* Team Members Preview */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Team Members ({team?.members?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {team?.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-200"
              >
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-3 h-3" />
                </div>
                <span className="text-sm font-medium">{member.student.studentName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter action title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category, Priority, and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                disabled={isSubmitting}
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={minDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  disabled={isSubmitting}
                />
                <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what the team needs to do..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" />
                  Assign to Team
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 