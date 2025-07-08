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
  
  // New state for coach tab system
  const [activeTab, setActiveTab] = useState<'badges' | 'students'>('badges');
  const [studentsProgress, setStudentsProgress] = useState<any[]>([]);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchBadges();
      if ((session?.user as any)?.role === 'COACH') {
        fetchStudentsProgress();
      }
    }
  }, [session]);

  useEffect(() => {
    if ((session?.user as any)?.role === 'COACH' && activeTab === 'students') {
      fetchStudentsProgress();
    }
  }, [activeTab]);

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

  const fetchStudentsProgress = async () => {
    if ((session?.user as any)?.role !== 'COACH') return;
    
    setLoadingStudents(true);
    try {
      const response = await fetch('/api/badges/student-progress');
      if (response.ok) {
        const data = await response.json();
        setStudentsProgress(data.students || []);
        setProgressSummary(data.summary || null);
      } else {
        console.error('Error fetching student progress:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoadingStudents(false);
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
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Back Button & Title */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button 
                onClick={() => router.back()}
                className="p-2.5 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    Badge Centre
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium hidden sm:block">
                    Track achievements & unlock rewards
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section - User Info */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm sm:text-base font-semibold text-white">
                  {session?.user?.name || 'Athlete'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-xs text-gray-300 font-medium whitespace-nowrap">
                    {isCoach ? 'Coach' : 'All-Rounder'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border border-gray-600/30 hover:shadow-xl transition-all duration-200">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm font-medium text-white">
              {session?.user?.name || 'Athlete'}
                </span>
              </div>
              <span className="text-xs text-gray-300 font-medium px-3 py-1 bg-gray-700/50 rounded-full whitespace-nowrap">
                {isCoach ? 'Coach' : 'All-Rounder'}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
        <div className="mb-6 sm:mb-8">
          {(session?.user as any)?.role === 'COACH' ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <p className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-base sm:text-lg font-semibold">
                🏆 Manage and create badges for your athletes ✨
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-2 text-sm bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Badge</span>
              </button>
            </div>
          ) : (
            <p className="text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-base sm:text-lg font-semibold">
            🚀 Track your achievements and unlock new badges ✨
          </p>
          )}
        </div>

        {/* Tab System for Coaches */}
        {(session?.user as any)?.role === 'COACH' && (
          <div className="mb-6 sm:mb-8">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'badges'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Badge Management</span>
                  <span className="sm:hidden">Badges</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'students'
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <span className="hidden sm:inline">My Athletes</span>
                  <span className="sm:hidden">Athletes</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats - Top Priority Display */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
          {isCoach ? (
            activeTab === 'badges' ? (
              <>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">{badges.length}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Total Badges</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-blue-400 h-1 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-yellow-400 mb-1 sm:mb-2">{customBadges.length}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Custom Badges</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-yellow-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (customBadges.length / badges.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">
                    {badges.filter(b => b.isActive !== false).length}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Active Badges</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-green-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (badges.filter(b => b.isActive !== false).length / badges.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">
                    {badges.reduce((sum, badge) => sum + (badge._count?.studentBadges || 0), 0)}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Awards Given</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-purple-400 h-1 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">{progressSummary?.totalStudents || 0}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">My Athletes</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-green-400 h-1 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">{progressSummary?.averageProgress || 0}%</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Avg Progress</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${progressSummary?.averageProgress || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-yellow-400 mb-1 sm:mb-2">{progressSummary?.totalBadgesEarned || 0}</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300">Total Earned</div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="text-xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">
                    {progressSummary?.topPerformer ? '🏆' : '⭐'}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-300 truncate">
                    {progressSummary?.topPerformer?.name || 'Top Performer'}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                    <div className="bg-purple-400 h-1 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">{completedBadges.length}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">Earned</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-green-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (completedBadges.length / badges.length) * 100 : 0}%` }}></div>
          </div>
        </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-xl sm:text-3xl font-bold text-gray-400 mb-1 sm:mb-2">{lockedBadges.length}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">Locked</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-gray-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (lockedBadges.length / badges.length) * 100 : 0}%` }}></div>
          </div>
          </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">
              {badges.length > 0 ? Math.round((completedBadges.length / badges.length) * 100) : 0}%
            </div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-blue-400 h-1 rounded-full" style={{ width: `${badges.length > 0 ? (completedBadges.length / badges.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 text-center border border-gray-700 hover:border-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-xl sm:text-3xl font-bold text-yellow-400 mb-1 sm:mb-2">{badges.length}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-300">Total</div>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-2 sm:mt-3">
                  <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '100%' }}></div>
          </div>
          </div>
            </>
          )}
        </div>



        {/* Content Display Section */}
        {isCoach ? (
          activeTab === 'badges' ? (
            totalFilteredBadges > 0 ? (
              <div className="space-y-8">
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
            )
          ) : (
            <StudentProgressView 
              students={studentsProgress}
              loading={loadingStudents}
              summary={progressSummary}
            />
          )
        ) : (
          totalFilteredBadges > 0 ? (
            <div className="space-y-8">
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
              {getFilteredBadges(lockedBadges).map((badge: any, index: number) => (
                <BadgeCard key={index} badge={badge} isCompleted={false} />
              ))}
            </div>
          </div>
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
          )
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

function StudentProgressView({ students, loading, summary }: { 
  students: any[]; 
  loading: boolean; 
  summary: any; 
}) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold mb-2 text-white">No assigned athletes</h3>
        <p className="text-gray-400">Assign athletes to track their badge progress!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">👥</span>
          <h2 className="text-2xl font-bold text-white">My Athletes Progress</h2>
          <span className="ml-3 text-xl font-medium text-gray-400">({students.length})</span>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((studentData) => (
          <StudentCard 
            key={studentData.student.id} 
            studentData={studentData}
            onClick={() => setSelectedStudent(studentData)}
          />
        ))}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal 
          studentData={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

function StudentCard({ studentData, onClick }: { 
  studentData: any; 
  onClick: () => void; 
}) {
  const { student, badges, recentBadges } = studentData;
  const progressColor = badges.progressPercentage >= 75 ? 'text-green-400' : 
                       badges.progressPercentage >= 50 ? 'text-yellow-400' : 
                       badges.progressPercentage >= 25 ? 'text-orange-400' : 'text-red-400';

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
    >
      {/* Student Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{student.name}</h3>
            <p className="text-sm text-gray-400">{student.sport} • Age {student.age}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${progressColor}`}>
            {badges.progressPercentage}%
          </div>
          <div className="text-xs text-gray-400">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">Badge Progress</span>
          <span className="text-gray-400">{badges.earned} / {badges.total}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${badges.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-300">Recent Activity</span>
          <span className="text-xs text-green-400">{badges.recent} this month</span>
        </div>
        
        {recentBadges.length > 0 ? (
          <div className="flex space-x-2">
            {recentBadges.slice(0, 3).map((recentBadge: any, index: number) => (
              <div
                key={index}
                className="flex-1 bg-gray-700 rounded-lg p-2 text-center"
                title={recentBadge.badge.name}
              >
                <div className="text-lg mb-1">{recentBadge.badge.icon}</div>
                <div className="text-xs text-gray-400 truncate">
                  {recentBadge.badge.name}
                </div>
              </div>
            ))}
            {recentBadges.length > 3 && (
              <div className="flex-1 bg-gray-700 rounded-lg p-2 text-center flex items-center justify-center">
                <span className="text-xs text-gray-400">+{recentBadges.length - 3}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <span className="text-gray-500 text-sm">No recent badges</span>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors">
          <span className="text-sm font-medium">View Details</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function StudentDetailModal({ studentData, onClose }: { 
  studentData: any; 
  onClose: () => void; 
}) {
  const { student, badges, recentBadges, allBadgeProgress } = studentData;
  const [activeTab, setActiveTab] = useState('progress');

  // Separate earned and locked badges
  const earnedBadges = allBadgeProgress ? allBadgeProgress.filter((badge: any) => badge.earned) : [];
  const lockedBadges = allBadgeProgress ? allBadgeProgress.filter((badge: any) => !badge.earned) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{student.name}</h2>
              <p className="text-gray-400">{student.sport} • {student.academy} • Age {student.age}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'progress'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Progress Overview
          </button>
          <button
            onClick={() => setActiveTab('earned')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'earned'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Earned Badges ({earnedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'locked'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Locked Badges ({lockedBadges.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Progress Overview Tab */}
          {activeTab === 'progress' && (
            <>
              {/* Progress Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{badges.earned}</div>
                  <div className="text-sm text-gray-400">Earned</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{badges.progressPercentage}%</div>
                  <div className="text-sm text-gray-400">Progress</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{badges.recent}</div>
                  <div className="text-sm text-gray-400">This Month</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{badges.total}</div>
                  <div className="text-sm text-gray-400">Total Available</div>
                </div>
              </div>

              {/* Recent Badges */}
              {recentBadges.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Badges (Last 30 Days)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentBadges.map((recentBadge: any, index: number) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4 flex items-center space-x-3">
                        <div className="text-3xl">{recentBadge.badge.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{recentBadge.badge.name}</h4>
                          <p className="text-sm text-gray-400">{recentBadge.badge.category} • {recentBadge.badge.level}</p>
                          {recentBadge.awardedAt && (
                            <p className="text-xs text-green-400">
                              Earned {new Date(recentBadge.awardedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Breakdown */}
              {Object.keys(badges.categoryBreakdown || {}).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Badge Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(badges.categoryBreakdown).map(([category, count]: [string, any]) => (
                      <div key={category} className="bg-gray-700 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">{count}</div>
                        <div className="text-sm text-gray-400">{category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Earned Badges Tab */}
          {activeTab === 'earned' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge: any, index: number) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{badge.badgeName}</h4>
                      <p className="text-sm text-gray-400">{badge.category} • {badge.level}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-green-400">
                      ✓ Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              {earnedBadges.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No badges earned yet</p>
                </div>
              )}
            </div>
          )}

          {/* Locked Badges Tab */}
          {activeTab === 'locked' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedBadges.map((badge: any, index: number) => (
                <div key={index} className="bg-gray-700/50 rounded-lg p-4 opacity-75">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl grayscale">{badge.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-gray-300 font-medium">{badge.badgeName}</h4>
                      <p className="text-sm text-gray-500">{badge.category} • {badge.level}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{badge.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-400">{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 italic">{badge.motivationalText}</p>
                </div>
              ))}
              {lockedBadges.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">All badges have been earned!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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