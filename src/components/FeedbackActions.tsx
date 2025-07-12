"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CoachFeedback from "./CoachFeedback";
import CoachActions from "./CoachActions";

interface FeedbackActionsProps {
  studentId?: string;
  isCoachView?: boolean;
}

export default function FeedbackActions({ studentId, isCoachView = false }: FeedbackActionsProps) {
  const [activeTab, setActiveTab] = useState<'feedback' | 'actions' | 'teams'>('feedback');
  const [teamFeedback, setTeamFeedback] = useState<any[]>([]);
  const [teamActions, setTeamActions] = useState<any[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const tabs = [
    {
      id: 'feedback' as const,
      label: 'Coach Feedback',
      shortLabel: 'Feedback',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
        </svg>
      ),
      description: 'Performance insights from your coach',
      shortDescription: 'Performance insights'
    },
    {
      id: 'actions' as const,
      label: 'Actions',
      shortLabel: 'Actions',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
        </svg>
      ),
      description: 'Tasks and drills from your coach',
      shortDescription: 'Tasks and drills'
    },
    {
      id: 'teams' as const,
      label: 'Teams',
      shortLabel: 'Teams',
      icon: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      ),
      description: 'Team feedback and actions',
      shortDescription: 'Team activities'
    }
  ];

  // Fetch team-related feedback and actions
  const fetchTeamData = async () => {
    if (activeTab !== 'teams') return;
    
    setIsLoadingTeams(true);
    try {
      // Fetch feedback with team information
      const feedbackResponse = await fetch('/api/feedback');
      if (feedbackResponse.ok) {
        const feedback = await feedbackResponse.json();
        const teamRelatedFeedback = feedback.filter((item: any) => item.team);
        setTeamFeedback(teamRelatedFeedback);
      }

      // Fetch actions with team information
      const actionsResponse = await fetch('/api/actions');
      if (actionsResponse.ok) {
        const actions = await actionsResponse.json();
        const teamRelatedActions = actions.filter((item: any) => item.team);
        setTeamActions(teamRelatedActions);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleAcknowledge = async (itemId: string, type: 'feedback' | 'actions') => {
    try {
      const endpoint = type === 'feedback' ? '/api/feedback' : '/api/actions';
      const updateField = type === 'feedback' ? 'isAcknowledged' : 'isAcknowledged';
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [type === 'feedback' ? 'feedbackId' : 'actionId']: itemId, 
          [updateField]: true 
        }),
      });

      if (response.ok) {
        // Refresh team data to show updated status
        fetchTeamData();
      }
    } catch (error) {
      console.error('Error acknowledging item:', error);
    }
  };

  const renderTeamsContent = () => {
    if (isLoadingTeams) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team activities...</p>
          </div>
        </div>
      );
    }

    const allTeamItems = [
      ...teamFeedback.map(item => ({ ...item, type: 'feedback' })),
      ...teamActions.map(item => ({ ...item, type: 'actions' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (allTeamItems.length === 0) {
      return (
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Team Activities</h3>
          <p className="text-gray-500">You haven't received any team-based feedback or actions yet.</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="space-y-4">
          {allTeamItems.map((item, index) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'feedback' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {item.type === 'feedback' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        Team: {item.team?.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'HIGH' 
                          ? 'bg-red-100 text-red-700' 
                          : item.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4">
                {item.content || item.description}
              </p>

              {/* Status and acknowledgment */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.type === 'feedback' ? (
                    <>
                      {item.isRead && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Read
                        </span>
                      )}
                      {item.isAcknowledged && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Acknowledged
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      {item.isCompleted && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Completed
                        </span>
                      )}
                      {item.isAcknowledged && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          Acknowledged
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Acknowledge button for team items */}
                {!item.isAcknowledged && (
                  <motion.button
                    onClick={() => handleAcknowledge(item.id, item.type)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    Acknowledge
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (activeTab === 'teams') {
      fetchTeamData();
    }
  }, [activeTab]);

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
      {/* Tab Headers - Mobile Optimized */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 px-3 sm:py-4 sm:px-6 text-sm font-medium border-b-2 transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </div>
              <p className={`text-xs mt-1 px-1 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'}`}>
                <span className="hidden sm:inline">{tab.description}</span>
                <span className="sm:hidden">{tab.shortDescription}</span>
              </p>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CoachFeedback studentId={studentId} isCoachView={isCoachView} enableAcknowledge={!isCoachView} />
            </motion.div>
          )}
          
          {activeTab === 'actions' && (
            <motion.div 
              key="actions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CoachActions studentId={studentId} isCoachView={isCoachView} />
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div 
              key="teams"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTeamsContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 