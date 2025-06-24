"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, MapPin, Camera, ChevronDown, Edit, Trash2, MoreVertical, AlertTriangle, Star, Trophy, Calendar } from 'lucide-react';
import AddMatchModal from './AddMatchModal';
import MatchDetailsModal from './MatchDetailsModal';
import ScorecardUploadModal from './ScorecardUploadModal';
import EditMatchModal from './EditMatchModal';
import { motion, AnimatePresence } from 'framer-motion';

export interface MatchPerformance {
  id: string;
  studentId: string;
  position: string | null;
  stats: string;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  match: {
    id: string;
    matchName: string;
    opponent: string;
    venue: string | null;
    matchDate: string;
    sport: string;
    matchType: string;
    result: string;
  };
  student: {
    studentName: string;
    sport: string;
    role: string;
  };
}

export default function RecentMatchScores({ studentId, isCoachView = false }: any) {
  const [performances, setPerformances] = useState<MatchPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchPerformance | null>(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMatch, setDeletingMatch] = useState<MatchPerformance | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { data: session } = useSession();
  const [playerRole, setPlayerRole] = useState("BATSMAN");

  const fetchPlayerRole = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setPlayerRole(data[0].role || "BATSMAN");
        }
      }
    } catch (error) {
      console.error('Error fetching player role:', error);
    }
  };

  const fetchPerformances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = studentId 
        ? `/api/matches?studentId=${studentId}`
        : '/api/matches';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort by most recent first
      const sortedData = data.sort((a: MatchPerformance, b: MatchPerformance) => 
        new Date(b.match.matchDate).getTime() - new Date(a.match.matchDate).getTime()
      );
      
      setPerformances(sortedData);
    } catch (err) {
      console.error('Error fetching match performances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load match data');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchPerformances();
    fetchPlayerRole();
  }, [fetchPerformances]);

  const handleScorecardAnalysis = async (result: any) => {
    // Convert scorecard analysis result to match data format
    const matchData = {
      matchName: result.matchDetails.matchName,
      opponent: result.matchDetails.opponent,
      venue: result.matchDetails.venue,
      matchDate: result.matchDetails.matchDate,
      sport: "CRICKET",
      matchType: result.matchDetails.matchType,
      result: result.matchDetails.result,
      position: result.playerStats.position || "",
      stats: {
        runs: result.playerStats.batting?.runs || 0,
        balls: result.playerStats.batting?.balls || 0,
        fours: result.playerStats.batting?.fours || 0,
        sixes: result.playerStats.batting?.sixes || 0,
        wickets: result.playerStats.bowling?.wickets || 0,
        overs: result.playerStats.bowling?.overs || 0,
        runsConceded: result.playerStats.bowling?.runs || 0,
        maidens: result.playerStats.bowling?.maidens || 0,
        catches: result.playerStats.fielding?.catches || 0,
        runOuts: result.playerStats.fielding?.runOuts || 0
      },
      rating: null,
      notes: `AI Analysis Confidence: ${result.confidence}%`
    };
    
    await handleMatchSubmit(matchData);
    setIsScorecardModalOpen(false);
  };
  const handleMatchSubmit = async (matchData: any) => {
    try {
      console.log("Submitting match data:", matchData);
      
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create match');
      }

      const newPerformance = await response.json();
      console.log("Match created successfully:", newPerformance);
      
      // Refresh the performances list
      await fetchPerformances();
      setIsAddModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error creating match:', error);
      setError(error instanceof Error ? error.message : 'Failed to create match');
    }
  };

  const handleEditMatch = async (matchData: any) => {
    if (!editingMatch) return;

    try {
      const response = await fetch(`/api/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update match');
      }

      // Refresh the performances list
      await fetchPerformances();
      setIsEditModalOpen(false);
      setEditingMatch(null);
      setActiveDropdown(null);
      setError(null);
    } catch (error) {
      console.error('Error updating match:', error);
      setError(error instanceof Error ? error.message : 'Failed to update match');
    }
  };

  const handleDeleteMatch = async (match: MatchPerformance) => {
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete match');
      }

      // Refresh the performances list
      await fetchPerformances();
      setShowDeleteConfirm(false);
      setDeletingMatch(null);
      setActiveDropdown(null);
      setError(null);
    } catch (error) {
      console.error('Error deleting match:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete match');
    }
  };

  const openEditModal = (match: MatchPerformance) => {
    setEditingMatch(match);
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const openDeleteConfirm = (match: MatchPerformance) => {
    setDeletingMatch(match);
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'text-green-600 bg-green-100';
      case 'LOSS': return 'text-red-600 bg-red-100';
      case 'DRAW': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingColor = (rating: number | null) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const parseStats = (statsString: string) => {
    try {
      return JSON.parse(statsString);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-indigo-600" />
          Recent Match Scores
        </h3>
        
        {!isCoachView && (
          <div className="relative">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Match
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2 text-gray-600" />
                  Manual Entry
                </button>
                <button
                  onClick={() => {
                    setIsScorecardModalOpen(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center border-t"
                >
                  <Camera className="w-4 h-4 mr-2 text-gray-600" />
                  Upload Scorecard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Matches List */}
      {performances.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No matches yet</h4>
          <p className="text-gray-500 mb-4">Start tracking your cricket performance by adding your first match.</p>
          {!isCoachView && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Match
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {performances.map((performance) => (
            <motion.div
              key={performance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative"
            >
              {/* Match Actions Dropdown */}
              {!isCoachView && (
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === performance.id ? null : performance.id)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {activeDropdown === performance.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-10">
                      <button
                        onClick={() => openEditModal(performance)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                      >
                        <Edit className="w-3 h-3 mr-2 text-gray-600" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(performance)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-red-600 border-t"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Match Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {performance.match.matchName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        vs {performance.match.opponent}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(performance.match.matchDate)}
                        </span>
                        {performance.match.venue && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {performance.match.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(() => {
                      const stats = parseStats(performance.stats);
                      if (playerRole === "BATSMAN" || playerRole === "ALL_ROUNDER") {
                        return (
                          <>
                            {stats.runs !== undefined && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {stats.runs} runs
                              </span>
                            )}
                            {stats.balls !== undefined && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                {stats.balls} balls
                              </span>
                            )}
                            {stats.fours !== undefined && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {stats.fours} fours
                              </span>
                            )}
                            {stats.sixes !== undefined && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                {stats.sixes} sixes
                              </span>
                            )}
                          </>
                        );
                      }
                      
                      if (playerRole === "BOWLER" || playerRole === "ALL_ROUNDER") {
                        return (
                          <>
                            {stats.wickets !== undefined && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                                {stats.wickets} wickets
                              </span>
                            )}
                            {stats.overs !== undefined && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {stats.overs} overs
                              </span>
                            )}
                            {stats.runsConceded !== undefined && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                {stats.runsConceded} runs
                              </span>
                            )}
                          </>
                        );
                      }
                      
                      return (
                        <>
                          {stats.catches !== undefined && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                              {stats.catches} catches
                            </span>
                          )}
                          {stats.runOuts !== undefined && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {stats.runOuts} run outs
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Result & Rating */}
                <div className="flex md:flex-col md:items-end justify-between md:justify-start">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(performance.match.result)}`}>
                    {performance.match.result}
                  </span>
                  
                  {performance.rating && (
                    <div className="flex items-center mt-2">
                      <Star className={`w-4 h-4 mr-1 ${getRatingColor(performance.rating)}`} />
                      <span className={`text-sm font-medium ${getRatingColor(performance.rating)}`}>
                        {performance.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddMatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleMatchSubmit}
        role={playerRole}
      />

      <ScorecardUploadModal
        isOpen={isScorecardModalOpen}
        onClose={() => setIsScorecardModalOpen(false)}
        onAnalysisComplete={handleScorecardAnalysis}
        role={playerRole}
      />

      {editingMatch && (
        <EditMatchModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMatch(null);
          }}
          onSubmit={handleEditMatch}
          match={editingMatch}
          role={playerRole}
        />
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingMatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Match</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the match "{deletingMatch.match.matchName}" vs {deletingMatch.match.opponent}?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingMatch(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteMatch(deletingMatch)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Match
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdowns */}
      {(showAddDropdown || activeDropdown) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowAddDropdown(false);
            setActiveDropdown(null);
          }}
        />
      )}
    </div>
  );
}
