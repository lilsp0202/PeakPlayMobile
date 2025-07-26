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
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';
import {
  FiActivity,
  FiTrendingUp,
  FiTarget,
  FiSmile,
  FiHeart,
  FiX,
  FiZap,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiMaximize2,
  FiDownload,
  FiSettings
} from 'react-icons/fi';
import { BiBrain, BiLineChart } from 'react-icons/bi';
import { format, subDays, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';
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

interface EnhancedAthleteProgressTrackerProps {
  athletes: Athlete[];
}

interface CustomDateRange {
  startDate: string;
  endDate: string;
}

// Enhanced metric configuration with subtle, modern colors
const metricConfig = [
  { 
    key: 'physical', 
    label: 'Physical', 
    color: '#6366f1',
    gradient: 'from-indigo-500/80 to-indigo-600/80',
    lightBg: 'bg-indigo-50/60',
    icon: FiActivity, 
    description: 'Strength, endurance & agility'
  },
  { 
    key: 'nutrition', 
    label: 'Nutrition', 
    color: '#10b981',
    gradient: 'from-emerald-500/80 to-emerald-600/80',
    lightBg: 'bg-emerald-50/60',
    icon: FiHeart, 
    description: 'Diet & nutrition balance'
  },
  { 
    key: 'mental', 
    label: 'Mental', 
    color: '#8b5cf6',
    gradient: 'from-violet-500/80 to-violet-600/80',
    lightBg: 'bg-violet-50/60',
    icon: BiBrain, 
    description: 'Focus & mental resilience'
  },
  { 
    key: 'wellness', 
    label: 'Wellness', 
    color: '#f59e0b',
    gradient: 'from-amber-500/80 to-amber-600/80',
    lightBg: 'bg-amber-50/60',
    icon: FiSmile, 
    description: 'Sleep, recovery & mood'
  },
  { 
    key: 'technique', 
    label: 'Technique', 
    color: '#ef4444',
    gradient: 'from-rose-500/80 to-rose-600/80',
    lightBg: 'bg-rose-50/60',
    icon: FiTarget, 
    description: 'Technical skill execution'
  },
  { 
    key: 'tactical', 
    label: 'Tactical', 
    color: '#06b6d4',
    gradient: 'from-cyan-500/80 to-cyan-600/80',
    lightBg: 'bg-cyan-50/60',
    icon: FiZap, 
    description: 'Game strategy & IQ'
  }
];

// Fill data gaps for better visualization
const fillDataGaps = (data: SkillHistoryData[], startDate: Date, endDate: Date): SkillHistoryData[] => {
  if (data.length === 0) return [];
  
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  const dataMap = new Map(data.map(d => [d.date, d]));
  
  return allDates.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dataMap.get(dateStr) || {
      date: dateStr,
      physicalScore: null,
      nutritionScore: null,
      mentalScore: null,
      wellnessScore: null,
      techniqueScore: null,
      tacticalScore: null
    };
  });
};

// Enhanced mobile-friendly tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-200/50 max-w-xs z-50"
    >
      <p className="font-semibold text-gray-800 mb-2 text-sm">
        {format(parseISO(label), 'MMM d, yyyy')}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => {
          const metric = metricConfig.find(m => `${m.key}Score` === entry.dataKey);
          if (!metric || entry.value === null) return null;
          
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: metric.color }}
                />
                <span className="text-xs text-gray-600">{metric.label}</span>
              </div>
              <span className="text-xs font-semibold text-gray-800">
                {entry.value?.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
      {payload.some((entry: any) => entry.value === null) && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">Some metrics have no data</span>
        </div>
      )}
    </motion.div>
  );
};

// Custom dot component that handles null values
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  const metric = metricConfig.find(m => `${m.key}Score` === dataKey);
  
  if (!metric || payload[dataKey] === null) return null;
  
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={3}
      fill={metric.color}
      stroke="white"
      strokeWidth={2}
      whileHover={{ scale: 1.4 }}
      style={{ cursor: 'pointer' }}
    />
  );
};

