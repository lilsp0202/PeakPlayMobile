"use client";

import { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  TrendingUp, 
  Activity,
  Zap,
  Shield,
  Crown,
  Medal,
  Gem,
  Lock,
  BarChart3,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Heart
} from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  motivationalText: string;
  level: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  progress: number;
  category: string;
}

interface BadgeDisplayProps {
  studentId?: string;
  showProgress?: boolean;
  showEarnedOnly?: boolean;
  layout?: 'grid' | 'list';
}

const ICON_MAP = {
  trophy: Trophy,
  award: Award,
  star: Star,
  target: Target,
  trending: TrendingUp,
  activity: Activity,
  zap: Zap,
  shield: Shield,
  crown: Crown,
  medal: Medal,
  gem: Gem,
  user: User,
  barchart: BarChart3,
  calendar: Calendar
};

const LEVEL_COLORS = {
  ROOKIE: 'from-violet-300 to-purple-400',    // Light purple shade (#A78BFA)
  ATHLETE: 'from-cyan-400 to-blue-500',       // Cyan/blue shade (#06B6D4)
  CHAMPION: 'from-yellow-300 via-yellow-400 to-amber-400', // Shiny gold gradient
  // Legacy support
  BRONZE: 'from-amber-400 to-orange-500',
  SILVER: 'from-gray-400 to-slate-500',
  GOLD: 'from-yellow-400 to-amber-500',
  PLATINUM: 'from-purple-400 to-violet-500',
  DIAMOND: 'from-blue-400 to-cyan-500'
};

