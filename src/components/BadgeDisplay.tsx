"use client";

import { useState, useEffect } from "react";
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
  ChevronUp
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
  BRONZE: 'from-orange-400 to-orange-600',
  SILVER: 'from-gray-400 to-gray-600', 
  GOLD: 'from-yellow-400 to-yellow-600',
  PLATINUM: 'from-purple-400 to-purple-600',
  DIAMOND: 'from-blue-400 to-blue-600'
};

const LEVEL_GLOW = {
  BRONZE: 'shadow-amber-500/50',
  SILVER: 'shadow-gray-500/50',
  GOLD: 'shadow-yellow-500/50', 
  PLATINUM: 'shadow-purple-500/50'
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

  const BadgeCard = ({ badge, isEarned }: { badge: Badge, isEarned: boolean }) => {
    const IconComponent = getIcon(badge.icon);
    const levelColor = LEVEL_COLORS[badge.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.BRONZE;

    return (
      <div className={`
        relative group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105
        ${isEarned 
          ? `bg-gradient-to-br ${levelColor} border-transparent shadow-md` 
          : 'bg-white border-gray-200 hover:border-gray-300'
        }
      `}>
        {/* Badge Level */}
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-1 text-xs font-semibold rounded-full
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
        <div className="flex justify-center mb-3">
          <div className={`
            p-3 rounded-full transition-all duration-300
            ${isEarned 
              ? 'bg-white/20 text-white shadow-lg' 
              : 'bg-gray-200 text-gray-400'
            }
          `}>
            <IconComponent className="w-8 h-8" />
          </div>
        </div>

        {/* Badge Info */}
        <div className="text-center">
          <h3 className={`
            font-bold text-sm mb-1
            ${isEarned ? 'text-white' : 'text-gray-700'}
          `}>
            {badge.name}
          </h3>
          
          <p className={`
            text-xs leading-tight mb-2
            ${isEarned ? 'text-white/80' : 'text-gray-500'}
          `}>
            {badge.description}
          </p>

          {/* Progress Bar for unearned badges */}
          {!isEarned && showProgress && (
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(badge.progress)}%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Date */}
          {isEarned && badge.earnedAt && (
            <div className="flex items-center justify-center mt-2 text-xs text-white/70">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(badge.earnedAt)}
            </div>
          )}
        </div>

        {/* Motivational Text Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
          {badge.motivationalText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Failed to load badges: {error}</p>
        <button 
          onClick={fetchBadges}
          className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
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

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Badges Yet</h3>
        <p className="text-gray-500">
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
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-white text-center">
          <div className="text-2xl font-bold">{earnedBadges.length}</div>
          <div className="text-sm opacity-80">Earned</div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white text-center">
          <div className="text-2xl font-bold">{unearnedBadges.length}</div>
          <div className="text-sm opacity-80">In Progress</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {earnedBadges.filter(b => b.level === 'GOLD').length}
          </div>
          <div className="text-sm opacity-80">Gold</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white text-center">
          <div className="text-2xl font-bold">
            {earnedBadges.filter(b => b.level === 'PLATINUM').length}
          </div>
          <div className="text-sm opacity-80">Platinum</div>
        </div>
      </div>

      {/* Earned Badges Section */}
      {earnedBadges.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowEarnedExpanded(!showEarnedExpanded)}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 transition-colors duration-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Trophy className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Earned Badges ({earnedBadges.length})
              </h2>
            </div>
            {showEarnedExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showEarnedExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {earnedBadges.map((badge, index) => (
                  <BadgeCard 
                    key={`earned-${badge.id}-${index}`} 
                    badge={badge} 
                    isEarned={true} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In Progress Badges Section */}
      {unearnedBadges.length > 0 && !showEarnedOnly && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                In Progress ({unearnedBadges.length})
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {unearnedBadges.map((badge, index) => (
                <BadgeCard 
                  key={`unearned-${badge.id}-${index}`} 
                  badge={badge} 
                  isEarned={false} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 