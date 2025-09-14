import React from 'react';
import { FiX } from 'react-icons/fi';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AttendanceModal({ isOpen, onClose }: AttendanceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Attendance</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600">Attendance tracking functionality is currently being updated.</p>
      </div>
    </div>
  );
} 