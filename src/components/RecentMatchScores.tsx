"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Camera, ChevronDown, Edit, Trash2, MoreVertical, AlertTriangle, Star, Trophy, Calendar, X, ChevronUp, Target, Shield, Users, BarChart2, TrendingUp } from 'lucide-react';
import AddMatchModal from './AddMatchModal';
import MatchDetailsModal from './MatchDetailsModal';
import ScorecardUploadModal from './ScorecardUploadModal';
import EditMatchModal from './EditMatchModal';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchRatingAlgorithm } from "@/lib/matchRatingAlgorithm";
import { FiChevronDown, FiChevronUp, FiCalendar, FiMapPin, FiUsers, FiTarget, FiTrendingUp, FiAward, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { format, parseISO } from "date-fns";

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
  const router = useRouter();
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    matchDate: new Date().toISOString().split("T")[0],
    matchType: "FRIENDLY",
    venue: "",
    result: "WON",
    runsScored: 0,
    ballsFaced: 0,
    fours: 0,
    sixes: 0,
    wicketsTaken: 0,
    oversBowled: 0,
    runsConceded: 0,
    catches: 0,
    runOuts: 0,
    stumpings: 0,
    notes: "",
  });

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

  const getRatingEmoji = (rating: number) => {
    if (rating >= 8.5) return "🌟";
    if (rating >= 7) return "⭐";
    if (rating >= 5) return "💪";
    return "🎯";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 8.5) return "Outstanding";
    if (rating >= 7) return "Excellent";
    if (rating >= 5) return "Good";
    return "Keep Practicing";
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
    <div className="space-y-6">
      {/* Add Match Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => setIsAddingMatch(!isAddingMatch)}
          className="btn-gradient btn-modern w-full flex items-center justify-center gap-2 text-white font-semibold"
          disabled={loading}
        >
          <motion.div
            animate={{ rotate: isAddingMatch ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <FiPlus className="w-5 h-5" />
          </motion.div>
          {isAddingMatch ? "Cancel" : "Add Match"}
        </button>
      </motion.div>

      {/* Add Match Form */}
      <AnimatePresence>
        {isAddingMatch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card-modern glass p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">New Match Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Match Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={newMatch.matchDate}
                      onChange={(e) => setNewMatch({ ...newMatch, matchDate: e.target.value })}
                      className="input-modern pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Match Type
                  </label>
                  <select
                    value={newMatch.matchType}
                    onChange={(e) => setNewMatch({ ...newMatch, matchType: e.target.value })}
                    className="input-modern select-modern"
                  >
                    <option value="FRIENDLY">Friendly</option>
                    <option value="LEAGUE">League</option>
                    <option value="TOURNAMENT">Tournament</option>
                    <option value="PRACTICE">Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({ ...newMatch, venue: e.target.value })}
                      placeholder="Enter venue"
                      className="input-modern pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Result
                  </label>
                  <select
                    value={newMatch.result}
                    onChange={(e) => setNewMatch({ ...newMatch, result: e.target.value })}
                    className="input-modern select-modern"
                  >
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                    <option value="DRAW">Draw</option>
                    <option value="NO_RESULT">No Result</option>
                  </select>
                </div>
              </div>

              {/* Batting Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiTarget className="text-blue-600" />
                  Batting Performance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Runs Scored
                    </label>
                    <input
                      type="number"
                      value={newMatch.runsScored}
                      onChange={(e) => setNewMatch({ ...newMatch, runsScored: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Balls Faced
                    </label>
                    <input
                      type="number"
                      value={newMatch.ballsFaced}
                      onChange={(e) => setNewMatch({ ...newMatch, ballsFaced: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fours
                    </label>
                    <input
                      type="number"
                      value={newMatch.fours}
                      onChange={(e) => setNewMatch({ ...newMatch, fours: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Sixes
                    </label>
                    <input
                      type="number"
                      value={newMatch.sixes}
                      onChange={(e) => setNewMatch({ ...newMatch, sixes: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Bowling Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiTrendingUp className="text-green-600" />
                  Bowling Performance
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Wickets Taken
                    </label>
                    <input
                      type="number"
                      value={newMatch.wicketsTaken}
                      onChange={(e) => setNewMatch({ ...newMatch, wicketsTaken: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Overs Bowled
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMatch.oversBowled}
                      onChange={(e) => setNewMatch({ ...newMatch, oversBowled: parseFloat(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Runs Conceded
                    </label>
                    <input
                      type="number"
                      value={newMatch.runsConceded}
                      onChange={(e) => setNewMatch({ ...newMatch, runsConceded: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Fielding Stats */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FiUsers className="text-purple-600" />
                  Fielding Performance
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Catches
                    </label>
                    <input
                      type="number"
                      value={newMatch.catches}
                      onChange={(e) => setNewMatch({ ...newMatch, catches: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Run Outs
                    </label>
                    <input
                      type="number"
                      value={newMatch.runOuts}
                      onChange={(e) => setNewMatch({ ...newMatch, runOuts: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Stumpings
                    </label>
                    <input
                      type="number"
                      value={newMatch.stumpings}
                      onChange={(e) => setNewMatch({ ...newMatch, stumpings: parseInt(e.target.value) || 0 })}
                      className="input-modern text-center"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={newMatch.notes}
                  onChange={(e) => setNewMatch({ ...newMatch, notes: e.target.value })}
                  placeholder="Add any additional notes about your performance..."
                  className="input-modern"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddMatch}
                  className="btn-modern bg-green-600 text-white hover:bg-green-700 flex-1"
                >
                  Save Match
                </button>
                <button
                  onClick={() => {
                    setIsAddingMatch(false);
                    setNewMatch({
                      matchDate: new Date().toISOString().split("T")[0],
                      matchType: "FRIENDLY",
                      venue: "",
                      result: "WON",
                      runsScored: 0,
                      ballsFaced: 0,
                      fours: 0,
                      sixes: 0,
                      wicketsTaken: 0,
                      oversBowled: 0,
                      runsConceded: 0,
                      catches: 0,
                      runOuts: 0,
                      stumpings: 0,
                      notes: "",
                    });
                  }}
                  className="btn-modern bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Matches List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner" />
          </div>
        ) : performances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 card-modern"
          >
            <Trophy className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches recorded yet</h3>
            <p className="text-gray-600">Start tracking your match performances to see your progress!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
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
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-modern match-card"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleExpanded(performance.id)}
                  >
                    {/* Match Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <motion.div
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              performance.match.result === "WON"
                                ? "bg-green-100 text-green-800"
                                : performance.match.result === "LOST"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {performance.match.result}
                          </motion.div>
                          <span className="text-sm text-gray-600">
                            {format(parseISO(performance.match.matchDate), "MMM dd, yyyy")}
                          </span>
                          <span className="text-sm text-gray-600">•</span>
                          <span className="text-sm text-gray-600">{performance.match.matchType}</span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="text-gray-400 w-4 h-4" />
                            <span className="text-sm text-gray-700">{performance.match.venue || "Not specified"}</span>
                          </div>
                          
                          {/* Key Stats Preview */}
                          <div className="flex items-center gap-4 text-sm">
                            {stats.runs !== undefined && (
                              <span className="text-gray-700">
                                <span className="font-semibold">{stats.runs}</span> runs
                              </span>
                            )}
                            {stats.wickets !== undefined && (
                              <span className="text-gray-700">
                                <span className="font-semibold">{stats.wickets}</span> wickets
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating Display */}
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="text-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          <div className={`text-4xl font-bold bg-gradient-to-r ${getRatingColor(recalculatedRating)} bg-clip-text text-transparent`}>
                            {recalculatedRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{getRatingLabel(recalculatedRating)}</div>
                        </motion.div>
                        
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-400"
                        >
                          <FiChevronDown className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                          {/* Performance Summary */}
                          {insights.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <FiAward className="text-blue-600" />
                                Performance Summary
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {insights.map((insight: string, idx: number) => (
                                  <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="badge-modern badge-gradient text-xs"
                                  >
                                    {insight}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detailed Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Batting Stats */}
                            {(stats.runs !== undefined && stats.balls !== undefined) && (
                              <div className="bg-blue-50 rounded-xl p-4">
                                <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                  <FiTarget className="w-4 h-4" />
                                  Batting
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Runs</span>
                                    <span className="font-semibold text-gray-900">{stats.runs}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Balls</span>
                                    <span className="font-semibold text-gray-900">{stats.balls}</span>
                                  </div>
                                  {stats.balls > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-700">Strike Rate</span>
                                      <span className="font-semibold text-gray-900">
                                        {((stats.runs / stats.balls) * 100).toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Boundaries</span>
                                    <span className="font-semibold text-gray-900">
                                      {stats.fours}×4, {stats.sixes}×6
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Bowling Stats */}
                            {(stats.wickets !== undefined && stats.overs !== undefined) && (
                              <div className="bg-green-50 rounded-xl p-4">
                                <h5 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                  <FiTrendingUp className="w-4 h-4" />
                                  Bowling
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Wickets</span>
                                    <span className="font-semibold text-gray-900">{stats.wickets}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Overs</span>
                                    <span className="font-semibold text-gray-900">{stats.overs}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Runs</span>
                                    <span className="font-semibold text-gray-900">{stats.runsConceded}</span>
                                  </div>
                                  {stats.overs > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-700">Economy</span>
                                      <span className="font-semibold text-gray-900">
                                        {(stats.runsConceded / stats.overs).toFixed(2)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Fielding Stats */}
                            {(stats.catches !== undefined || stats.runOuts !== undefined) && (
                              <div className="bg-purple-50 rounded-xl p-4">
                                <h5 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                  <FiUsers className="w-4 h-4" />
                                  Fielding
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Catches</span>
                                    <span className="font-semibold text-gray-900">{stats.catches}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-700">Run Outs</span>
                                    <span className="font-semibold text-gray-900">{stats.runOuts}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Performance Insights */}
                          {insights.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-semibold text-gray-900">Key Insights</h5>
                              <div className="flex flex-wrap gap-2">
                                {insights.map((insight: string, idx: number) => (
                                  <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="badge-modern badge-gradient text-xs"
                                  >
                                    {insight}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {performance.notes && (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <h5 className="font-semibold text-gray-900 mb-2">Notes</h5>
                              <p className="text-sm text-gray-700">{performance.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteConfirm(performance);
                              }}
                              className="btn-modern bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

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
