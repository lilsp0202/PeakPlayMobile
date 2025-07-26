"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiUser, 
  FiUsers,
  FiStar, 
  FiAward,
  FiLoader
} from 'react-icons/fi';
import { Team, TeamMember, TeamRole, ROLE_COLORS, ROLE_DISPLAY_NAMES } from '@/types/team';

interface ViewTeamRolesModalProps {
  team: any;
  onClose: () => void;
}

const ViewTeamRolesModal: React.FC<ViewTeamRolesModalProps> = ({ team, onClose }) => {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamRoles();
  }, [team.id]);

  const fetchTeamRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/teams/${team.id}/roles`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team roles');
      }

      const data = await response.json();
      setTeamData(data.team);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load team roles');
      console.error('Error fetching team roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const RoleBadge: React.FC<{ role: TeamRole }> = ({ role }) => {
    const colors = ROLE_COLORS[role];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
        {role === 'CAPTAIN' && <FiStar className="w-3 h-3 mr-1" />}
        {role === 'VICE_CAPTAIN' && <FiAward className="w-3 h-3 mr-1" />}
        {ROLE_DISPLAY_NAMES[role]}
      </span>
    );
  };

  const MemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4"
    >
      <div className="flex items-start space-x-3">
        <div className="relative flex-shrink-0">
          {member.student.user?.image ? (
            <img
              src={member.student.user.image}
              alt={member.student.studentName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {member.student.studentName}
          </h4>
          <p className="text-gray-500 text-xs sm:text-sm truncate">
            {member.student.email}
          </p>
          <div className="mt-2">
            {member.roles && member.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {member.roles.map((role, index) => (
                  <RoleBadge key={index} role={role} />
                ))}
              </div>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                No role assigned
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Group members by roles for better organization
  const membersByRole = teamData?.members?.reduce((acc, member) => {
    if (!member.roles || member.roles.length === 0) {
      if (!acc['UNASSIGNED']) acc['UNASSIGNED'] = [];
      acc['UNASSIGNED'].push(member);
    } else {
      member.roles.forEach(role => {
        if (!acc[role]) acc[role] = [];
        acc[role].push(member);
      });
    }
    return acc;
  }, {} as Record<TeamRole | 'UNASSIGNED', TeamMember[]>) || {};

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
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    {team.name}
                  </h2>
                  <p className="text-gray-500 text-sm truncate">Team Roles & Members</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
            <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FiLoader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading team roles...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <FiX className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Failed to load team roles</p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={fetchTeamRoles}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : teamData?.members && teamData.members.length > 0 ? (
                <div className="space-y-6">
                  {/* Leadership Roles */}
                  {(membersByRole['CAPTAIN'] || membersByRole['VICE_CAPTAIN']) && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiStar className="w-5 h-5 text-yellow-500 mr-2" />
                        Leadership
                      </h3>
                      <div className="space-y-3">
                        {membersByRole['CAPTAIN']?.map((member, index) => (
                          <MemberCard key={`captain-${index}`} member={member} />
                        ))}
                        {membersByRole['VICE_CAPTAIN']?.map((member, index) => (
                          <MemberCard key={`vice-captain-${index}`} member={member} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playing Positions */}
                  {Object.entries(membersByRole).some(([role]) => 
                    !['CAPTAIN', 'VICE_CAPTAIN', 'UNASSIGNED'].includes(role)
                  ) && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUsers className="w-5 h-5 text-blue-500 mr-2" />
                        Playing Positions
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(membersByRole)
                          .filter(([role]) => !['CAPTAIN', 'VICE_CAPTAIN', 'UNASSIGNED'].includes(role))
                          .map(([role, members]) => 
                            (members as TeamMember[]).map((member, index) => (
                              <MemberCard key={`${role}-${index}`} member={member} />
                            ))
                          )}
                      </div>
                    </div>
                  )}

                  {/* Unassigned Members */}
                  {membersByRole['UNASSIGNED'] && membersByRole['UNASSIGNED'].length > 0 && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="w-5 h-5 text-gray-500 mr-2" />
                        No Role Assigned
                      </h3>
                      <div className="space-y-3">
                        {membersByRole['UNASSIGNED'].map((member, index) => (
                          <MemberCard key={`unassigned-${index}`} member={member} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Team Members</h3>
                  <p className="text-gray-500">This team doesn't have any members yet.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewTeamRolesModal; 