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
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
  ComposedChart
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
  FiMenu,
  FiInfo,
  FiAward,
  FiClock,
  FiBarChart2,
  FiPieChart,
  FiRefreshCw
} from 'react-icons/fi';
import { BiBrain, BiLineChart } from 'react-icons/bi';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
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

// Enhanced metric configuration with gradients and animations
const metricConfig = [
  { 
    key: 'physical', 
    label: 'Physical', 
    color: '#3B82F6',
    gradient: 'from-blue-400 to-blue-600',
    lightGradient: 'from-blue-50 to-blue-100',
    icon: FiActivity, 
    description: 'Strength, speed, and endurance metrics',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    shadowColor: 'shadow-blue-200',
    glowColor: 'hover:shadow-blue-300'
  },
  { 
    key: 'nutrition', 
    label: 'Nutrition', 
    color: '#10B981',
    gradient: 'from-emerald-400 to-emerald-600',
    lightGradient: 'from-emerald-50 to-emerald-100',
    icon: FiHeart, 
    description: 'Dietary intake and nutrition balance',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    shadowColor: 'shadow-emerald-200',
    glowColor: 'hover:shadow-emerald-300'
  },
  { 
    key: 'mental', 
    label: 'Mental', 
    color: '#8B5CF6',
    gradient: 'from-purple-400 to-purple-600',
    lightGradient: 'from-purple-50 to-purple-100',
    icon: BiBrain, 
    description: 'Mental focus and psychological state',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    shadowColor: 'shadow-purple-200',
    glowColor: 'hover:shadow-purple-300'
  },
  { 
    key: 'wellness', 
    label: 'Wellness', 
    color: '#F59E0B',
    gradient: 'from-amber-400 to-amber-600',
    lightGradient: 'from-amber-50 to-amber-100',
    icon: FiSmile, 
    description: 'Overall health and well-being',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    shadowColor: 'shadow-amber-200',
    glowColor: 'hover:shadow-amber-300'
  },
  { 
    key: 'technique', 
    label: 'Technique', 
    color: '#EF4444',
    gradient: 'from-red-400 to-red-600',
    lightGradient: 'from-red-50 to-red-100',
    icon: FiTarget, 
    description: 'Technical skills execution',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    shadowColor: 'shadow-red-200',
    glowColor: 'hover:shadow-red-300'
  },
  { 
    key: 'tactical', 
    label: 'Tactical', 
    color: '#6366F1',
    gradient: 'from-indigo-400 to-indigo-600',
    lightGradient: 'from-indigo-50 to-indigo-100',
    icon: FiZap, 
    description: 'Game strategy and decision making',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    shadowColor: 'shadow-indigo-200',
    glowColor: 'hover:shadow-indigo-300'
  }
];

