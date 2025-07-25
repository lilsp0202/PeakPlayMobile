"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiCheckSquare, 
  FiUser, 
  FiClock, 
  FiArrowRight
} from 'react-icons/fi';
import TeamModal from './TeamModal';
import ViewTeamRolesModal from './ViewTeamRolesModal';

interface AthleteTeamsProps {
  studentId?: string;
}

export default function AthleteTeams({ studentId }: AthleteTeamsProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [teamFeedback, setTeamFeedback] = useState<any[]>([]);
  const [teamActions, setTeamActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeamForRoles, setSelectedTeamForRoles] = useState<any>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      console.log('🏈 Fetching team data...');
      
      // OPTIMIZED: Remove timeout and use optimized request handling
      // Fetch teams that the student is a member of (now cached server-side)
      const teamsResponse = await fetch('/api/teams?includeMembers=true&includeStats=true', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        console.log(`✅ Teams fetched: ${teamsData.teams?.length || 0} teams`);
        setTeams(teamsData.teams || []);
      } else {
        throw new Error(`Teams API error: ${teamsResponse.status}`);
      }

      // Small delay before feedback request to prevent connection pool exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch feedback with team information (now cached server-side)
      const feedbackResponse = await fetch('/api/feedback', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        // Handle API response format (may return array directly or object with data property)
        const feedback = Array.isArray(feedbackData) ? feedbackData : (feedbackData.data || feedbackData || []);
        const teamRelatedFeedback = feedback.filter((item: any) => item.team);
        setTeamFeedback(teamRelatedFeedback);
      }

      // Fetch actions with team information
      const actionsController = new AbortController();
      const actionsResponse = await fetch('/api/actions', {
        signal: actionsController.signal,
      });
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        // Handle new API response format for athletes
        const actions = actionsData.actions || actionsData || [];
        const teamRelatedActions = actions.filter((item: any) => item.team);
        setTeamActions(teamRelatedActions);
      }

    } catch (error) {
      console.error('Error fetching team data:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Team data fetch timeout - continuing with cached data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (itemId: string, type: 'feedback' | 'actions') => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const endpoint = type === 'feedback' ? '/api/feedback' : '/api/actions';
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [type === 'feedback' ? 'feedbackId' : 'actionId']: itemId, 
          isAcknowledged: true 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        fetchTeamData(); // Refresh data
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to acknowledge ${type}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error acknowledging item:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timeout. Please check your connection and try again.');
      } else {
        alert(`Failed to acknowledge ${type}. Please try again.`);
      }
    }
  };

  const handleComplete = async (actionId: string) => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actionId, 
          isCompleted: true 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        fetchTeamData(); // Refresh data
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to complete action: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error completing action:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timeout. Please check your connection and try again.');
      } else {
        alert('Failed to complete action. Please try again.');
      }
    }
  };

  const getTeamStats = (teamId: string) => {
    const teamFeedbackItems = teamFeedback.filter(item => item.team?.id === teamId);
    const teamActionItems = teamActions.filter(item => item.team?.id === teamId);
    
    return {
      totalFeedback: teamFeedbackItems.length,
      acknowledgedFeedback: teamFeedbackItems.filter(item => item.isAcknowledged).length,
      totalActions: teamActionItems.length,
      completedActions: teamActionItems.filter(item => item.isCompleted).length,
      pendingItems: [
        ...teamFeedbackItems.filter(item => !item.isAcknowledged),
        ...teamActionItems.filter(item => !item.isCompleted)
      ].length
    };
  };

  const getTeamFeedback = (teamId: string) => {
    return teamFeedback.filter(item => item.team?.id === teamId);
  };

  const getTeamActions = (teamId: string) => {
    return teamActions.filter(item => item.team?.id === teamId);
  };

  const handleTeamClick = (team: any) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  const handleViewTeamRoles = (team: any) => {
    setSelectedTeamForRoles(team);
    setIsRolesModalOpen(true);
  };

  const handleCloseRolesModal = () => {
    setIsRolesModalOpen(false);
    setSelectedTeamForRoles(null);
  };

  const renderTeamsList = () => (
    <div className="space-y-3">
      {teams.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 px-4"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FiUsers className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">No Teams Yet</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            You haven't been added to any teams yet. Once your coach adds you to a team, you'll see it here!
          </p>
        </motion.div>
      ) : (
        teams.map((team, index) => {
          const stats = getTeamStats(team.id);
          
          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <motion.div 
                className="p-4 cursor-pointer active:bg-gray-50 transition-colors min-h-[72px]"
                onClick={() => handleTeamClick(team)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 truncate">{team.name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <FiUser className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500 truncate">
                          {team.coach?.name} • {(team as any)._count?.members || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold min-w-[22px] text-center">
                        {stats.totalFeedback}
                      </div>
                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-semibold min-w-[22px] text-center">
                        {stats.totalActions}
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="flex-shrink-0"
                    >
                      <FiArrowRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                {/* Quick Stats Grid - Mobile Optimized */}
                {(stats.totalFeedback > 0 || stats.totalActions > 0) && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <FiMessageSquare className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-900">Feedback</span>
                        </div>
                        <span className="text-sm font-bold text-blue-700">
                          {stats.acknowledgedFeedback}/{stats.totalFeedback}
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-blue-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${stats.totalFeedback > 0 ? (stats.acknowledgedFeedback / stats.totalFeedback) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <FiCheckSquare className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-900">Actions</span>
                        </div>
                        <span className="text-sm font-bold text-green-700">
                          {stats.completedActions}/{stats.totalActions}
                        </span>
                      </div>
                      <div className="mt-1.5 w-full bg-green-200 rounded-full h-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${stats.totalActions > 0 ? (stats.completedActions / stats.totalActions) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* View Roles Button - Mobile Optimized */}
                <div className="mt-3">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTeamRoles(team);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-medium flex items-center justify-center space-x-2"
                  >
                    <FiUsers className="w-3 h-3" />
                    <span>View Team Roles</span>
                  </motion.button>
                </div>

                {/* Pending Items Alert - Mobile Optimized */}
                {stats.pendingItems > 0 && (
                  <div className="mt-2 bg-orange-50 border border-orange-100 rounded-lg p-2.5">
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-800">
                        {stats.pendingItems} pending • Tap to view
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-3">
        <div className="max-w-sm mx-auto">
          <div className="animate-pulse space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-5 bg-gray-200 rounded-lg mb-3"></div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-3">
      <div className="max-w-sm mx-auto space-y-3">
        {renderTeamsList()}

        {/* Team Modal */}
        {selectedTeam && (
          <TeamModal
            team={selectedTeam}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            teamFeedback={getTeamFeedback(selectedTeam.id)}
            teamActions={getTeamActions(selectedTeam.id)}
            onAcknowledge={handleAcknowledge}
            onComplete={handleComplete}
          />
        )}

        {/* View Team Roles Modal */}
        {selectedTeamForRoles && isRolesModalOpen && (
          <ViewTeamRolesModal
            team={selectedTeamForRoles}
            onClose={handleCloseRolesModal}
          />
        )}
      </div>
    </div>
  );
} 