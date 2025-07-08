"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiX, FiSave, FiEdit, FiMail, FiPhone, FiLock, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  sport?: string;
  academy?: string;
  role: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  // Sport options
  const sportOptions = [
    'CRICKET',
    'FOOTBALL',
    'BASKETBALL',
    'TENNIS',
    'SWIMMING',
    'ATHLETICS',
    'BADMINTON',
    'HOCKEY',
    'VOLLEYBALL',
    'OTHER'
  ];

  // Academy options - Remove "Not specified" to force proper selection
  const academyOptions = [
    'Transform',
    'Elite Sports Academy',
    'Champion Academy',
    'Victory Sports',
    'Peak Performance',
    'Excel Academy',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfileData(data);
      setFormData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Validate academy before saving
    if (!formData.academy || formData.academy === 'Not specified' || formData.academy.trim() === '') {
      setError('Please select a valid academy before saving');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);
      setFormData(updatedData);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-2xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h2>
              <p className="text-xs sm:text-sm text-gray-600">Manage your personal information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
              >
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-700 text-sm break-words">{error}</span>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2"
              >
                <FiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-green-700 text-sm break-words">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-6">
              {/* Profile Summary Card - Mobile-friendly */}
              {!isEditing && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-purple-200 mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{profileData?.name || 'Not specified'}</h3>
                      <p className="text-xs sm:text-sm text-purple-600 capitalize">{profileData?.role?.toLowerCase() || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">🏛️</span>
                      <span className="text-gray-700">Academy:</span>
                      <span className="font-medium text-purple-700">{profileData?.academy || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">🏏</span>
                      <span className="text-gray-700">Sport:</span>
                      <span className="font-medium text-blue-700">{profileData?.sport || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Form */}
              <div className="grid grid-cols-1 gap-3 sm:gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                        isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      disabled={true}
                      className="w-full pl-10 pr-10 py-3 border rounded-lg bg-gray-50 text-gray-500 text-sm sm:text-base"
                      placeholder="Email address"
                    />
                    <FiLock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                        isEditing ? 'bg-white' : 'bg-gray-50'
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Sport Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport
                  </label>
                  <select
                    value={formData.sport || ''}
                    onChange={(e) => handleInputChange('sport', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                      isEditing ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <option value="">Select sport</option>
                    {sportOptions.map((sport) => (
                      <option key={sport} value={sport}>
                        {sport.charAt(0) + sport.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academy Field - IMPORTANT for coach-athlete relationships */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      <span className="mr-1">🏛️</span>
                      Academy
                      <span className="ml-2 text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">Important</span>
                    </span>
                  </label>
                  <select
                    value={formData.academy || ''}
                    onChange={(e) => handleInputChange('academy', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base ${
                      isEditing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <option value="">Select academy</option>
                    {academyOptions.map((academy) => (
                      <option key={academy} value={academy}>
                        {academy}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <span className="mr-1">ℹ️</span>
                    Coaches can only view athletes from their academy
                  </p>
                </div>
              </div>

              {/* Role Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Role:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                    {profileData?.role?.toLowerCase() || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-200 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {!isEditing ? (
              <motion.button
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
                <motion.button
                  onClick={handleCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                >
                  <FiX className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors w-full sm:w-auto text-center"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal; 