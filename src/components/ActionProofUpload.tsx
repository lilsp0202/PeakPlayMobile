"use client";
import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiVideo, FiCheck, FiClock } from 'react-icons/fi';

interface ActionProofUploadProps {
  actionId: string;
  onUploadSuccess: (proofData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function ActionProofUpload({ 
  actionId, 
  onUploadSuccess, 
  onClose, 
  isOpen 
}: ActionProofUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    time?: number;
    size?: string;
    compression?: string;
    mode?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only images (JPEG, PNG, GIF) and videos (MP4, MOV, WebM) are allowed');
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError('');
    setUploadProgress({});
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setUploadProgress({});

    try {
      console.log('🎯 Starting optimized proof upload for action:', actionId);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('actionId', actionId);

      // PERFORMANCE: Use optimized upload endpoint
      const response = await fetch('/api/actions/upload-optimized', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload successful:', data);
        
        // Update progress with performance metrics
        if (data.performance) {
          setUploadProgress({
            time: data.performance.uploadTime,
            size: data.performance.fileSize ? `${(data.performance.fileSize / 1024).toFixed(2)}KB` : undefined,
            compression: data.performance.compressionRatio,
            mode: data.performance.mode || 'optimized'
          });
        }

        // Call success callback with action data
        onUploadSuccess(data.action);
        
        // Auto-close after 1 second to show success feedback
        setTimeout(() => {
          setSelectedFile(null);
          setUploadProgress({});
          onClose();
        }, 1500);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Upload failed:', errorData);
        setError(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError('Network error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FiImage className="w-8 h-8 text-blue-500" />;
    if (file.type.startsWith('video/')) return <FiVideo className="w-8 h-8 text-purple-500" />;
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Upload Action Proof</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Upload Progress Display */}
          {uploadProgress.time && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              <div className="flex items-center mb-2">
                <FiCheck className="w-4 h-4 mr-2" />
                <span className="font-medium">Upload Successful!</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center">
                  <FiClock className="w-3 h-3 mr-2" />
                  Upload time: {uploadProgress.time}ms
                </div>
                {uploadProgress.size && (
                  <div>Optimized size: {uploadProgress.size}</div>
                )}
                {uploadProgress.compression && (
                  <div>Compression: {uploadProgress.compression} smaller</div>
                )}
                {uploadProgress.mode && (
                  <div>Mode: {uploadProgress.mode === 'optimized' ? '🚀 Optimized Storage' : '📦 Fallback Storage'}</div>
                )}
              </div>
            </div>
          )}

          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drop your proof file here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Images (JPG, PNG, GIF) or Videos (MP4, MOV, WebM)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maximum file size: 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept="image/*,video/*"
                className="hidden"
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                {getFileIcon(selectedFile)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!uploading && !uploadProgress.time && (
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError('');
                      setUploadProgress({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!uploadProgress.time && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FiUpload className="w-4 h-4 mr-2" />
                        Upload Proof
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError('');
                      setUploadProgress({});
                    }}
                    disabled={uploading}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>💡 <strong>Tip:</strong> Images will be automatically optimized for faster loading. Videos are uploaded as-is.</p>
            {selectedFile && selectedFile.type.startsWith('image/') && selectedFile.size > 5 * 1024 * 1024 && (
              <p className="mt-1 text-blue-600">🚀 Large image detected - will be compressed for optimal performance.</p>
            )}
            {selectedFile && selectedFile.type.startsWith('video/') && (
              <p className="mt-1 text-purple-600">🎥 Video file - will be uploaded without compression.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 