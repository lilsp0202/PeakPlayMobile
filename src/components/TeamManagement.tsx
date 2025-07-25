"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiSearch, FiEdit2, FiUser, FiStar, FiAward, FiMail, FiBook, FiAlertCircle } from 'react-icons/fi';
import BatchRoleAssignmentModal from './BatchRoleAssignmentModal';
import { Team, TeamMember, TeamRole, ROLE_COLORS, ROLE_DISPLAY_NAMES } from '@/types/team';

interface TeamManagementProps {
  teams: Team[];
  onTeamsUpdate: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ teams, onTeamsUpdate }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<TeamRole | 'ALL' | 'UNASSIGNED'>('ALL');
  const [isBatchRoleModalOpen, setIsBatchRoleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-select the first team if only one team is provided (single team modal)
  useEffect(() => {
    if (teams.length === 1 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams, selectedTeam]);

  // Filter members based on search term and role filter
  const filteredMembers = selectedTeam?.members?.filter(member => {
    const matchesSearch = member.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter === 'UNASSIGNED') {
      matchesRole = !member.roles || member.roles.length === 0;
    } else if (roleFilter !== 'ALL') {
      matchesRole = member.roles && member.roles.includes(roleFilter as TeamRole);
    }
    
    return matchesSearch && matchesRole;
  }) || [];

  // Group members by role for easy visualization
  const membersByRole = filteredMembers.reduce((acc, member) => {
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
  }, {} as Record<TeamRole | 'UNASSIGNED', TeamMember[]>);

  const handleOpenBatchRoleAssignment = () => {
    setIsBatchRoleModalOpen(true);
  };

  const handleBatchRoleUpdate = async () => {
    setIsBatchRoleModalOpen(false);
    onTeamsUpdate();
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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
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
            {member.roles && member.roles.includes('CAPTAIN' as any) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <FiStar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-800" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{member.student.studentName}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="flex items-center truncate">
                <FiMail className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{member.student.email}</span>
              </span>
              <span className="flex items-center">
                <FiBook className="w-3 h-3 mr-1 flex-shrink-0" />
                {member.student.academy}
              </span>
            </div>
            
            {/* Roles */}
            <div className="flex flex-wrap gap-1 mt-2">
              {member.roles && member.roles.length > 0 ? (
                member.roles.map((role, index) => (
                  <RoleBadge key={index} role={role} />
                ))
              ) : (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                  <FiAlertCircle className="w-3 h-3 mr-1" />
                  No roles assigned
                </div>
              )}
            </div>
          </div>
        </div>
        

      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Team Selector - Only show if multiple teams */}
      {teams.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Select Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {teams.map((team) => (
              <motion.button
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTeam?.id === team.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{team.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{team.description}</p>
                <div className="flex items-center justify-between mt-2 sm:mt-3">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {team.members?.length || 0} members
                  </span>
                  <FiUsers className="w-4 h-4 text-gray-400" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Management */}
      {selectedTeam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{selectedTeam.name}</h3>
              <p className="text-sm text-gray-500">
                {filteredMembers.length} of {selectedTeam.members?.length || 0} members
                {roleFilter !== 'ALL' && ` • Filtered by ${roleFilter === 'UNASSIGNED' ? 'Unassigned' : ROLE_DISPLAY_NAMES[roleFilter as TeamRole]}`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Unassigned roles alert */}
              {selectedTeam.members?.some(m => !m.roles || m.roles.length === 0) && (
                <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Some members need role assignment</span>
                  <span className="sm:hidden">Roles needed</span>
                </div>
              )}
              
              {/* Batch Role Assignment Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenBatchRoleAssignment}
                className="flex items-center px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
              >
                <FiEdit2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Assign Roles</span>
                <span className="sm:hidden">Roles</span>
              </motion.button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as TeamRole | 'ALL' | 'UNASSIGNED')}
              className="px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm min-w-0 sm:min-w-[140px]"
            >
              <option value="ALL">All Members</option>
              <option value="UNASSIGNED">Unassigned</option>
              {Object.values(TeamRole).map((role) => (
                <option key={role} value={role}>
                  {ROLE_DISPLAY_NAMES[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                {searchTerm || roleFilter !== 'ALL' 
                  ? 'No members match your search criteria.' 
                  : 'No members in this team yet.'
                }
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
            >
              <AnimatePresence>
                {filteredMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Role Summary */}
          {selectedTeam.members && selectedTeam.members.length > 0 && (
            <div className="mt-6 sm:mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Team Composition</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Unassigned count */}
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    {membersByRole['UNASSIGNED']?.length || 0}
                  </div>
                  <p className="text-xs text-gray-600">Unassigned</p>
                </div>
                
                {Object.values(TeamRole).map((role) => {
                  const count = membersByRole[role]?.length || 0;
                  const colors = ROLE_COLORS[role];
                  return (
                    <div key={role} className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium ${colors?.bg} ${colors?.text} ${colors?.border} border`}>
                        {count}
                      </div>
                      <p className="text-xs text-gray-600 truncate">{ROLE_DISPLAY_NAMES[role]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Batch Role Assignment Modal */}
      {isBatchRoleModalOpen && selectedTeam && (
        <BatchRoleAssignmentModal
          team={selectedTeam}
          isOpen={isBatchRoleModalOpen}
          onClose={() => setIsBatchRoleModalOpen(false)}
          onSuccess={handleBatchRoleUpdate}
        />
      )}
    </div>
  );
};

export default TeamManagement; 