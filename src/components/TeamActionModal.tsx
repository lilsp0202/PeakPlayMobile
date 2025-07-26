"use client";

import React, { useState, useRef } from 'react';
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
  
  // Demo media state
  const [demoMedia, setDemoMedia] = useState<{
    file: File | null;
    url: string | null;
    type: string | null;
    fileName: string | null;
  }>({
    file: null,
    url: null,
    type: null,
    fileName: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAction({
        ...formData,
        demoMediaUrl: demoMedia.url,
        demoMediaType: demoMedia.type,
        demoFileName: demoMedia.fileName,
        demoUploadedAt: demoMedia.url ? new Date().toISOString() : null
      });
      setFormData({
        title: '',
        description: '',
        category: 'TRAINING',
        priority: 'MEDIUM',
        dueDate: ''
      });
      setDemoMedia({
        file: null,
        url: null,
        type: null,
        fileName: null
      });
      onClose();
    } catch (error) {
      console.error('Error creating team action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo media handlers
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(file.type)) {
      console.error('Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM) are allowed');
      return false;
    }
    
    if (file.size > maxSize) {
      console.error('File size must be less than 50MB');
      return false;
    }
    
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);

    try {
      // Upload to demo upload API
      const formData = new FormData();
      formData.append('file', file);

      // PERFORMANCE: Use optimized demo upload endpoint
      // Use Vercel-specific endpoint if deployed on Vercel
      const isVercel = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname === 'www.peakplayai.com' ||
                       window.location.hostname === 'peakplayai.com';
      
      const uploadEndpoint = isVercel && file.size > 4 * 1024 * 1024 
        ? '/api/actions/demo-upload-vercel'
        : '/api/actions/demo-upload-optimized';
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setDemoMedia({
          file,
          url: data.mediaData.demoMediaUrl,
          type: data.mediaData.demoMediaType,
          fileName: data.mediaData.demoFileName
        });
      } else {
        const errorData = await response.json();
        console.error(errorData.message || 'Failed to upload demo media');
      }
    } catch (error) {
      console.error('Failed to upload media. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeDemoMedia = () => {
    setDemoMedia({
      file: null,
      url: null,
      type: null,
      fileName: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

          {/* Demo Media Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demo Media (Optional)
            </label>
                              <p className="text-xs text-gray-600 mb-3">
                    Upload an image or video to show the team how this action should be performed. Images will be optimized, videos uploaded as-is.
                  </p>
            
            {!demoMedia.url ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={isSubmitting}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-600">Uploading demo media...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-base text-gray-600">
                        <span className="font-medium text-orange-600 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          Click to upload
                        </span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images: JPEG, PNG, GIF • Videos: MP4, MOV, WebM • Max 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {demoMedia.type === 'image' ? (
                      <img
                        src={demoMedia.url}
                        alt="Demo preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={demoMedia.url}
                        className="w-20 h-20 object-cover rounded-lg"
                        controls
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {demoMedia.fileName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {demoMedia.type === 'image' ? 'Image' : 'Video'} uploaded successfully
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Team members will see this demo when viewing the action
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeDemoMedia}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isSubmitting}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
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