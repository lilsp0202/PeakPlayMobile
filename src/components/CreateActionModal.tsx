"use client";

import { useState, useRef } from "react";

interface CreateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    studentName: string;
    username: string;
    age: number;
  };
  onCreated: () => void;
}

export default function CreateActionModal({ 
  isOpen, 
  onClose, 
  student, 
  onCreated
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const actionPayload = {
        studentId: student.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      };

      // Include demo media data if it was uploaded
      if (demoMedia.url && demoMedia.file) {
        actionPayload.demoMediaUrl = demoMedia.url;
        actionPayload.demoMediaType = demoMedia.type?.startsWith('image/') ? 'image' : 'video';
        actionPayload.demoFileName = demoMedia.fileName;
        actionPayload.demoUploadedAt = new Date().toISOString();
        actionPayload.demoFileSize = demoMedia.file.size;
        actionPayload.demoUploadMethod = 'optimized_upload';
        
        console.log('📎 Including demo media data in action creation:', {
          demoMediaType: actionPayload.demoMediaType,
          demoFileName: actionPayload.demoFileName,
          demoFileSize: actionPayload.demoFileSize,
          demoUploadMethod: actionPayload.demoUploadMethod
        });
      }

      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actionPayload),
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
        setDemoMedia({
          file: null,
          url: null,
          type: null,
          fileName: null
        });
        onCreated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create action');
      }
    } catch (error) {
      console.error('Error creating action:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024; // 100MB as requested by user
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi', 'image/jpeg', 'image/png', 'image/gif'];
    
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a video (MP4, WebM, MOV, AVI) or image (JPEG, PNG, GIF) file');
      return false;
    }
    
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setError('');

    try {
      console.log('📤 Starting demo media upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'demo');
      // Use 'temp' as actionId since we're uploading before action creation
      formData.append('actionId', 'temp');

      // Try the optimized upload endpoint first, fallback to regular endpoint
      const endpoints = [
        '/api/actions/demo-upload-optimized',
        '/api/actions/demo-upload'
      ];

      let uploadSuccess = false;
      let responseData = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying upload endpoint: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });

          console.log(`📊 Response status: ${response.status} for ${endpoint}`);
          
          if (response.ok) {
            responseData = await response.json();
            console.log('✅ Upload successful via', endpoint, responseData);
            uploadSuccess = true;
            break;
          } else {
            console.log(`❌ ${endpoint} failed with status ${response.status}`);
            
            // Try to get error details
            try {
              const errorDetails = await response.json();
              console.log('Error details:', errorDetails);
              
              // Handle specific error cases
              if (response.status === 401) {
                throw new Error('Please log in again to upload media.');
              } else if (response.status === 404) {
                throw new Error('Upload service not available. Please try again.');
              } else if (response.status === 413) {
                throw new Error('File too large. Please use a smaller file (max 100MB).');
              } else if (errorDetails.message) {
                // Use the server's error message if available
                console.log(`Server error: ${errorDetails.message}`);
              }
            } catch (parseError) {
              console.log('Could not parse error response');
            }
            
            if (response.status === 413) {
              throw new Error('File too large. Please use a smaller file (max 100MB).');
            }
          }
        } catch (endpointError) {
          console.log(`❌ Error with ${endpoint}:`, endpointError);
          
          // If this is a specific error (like authentication), don't continue to other endpoints
          if (endpointError instanceof Error && endpointError.message.includes('log in again')) {
            throw endpointError;
          }
          continue;
        }
      }

      if (!uploadSuccess) {
        throw new Error('Upload failed. Please check your connection and try again.');
      }

      // Extract the media data from response - handle both response formats
      const mediaData = responseData.mediaData || responseData;
      const mediaUrl = mediaData.demoMediaUrl || mediaData.url || responseData.url;
      
      if (!mediaUrl) {
        console.error('❌ No media URL in response:', responseData);
        throw new Error('Upload completed but media URL not found. Please try again.');
      }
      
      setDemoMedia({
        file,
        url: mediaUrl,
        type: file.type,
        fileName: file.name
      });

      console.log('✅ Demo media upload completed successfully');

    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload demo media. Please try again.');
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
    
    const file = e.dataTransfer.files[0];
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

  const getActionSuggestions = (category: string) => {
    switch (category) {
      case 'TECHNICAL':
        return [
          'Practice batting stance for 30 minutes daily',
          'Work on bowling accuracy with target practice',
          'Improve fielding technique with catching drills',
          'Focus on footwork and movement patterns'
        ];
      case 'MENTAL':
        return [
          'Practice visualization techniques before matches',
          'Work on breathing exercises for stress management',
          'Develop pre-match routine and rituals',
          'Practice positive self-talk and confidence building'
        ];
      case 'NUTRITIONAL':
        return [
          'Maintain proper hydration throughout the day',
          'Follow balanced meal plan for training days',
          'Include protein-rich foods in post-training meals',
          'Monitor energy levels and adjust nutrition accordingly'
        ];
      case 'TACTICAL':
        return [
          'Study opponent strategies and game plans',
          'Practice situational awareness during matches',
          'Work on decision-making under pressure',
          'Analyze match footage for tactical improvements'
        ];
      default:
        return [
          'Set specific performance goals for the week',
          'Maintain consistent training schedule',
          'Track progress and maintain training diary',
          'Focus on overall fitness and conditioning'
        ];
    }
  };

  const fillSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, title: suggestion }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Action</h2>
                <p className="text-white/80">Assign action to {student.studentName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="ml-3 text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Title Field */}
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
                  placeholder="Enter action title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                  required
                />
              </div>

              {/* Category, Priority, and Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                  >
                    <option value="GENERAL">Training</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="MENTAL">Mental</option>
                    <option value="NUTRITIONAL">Nutritional</option>
                    <option value="TACTICAL">Tactical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    placeholder="mm/dd/yyyy"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900"
                  />
                </div>
              </div>

              {/* Description Field */}
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
                  placeholder="Describe what the student needs to do..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 resize-none"
                  required
                />
              </div>

              {/* Demo Media Upload */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Media (Optional)</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Upload an image or video to show the student how this action should be performed. Images will be optimized, videos uploaded as-is.
                </p>
                
                {!demoMedia.file ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <div className="space-y-3">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      
                      <div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-orange-600 hover:text-orange-500 font-medium"
                        >
                          Click to upload
                        </button>
                        <span className="text-gray-500"> or drag and drop</span>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Images: JPEG, PNG, GIF • Videos: MP4, MOV, WebM, AVI • Max 100MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {demoMedia.type?.startsWith('image/') ? (
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{demoMedia.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {demoMedia.type?.startsWith('image/') ? 'Image' : 'Video'} • {Math.round((demoMedia.file?.size || 0) / 1024 / 1024 * 100) / 100}MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeDemoMedia}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading demo media...</span>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <form onSubmit={handleSubmit} className="flex-shrink-0 p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                  Assign to Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 