"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiSave, 
  FiUser, 
  FiStar, 
  FiAward,
  FiCheckSquare,
  FiSquare,
  FiAlertCircle 
} from 'react-icons/fi';
import { Team, TeamMember, TeamRole, ROLE_COLORS, ROLE_DISPLAY_NAMES } from '@/types/team';

interface RoleEditModalProps {
  member: TeamMember;
  team: Team;
  onClose: () => void;
  onSuccess: () => void;
}

const RoleEditModal: React.FC<RoleEditModalProps> = ({ member, team, onClose, onSuccess }) => {
  const [selectedRoles, setSelectedRoles] = useState<TeamRole[]>(member.roles || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = (role: TeamRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
    setError(null);
  };

  const validateRoles = (roles: TeamRole[]): string | null => {
    // Check for multiple leadership roles
    const hasMultipleLeadershipRoles = roles.filter(role => 
      role === TeamRole.CAPTAIN || role === TeamRole.VICE_CAPTAIN
    ).length > 1;

    if (hasMultipleLeadershipRoles) {
      return "A player cannot be both Captain and Vice Captain";
    }

    // Check for conflicting playing positions
    const playingRoles = roles.filter(role => 
      role !== TeamRole.CAPTAIN && role !== TeamRole.VICE_CAPTAIN
    );

    if (playingRoles.length > 2) {
      return "A player can have maximum 2 playing positions";
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateRoles(selectedRoles);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${team.id}/roles`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: member.studentId,
          roles: selectedRoles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update roles');
      }

      onSuccess();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const RoleOption: React.FC<{ role: TeamRole }> = ({ role }) => {
    const isSelected = selectedRoles.includes(role);
    const colors = ROLE_COLORS[role];
    
    return (
      <motion.button
        onClick={() => handleRoleToggle(role)}
        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-left min-h-[60px] sm:min-h-[auto] ${
          isSelected 
            ? `${colors.bg} ${colors.border} border-opacity-50` 
            : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isSelected ? `${colors.bg} ${colors.text}` : 'bg-gray-100 text-gray-400'
            }`}>
              {role === TeamRole.CAPTAIN && <FiStar className="w-4 h-4" />}
              {role === TeamRole.VICE_CAPTAIN && <FiAward className="w-4 h-4" />}
              {role !== TeamRole.CAPTAIN && role !== TeamRole.VICE_CAPTAIN && <FiUser className="w-4 h-4" />}
            </div>
            
            <div className="min-w-0">
              <h4 className={`font-medium text-sm sm:text-base ${isSelected ? colors.text : 'text-gray-900'}`}>
                {ROLE_DISPLAY_NAMES[role]}
              </h4>
              <p className={`text-xs sm:text-sm ${isSelected ? colors.text : 'text-gray-500'} truncate`}>
                {getRoleDescription(role)}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            {isSelected ? (
              <FiCheckSquare className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <FiSquare className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  const getRoleDescription = (role: TeamRole): string => {
    const descriptions = {
      [TeamRole.CAPTAIN]: 'Team leader, on-field decision maker',
      [TeamRole.VICE_CAPTAIN]: 'Deputy leader, supports captain',
      [TeamRole.BATSMAN]: 'Specialist in batting skills',
      [TeamRole.ALL_ROUNDER]: 'Skilled in both batting and bowling',
      [TeamRole.BATTING_ALL_ROUNDER]: 'Batting specialist with bowling ability',
      [TeamRole.BOWLING_ALL_ROUNDER]: 'Bowling specialist with batting ability',
      [TeamRole.BOWLER]: 'Specialist in bowling skills',
      [TeamRole.WICKET_KEEPER]: 'Behind the stumps, key fielding position'
    };
    return descriptions[role];
  };

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
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {member.student.user?.image ? (
                  <img
                    src={member.student.user.image}
                    alt={member.student.studentName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {member.student.studentName}
                  </h2>
                  <p className="text-gray-500 text-sm truncate">Assign team roles</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Leadership Roles */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Leadership Roles</h3>
              <div className="space-y-2 sm:space-y-3">
                <RoleOption role={TeamRole.CAPTAIN} />
                <RoleOption role={TeamRole.VICE_CAPTAIN} />
              </div>
            </div>

            {/* Playing Positions */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Playing Positions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <RoleOption role={TeamRole.BATSMAN} />
                <RoleOption role={TeamRole.ALL_ROUNDER} />
                <RoleOption role={TeamRole.BATTING_ALL_ROUNDER} />
                <RoleOption role={TeamRole.BOWLING_ALL_ROUNDER} />
                <RoleOption role={TeamRole.BOWLER} />
                <RoleOption role={TeamRole.WICKET_KEEPER} />
              </div>
            </div>

            {/* Selected Roles Summary */}
            {selectedRoles.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">Selected Roles:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRoles.map((role, index) => {
                    const colors = ROLE_COLORS[role];
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                      >
                        {role === TeamRole.CAPTAIN && <FiStar className="w-3 h-3 mr-1" />}
                        {role === TeamRole.VICE_CAPTAIN && <FiAward className="w-3 h-3 mr-1" />}
                        {ROLE_DISPLAY_NAMES[role]}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3 sm:gap-0">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors order-2 sm:order-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 order-1 sm:order-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleEditModal; 