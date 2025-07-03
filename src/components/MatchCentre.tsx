"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiBarChart, FiTarget, FiTrendingUp, FiActivity, FiAward, FiCalendar, FiUser } from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import AddMatchModal from './AddMatchModal';
import EditMatchModal from './EditMatchModal';
import MatchDetailsModal from './MatchDetailsModal';
import ScorecardUploadModal from './ScorecardUploadModal';
import RecentMatchScores from './RecentMatchScores';
import type { Session } from "next-auth";

// Types for match statistics
interface MatchStats {
  totalMatches: number;
  averageScore?: number;
  battingAverage?: number;
  highestScore: number;
  winRate?: number;
  winPercentage?: number;
  recentForm: string[];
  totalRuns: number;
  totalWickets: number;
  bestBowling: string;
  catchesDropped?: number;
  catchesTaken?: number;
  totalCatches?: number;
  strikeRate?: number;
  economyRate?: number;
}

type ActiveTab = 'upload' | 'statistics' | 'recent';

const MatchCentre: React.FC = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload');
  const [stats, setStats] = useState<MatchStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const fetchMatchStats = useCallback(async () => {
    if (!(session as unknown as Session)?.user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/matches/stats?userId=${(session as unknown as Session)?.user?.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch match stats: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching match stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [(session as unknown as Session)?.user?.id]);

  useEffect(() => {
    if ((session as unknown as Session)?.user?.id) {
      fetchMatchStats();
    }
  }, [(session as unknown as Session)?.user?.id, fetchMatchStats]);

  const handleMatchUpdate = useCallback(async (matchData?: any) => {
    if (matchData) {
      // If match data is provided, handle the submission
      try {
        const response = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(matchData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add match");
        }
      } catch (error) {
        console.error("Error adding match:", error);
        throw error; // Re-throw to let the modal handle the error
      }
    }
    // Always refresh stats after adding a match or when called without data
    await fetchMatchStats();
  }, [fetchMatchStats]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    colorScheme: 'blue' | 'emerald' | 'purple' | 'amber';
  }> = ({ title, value, icon, description, colorScheme }) => {
    const colorSchemes = {
      blue: {
        gradient: 'from-blue-50 via-indigo-50 to-cyan-50',
        iconBg: 'from-blue-100 to-indigo-100',
        text: 'text-blue-700',
        border: 'border-blue-100',
        pattern: 'text-blue-200'
      },
      emerald: {
        gradient: 'from-emerald-50 via-teal-50 to-green-50',
        iconBg: 'from-emerald-100 to-teal-100',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        pattern: 'text-emerald-200'
      },
      purple: {
        gradient: 'from-purple-50 via-violet-50 to-indigo-50',
        iconBg: 'from-purple-100 to-violet-100',
        text: 'text-purple-700',
        border: 'border-purple-100',
        pattern: 'text-purple-200'
      },
      amber: {
        gradient: 'from-amber-50 via-yellow-50 to-orange-50',
        iconBg: 'from-amber-100 to-yellow-100',
        text: 'text-amber-700',
        border: 'border-amber-100',
        pattern: 'text-amber-200'
      }
    };

    const colors = colorSchemes[colorScheme];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border ${colors.border} overflow-hidden group`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`}></div>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id={`pattern-${colorScheme}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.2" className={colors.pattern} />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#pattern-${colorScheme})`} />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <motion.div 
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center shadow-sm`}
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`}>
                {icon}
              </div>
            </motion.div>
            <div className="text-right">
              <div className={`text-2xl sm:text-3xl font-bold ${colors.text}`}>
                {value}
              </div>
            </div>
          </div>
          
          <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1">{title}</h3>
          {description && (
            <p className="text-xs sm:text-sm text-gray-500">{description}</p>
          )}
        </div>

        {/* Hover Effect */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}
          initial={{ opacity: 0, scaleX: 0 }}
          whileHover={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  const renderUploadSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div 
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center shadow-sm border border-blue-100"
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.6 }}
        >
          <FiUpload className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
        </motion.div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Upload Match Data</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            Add your match performance data to track progress and analyze your game
          </p>
        </div>
      </div>

      {/* Upload Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <FiTarget className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Entry</h3>
            <p className="text-sm text-gray-600">Enter match details manually with our guided form</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setShowUploadModal(true)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-200 transition-all duration-300 shadow-sm hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scorecard Upload
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700">
                AI
              </span>
            </h3>
            <p className="text-sm text-gray-600">Upload scorecard images for automatic analysis</p>
          </div>
        </motion.button>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center pt-4"
      >
        <motion.button
          onClick={() => setActiveTab('recent')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FiCalendar className="w-4 h-4" />
          View Recent Matches
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const renderStatistics = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full"
          />
        </div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
            <FiActivity className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Statistics</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <motion.button
            onClick={fetchMatchStats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-700 rounded-lg font-medium transition-all duration-200"
          >
            Try Again
          </motion.button>
        </motion.div>
      );
    }

    if (!stats || stats.totalMatches === 0) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center">
            <FiBarChart className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Match Data Available</h3>
          <p className="text-sm text-gray-600 mb-4">Upload your first match to see detailed statistics and insights</p>
          <motion.button
            onClick={() => setActiveTab('upload')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-xl font-medium transition-all duration-200"
          >
            Upload First Match
          </motion.button>
        </motion.div>
      );
    }

    // Safe property access with fallbacks
    const averageScore = stats.battingAverage || stats.averageScore || 0;
    const winRate = stats.winPercentage || stats.winRate || 0;
    const strikeRate = stats.strikeRate || 0;
    const totalCatches = stats.totalCatches || stats.catchesTaken || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Performance Statistics</h2>
          <p className="text-sm sm:text-base text-gray-600">Your cricket performance insights and trends</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Matches"
            value={stats.totalMatches}
            icon={<FiCalendar />}
            description="Matches played"
            colorScheme="blue"
          />
          <StatCard
            title="Average Score"
            value={averageScore.toFixed(1)}
            icon={<FiTrendingUp />}
            description="Runs per match"
            colorScheme="emerald"
          />
          <StatCard
            title="Highest Score"
            value={stats.highestScore || 0}
            icon={<FiAward />}
            description="Personal best"
            colorScheme="purple"
          />
          <StatCard
            title="Win Rate"
            value={`${winRate.toFixed(1)}%`}
            icon={<FiTarget />}
            description="Match success"
            colorScheme="amber"
          />
        </div>

        {/* Additional Stats - Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Batting Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Batting Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Runs</span>
                <span className="text-sm font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded-lg">
                  {stats.totalRuns || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Strike Rate</span>
                <span className="text-sm font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded-lg">
                  {strikeRate.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Batting Average</span>
                <span className="text-sm font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded-lg">
                  {averageScore.toFixed(1)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bowling Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <FiTarget className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Bowling Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Wickets</span>
                <span className="text-sm font-semibold text-gray-900 bg-orange-50 px-2 py-1 rounded-lg">
                  {stats.totalWickets || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Economy Rate</span>
                <span className="text-sm font-semibold text-gray-900 bg-orange-50 px-2 py-1 rounded-lg">
                  {(stats.economyRate || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Best Bowling</span>
                <span className="text-sm font-semibold text-gray-900 bg-orange-50 px-2 py-1 rounded-lg">
                  {stats.bestBowling || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Fielding Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fielding Stats</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Catches</span>
                <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-2 py-1 rounded-lg">
                  {totalCatches}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Catches Dropped</span>
                <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-2 py-1 rounded-lg">
                  {stats.catchesDropped || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Catch Success Rate</span>
                <span className="text-sm font-semibold text-gray-900 bg-purple-50 px-2 py-1 rounded-lg">
                  {totalCatches > 0 && stats.catchesDropped !== undefined
                    ? Math.round((totalCatches / (totalCatches + stats.catchesDropped)) * 100)
                    : 100}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center border border-blue-100"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <FiBarChart className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Match Centre</h1>
              <p className="text-sm text-gray-600">Track and analyze your cricket performance</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-3">
            {([
              { id: 'upload' as const, label: 'Upload', icon: FiUpload },
              { id: 'statistics' as const, label: 'Statistics', icon: FiBarChart },
              { id: 'recent' as const, label: 'Recent', icon: FiTarget }
            ] as const).map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderUploadSection()}
            </motion.div>
          )}

          {activeTab === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStatistics()}
            </motion.div>
          )}

          {activeTab === 'recent' && (
            <motion.div
              key="recent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center border border-gray-100">
                    <FiTarget className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Matches</h2>
                    <p className="text-gray-600 text-sm">Your latest performances</p>
                  </div>
                </div>
                <RecentMatchScores />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddMatchModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleMatchUpdate}
      />

      <ScorecardUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onAnalysisComplete={handleMatchUpdate}
      />
    </div>
  );
};

export default MatchCentre; 