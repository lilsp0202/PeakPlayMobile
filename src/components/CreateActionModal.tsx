"use client";

import { useState } from "react";

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    studentName: string;
    username: string;
    age: number;
  };
  onActionCreated: () => void;
}

export default function CreateActionModal({ 
  isOpen, 
  onClose, 
  student, 
  onActionCreated 
}: CreateActionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL' as 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: student.id,
          ...formData,
          dueDate: formData.dueDate || null
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'GENERAL',
          priority: 'MEDIUM',
          dueDate: ''
        });
        onActionCreated();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create action');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'Drills, techniques, and skill-building exercises';
      case 'MENTAL': return 'Mental training, focus exercises, and mindset tasks';
      case 'NUTRITIONAL': return 'Diet plans, hydration goals, and nutrition tracking';
      case 'TACTICAL': return 'Strategy practice, game analysis, and tactical drills';
      default: return 'General training and development tasks';
    }
  };

  const getActionSuggestions = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return [
          'Practice 50 batting shots against spin bowling',
          'Complete 30 catches practice session',
          'Work on bowling action for 45 minutes',
          'Practice footwork drills for 20 minutes'
        ];
      case 'MENTAL':
        return [
          'Complete 10-minute meditation session daily',
          'Visualize match scenarios for 15 minutes',
          'Practice positive self-talk during training',
          'Write match goals and strategies in journal'
        ];
      case 'NUTRITIONAL':
        return [
          'Drink 3 liters of water daily',
          'Eat protein within 30 minutes after training',
          'Track meal timing and portions for one week',
          'Avoid processed foods for next 7 days'
        ];
      case 'TACTICAL':
        return [
          'Analyze opposition batting patterns from last match',
          'Practice field positioning for different bowlers',
          'Study game footage for 30 minutes',
          'Discuss game strategy with captain'
        ];
      default:
        return [
          'Complete fitness assessment',
          'Attend team meeting on time',
          'Update skill tracking in PeakPlay',
          'Review and set weekly goals'
        ];
    }
  };

  const fillSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, title: suggestion }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header - Mobile Optimized */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create Action</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign a task to <span className="font-medium text-indigo-600">{student.studentName}</span>
                <span className="hidden sm:inline"> (@{student.username})</span>
              </p>
              <p className="text-sm text-gray-500 sm:hidden">@{student.username}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 touch-manipulation"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
          <div className="space-y-4 sm:space-y-6">
            {/* Error Message - Mobile Optimized */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="ml-3 text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Title Field - Mobile Optimized */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Action Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Practice batting stance for 30 minutes"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm sm:text-base touch-manipulation"
                required
              />
            </div>

            {/* Category and Priority Row - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm sm:text-base touch-manipulation"
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="MENTAL">Mental</option>
                  <option value="NUTRITIONAL">Nutritional</option>
                  <option value="TACTICAL">Tactical</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getCategoryDescription(formData.category)}
                </p>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm sm:text-base touch-manipulation"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.priority === 'HIGH' && 'Must be completed soon'}
                  {formData.priority === 'MEDIUM' && 'Standard priority task'}
                  {formData.priority === 'LOW' && 'Complete when possible'}
                </p>
              </div>
            </div>

            {/* Due Date - Mobile Optimized */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900 text-sm sm:text-base touch-manipulation"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set a deadline for this action (optional)
              </p>
            </div>

            {/* Quick Suggestions - Mobile Optimized */}
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2 sm:mb-3">
                Quick Suggestions for {formData.category}:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {getActionSuggestions(formData.category).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillSuggestion(suggestion)}
                    className="text-left p-2.5 sm:p-2 text-sm text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors touch-manipulation"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Field - Mobile Optimized */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Action Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide detailed instructions for this task. Include specific goals, duration, techniques to focus on, and success criteria..."
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-900 text-sm sm:text-base touch-manipulation"
                required
              />
              <p className="text-xs text-gray-600 mt-1">
                Be clear and specific. Include what success looks like and any important notes.
              </p>
            </div>

            {/* Submit Button - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Action'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 