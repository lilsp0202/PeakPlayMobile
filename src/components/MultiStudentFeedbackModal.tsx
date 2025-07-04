"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX, FiUsers, FiMessageSquare, FiFilter } from "react-icons/fi";

interface Student {
  id: string;
  studentName: string;
  username: string;
  role: string;
  academy: string;
}

interface MultiStudentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onFeedbackCreated: () => void;
}

export default function MultiStudentFeedbackModal({ 
  isOpen, 
  onClose, 
  students, 
  onFeedbackCreated 
}: MultiStudentFeedbackModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as 'GENERAL' | 'TECHNICAL' | 'MENTAL' | 'NUTRITIONAL' | 'TACTICAL',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH'
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send feedback for each selected student
      const promises = selectedStudentIds.map(studentId => 
        fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId,
            ...formData
          }),
        })
      );

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every(res => res.ok);

      if (allSuccessful) {
        setSuccess(`Feedback sent to ${selectedStudentIds.length} student(s) successfully!`);
        setTimeout(() => {
          setFormData({
            title: '',
            content: '',
            category: 'GENERAL',
            priority: 'MEDIUM'
          });
          setSelectedStudentIds([]);
          onFeedbackCreated();
          onClose();
        }, 2000);
      } else {
        setError('Failed to send feedback to some students');
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
    if (error) setError('');
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const filteredStudents = getFilteredStudents();
    const allFilteredIds = filteredStudents.map(s => s.id);
    const isAllSelected = allFilteredIds.every(id => selectedStudentIds.includes(id));
    
    if (isAllSelected) {
      setSelectedStudentIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      const newIds = allFilteredIds.filter(id => !selectedStudentIds.includes(id));
      setSelectedStudentIds(prev => [...prev, ...newIds]);
    }
  };

  const getFilteredStudents = () => {
    if (roleFilter === 'ALL') return students;
    return students.filter(student => student.role === roleFilter);
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return 'Skills, techniques, and sport-specific abilities';
      case 'MENTAL': return 'Psychology, focus, confidence, and mental preparation';
      case 'NUTRITIONAL': return 'Diet, hydration, and nutrition planning';
      case 'TACTICAL': return 'Game strategy, positioning, and decision making';
      default: return 'General performance and overall development';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BATSMAN': return 'Batsman';
      case 'BOWLER': return 'Bowler';
      case 'ALL_ROUNDER': return 'All Rounder';
      case 'KEEPER': return 'Wicket Keeper';
      default: return role;
    }
  };

  const filteredStudents = getFilteredStudents();
  const isAllFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudentIds.includes(s.id));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiMessageSquare className="text-indigo-600" />
                  Multi-Student Feedback
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Send feedback to multiple students at once
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Success/Error Messages */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="text-green-800 flex items-center gap-2">
                    <FiCheck className="text-green-600" />
                    {success}
                  </p>
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-800">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              {/* Student Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiUsers className="text-indigo-600" />
                    Select Students ({selectedStudentIds.length} selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <select 
                      value={roleFilter} 
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="BATSMAN">Batsman</option>
                      <option value="BOWLER">Bowler</option>
                      <option value="ALL_ROUNDER">All Rounder</option>
                      <option value="KEEPER">Wicket Keeper</option>
                    </select>
                    <motion.button 
                      type="button"
                      onClick={handleSelectAll}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isAllFilteredSelected 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isAllFilteredSelected ? 'Deselect All' : 'Select All'}
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {filteredStudents.map(student => (
                    <motion.label 
                      key={student.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedStudentIds.includes(student.id)
                          ? 'bg-indigo-100 border-2 border-indigo-500'
                          : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedStudentIds.includes(student.id)} 
                        onChange={() => handleStudentToggle(student.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{student.studentName}</span>
                        <span className="text-xs text-gray-500">@{student.username} • {getRoleDisplayName(student.role)}</span>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekly Training Progress Update"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                  required
                />
              </div>

              {/* Category and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-900"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>

              {/* Content Field */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Write feedback that applies to all selected students. You can use general terms like 'your performance' or 'your technique'..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none text-gray-900"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  This feedback will be sent to all selected students. Keep it relevant to the group.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Sending to <span className="font-semibold text-indigo-600">{selectedStudentIds.length}</span> student{selectedStudentIds.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedStudentIds.length === 0}
                  className="px-6 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    'Send Feedback'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 