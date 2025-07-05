"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
  Area,
  AreaChart
} from 'recharts';
import {
  FiUser,
  FiDownload,
  FiTrendingUp,
  FiTarget,
  FiActivity,
  FiSmile,
  FiHeart,
  FiX,
  FiChevronDown,
  FiPlus,
  FiEye,
  FiFilter,
  FiMaximize2,
  FiCalendar,
  FiZap,
  FiArrowUp,
  FiArrowDown,
  FiMenu
} from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { format, subDays, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Athlete {
  id: string;
  name: string;
  sport?: string;
}

interface SkillHistoryData {
  date: string;
  physicalScore: number | null;
  nutritionScore: number | null;
  mentalScore: number | null;
  wellnessScore: number | null;
  techniqueScore: number | null;
  tacticalScore: number | null;
  isMatchDay?: boolean;
  coachFeedback?: string;
  notes?: string;
}

interface AthleteProgressTrackerProps {
  athletes: Athlete[];
}

// Configuration for metrics
const metricConfig = [
  { 
    key: 'physical', 
    label: 'Physical', 
    color: '#3B82F6', 
    icon: FiActivity, 
    description: 'Strength, speed, and endurance metrics',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700'
  },
  { 
    key: 'nutrition', 
    label: 'Nutrition', 
    color: '#10B981', 
    icon: FiHeart, 
    description: 'Dietary intake and nutrition balance',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700'
  },
  { 
    key: 'mental', 
    label: 'Mental', 
    color: '#8B5CF6', 
    icon: BiBrain, 
    description: 'Mental focus and psychological state',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700'
  },
  { 
    key: 'wellness', 
    label: 'Wellness', 
    color: '#F59E0B', 
    icon: FiSmile, 
    description: 'Overall health and well-being',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700'
  },
  { 
    key: 'technique', 
    label: 'Technique', 
    color: '#EF4444', 
    icon: FiTarget, 
    description: 'Technical skills execution',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700'
  },
  { 
    key: 'tactical', 
    label: 'Tactical', 
    color: '#6366F1', 
    icon: FiZap, 
    description: 'Game strategy and decision making',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700'
  }
];

// Expanded Modal Component
const ExpandedGraphModal = ({ isOpen, onClose, metric, data, athleteName }: any) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className={`p-4 sm:p-6 ${metric.bgColor} border-b ${metric.borderColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl ${metric.bgColor} ${metric.borderColor} border`}>
                  <metric.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.textColor}`} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{metric.label} Performance</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">{athleteName} • {metric.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto">
            <div className="h-[350px] sm:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                  <defs>
                    <linearGradient id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any) => [`${value?.toFixed(1)}%`, metric.label]}
                    labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={`${metric.key}Score`} 
                    stroke={metric.color} 
                    strokeWidth={3}
                    fill={`url(#gradient-${metric.key})`}
                    dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" label="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const AthleteProgressTracker: React.FC<AthleteProgressTrackerProps> = ({ athletes }) => {
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30');
  const [skillHistory, setSkillHistory] = useState<SkillHistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedModal, setExpandedModal] = useState<{ metric: any, isOpen: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch skill history data
  const fetchSkillHistory = async (studentId: string, days: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/skills/history?studentId=${studentId}&days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch skill history');
      }
      const data = await response.json();
      setSkillHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching skill history:', err);
      setError('Failed to load progress data');
      setSkillHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAthlete) {
      fetchSkillHistory(selectedAthlete, selectedDateRange);
    }
  }, [selectedAthlete, selectedDateRange]);

  // Calculate latest values and trends
  const latestMetrics = useMemo(() => {
    if (!skillHistory.length) return {};
    
    const latest = skillHistory[skillHistory.length - 1];
    const previous = skillHistory.length > 1 ? skillHistory[skillHistory.length - 2] : null;
    
    return metricConfig.reduce((acc, metric) => {
      const key = `${metric.key}Score` as keyof SkillHistoryData;
      const currentValue = latest[key] as number || 0;
      const previousValue = previous ? (previous[key] as number || 0) : currentValue;
      const trend = currentValue - previousValue;
      
      acc[metric.key] = {
        value: currentValue,
        trend,
        trendPercentage: previousValue > 0 ? ((trend / previousValue) * 100) : 0
      };
      return acc;
    }, {} as Record<string, { value: number; trend: number; trendPercentage: number }>);
  }, [skillHistory]);

  // Export functionality
  const handleExport = async () => {
    const element = document.getElementById('progress-tracker');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${athletes.find(a => a.id === selectedAthlete)?.name || 'athlete'}-progress-report.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const selectedAthleteName = athletes.find(a => a.id === selectedAthlete)?.name || '';
    
    return (
    <div id="progress-tracker" className="h-full flex flex-col bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Mobile: Top Row - Athlete & Date Selection */}
          <div className="flex items-center gap-2 sm:gap-4">
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base sm:px-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select Athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 text-sm sm:text-base sm:px-4 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>

            {/* Mobile Menu Button */}
              <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
              <FiMenu className="w-5 h-5" />
              </button>
          </div>
          
          {/* Desktop: Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Note
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </motion.button>
        </div>
      </div>

        {/* Mobile: Action Menu */}
      <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden mt-3 flex gap-2 overflow-hidden"
            >
                  <button
                onClick={() => {
                  setIsAddingNote(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Note
                    </button>
              
                    <button
                onClick={() => {
                  handleExport();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Export
                    </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {!selectedAthlete ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FiUser className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">Select an athlete to view their progress</p>
            </div>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-red-600">
              <p className="text-sm sm:text-base">{error}</p>
                  </div>
                </div>
        ) : (
          <>
            {/* Performance Overview */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Performance Overview</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {metricConfig.map((metric) => {
                  const metricData = latestMetrics[metric.key] || { value: 0, trend: 0, trendPercentage: 0 };
                  
                    return (
                    <motion.div
                        key={metric.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`bg-white rounded-xl shadow-sm border ${metric.borderColor} overflow-hidden hover:shadow-md transition-shadow`}
                    >
                      {/* Metric Header */}
                      <div className={`p-3 sm:p-4 ${metric.bgColor}`}>
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${metric.bgColor} ${metric.borderColor} border`}>
                              <metric.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.textColor}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm sm:text-base text-gray-900">{metric.label}</h3>
                              <p className="text-xs text-gray-600 hidden sm:block">{metric.description}</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedModal({ metric, isOpen: true })}
                            className="p-1 sm:p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                            title="Expand graph"
                          >
                            <FiMaximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          </motion.button>
                </div>
              </div>

                      {/* Metric Value and Trend */}
                      <div className="p-3 sm:p-4">
                        <div className="flex items-end justify-between mb-3 sm:mb-4">
                          <div>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                              {metricData.value.toFixed(0)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">Current Score</p>
                          </div>
                          <div className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm ${
                            metricData.trend > 0 ? 'bg-green-50 text-green-700' : 
                            metricData.trend < 0 ? 'bg-red-50 text-red-700' : 
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {metricData.trend > 0 ? (
                              <FiArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : metricData.trend < 0 ? (
                              <FiArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : null}
                            <span className="font-medium">
                              {Math.abs(metricData.trendPercentage).toFixed(1)}%
                            </span>
                    </div>
                  </div>

                        {/* Mini Chart */}
                        <div className="h-16 sm:h-20">
                    <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={skillHistory.slice(-7)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <Line
                              type="monotone"
                                dataKey={`${metric.key}Score`} 
                              stroke={metric.color}
                                strokeWidth={2}
                                dot={false}
                              />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Expanded Graph Modal */}
      {expandedModal && (
        <ExpandedGraphModal
          isOpen={expandedModal.isOpen}
          onClose={() => setExpandedModal(null)}
          metric={expandedModal.metric}
          data={skillHistory}
          athleteName={selectedAthleteName}
        />
      )}

      {/* Add Note Modal - Mobile Optimized */}
      <AnimatePresence>
        {isAddingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            onClick={() => setIsAddingNote(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold mb-4">Add Progress Note</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full h-24 sm:h-32 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none text-sm sm:text-base"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteText('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (noteText.trim() && selectedAthlete) {
                      try {
                        const response = await fetch('/api/skills/notes', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            studentId: selectedAthlete,
                            note: noteText.trim()
                          })
                        });
                        if (response.ok) {
                          setIsAddingNote(false);
                          setNoteText('');
                          // Refresh data
                          fetchSkillHistory(selectedAthlete, selectedDateRange);
                        }
                      } catch (err) {
                        console.error('Failed to add note:', err);
                      }
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AthleteProgressTracker; 