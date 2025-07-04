'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BadgeData {
  badgeId: string;
  badgeName: string;
  level: string;
  category: string;
  progress: number;
  description: string;
  motivationalText: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
  color?: string;
}

const levelColors = {
  ROOKIE: '#4CAF50',
  AMATEUR: '#2196F3', 
  PRO: '#9C27B0'
};

const categoryColors: { [key: string]: string } = {
  'Physical Fitness': '#4CAF50',
  'Technical Skills': '#2196F3',
  'Wellness & Nutrition': '#FF9800',
  'Match Performance': '#9C27B0',
  'Consistency': '#F44336'
};

export default function BadgeCentrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBadges();
    }
  }, [session]);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/badges?type=progress');
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedBadges = badges.filter(b => b.earned);
  const lockedBadges = badges.filter(b => !b.earned);

  const getFilteredBadges = (badgeList: BadgeData[]) => {
    if (activeFilter === 'all') return badgeList;
    return badgeList.filter(b => b.category === activeFilter);
  };

  const categories = ['all', ...Array.from(new Set(badges.map(b => b.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* <Navigation /> */}
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold">Badge Centre</h1>
            </div>
            <div className="text-sm text-gray-400">
              {session?.user?.name || 'Athlete'}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <p className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-lg font-semibold">
            🚀 Track your achievements and unlock new badges ✨
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'All Badges' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{completedBadges.length}</div>
            <div className="text-sm text-gray-400">Earned</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{lockedBadges.length}</div>
            <div className="text-sm text-gray-400">Locked</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {badges.length > 0 ? Math.round((completedBadges.length / badges.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-400">Progress</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{badges.length}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>

        {/* Completed Badges Section */}
        {getFilteredBadges(completedBadges).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">🏆</span>
              Completed Badges ({getFilteredBadges(completedBadges).length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {getFilteredBadges(completedBadges).map((badge) => (
                <BadgeCard key={badge.badgeId} badge={badge} isCompleted={true} />
              ))}
            </div>
          </div>
        )}

        {/* Locked Badges Section */}
        {getFilteredBadges(lockedBadges).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">🔒</span>
              Locked Badges ({getFilteredBadges(lockedBadges).length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {getFilteredBadges(lockedBadges).map((badge) => (
                <BadgeCard key={badge.badgeId} badge={badge} isCompleted={false} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {badges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏅</div>
            <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
            <p className="text-gray-400">Start your journey to unlock amazing badges!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({ badge, isCompleted }: { badge: BadgeData; isCompleted: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelColor = levelColors[badge.level as keyof typeof levelColors] || '#6B7280';
  const categoryColor = categoryColors[badge.category] || '#6B7280';

  return (
    <div
      className={`relative rounded-lg transition-all duration-300 cursor-pointer ${
        isCompleted
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-lg'
          : 'bg-gray-800 opacity-75'
      } ${isExpanded ? 'col-span-2 md:col-span-1' : ''}`}
      style={{
        borderTop: isCompleted ? `3px solid ${categoryColor}` : '3px solid #4B5563'
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact View */}
      {!isExpanded ? (
        <div className="p-3">
          {/* Level Badge */}
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: isCompleted ? `${levelColor}20` : '#37415120',
              color: isCompleted ? levelColor : '#6B7280',
              border: `1px solid ${isCompleted ? levelColor : '#4B5563'}`
            }}
          >
            {badge.level}
          </div>

          {/* Badge Icon */}
          <div className={`text-3xl mb-2 ${!isCompleted && 'grayscale'}`}>{badge.icon}</div>

          {/* Badge Name */}
          <h3 className={`text-sm font-bold mb-1 ${isCompleted ? 'text-white' : 'text-gray-400'}`} style={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}>
            {badge.badgeName}
          </h3>

          {/* Progress Bar for locked badges */}
          {!isCompleted && (
            <div className="mb-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{badge.progress}%</div>
            </div>
          )}

          {/* Earned date for completed badges */}
          {isCompleted && badge.earnedAt && (
            <div className="text-xs text-green-400 mb-2">
              ✓ {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          )}

          {/* Expand Button */}
          <div className="flex justify-between items-center mt-2">
            <span
              className="inline-block px-2 py-1 rounded text-xs"
              style={{
                backgroundColor: isCompleted ? `${categoryColor}20` : '#37415120',
                color: isCompleted ? categoryColor : '#6B7280'
              }}
            >
              {badge.category.split(' ')[0]}
            </span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Expanded View */
        <div className="p-4">
          {/* Header with collapse button */}
          <div className="flex justify-between items-start mb-3">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                backgroundColor: isCompleted ? `${levelColor}20` : '#37415120',
                color: isCompleted ? levelColor : '#6B7280',
                border: `2px solid ${isCompleted ? levelColor : '#4B5563'}`
              }}
            >
              {badge.level}
            </div>
            <button 
              className="text-gray-400 hover:text-white transition-colors p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* Badge Icon */}
          <div className={`text-5xl mb-4 ${!isCompleted && 'grayscale'}`}>{badge.icon}</div>

          {/* Badge Name */}
          <h3 className={`text-lg font-bold mb-2 ${isCompleted ? 'text-white' : 'text-gray-400'}`}>
            {badge.badgeName}
          </h3>

          {/* Badge Description */}
          <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
            {badge.description}
          </p>

          {/* Progress Bar for locked badges */}
          {!isCompleted && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Progress</span>
                <span className="text-gray-400">{badge.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Motivational Text or Earned Date */}
          <div className={`text-xs italic mb-3 ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
            {isCompleted ? (
              <>
                <div className="mb-1">{badge.motivationalText}</div>
                {badge.earnedAt && (
                  <div className="text-gray-400">
                    Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}
              </>
            ) : (
              badge.motivationalText
            )}
          </div>

          {/* Category Tag */}
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: isCompleted ? `${categoryColor}20` : '#37415120',
                color: isCompleted ? categoryColor : '#6B7280'
              }}
            >
              {badge.category}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 