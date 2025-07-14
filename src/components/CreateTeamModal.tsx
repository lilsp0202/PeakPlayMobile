"use client";

// Team Creation Modal Component - Updated for Vercel deployment - Active
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUsers, 
  FiPlus, 
  FiCheck, 
  FiLoader,
  FiUser
} from 'react-icons/fi';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
  availableStudents: any[];
  onCreateTeam: (teamData: any) => Promise<void>;
}

export default function CreateTeamModal({ 
  isOpen, 
  onClose, 
  onTeamCreated, 
  availableStudents, 
  onCreateTeam 
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setTeamName('');
      setTeamDescription('');
      setSelectedStudents([]);
      setError('');
    }
  }, [isOpen]);

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }
    
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      await onCreateTeam({
        name: teamName.trim(),
        description: teamDescription.trim(),
        memberIds: selectedStudents
      });
      
      onTeamCreated();
      onClose();
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FiPlus className="text-blue-600" />
                  Create New Team
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter team name"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    disabled={isCreating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="Enter team description (optional)"
                    rows={3}
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Students *
                  </label>
                  <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                    {availableStudents.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">
                        No students available to add to team
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {availableStudents.map((student) => (
                          <div
                            key={student.id}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${
                              selectedStudents.includes(student.id)
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                            onClick={() => handleStudentToggle(student.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <FiUser className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {student.studentName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                              {selectedStudents.includes(student.id) && (
                                <FiCheck className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedStudents.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !teamName.trim() || selectedStudents.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-4 h-4" />
                        Create Team
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 