export default function BadgeDisplay({ 
  studentId, 
  showProgress = true, 
  showEarnedOnly = false,
  layout = 'grid'
}: BadgeDisplayProps) {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEarnedExpanded, setShowEarnedExpanded] = useState(true);
  const [showInProgressExpanded, setShowInProgressExpanded] = useState(false);
  const [showEarnedModal, setShowEarnedModal] = useState(false);
  const [showInProgressModal, setShowInProgressModal] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [studentId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('type', 'progress');
      if (studentId) {
        params.append('studentId', studentId);
      }
      
      const response = await fetch(`/api/badges?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch badges: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle different response formats based on API type
      let rawBadges = [];
      if (Array.isArray(data)) {
        // Direct array response (for type=progress)
        rawBadges = data;
      } else if (data.badges && Array.isArray(data.badges)) {
        // Wrapped response (for type=manage)
        rawBadges = data.badges;
      } else if (data.earned && Array.isArray(data.earned)) {
        // Response with earned property
        rawBadges = data.earned;
      } else if (data.progress && Array.isArray(data.progress)) {
        // Response with progress property
        rawBadges = data.progress;
      }
      
      console.log('BadgeDisplay - Raw badges data:', rawBadges);
      
      // Ensure each badge has a unique ID and required properties
      const processedBadges = rawBadges.map((badge: any, index: number) => ({
        id: badge.badgeId || badge.id || `badge-${index}`,
        name: badge.badgeName || badge.name || 'Unknown Badge',
        description: badge.description || '',
        motivationalText: badge.motivationalText || '',
        level: badge.level || 'BRONZE',
        icon: badge.icon || 'trophy',
        earned: Boolean(badge.earned),
        earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : undefined,
        progress: Number(badge.progress) || 0,
        category: badge.category || 'GENERAL'
      }));
      
      setAllBadges(processedBadges);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP] || Trophy;
    return IconComponent;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const BadgeCard = ({ badge, isEarned, compact = false }: { badge: Badge, isEarned: boolean, compact?: boolean }) => {
    const IconComponent = getIcon(badge.icon);
    const levelColor = LEVEL_COLORS[badge.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.ROOKIE;

    if (compact) {
      // Compact version for sidebar
      return (
        <div className={`
          relative group p-4 rounded-xl border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1
          ${isEarned 
            ? `bg-gradient-to-br ${levelColor} border-transparent shadow-md text-white` 
            : 'bg-white border-gray-200 hover:border-gray-300'
          }
        `}>
          {/* Badge Level */}
          <div className="absolute top-2 right-2">
            <span className={`
              px-2 py-1 text-xs font-bold rounded-full text-center min-w-[3rem]
              ${isEarned ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              {badge.level}
            </span>
          </div>

          {/* Lock icon for unearned badges */}
          {!isEarned && (
            <div className="absolute top-2 left-2">
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          )}

          {/* Badge Icon */}
          <div className="flex justify-center mb-4 mt-2">
            <div className={`
              p-4 rounded-full transition-all duration-300 shadow-lg
              ${isEarned 
                ? 'bg-white/20 text-white group-hover:scale-110' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }
            `}>
              <IconComponent className="w-8 h-8" />
            </div>
          </div>

          {/* Badge Info */}
          <div className="text-center space-y-2">
            <h3 className={`
              font-bold text-sm leading-tight
              ${isEarned ? 'text-white' : 'text-gray-800'}
            `}>
              {badge.name}
            </h3>
            
            <p className={`
              text-xs leading-relaxed line-clamp-2
              ${isEarned ? 'text-white/90' : 'text-gray-600'}
            `}>
              {badge.description}
            </p>

            {/* Progress Bar for unearned badges */}
            {!isEarned && showProgress && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-indigo-600">{Math.round(badge.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Earned Date */}
            {isEarned && badge.earnedAt && (
              <div className="flex items-center justify-center mt-2 text-xs text-white/80">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(badge.earnedAt)}
              </div>
            )}
          </div>

          {/* Motivational Text Tooltip */}
          {badge.motivationalText && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 max-w-48 text-center">
              {badge.motivationalText}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      );
    }

    // Full-size version for detailed views
    return (
      <div className={`
        relative group p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2
        ${isEarned 
          ? `bg-gradient-to-br ${levelColor} border-transparent shadow-lg text-white` 
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}>
        {/* Badge Level */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-3 py-1.5 text-sm font-bold rounded-full
            ${isEarned ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
          `}>
            {badge.level}
          </span>
        </div>

        {/* Lock icon for unearned badges */}
        {!isEarned && (
          <div className="absolute top-3 left-3">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Badge Icon */}
        <div className="flex justify-center mb-6 mt-2">
          <div className={`
            p-6 rounded-full transition-all duration-300 shadow-xl
            ${isEarned 
              ? 'bg-white/20 text-white group-hover:scale-110' 
              : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
            }
          `}>
            <IconComponent className="w-12 h-12" />
          </div>
        </div>

        {/* Badge Info */}
        <div className="text-center space-y-3">
          <h3 className={`
            font-bold text-lg leading-tight
            ${isEarned ? 'text-white' : 'text-gray-800'}
          `}>
            {badge.name}
          </h3>
          
          <p className={`
            text-sm leading-relaxed
            ${isEarned ? 'text-white/90' : 'text-gray-600'}
          `}>
            {badge.description}
          </p>

          {/* Progress Bar for unearned badges */}
          {!isEarned && showProgress && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-600">Progress</span>
                <span className="text-indigo-600">{Math.round(badge.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          {isEarned && badge.earnedAt && (
            <div className="flex items-center justify-center mt-3 text-sm text-white/80">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(badge.earnedAt)}
            </div>
          )}
        </div>

        {/* Motivational Text */}
        {badge.motivationalText && (
          <div className="mt-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <p className={`text-sm italic text-center ${isEarned ? 'text-white/90' : 'text-gray-600'}`}>
              "{badge.motivationalText}"
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        <p className="font-medium">Failed to load badges</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={fetchBadges}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Separate earned and unearned badges with proper filtering
  const earnedBadges = allBadges.filter(badge => badge && badge.earned);
  const unearnedBadges = allBadges.filter(badge => badge && !badge.earned);
  
  const displayBadges = showEarnedOnly ? earnedBadges : allBadges;

  // Modal component for viewing all badges
  const BadgeModal = ({ badges, title, isOpen, onClose, isEarned }: {
    badges: Badge[];
    title: string;
    isOpen: boolean;
    onClose: () => void;
    isEarned: boolean;
  }) => {
    if (!isOpen || typeof window === 'undefined') return null;

    const modalContent = (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
                {isEarned ? <Trophy className="h-5 w-5 text-white" /> : <Target className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-indigo-100 text-sm">{badges.length} badge{badges.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {badges.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  {isEarned ? <Trophy className="w-10 h-10 text-gray-400" /> : <Target className="w-10 h-10 text-gray-400" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {isEarned ? "No Badges Earned Yet" : "No Badges In Progress"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {isEarned 
                    ? "Keep training to earn your first badge!" 
                    : "Complete some activities to unlock new challenges!"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge, index) => (
                  <BadgeCard 
                    key={`modal-${badge.id}-${index}`} 
                    badge={badge} 
                    isEarned={isEarned}
                    compact={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isEarned ? (
                  <span>🎉 Great progress! You've earned {badges.length} badge{badges.length !== 1 ? 's' : ''}!</span>
                ) : (
                  <span>🎯 Keep going! {badges.length} badge{badges.length !== 1 ? 's' : ''} waiting to be unlocked!</span>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Badges Yet</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {showEarnedOnly 
            ? "Start training to earn your first badge!" 
            : "Keep practicing to unlock achievements!"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats - More compact for sidebar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 text-white text-center shadow-lg" style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' }}>
          <div className="text-xl font-bold">{earnedBadges.length}</div>
          <div className="text-xs font-medium opacity-90">Earned</div>
        </div>
        <div className="rounded-xl p-3 text-white text-center shadow-lg" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)' }}>
          <div className="text-xl font-bold">{unearnedBadges.length}</div>
          <div className="text-xs font-medium opacity-90">In Progress</div>
        </div>
      </div>

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowEarnedExpanded(!showEarnedExpanded)}
            className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)' }}>
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-800">Earned Badges</h3>
                <p className="text-xs text-gray-600">{earnedBadges.length} achievement{earnedBadges.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {showEarnedExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showEarnedExpanded && (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {earnedBadges.slice(0, 3).map((badge, index) => (
                  <BadgeCard 
                    key={`earned-${badge.id}-${index}`} 
                    badge={badge} 
                    isEarned={true}
                    compact={true}
                  />
                ))}
                {earnedBadges.length > 3 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setShowEarnedModal(true)}
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      <Trophy className="w-4 h-4" />
                      View all {earnedBadges.length} badges
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In Progress Badges Section */}
      {unearnedBadges.length > 0 && !showEarnedOnly && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowInProgressExpanded(!showInProgressExpanded)}
            className="w-full px-4 py-3 transition-colors duration-200 flex items-center justify-between hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)' }}>
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-800">In Progress</h3>
                <p className="text-xs text-gray-600">{unearnedBadges.length} badge{unearnedBadges.length !== 1 ? 's' : ''} to unlock</p>
              </div>
            </div>
            {showInProgressExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showInProgressExpanded && (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {unearnedBadges.slice(0, 2).map((badge, index) => (
                  <BadgeCard 
                    key={`unearned-${badge.id}-${index}`} 
                    badge={badge} 
                    isEarned={false}
                    compact={true}
                  />
                ))}
                {unearnedBadges.length > 2 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setShowInProgressModal(true)}
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-indigo-50"
                    >
                      <Target className="w-4 h-4" />
                      View all {unearnedBadges.length} badges
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Badge Modals */}
      <BadgeModal
        badges={earnedBadges}
        title="Earned Badges"
        isOpen={showEarnedModal}
        onClose={() => setShowEarnedModal(false)}
        isEarned={true}
      />

      <BadgeModal
        badges={unearnedBadges}
        title="Badges In Progress"
        isOpen={showInProgressModal}
        onClose={() => setShowInProgressModal(false)}
        isEarned={false}
      />
    </div>
  );
} 