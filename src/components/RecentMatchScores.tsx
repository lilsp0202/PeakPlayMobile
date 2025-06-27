"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, MapPin, Camera, ChevronDown, Edit, Trash2, MoreVertical, AlertTriangle, Star, Trophy, Calendar, X, ChevronUp, Target, Shield, Users, BarChart2, TrendingUp } from 'lucide-react';
import AddMatchModal from './AddMatchModal';
import MatchDetailsModal from './MatchDetailsModal';
import ScorecardUploadModal from './ScorecardUploadModal';
import EditMatchModal from './EditMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchRatingAlgorithm } from "@/lib/matchRatingAlgorithm";

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
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

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

  const toggleExpanded = (matchId: string) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  const recalculateRating = (performance: MatchPerformance) => {
    const stats = parseStats(performance.stats);
    const context = {
      matchType: performance.match.matchType,
      result: performance.match.result,
      role: performance.student?.role || playerRole || "BATSMAN"
    };
    
    return MatchRatingAlgorithm.calculateRating(stats, context);
  };

  const getPerformanceInsights = (performance: MatchPerformance) => {
    const stats = parseStats(performance.stats);
    const context = {
      matchType: performance.match.matchType,
      result: performance.match.result,
      role: performance.student?.role || playerRole || "BATSMAN"
    };
    
    return MatchRatingAlgorithm.getPerformanceInsights(stats, context);
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
      {/* Header - Remove duplicate title and improve layout */}
      <div className="flex justify-between items-center mb-6">
        {!isCoachView && (
          <div className="relative ml-auto">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Match
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            
            {showAddDropdown && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border z-10 min-w-48">
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700 border-b"
                >
                  <BarChart2 className="w-4 h-4 mr-3 text-indigo-500" />
                  Manual Entry
                </button>
                <button
                  onClick={() => {
                    setIsScorecardModalOpen(true);
                    setShowAddDropdown(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700"
                >
                  <Target className="w-4 h-4 mr-3 text-green-500" />
                  Upload Scorecard
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matches List */}
      {performances.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-600 mb-2">No matches yet</h4>
          <p className="text-gray-500 mb-6">Start tracking your cricket performance by adding your first match.</p>
          {!isCoachView && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Match
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {performances.map((performance, index) => {
            const stats = parseStats(performance.stats);
            const isExpanded = expandedMatch === performance.id;
            const insights = getPerformanceInsights(performance);
            const recalculatedRating = recalculateRating(performance);
            
            return (
              <motion.div
                key={performance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50/30 border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                {/* Main Match Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  {/* Match Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {performance.match.matchName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpanded(performance.id)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        {!isCoachView && (
                          <div className="relative">
                            <button
                              onClick={() => setActiveDropdown(activeDropdown === performance.id ? null : performance.id)}
                              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full mb-1"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            </button>
                            
                            {activeDropdown === performance.id && (
                              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-xl border z-10 min-w-32">
                                <button
                                  onClick={() => openEditModal(performance)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-gray-700 border-b"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(performance)}
                                  className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        vs {performance.match.opponent}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(performance.match.matchDate)}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {performance.match.venue || "Unknown Venue"}
                      </span>
                    </div>

                    {/* Key Stats Preview */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(() => {
                        if (playerRole === "BATSMAN" || playerRole === "ALL_ROUNDER") {
                          return (
                            <>
                              {stats.runs !== undefined && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                  {stats.runs} runs
                                </span>
                              )}
                              {stats.balls !== undefined && stats.balls > 0 && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                                  {((stats.runs / stats.balls) * 100).toFixed(1)} SR
                                </span>
                              )}
                              {stats.fours !== undefined && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-medium">
                                  {stats.fours} 4s
                                </span>
                              )}
                              {stats.sixes !== undefined && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                                  {stats.sixes} 6s
                                </span>
                              )}
                            </>
                          );
                        }
                        
                        if (playerRole === "BOWLER" || playerRole === "ALL_ROUNDER") {
                          return (
                            <>
                              {stats.wickets !== undefined && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                                  {stats.wickets} wickets
                                </span>
                              )}
                              {stats.overs !== undefined && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                  {stats.overs} overs
                                </span>
                              )}
                              {stats.runsConceded !== undefined && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">
                                  {stats.runsConceded} runs
                                </span>
                              )}
                            </>
                          );
                        }
                        
                        return (
                          <>
                            {stats.catches !== undefined && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                                {stats.catches} catches
                              </span>
                            )}
                            {stats.runOuts !== undefined && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(performance.match.result)}`}>
                      {performance.match.result}
                    </span>
                    
                    <div className="flex items-center mt-2">
                      <Star className={`w-4 h-4 mr-1 ${getRatingColor(recalculatedRating)}`} />
                      <span className={`text-sm font-semibold ${getRatingColor(recalculatedRating)}`}>
                        {recalculatedRating.toFixed(1)}
                      </span>
                      {Math.abs(recalculatedRating - (performance.rating || 7.0)) > 0.1 && (
                        <span className="ml-1 text-xs text-gray-500">
                          (updated)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      {/* Performance Insights */}
                      {insights.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Performance Insights
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {insights.map((insight, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs"
                              >
                                {insight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Batting Stats */}
                        {(playerRole === "BATSMAN" || playerRole === "ALL_ROUNDER" || playerRole === "KEEPER") && (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Batting</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Runs:</span>
                                <span className="font-medium">{stats.runs || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Balls:</span>
                                <span className="font-medium">{stats.balls || 0}</span>
                              </div>
                              {stats.balls > 0 && (
                                <div className="flex justify-between">
                                  <span>Strike Rate:</span>
                                  <span className="font-medium">{((stats.runs / stats.balls) * 100).toFixed(1)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Boundaries:</span>
                                <span className="font-medium">{(stats.fours || 0) + (stats.sixes || 0)}</span>
                              </div>
                              {stats.notOut && (
                                <div className="text-green-600 font-medium">Not Out</div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bowling Stats */}
                        {(playerRole === "BOWLER" || playerRole === "ALL_ROUNDER") && (
                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Bowling</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Wickets:</span>
                                <span className="font-medium">{stats.wickets || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Overs:</span>
                                <span className="font-medium">{stats.overs || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Runs:</span>
                                <span className="font-medium">{stats.runsConceded || 0}</span>
                              </div>
                              {stats.overs > 0 && (
                                <div className="flex justify-between">
                                  <span>Economy:</span>
                                  <span className="font-medium">{((stats.runsConceded || 0) / stats.overs).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Maidens:</span>
                                <span className="font-medium">{stats.maidens || 0}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fielding Stats */}
                        <div className="bg-white rounded-lg p-3 border">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Fielding</h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Catches:</span>
                              <span className="font-medium">{stats.catches || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Run Outs:</span>
                              <span className="font-medium">{stats.runOuts || 0}</span>
                            </div>
                            {playerRole === "KEEPER" && (
                              <div className="flex justify-between">
                                <span>Stumpings:</span>
                                <span className="font-medium">{stats.stumpings || 0}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {performance.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{performance.notes}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
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
      {showDeleteConfirm && deletingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Match</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingMatch.match.matchName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingMatch(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMatch(deletingMatch)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
