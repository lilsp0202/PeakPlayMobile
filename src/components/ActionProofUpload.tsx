"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiImage, FiVideo, FiX, FiCheck } from 'react-icons/fi';

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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('actionId', actionId);

      const response = await fetch('/api/actions/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploadSuccess(data.action);
        setSelectedFile(null);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Upload failed');
      }
    } catch (error) {
      setError('An error occurred during upload');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Upload Proof</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : selectedFile 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                {getFileIcon(selectedFile)}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FiUpload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Upload your completion proof
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop or click to select
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Choose File
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* File Type Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Supported formats:</strong> Images (JPEG, PNG, GIF) and Videos (MP4, MOV, WebM)
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <strong>Maximum size:</strong> 50MB
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                Upload Proof
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 