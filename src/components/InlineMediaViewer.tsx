import React from 'react';

interface InlineMediaViewerProps {
  actionId: string;
  mediaType: 'demo' | 'proof';
  fileName: string;
  fileSize?: number;
  mediaFileType: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function InlineMediaViewer({ 
  actionId, 
  mediaType, 
  fileName, 
  fileSize, 
  mediaFileType,
  isOpen,
  onClose,
  className 
}: InlineMediaViewerProps) {
  if (!isOpen) return null;

  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className || 'mt-4'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Media Viewer</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>
      <p className="text-sm text-gray-600">
        {mediaType} media: {fileName} ({mediaFileType})
      </p>
      {fileSize && <p className="text-xs text-gray-500">Size: {(fileSize / 1024).toFixed(2)} KB</p>}
      <div className="mt-2 p-8 bg-gray-200 rounded text-center">
        <p className="text-gray-500">Media preview not available</p>
      </div>
    </div>
  );
} 