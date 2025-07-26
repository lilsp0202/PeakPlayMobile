"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiSave, 
  FiCheck, 
  FiUser, 
  FiUsers, 
  FiStar, 
  FiAward, 
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiRotateCcw
} from 'react-icons/fi';
import { Team, TeamMember, TeamRole, ROLE_COLORS, ROLE_DISPLAY_NAMES } from '@/types/team';

interface BatchRoleAssignmentModalProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PendingRoleUpdate {
  studentId: string;
  roles: TeamRole[];
  studentName: string;
  hasChanges: boolean;
}

const BatchRoleAssignmentModal: React.FC<BatchRoleAssignmentModalProps> = ({
  team,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, PendingRoleUpdate>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize pending updates when modal opens or team changes
  useEffect(() => {
    if (isOpen && team?.members) {
      const initialUpdates: Record<string, PendingRoleUpdate> = {};
      team.members.forEach(member => {
        initialUpdates[member.studentId] = {
          studentId: member.studentId,
          roles: [...(member.roles || [])],
          studentName: member.student.studentName,
          hasChanges: false
        };
      });
      setPendingUpdates(initialUpdates);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, team]);

  // Filter members based on search
  const filteredMembers = team?.members?.filter(member =>
    member.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Check if there are any pending changes
  const hasPendingChanges = Object.values(pendingUpdates).some(update => update.hasChanges);

  // Get pending changes count
  const pendingChangesCount = Object.values(pendingUpdates).filter(update => update.hasChanges).length;

  // Validate roles across all pending updates
  const validateAllRoles = useCallback((): string | null => {
    const allUpdates = Object.values(pendingUpdates);
    
    // Check for multiple captains
    const captains = allUpdates.filter(update => update.roles.includes(TeamRole.CAPTAIN));
    if (captains.length > 1) {
      return `Multiple captains selected: ${captains.map(c => c.studentName).join(', ')}`;
    }

    // Check for multiple vice captains
    const viceCaptains = allUpdates.filter(update => update.roles.includes(TeamRole.VICE_CAPTAIN));
    if (viceCaptains.length > 1) {
      return `Multiple vice captains selected: ${viceCaptains.map(c => c.studentName).join(', ')}`;
    }

    return null;
  }, [pendingUpdates]);

  const handleRoleToggle = (studentId: string, role: TeamRole) => {
    setPendingUpdates(prev => {
      const current = prev[studentId];
      if (!current) return prev;

      const newRoles = current.roles.includes(role)
        ? current.roles.filter(r => r !== role)
        : [...current.roles, role];

      const originalRoles = team.members?.find(m => m.studentId === studentId)?.roles || [];
      const hasChanges = JSON.stringify(newRoles.sort()) !== JSON.stringify(originalRoles.sort());

      return {
        ...prev,
        [studentId]: {
          ...current,
          roles: newRoles,
          hasChanges
        }
      };
    });
    setError(null);
  };

  const handleBulkRoleAssign = (role: TeamRole, selectedStudentIds: string[]) => {
    setPendingUpdates(prev => {
      const newUpdates = { ...prev };
      
      selectedStudentIds.forEach(studentId => {
        if (newUpdates[studentId]) {
          const currentRoles = newUpdates[studentId].roles;
          const newRoles = currentRoles.includes(role) 
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role];

          const originalRoles = team.members?.find(m => m.studentId === studentId)?.roles || [];
          const hasChanges = JSON.stringify(newRoles.sort()) !== JSON.stringify(originalRoles.sort());

          newUpdates[studentId] = {
            ...newUpdates[studentId],
            roles: newRoles,
            hasChanges
          };
        }
      });
      
      return newUpdates;
    });
  };

  const handleResetMember = (studentId: string) => {
    setPendingUpdates(prev => {
      const originalRoles = team.members?.find(m => m.studentId === studentId)?.roles || [];
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          roles: [...originalRoles],
          hasChanges: false
        }
      };
    });
  };

  const handleResetAll = () => {
    setPendingUpdates(prev => {
      const resetUpdates: Record<string, PendingRoleUpdate> = {};
      Object.keys(prev).forEach(studentId => {
        const originalRoles = team.members?.find(m => m.studentId === studentId)?.roles || [];
        resetUpdates[studentId] = {
          ...prev[studentId],
          roles: [...originalRoles],
          hasChanges: false
        };
      });
      return resetUpdates;
    });
    setError(null);
  };

  const handleSaveAll = async () => {
    const validationError = validateAllRoles();
    if (validationError) {
      setError(validationError);
      return;
    }

    const changedUpdates = Object.values(pendingUpdates)
      .filter(update => update.hasChanges)
      .map(update => ({
        studentId: update.studentId,
        roles: update.roles
      }));

    if (changedUpdates.length === 0) {
      setError('No changes to save');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/teams/${team.id}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleUpdates: changedUpdates
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update roles');
      }

      setSuccess(`Successfully updated roles for ${data.updatedCount} team members!`);
      
      // Reset all hasChanges flags
      setPendingUpdates(prev => {
        const resetUpdates = { ...prev };
        Object.keys(resetUpdates).forEach(studentId => {
          resetUpdates[studentId].hasChanges = false;
        });
        return resetUpdates;
      });

      // Call success callback after a brief delay to show success message
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const RoleBadge: React.FC<{ role: TeamRole; isSelected: boolean; onClick: () => void }> = ({ 
    role, 
    isSelected, 
    onClick 
  }) => {
    const colors = ROLE_COLORS[role];
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-all
          ${isSelected 
            ? `${colors.bg} ${colors.text} ${colors.border} ring-2 ring-blue-300` 
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
          }
        `}
      >
        {role === TeamRole.CAPTAIN && <FiStar className="w-3 h-3 mr-1" />}
        {role === TeamRole.VICE_CAPTAIN && <FiAward className="w-3 h-3 mr-1" />}
        {isSelected && <FiCheck className="w-3 h-3 mr-1" />}
        {ROLE_DISPLAY_NAMES[role]}
      </motion.button>
    );
  };

  const MemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
    const pendingUpdate = pendingUpdates[member.studentId];
    if (!pendingUpdate) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-white rounded-xl shadow-sm border p-4 transition-all
          ${pendingUpdate.hasChanges 
            ? 'border-blue-300 bg-blue-50/50 ring-1 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">{member.student.studentName}</h4>
              <p className="text-gray-500 text-xs">{member.student.email}</p>
            </div>
          </div>
          
          {pendingUpdate.hasChanges && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                <FiCheckCircle className="w-3 h-3 mr-1" />
                Modified
              </span>
              <button
                onClick={() => handleResetMember(member.studentId)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Reset changes"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Roles:</p>
            <div className="flex flex-wrap gap-2">
              {Object.values(TeamRole).map(role => (
                <RoleBadge
                  key={role}
                  role={role}
                  isSelected={pendingUpdate.roles.includes(role)}
                  onClick={() => handleRoleToggle(member.studentId, role)}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                  <FiUsers className="w-6 h-6 mr-3 text-purple-600" />
                  Assign Team Roles
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {team.name} • {filteredMembers.length} members
                  {hasPendingChanges && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      {pendingChangesCount} pending change{pendingChangesCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-[calc(95vh-140px)] sm:h-[calc(90vh-160px)]">
            {/* Search and Actions Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-100 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {hasPendingChanges && (
                  <button
                    onClick={handleResetAll}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiRotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No team members found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredMembers.map(member => (
                    <MemberCard key={member.studentId} member={member} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
              {/* Status Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center"
                >
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{success}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="text-sm text-gray-600">
                  {hasPendingChanges 
                    ? `${pendingChangesCount} member${pendingChangesCount !== 1 ? 's' : ''} with pending changes`
                    : 'No pending changes'
                  }
                </div>

                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 sm:flex-none px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={loading || !hasPendingChanges}
                    className="flex-1 sm:flex-none px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        Save All Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchRoleAssignmentModal; 