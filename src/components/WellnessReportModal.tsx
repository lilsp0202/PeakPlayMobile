"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiInfo, 
  FiTarget, 
  FiBarChart2,
  FiActivity,
  FiHeart,
  FiZap,
  FiUser,
  FiSmile,
  FiMinus,
  FiMoon,
  FiBattery
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { useSession } from 'next-auth/react';
import type { Session } from "next-auth";

interface WellnessEntry {
  id: string;
  date: Date;
  fatigue: number;
  stress: number;
  muscleSoreness: number;
  sleepQuality: number;
  enjoyingTraining: number;
  irritable: number;
  healthyOverall: number;
  wellRested: number;
  hooperIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WellnessReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEntry?: WellnessEntry | null;
}

// Helper function to get wellness interpretation
const getWellnessInterpretation = (score: number) => {
  if (score <= 16) {
    return {
      label: "Excellent",
      description: "Great recovery and wellness",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    };
  } else if (score <= 24) {
    return {
      label: "Good", 
      description: "Moderate wellness levels",
      color: "text-blue-600",
      bgColor: "bg-blue-50", 
      borderColor: "border-blue-200"
    };
  } else if (score <= 32) {
    return {
      label: "Fair",
      description: "Some fatigue or stress present",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
  } else if (score <= 40) {
    return {
      label: "Poor",
      description: "High fatigue or stress levels",
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    };
  } else {
    return {
      label: "Very Poor",
      description: "Significant fatigue and stress",
      color: "text-red-600",
      bgColor: "bg-red-50", 
      borderColor: "border-red-200"
    };
  }
};

const WellnessReportModal: React.FC<WellnessReportModalProps> = ({ isOpen, onClose, currentEntry }) => {
  const { data: session } = useSession();
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'detailed'>('overview');

  // Fetch wellness history
  useEffect(() => {
    if (isOpen && (session as unknown as Session)?.user?.id) {
      fetchWellnessHistory();
    }
  }, [isOpen, (session as unknown as Session)?.user?.id]);

  const fetchWellnessHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hooper-index?recent=true');
      if (response.ok) {
        const data = await response.json();
        setWellnessHistory(data.entries || []);
      }
    } catch (error) {
      console.error('Error fetching wellness history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (wellnessHistory.length === 0) return null;

    const scores = wellnessHistory.map(entry => entry.hooperIndex);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Calculate trend (last 7 days vs previous 7 days)
    const recent7Days = wellnessHistory.slice(0, 7);
    const previous7Days = wellnessHistory.slice(7, 14);
    
    let trend = 'stable';
    if (recent7Days.length > 0 && previous7Days.length > 0) {
      const recentAvg = recent7Days.reduce((sum, entry) => sum + entry.hooperIndex, 0) / recent7Days.length;
      const previousAvg = previous7Days.reduce((sum, entry) => sum + entry.hooperIndex, 0) / previous7Days.length;
      
      if (recentAvg < previousAvg - 2) trend = 'improving';
      else if (recentAvg > previousAvg + 2) trend = 'declining';
    }

    return { average, min, max, trend, totalEntries: wellnessHistory.length };
  };

  const stats = calculateStats();

  // Prepare chart data
  const chartData = wellnessHistory
    .slice(0, 14) // Last 14 days
    .reverse()
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: entry.hooperIndex,
      fatigue: entry.fatigue,
      stress: entry.stress,
      muscleSoreness: entry.muscleSoreness,
      sleepQuality: entry.sleepQuality,
      enjoyingTraining: entry.enjoyingTraining,
      irritable: entry.irritable,
      healthyOverall: entry.healthyOverall,
      wellRested: entry.wellRested
    }));

  const questions = [
    { key: 'fatigue', label: 'Fatigue', icon: FiBattery, color: 'text-blue-600', chartColor: '#2563eb' },
    { key: 'stress', label: 'Stress', icon: FiZap, color: 'text-red-600', chartColor: '#dc2626' },
    { key: 'muscleSoreness', label: 'Muscle Soreness', icon: FiActivity, color: 'text-orange-600', chartColor: '#ea580c' },
    { key: 'sleepQuality', label: 'Sleep Quality', icon: FiMoon, color: 'text-indigo-600', chartColor: '#4f46e5' },
    { key: 'enjoyingTraining', label: 'Enjoying Training', icon: FiSmile, color: 'text-green-600', chartColor: '#16a34a' },
    { key: 'irritable', label: 'Irritability', icon: FiUser, color: 'text-purple-600', chartColor: '#9333ea' },
    { key: 'healthyOverall', label: 'Overall Health', icon: FiHeart, color: 'text-pink-600', chartColor: '#db2777' },
    { key: 'wellRested', label: 'Well Rested', icon: FiMoon, color: 'text-teal-600', chartColor: '#0d9488' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <FiBarChart2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Wellness Report</h3>
                <p className="text-sm text-gray-600">Track your daily wellness and recovery</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <FiTarget className="w-5 h-5 rotate-45" />
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: FiInfo },
              { id: 'trends', label: 'Trends', icon: FiTrendingUp },
              { id: 'detailed', label: 'Detailed', icon: FiBarChart2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Current Status */}
                    {currentEntry && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Today's Wellness</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                              {currentEntry.hooperIndex}
                            </div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getWellnessInterpretation(currentEntry.hooperIndex).bgColor} ${getWellnessInterpretation(currentEntry.hooperIndex).color} border ${getWellnessInterpretation(currentEntry.hooperIndex).borderColor}`}>
                              {getWellnessInterpretation(currentEntry.hooperIndex).label}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-2">Completed</div>
                            <div className="text-lg font-semibold text-gray-800">
                              {new Date(currentEntry.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    {stats && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {stats.average.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Average Score</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {stats.min}
                          </div>
                          <div className="text-sm text-gray-600">Best Score</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600 mb-1">
                            {stats.max}
                          </div>
                          <div className="text-sm text-gray-600">Highest Score</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            {stats.trend === 'improving' ? (
                              <FiTrendingDown className="w-5 h-5 text-green-600" />
                            ) : stats.trend === 'declining' ? (
                              <FiTrendingUp className="w-5 h-5 text-red-600" />
                            ) : (
                              <FiMinus className="w-5 h-5 text-gray-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              stats.trend === 'improving' ? 'text-green-600' : 
                              stats.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {stats.trend === 'improving' ? 'Improving' : 
                               stats.trend === 'declining' ? 'Declining' : 'Stable'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">7-Day Trend</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Wellness Score Trend (Last 14 Days)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <YAxis 
                              domain={[0, 56]}
                              tick={{ fontSize: 12, fill: '#6b7280' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <defs>
                              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#8b5cf6" 
                              fillOpacity={1}
                              fill="url(#scoreGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Tab */}
                {activeTab === 'detailed' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {questions.map((question) => (
                        <div key={question.key} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <question.icon className={`w-5 h-5 ${question.color}`} />
                            <h5 className="font-semibold text-gray-800">{question.label}</h5>
                          </div>
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 10, fill: '#6b7280' }}
                                />
                                <YAxis 
                                  domain={[1, 7]}
                                  tick={{ fontSize: 10, fill: '#6b7280' }}
                                />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey={question.key} 
                                  stroke={question.chartColor} 
                                  strokeWidth={2}
                                  dot={{ fill: question.chartColor, strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WellnessReportModal; 