// Enhanced Modal for detailed metric view
const MetricDetailModal = ({ isOpen, onClose, metric, data, athleteName }: any) => {
  if (!isOpen || !metric) return null;

  const validData = data.filter((d: any) => d[`${metric.key}Score`] !== null);
  const averageScore = validData.length > 0 ? 
    validData.reduce((sum: number, d: any) => sum + (d[`${metric.key}Score`] || 0), 0) / validData.length : 0;
  const maxScore = validData.length > 0 ? 
    Math.max(...validData.map((d: any) => d[`${metric.key}Score`] || 0)) : 0;
  const minScore = validData.length > 0 ? 
    Math.min(...validData.map((d: any) => d[`${metric.key}Score`] || 0)) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-4 sm:p-6 bg-gradient-to-r ${metric.gradient} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <metric.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{metric.label} Progress</h2>
                  <p className="text-white/80 text-sm">{athleteName} • {metric.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-gray-50/50">
            {[
              { label: 'Average', value: averageScore, icon: FiActivity, suffix: '%' },
              { label: 'Peak Score', value: maxScore, icon: FiTrendingUp, suffix: '%' },
              { label: 'Lowest', value: minScore, icon: FiArrowDown, suffix: '%' },
              { label: 'Data Points', value: validData.length, icon: FiCalendar, suffix: '' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}{stat.suffix}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <div className="p-4 sm:p-6">
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11 }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={`${metric.key}Score`}
                    stroke={metric.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${metric.key})`}
                    connectNulls={false}
                    dot={<CustomDot />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Custom Date Range Modal
const CustomDateRangeModal = ({ 
  isOpen, 
  onClose, 
  onApply, 
  currentRange 
}: {
  isOpen: boolean;
  onClose: () => void;
  onApply: (range: CustomDateRange) => void;
  currentRange: CustomDateRange;
}) => {
  const [startDate, setStartDate] = useState(currentRange.startDate);
  const [endDate, setEndDate] = useState(currentRange.endDate);
  const [error, setError] = useState('');

  const handleApply = () => {
    if (!startDate || !endDate) {
      setError('Both start and end dates are required');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      setError('Start date must be before end date');
      return;
    }

    const daysDiff = differenceInDays(end, start);
    if (daysDiff > 365) {
      setError('Date range cannot exceed 365 days');
      return;
    }

    setError('');
    onApply({ startDate, endDate });
    onClose();
  };

  const handleReset = () => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    setStartDate(format(thirtyDaysAgo, 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    setError('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Custom Date Range</h2>
                  <p className="text-white/80 text-sm">Select your preferred time period</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  min={startDate}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Quick Selection */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Selection</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '7 Days', days: 7 },
                  { label: '30 Days', days: 30 },
                  { label: '90 Days', days: 90 },
                  { label: '180 Days', days: 180 }
                ].map((option) => (
                  <button
                    key={option.days}
                    onClick={() => {
                      const today = new Date();
                      const startDay = subDays(today, option.days - 1);
                      setStartDate(format(startDay, 'yyyy-MM-dd'));
                      setEndDate(format(today, 'yyyy-MM-dd'));
                      setError('');
                    }}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Apply Range
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Enhanced Component
const EnhancedAthleteProgressTracker: React.FC<EnhancedAthleteProgressTrackerProps> = ({ athletes }) => {
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('30');
  const [selectedVisualization, setSelectedVisualization] = useState<'overview' | 'trends' | 'radar'>('overview');
  const [skillHistory, setSkillHistory] = useState<SkillHistoryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; metric?: any }>({ isOpen: false });
  const [customDateRangeModal, setCustomDateRangeModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Fetch data from API with custom date range support
  const fetchSkillHistory = async (athleteId: string, dateRangeOrDays: string) => {
    if (!athleteId) return;
    
    setLoading(true);
    setError('');
    
    try {
      let apiUrl: string;
      let startDate: Date;
      let endDate: Date;

      if (dateRangeOrDays === 'custom') {
        // Use custom date range
        startDate = new Date(customDateRange.startDate);
        endDate = new Date(customDateRange.endDate);
        const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
        apiUrl = `/api/skills/history?studentId=${athleteId}&days=${days}&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      } else {
        // Use predefined days
        const days = parseInt(dateRangeOrDays);
        startDate = subDays(new Date(), days - 1);
        endDate = new Date();
        apiUrl = `/api/skills/history?studentId=${athleteId}&days=${dateRangeOrDays}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress data');
      }
      
      // Fill gaps for better visualization
      const filledData = fillDataGaps(data.history || [], startDate, endDate);
      setSkillHistory(filledData);
      
    } catch (err: any) {
      setError(err.message || 'Unable to load progress data');
      setSkillHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAthlete) {
      fetchSkillHistory(selectedAthlete, selectedDateRange);
    }
  }, [selectedAthlete, selectedDateRange, customDateRange]);

  // Handle custom date range application
  const handleCustomDateRangeApply = (range: CustomDateRange) => {
    setCustomDateRange(range);
    setSelectedDateRange('custom');
    setCustomDateRangeModal(false);
  };

  // Handle date range change
  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setCustomDateRangeModal(true);
    } else {
      setSelectedDateRange(value);
    }
  };

  // Get display text for current date range
  const getDateRangeDisplayText = () => {
    if (selectedDateRange === 'custom') {
      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else {
      return `${selectedDateRange} Days`;
    }
  };

  // Calculate latest metrics with null handling
  const latestMetrics = useMemo(() => {
    if (!skillHistory.length) return {};
    
    const validDataPoints = skillHistory.filter(point => 
      metricConfig.some(metric => point[`${metric.key}Score` as keyof SkillHistoryData] !== null)
    );
    
    if (validDataPoints.length === 0) return {};
    
    const latest = validDataPoints[validDataPoints.length - 1];
    const previous = validDataPoints.length > 1 ? validDataPoints[validDataPoints.length - 2] : null;
    
    return metricConfig.reduce((acc, metric) => {
      const key = `${metric.key}Score` as keyof SkillHistoryData;
      const currentValue = latest[key] as number;
      const previousValue = previous ? (previous[key] as number) : null;
      
      if (currentValue === null) {
        acc[metric.key] = { value: null, trend: 0, status: 'no-data' };
        return acc;
      }
      
      const trend = previousValue !== null ? currentValue - previousValue : 0;
      
      acc[metric.key] = {
        value: currentValue,
        trend,
        trendPercentage: previousValue && previousValue > 0 ? ((trend / previousValue) * 100) : 0,
        status: currentValue >= 75 ? 'excellent' : currentValue >= 50 ? 'good' : 'needs-improvement'
      };
      return acc;
    }, {} as Record<string, any>);
  }, [skillHistory]);

  // Radar chart data
  const radarData = useMemo(() => {
    if (!skillHistory.length) return [];
    
    const validDataPoints = skillHistory.filter(point => 
      metricConfig.some(metric => point[`${metric.key}Score` as keyof SkillHistoryData] !== null)
    );
    
    if (validDataPoints.length === 0) return [];
    
    const latest = validDataPoints[validDataPoints.length - 1];
    return metricConfig
      .map(metric => ({
        metric: metric.label,
        score: latest[`${metric.key}Score` as keyof SkillHistoryData] as number || 0,
        fullMark: 100
      }))
      .filter(item => item.score > 0);
  }, [skillHistory]);

  // Export functionality
  const handleExport = async () => {
    const element = document.getElementById('enhanced-progress-tracker');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.setFontSize(18);
      pdf.text('Progress Report', 105, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      const athleteName = athletes.find(a => a.id === selectedAthlete)?.name || 'Unknown';
      pdf.text(`Athlete: ${athleteName}`, 20, 25);
      pdf.text(`Period: ${getDateRangeDisplayText()}`, 20, 32);
      pdf.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, 39);
      
      pdf.addImage(imgData, 'PNG', 10, 45, imgWidth, imgHeight);
      pdf.save(`${athleteName}-progress-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const selectedAthleteName = athletes.find(a => a.id === selectedAthlete)?.name || '';
  const hasData = skillHistory.some(point => 
    metricConfig.some(metric => point[`${metric.key}Score` as keyof SkillHistoryData] !== null)
  );

  return (
    <div id="enhanced-progress-tracker" className="h-full flex flex-col bg-gradient-to-br from-slate-50/50 to-gray-100/50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Selection Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <select
              value={selectedAthlete}
              onChange={(e) => setSelectedAthlete(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 px-3 py-2.5 text-sm bg-white/80 border border-gray-300/60 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
            >
              <option value="">Choose Athlete</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
            
            <div className="relative">
              <select
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="px-3 py-2.5 text-sm bg-white/80 border border-gray-300/60 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
              {selectedDateRange === 'custom' && (
                <button
                  onClick={() => setCustomDateRangeModal(true)}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
                  title="Edit custom range"
                >
                  <FiSettings className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {selectedDateRange === 'custom' && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200">
                <FiCalendar className="w-3 h-3" />
                <span>{getDateRangeDisplayText()}</span>
                <button
                  onClick={() => setCustomDateRangeModal(true)}
                  className="ml-auto text-indigo-600 hover:text-indigo-700"
                >
                  <FiSettings className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSkillHistory(selectedAthlete, selectedDateRange)}
              disabled={!selectedAthlete || loading}
              className="px-3 py-2.5 bg-gray-100/80 text-gray-700 rounded-lg hover:bg-gray-200/80 transition-all flex items-center gap-2 disabled:opacity-50 text-sm font-medium"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {hasData && (
              <button
                onClick={handleExport}
                className="px-3 py-2.5 bg-indigo-600/90 text-white rounded-lg hover:bg-indigo-700/90 transition-all flex items-center gap-2 text-sm font-medium"
              >
                <FiDownload className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Custom Date Range Display */}
        {selectedDateRange === 'custom' && (
          <div className="sm:hidden mt-2 flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200">
            <FiCalendar className="w-3 h-3" />
            <span>{getDateRangeDisplayText()}</span>
            <button
              onClick={() => setCustomDateRangeModal(true)}
              className="ml-auto text-indigo-600 hover:text-indigo-700"
            >
              <FiSettings className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 text-sm font-medium">Loading progress data...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-red-50/80 rounded-xl p-6 max-w-md border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-800 mb-2">Unable to Load Data</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={() => fetchSkillHistory(selectedAthlete, selectedDateRange)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : !selectedAthlete ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-white/80 rounded-xl shadow-sm p-8 max-w-md border border-gray-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiActivity className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Select an Athlete</h3>
              <p className="text-gray-600 text-sm">
                Choose an athlete from the dropdown to view their progress data and performance metrics.
              </p>
            </div>
          </motion.div>
        ) : !hasData ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center bg-white/80 rounded-xl shadow-sm p-8 max-w-md border border-gray-200/50">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Progress Data</h3>
              <p className="text-gray-600 text-sm mb-4">
                This athlete doesn't have any progress data in the selected time period.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="font-medium text-gray-800 mb-2 text-sm">Start tracking by:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Recording skill assessments</li>
                  <li>• Adding match performance data</li>
                  <li>• Updating wellness metrics</li>
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Performance Overview Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="w-4 h-4 text-indigo-600" />
                  </div>
                  Performance Overview
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {selectedAthleteName} • Last {selectedDateRange} days
                </span>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {metricConfig.map((metric, index) => {
                  const metricData = latestMetrics[metric.key] || { value: null, trend: 0, status: 'no-data' };
                  
                  return (
                    <motion.div
                      key={metric.key}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => setDetailModal({ isOpen: true, metric })}
                      className={`${metric.lightBg} border border-gray-200/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 backdrop-blur-sm`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-white/60 rounded-lg shadow-sm">
                            <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-gray-800">{metric.label}</h3>
                            <p className="text-xs text-gray-600">{metric.description}</p>
                          </div>
                        </div>
                        <FiMaximize2 className="w-3 h-3 text-gray-400" />
                      </div>
                      
                      <div className="space-y-1">
                        {metricData.value !== null ? (
                          <>
                            <p className="text-2xl font-bold text-gray-900">
                              {metricData.value.toFixed(1)}%
                            </p>
                            {metricData.trend !== 0 && (
                              <div className="flex items-center gap-1">
                                {metricData.trend > 0 ? (
                                  <FiArrowUp className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <FiArrowDown className="w-3 h-3 text-red-500" />
                                )}
                                <span className={`text-xs font-medium ${
                                  metricData.trend > 0 ? 'text-emerald-600' : 'text-red-500'
                                }`}>
                                  {Math.abs(metricData.trendPercentage).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-sm text-gray-500 font-medium">No data available</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Main Visualization */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Progress Timeline</h3>
                <div className="flex gap-1 bg-gray-100/70 rounded-lg p-1">
                  {[
                    { id: 'overview', icon: FiBarChart2, label: 'Overview' },
                    { id: 'trends', icon: BiLineChart, label: 'Trends' },
                    { id: 'radar', icon: FiPieChart, label: 'Radar' }
                  ].map((view) => (
                    <button
                      key={view.id}
                      onClick={() => setSelectedVisualization(view.id as any)}
                      className={`p-2 rounded-md transition-all text-sm font-medium ${
                        selectedVisualization === view.id
                          ? 'bg-white text-gray-800 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                      }`}
                    >
                      <view.icon className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">{view.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[320px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedVisualization === 'radar' && radarData.length > 0 ? (
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        tickCount={5}
                      />
                      <Radar
                        name="Performance"
                        dataKey="score"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Tooltip />
                    </RadarChart>
                  ) : selectedVisualization === 'overview' ? (
                    <BarChart data={skillHistory.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        width={30}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metricConfig.map((metric) => (
                        <Bar
                          key={metric.key}
                          dataKey={`${metric.key}Score`}
                          fill={metric.color}
                          name={metric.label}
                          radius={[2, 2, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  ) : (
                    <LineChart data={skillHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => format(parseISO(value), 'MMM d')}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                        width={30}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metricConfig.map((metric) => (
                        <Line
                          key={metric.key}
                          type="monotone"
                          dataKey={`${metric.key}Score`}
                          stroke={metric.color}
                          strokeWidth={2}
                          dot={<CustomDot />}
                          connectNulls={false}
                          name={metric.label}
                        />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <MetricDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false })}
        metric={detailModal.metric}
        data={skillHistory}
        athleteName={selectedAthleteName}
      />

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isOpen={customDateRangeModal}
        onClose={() => setCustomDateRangeModal(false)}
        onApply={handleCustomDateRangeApply}
        currentRange={customDateRange}
      />
    </div>
  );
};

export default EnhancedAthleteProgressTracker; 