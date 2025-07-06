'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CreateBadgeModal from '@/components/CreateBadgeModal';
import { levelColors, categoryColors } from '@/lib/constants';

interface BadgeData {
  badgeId?: string;
  badgeName?: string;
  id?: string;
  name?: string;
  level: string;
  category: string;
  progress?: number;
  description: string;
  motivationalText: string;
  icon: string;
  earned?: boolean;
  earnedAt?: string;
  color?: string;
  sport?: string;
  isActive?: boolean;
  _count?: {
    studentBadges: number;
  };
}



export default function BadgeCentrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      let response;
      
      // Check if user is a coach
      if ((session?.user as any)?.role === 'COACH') {
        // For coaches, fetch all badges for management
        response = await fetch('/api/badges?manage=true');
      } else {
        // For athletes, fetch their progress badges
        response = await fetch('/api/badges?type=progress');
      }
      
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
      } else {
        console.error('Error fetching badges:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCoach = (session?.user as any)?.role === 'COACH';
  
  const completedBadges = isCoach ? badges : badges.filter(b => b.earned);
  const lockedBadges = isCoach ? [] : badges.filter(b => !b.earned);
  const customBadges = isCoach ? badges.filter(b => {
    const categoryName = typeof b.category === 'object' ? (b.category as any)?.name : b.category;
    return categoryName === 'Custom';
  }) : [];

  const getFilteredBadges = (badgeList: BadgeData[]) => {
    let filteredBadges = badgeList;

    // Category filter
    if (activeFilter !== 'all') {
      filteredBadges = filteredBadges.filter(b => {
        const badgeCategory = typeof b.category === 'object' ? (b.category as any)?.name : b.category;
        return badgeCategory === activeFilter;
      });
    }

    // Level filter
    if (levelFilter !== 'all') {
      filteredBadges = filteredBadges.filter(b => b.level === levelFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredBadges = filteredBadges.filter(b => {
        const badgeName = (b.name || b.badgeName || '').toLowerCase();
        const badgeDescription = (b.description || '').toLowerCase();
        return badgeName.includes(query) || badgeDescription.includes(query);
      });
    }

    // Custom badges only filter
    if (showOnlyCustom && isCoach) {
      filteredBadges = filteredBadges.filter(b => {
        const categoryName = typeof b.category === 'object' ? (b.category as any)?.name : b.category;
        return categoryName === 'Custom';
      });
    }

    return filteredBadges;
  };

  const categories = ['all', ...Array.from(new Set(badges.map(b => {
    if (typeof b.category === 'object' && (b.category as any)?.name) {
      return (b.category as any).name;
    }
    return b.category || 'General';
  })))];

  const levels = ['all', ...Array.from(new Set(badges.map(b => b.level)))];
  const totalFilteredBadges = getFilteredBadges(badges).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* <Navigation /> */}
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500">        </div>
      </div>
      
      {/* Create Badge Modal */}
      {showCreateModal && (
        <CreateBadgeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onBadgeCreated={fetchBadges}
        />
      )}
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
          {(session?.user as any)?.role === 'COACH' ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-lg font-semibold">
                🏆 Manage and create badges for your athletes ✨
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 text-sm bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium shadow-lg flex items-center gap-1.5 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Create Badge</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          ) : (
            <p className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-lg font-semibold">
              🚀 Track your achievements and unlock new badges ✨
            </p>
          )}
        </div>

        {/* Summary Stats - Top Priority Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {isCoach ? (
            <>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">{badges.length}</div>
                <div className="text-sm font-medium text-gray-300">Total Badges</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-blue-400 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{customBadges.length}</div>
                <div className="text-sm font-medium text-gray-300">Custom Badges</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-yellow-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (customBadges.length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {badges.filter(b => b.isActive !== false).length}
                </div>
                <div className="text-sm font-medium text-gray-300">Active Badges</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-green-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (badges.filter(b => b.isActive !== false).length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {badges.reduce((sum, badge) => sum + (badge._count?.studentBadges || 0), 0)}
                </div>
                <div className="text-sm font-medium text-gray-300">Awards Given</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-purple-400 h-1 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-green-400 mb-2">{completedBadges.length}</div>
                <div className="text-sm font-medium text-gray-300">Earned</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-green-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (completedBadges.length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-gray-400 mb-2">{lockedBadges.length}</div>
                <div className="text-sm font-medium text-gray-300">Locked</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-gray-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (lockedBadges.length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {badges.length > 0 ? Math.round((completedBadges.length / badges.length) * 100) : 0}%
                </div>
                <div className="text-sm font-medium text-gray-300">Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (completedBadges.length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{badges.length}</div>
                <div className="text-sm font-medium text-gray-300">Total</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-3">
                  <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </>
          )}
        </div>



        {/* Badge Display Section */}
        {totalFilteredBadges > 0 ? (
          <div className="space-y-8">
            {isCoach ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏆</span>
                    <h2 className="text-2xl font-bold text-white">Badge Management</h2>
                    <span className="ml-3 text-xl font-medium text-gray-400">({badges.length})</span>
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    Showing {badges.length} of {badges.length} badges
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {getFilteredBadges(badges).map((badge) => (
                    <BadgeCard 
                      key={badge.id || badge.badgeId} 
                      badge={badge} 
                      isCompleted={true} 
                      isCoach={true} 
                      isCustom={customBadges.some(cb => (cb.id || cb.badgeId) === (badge.id || badge.badgeId))}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Completed Badges Section for Athletes */}
                {getFilteredBadges(completedBadges).length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="mr-2">🏆</span>
                      <span>Completed Badges</span>
                      <span className="ml-2 text-lg text-gray-400">({getFilteredBadges(completedBadges).length})</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {getFilteredBadges(completedBadges).map((badge) => (
                        <BadgeCard key={badge.badgeId} badge={badge} isCompleted={true} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Locked Badges Section for Athletes */}
                {getFilteredBadges(lockedBadges).length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <span className="mr-2">🔒</span>
                      <span>Locked Badges</span>
                      <span className="ml-2 text-lg text-gray-400">({getFilteredBadges(lockedBadges).length})</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {getFilteredBadges(lockedBadges).map((badge) => (
                        <BadgeCard key={badge.badgeId} badge={badge} isCompleted={false} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            {badges.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🏅</div>
                <h3 className="text-xl font-semibold mb-2 text-white">No badges yet</h3>
                <p className="text-gray-400">Start your journey to unlock amazing badges!</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-white">No badges match your filters</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search criteria or clearing the filters.</p>
                <button
                  onClick={() => {
                    setActiveFilter('all');
                    setLevelFilter('all');
                    setSearchQuery('');
                    setShowOnlyCustom(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Badge Modal */}
      {showCreateModal && (
        <CreateBadgeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onBadgeCreated={fetchBadges}
        />
      )}
    </div>
  );
}

function BadgeCard({ badge, isCompleted, isCoach = false, isCustom = false }: { 
  badge: BadgeData; 
  isCompleted: boolean; 
  isCoach?: boolean; 
  isCustom?: boolean; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelColor = levelColors[badge.level as keyof typeof levelColors] || '#6B7280';
  const categoryName = typeof badge.category === 'object' ? (badge.category as any)?.name : badge.category;
  const categoryColor = categoryColors[categoryName || 'General'] || '#6B7280';
  const badgeName = badge.name || badge.badgeName || 'Unknown Badge';
  const badgeId = badge.id || badge.badgeId || 'unknown';

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
            {badgeName}
          </h3>

          {/* Progress Bar for locked badges */}
          {!isCompleted && badge.progress !== undefined && (
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
          
          {/* Coach-specific info */}
          {isCoach && badge._count?.studentBadges !== undefined && (
            <div className="text-xs text-blue-400 mb-2">
              {badge._count.studentBadges} awards given
            </div>
          )}
          
          {/* Custom badge indicator */}
          {isCustom && (
            <div className="text-xs text-yellow-400 mb-2">
              ⭐ Custom Badge
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
              {(categoryName || 'General').split(' ')[0]}
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
            {badgeName}
          </h3>

          {/* Badge Description */}
          <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-300' : 'text-gray-500'}`}>
            {badge.description}
          </p>

          {/* Progress Bar for locked badges */}
          {!isCompleted && badge.progress !== undefined && (
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
              {categoryName || 'General'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 