// Custom animated tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200"
    >
      <p className="font-semibold text-gray-800 mb-2">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      {payload.map((entry: any, index: number) => {
        const metric = metricConfig.find(m => `${m.key}Score` === entry.dataKey);
        if (!metric) return null;
        
        return (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${metric.gradient}`} />
            <span className="text-sm text-gray-600">{metric.label}:</span>
            <span className="text-sm font-semibold">{entry.value?.toFixed(1)}%</span>
          </div>
        );
      })}
    </motion.div>
  );
};

// Custom animated dot
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  const metric = metricConfig.find(m => `${m.key}Score` === dataKey);
  
  if (!metric) return null;
  
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={4}
      fill={metric.color}
      stroke="white"
      strokeWidth={2}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.5 }}
      style={{ cursor: 'pointer' }}
    />
  );
};

// Enhanced Expanded Modal with mobile-friendly design
const ExpandedGraphModal = ({ isOpen, onClose, metric, data, athleteName }: any) => {
  const [viewType, setViewType] = useState<'line' | 'area' | 'bar'>('area');
  
  if (!isOpen) return null;

  const averageScore = data.reduce((sum: number, d: any) => sum + (d[`${metric.key}Score`] || 0), 0) / data.length;
  const maxScore = Math.max(...data.map((d: any) => d[`${metric.key}Score`] || 0));
  const minScore = Math.min(...data.map((d: any) => d[`${metric.key}Score`] || 0));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden mx-4 my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header - Mobile Optimized */}
          <div className={`p-4 sm:p-6 bg-gradient-to-r ${metric.gradient} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <motion.div 
                  className="p-2 sm:p-3 bg-white/20 backdrop-blur-md rounded-xl flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <metric.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">{metric.label} Analysis</h2>
                  <p className="text-white/80 text-sm sm:text-base truncate">{athleteName} • {metric.description}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-colors flex-shrink-0"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </div>

            {/* View Type Selector - Mobile Optimized */}
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {[
                { type: 'area', icon: FiBarChart2, label: 'Area' },
                { type: 'line', icon: BiLineChart, label: 'Line' },
                { type: 'bar', icon: FiPieChart, label: 'Bar' }
              ].map((view) => (
                <motion.button
                  key={view.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewType(view.type as any)}
                  className={`px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all whitespace-nowrap ${
                    viewType === view.type 
                      ? 'bg-white text-gray-800 shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{view.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stats Cards - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50">
            {[
              { label: 'Average', value: averageScore.toFixed(1), icon: FiActivity },
              { label: 'Maximum', value: maxScore.toFixed(1), icon: FiTrendingUp },
              { label: 'Minimum', value: minScore.toFixed(1), icon: FiArrowDown },
              { label: 'Data Points', value: data.length, icon: FiCalendar }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-3 sm:p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${metric.textColor}`} />
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">
                  {stat.value}{stat.label !== 'Data Points' ? '%' : ''}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Modal Body with Chart - Mobile Optimized */}
          <div className="p-4 sm:p-6 overflow-y-auto bg-white">
            <div className="h-[300px] sm:h-[400px] md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'area' ? (
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id={`gradient-modal-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={metric.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey={`${metric.key}Score`} 
                      stroke={metric.color} 
                      strokeWidth={2}
                      fill={`url(#gradient-modal-${metric.key})`}
                      dot={<CustomDot />}
                    />
                    <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" />
                    <ReferenceLine y={averageScore} stroke="#6366f1" strokeDasharray="3 3" />
                  </AreaChart>
                ) : viewType === 'line' ? (
                  <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey={`${metric.key}Score`} 
                      stroke={metric.color} 
                      strokeWidth={2}
                      dot={{ fill: metric.color, strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" />
                  </LineChart>
                ) : (
                  <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey={`${metric.key}Score`} fill={metric.color} radius={[4, 4, 0, 0]}>
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={metric.color} />
                      ))}
                    </Bar>
                    <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" />
                  </BarChart>
                )}
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
  const [selectedVisualization, setSelectedVisualization] = useState<'overview' | 'comparison' | 'radar'>('overview');

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

  // Calculate latest values and trends with enhanced metrics
  const latestMetrics = useMemo(() => {
    if (!skillHistory.length) return {};
    
    const latest = skillHistory[skillHistory.length - 1];
    const previous = skillHistory.length > 1 ? skillHistory[skillHistory.length - 2] : null;
    const weekAgo = skillHistory.length > 7 ? skillHistory[skillHistory.length - 8] : null;
    
    return metricConfig.reduce((acc, metric) => {
      const key = `${metric.key}Score` as keyof SkillHistoryData;
      const currentValue = latest[key] as number || 0;
      const previousValue = previous ? (previous[key] as number || 0) : currentValue;
      const weekAgoValue = weekAgo ? (weekAgo[key] as number || 0) : currentValue;
      const trend = currentValue - previousValue;
      const weekTrend = currentValue - weekAgoValue;
      const average = skillHistory.reduce((sum, h) => sum + (h[key] as number || 0), 0) / skillHistory.length;
      
      acc[metric.key] = {
        value: currentValue,
        trend,
        weekTrend,
        trendPercentage: previousValue > 0 ? ((trend / previousValue) * 100) : 0,
        weekTrendPercentage: weekAgoValue > 0 ? ((weekTrend / weekAgoValue) * 100) : 0,
        average,
        status: currentValue >= 75 ? 'excellent' : currentValue >= 50 ? 'good' : 'needs-improvement'
      };
      return acc;
    }, {} as Record<string, any>);
  }, [skillHistory]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    if (!skillHistory.length) return [];
    
    const latest = skillHistory[skillHistory.length - 1];
    return metricConfig.map(metric => ({
      metric: metric.label,
      score: latest[`${metric.key}Score` as keyof SkillHistoryData] as number || 0,
      fullMark: 100
    }));
  }, [skillHistory]);

  // Export functionality with enhanced PDF
  const handleExport = async () => {
    const element = document.getElementById('progress-tracker');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add header
      pdf.setFontSize(20);
      pdf.text('Athlete Progress Report', 105, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(`Athlete: ${athletes.find(a => a.id === selectedAthlete)?.name || 'Unknown'}`, 20, 25);
      pdf.text(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 32);
      pdf.text(`Period: Last ${selectedDateRange} days`, 20, 39);
      
      // Add image
      pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, imgHeight);
      
      pdf.save(`${athletes.find(a => a.id === selectedAthlete)?.name || 'athlete'}-progress-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const selectedAthleteName = athletes.find(a => a.id === selectedAthlete)?.name || '';
    
  return (
    <div id="progress-tracker" className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sm:px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Athlete & Date Selection */}
          <div className="flex items-center gap-2 sm:gap-4">
            <motion.select
              whileHover={{ scale: 1.02 }}
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 text-sm sm:text-base sm:px-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </motion.select>
            
            <motion.select
              whileHover={{ scale: 1.02 }}
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 text-sm sm:text-base sm:px-4 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </motion.select>

            {/* Visualization Toggle */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { id: 'overview', icon: FiBarChart2, label: 'Overview' },
                { id: 'comparison', icon: BiLineChart, label: 'Trends' },
                { id: 'radar', icon: FiPieChart, label: 'Radar' }
              ].map((view) => (
                <motion.button
                  key={view.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedVisualization(view.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedVisualization === view.id
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                </motion.button>
          ))}
        </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              <FiMenu className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Desktop: Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchSkillHistory.bind(null, selectedAthlete, selectedDateRange)}
              disabled={!selectedAthlete || loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingNote(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FiPlus className="w-4 h-4" />
              Add Note
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
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
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Note
              </button>
              
              <button
                onClick={() => {
                  handleExport();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm flex items-center justify-center gap-2"
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiUser className="w-10 h-10 text-blue-600" />
              </motion.div>
              <p className="text-gray-600 text-lg font-medium">Select an athlete to view their progress</p>
              <p className="text-gray-400 text-sm mt-2">Choose from the dropdown above to get started</p>
          </div>
          </motion.div>
        ) : loading ? (
              <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading performance data...</p>
                  </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-red-50 rounded-xl p-8 max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiX className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={() => fetchSkillHistory(selectedAthlete, selectedDateRange)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
                  </button>
                </div>
              </motion.div>
        ) : skillHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiTrendingUp className="w-10 h-10 text-amber-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Progress Data Available</h3>
              <p className="text-gray-600 mb-6">
                This athlete doesn't have any skill history data yet. Progress tracking will begin once skill assessments are completed.
              </p>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-left">
                <p className="font-semibold text-blue-800 mb-3">To start tracking progress:</p>
                <ul className="space-y-2">
                  {[
                    'Complete skill assessments in SkillSnap',
                    'Record match performances',
                    'Add wellness and nutrition data'
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      <span className="text-sm text-blue-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
          </div>
            </div>
          </motion.div>
        ) : skillHistory.length < 7 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <FiCalendar className="w-10 h-10 text-amber-600" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Limited Data Available</h3>
              <p className="text-gray-600 mb-6">
                Only {skillHistory.length} data point{skillHistory.length === 1 ? '' : 's'} available. 
                Meaningful progress graphs require at least 7 data points for trend analysis.
              </p>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                <p className="font-semibold text-amber-800 mb-3">Current Data Points:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skillHistory.map((point, index) => {
                    const avgScore = (
                      (point.physicalScore || 0) + 
                      (point.mentalScore || 0) + 
                      (point.nutritionScore || 0) + 
                      (point.wellnessScore || 0) + 
                      (point.techniqueScore || 0) + 
                      (point.tacticalScore || 0)
                    ) / 6;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center bg-white rounded-lg px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">
                          {format(parseISO(point.date), 'MMM d, yyyy')}
                        </span>
                        <span className="text-sm font-semibold text-amber-600">
                          {avgScore.toFixed(1)}%
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
        </div>
          </motion.div>
        ) : (
          <>
            {/* Performance Overview Cards */}
            <div className="mb-6">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <FiActivity className="w-5 h-5 text-blue-600" />
      </div>
                Performance Metrics
              </motion.h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {metricConfig.map((metric, index) => {
                  const metricData = latestMetrics[metric.key] || { value: 0, trend: 0, trendPercentage: 0, status: 'needs-improvement' };
                  
                  return (
          <motion.div
                      key={metric.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                      whileHover={{ scale: 1.02, translateY: -4 }}
                      className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                      onClick={() => setExpandedModal({ metric, isOpen: true })}
                    >
                      {/* Metric Header */}
                      <div className={`p-4 bg-gradient-to-br ${metric.lightGradient}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
            <motion.div
                              className={`p-2.5 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all`}
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <metric.icon className={`w-5 h-5 ${metric.textColor}`} />
                            </motion.div>
                    <div>
                              <h3 className="font-semibold text-gray-800">{metric.label}</h3>
                              <p className="text-xs text-gray-600 mt-0.5">{metric.description}</p>
                    </div>
                  </div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="p-1.5 bg-white/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiMaximize2 className="w-4 h-4 text-gray-600" />
                          </motion.div>
                </div>

                        {/* Value Display */}
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-800">
                                {metricData.value.toFixed(0)}
                              </span>
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {metricData.trend > 0 ? (
                                <FiArrowUp className="w-4 h-4 text-emerald-600" />
                              ) : metricData.trend < 0 ? (
                                <FiArrowDown className="w-4 h-4 text-red-600" />
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
                              )}
                              <span className={`text-sm font-medium ${
                                metricData.trend > 0 ? 'text-emerald-600' : 
                                metricData.trend < 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {metricData.trend > 0 ? '+' : ''}{metricData.trendPercentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-gray-500">vs last</span>
                            </div>
                  </div>

                          {/* Mini Chart */}
                          <div className="w-24 h-12">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={skillHistory.slice(-7)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id={`mini-gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <Area 
                                  type="monotone" 
                                  dataKey={`${metric.key}Score`} 
                                  stroke={metric.color} 
                                  strokeWidth={2}
                                  fill={`url(#mini-gradient-${metric.key})`}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                    </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            metricData.status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                            metricData.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {metricData.status === 'excellent' ? 'Excellent' :
                             metricData.status === 'good' ? 'Good' : 'Needs Work'}
                  </div>
                          <span className="text-xs text-gray-500">
                            Avg: {metricData.average?.toFixed(1)}%
                          </span>
                </div>
                      </div>
                    </motion.div>
                    );
                  })}
                </div>
              </div>

            {/* Main Visualization Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              {/* Visualization Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedVisualization === 'overview' && 'Performance Overview'}
                  {selectedVisualization === 'comparison' && 'Trend Analysis'}
                  {selectedVisualization === 'radar' && 'Skills Radar Chart'}
                </h3>
                
                {/* Mobile Visualization Toggle */}
                <div className="lg:hidden flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  {[
                    { id: 'overview', icon: FiBarChart2 },
                    { id: 'comparison', icon: BiLineChart },
                    { id: 'radar', icon: FiPieChart }
                  ].map((view) => (
                    <motion.button
                      key={view.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedVisualization(view.id as any)}
                      className={`p-2 rounded-lg transition-all ${
                        selectedVisualization === view.id
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600'
                      }`}
                    >
                      <view.icon className="w-4 h-4" />
                    </motion.button>
                  ))}
                    </div>
                  </div>

              {/* Chart Container - Mobile Optimized */}
              <div className="h-[350px] sm:h-[400px] md:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                  {selectedVisualization === 'overview' ? (
                    <ComposedChart data={skillHistory} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <defs>
                        {metricConfig.map(metric => (
                          <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                        interval="preserveStartEnd"
                        />
                        <YAxis 
                          domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        width={35}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                        wrapperStyle={{ paddingTop: 10 }}
                        iconType="circle"
                        />
                      {metricConfig.map((metric) => (
                        <Area
                          key={metric.key}
                          type="monotone"
                          dataKey={`${metric.key}Score`}
                          name={metric.label}
                          stroke={metric.color}
                          strokeWidth={2}
                          fill={`url(#gradient-${metric.key})`}
                          stackId="1"
                          />
                        ))}
                    </ComposedChart>
                  ) : selectedVisualization === 'comparison' ? (
                    <LineChart data={skillHistory} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        width={35}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: 10 }}
                        iconType="line"
                      />
                      {metricConfig.map((metric) => (
                            <Line
                              key={metric.key}
                              type="monotone"
                          dataKey={`${metric.key}Score`}
                          name={metric.label}
                              stroke={metric.color}
                              strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                      <ReferenceLine y={75} stroke="#10b981" strokeDasharray="5 5" label="Target" />
                      </LineChart>
                  ) : (
                    <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <PolarRadiusAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                      />
                      <Radar 
                        name="Current Score" 
                        dataKey="score" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar 
                        name="Target" 
                        dataKey={() => 75} 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </RadarChart>
                  )}
                    </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Expanded Modal */}
      {expandedModal && (
        <ExpandedGraphModal
          isOpen={expandedModal.isOpen}
          onClose={() => setExpandedModal(null)}
          metric={expandedModal.metric}
          data={skillHistory}
          athleteName={selectedAthleteName}
        />
      )}
    </div>
  );
};

export default AthleteProgressTracker; 