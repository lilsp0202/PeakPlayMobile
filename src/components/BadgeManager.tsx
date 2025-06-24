"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Edit, 
  Trash2, 
  X, 
  Trophy,
  User,
  Settings
} from "lucide-react";
import { useSession } from "next-auth/react";

interface BadgeManagerProps {
  onEditBadge?: (badge: any) => void;
  onDeleteBadge?: (badgeId: string) => void;
  refreshTrigger?: number;
}

type TabType = 'coach' | 'system';

export default function BadgeManager({ onEditBadge, onDeleteBadge, refreshTrigger }: BadgeManagerProps = {}) {
  const { data: session } = useSession();
  const [coachBadges, setCoachBadges] = useState<any[]>([]);
  const [systemBadges, setSystemBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('coach');
  const [showAll, setShowAll] = useState<{coach: boolean, system: boolean}>({coach: false, system: false});
  const lastRefreshTrigger = useRef<number>(0);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/badges?manage=true');
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch badges: ${response.status} ${errorData}`);
      }
      const data = await response.json();
      
      // Set coach badges and system badges from the API response
      setCoachBadges(Array.isArray(data.coachBadges) ? data.coachBadges : []);
      setSystemBadges(Array.isArray(data.systemBadges) ? data.systemBadges : []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Add effect to watch for refresh trigger - only trigger if value actually changed
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && refreshTrigger !== lastRefreshTrigger.current) {
      lastRefreshTrigger.current = refreshTrigger;
      fetchBadges();
    }
  }, [refreshTrigger, fetchBadges]);

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;
    try {
      const response = await fetch(`/api/badges/${badgeId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete badge');
      }
      // Remove from coach badges only (since only coach badges can be deleted)
      setCoachBadges(prev => prev.filter(badge => badge.id !== badgeId));
      if (onDeleteBadge) onDeleteBadge(badgeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete badge';
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const renderBadgeGrid = (badges: any[], tab: TabType) => {
    const badgesToShow = showAll[tab] ? badges : badges.slice(0, 6);

    if (badges.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
            <Trophy className="h-10 w-10 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {tab === 'coach' ? 'No Custom Badges Created Yet' : 'No Default Badges Available'}
          </h3>
          <p className="text-gray-600 mb-6">
            {tab === 'coach' 
              ? 'Start creating personalized badges to motivate and reward your students for their achievements.' 
              : 'Default system badges will appear here once available.'}
          </p>
          {tab === 'coach' && (
            <button
              onClick={() => onEditBadge && onEditBadge(null)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏆 Create Your First Badge
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badgesToShow.map((badge, index) => (
            <div
              key={`badge-${badge.id}`}
              className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-yellow-300 flex flex-col justify-between"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                  badge.level === 'CHAMPION' ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                  badge.level === 'ATHLETE' ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' :
                  badge.level === 'ROOKIE' ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white' :
                  badge.level === 'GOLD' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  badge.level === 'SILVER' ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                  badge.level === 'BRONZE' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white'
                }`}>
                  <Trophy />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-200 mb-1">
                    {badge.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      badge.level === 'CHAMPION' ? 'bg-yellow-100 text-yellow-800' :
                      badge.level === 'ATHLETE' ? 'bg-cyan-100 text-cyan-800' :
                      badge.level === 'ROOKIE' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {badge.level}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {badge.category?.name || 'General'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-3">
                {badge.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-lg font-medium">
                    {badge.sport || 'ALL'} Sport
                  </span>
                  {badge._count?.studentBadges > 0 && (
                    <span className="text-xs text-green-600 px-2 py-1 bg-green-100 rounded-lg font-medium">
                      {badge._count.studentBadges} awarded
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {tab === 'coach' && (
                    <>
                      {onEditBadge && (
                        <button
                          onClick={() => onEditBadge(badge)}
                          className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit badge"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                        className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Delete badge"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    </>
                  )}
                  {tab === 'system' && (
                    <span className="text-xs text-blue-600 px-3 py-1 bg-blue-100 rounded-full font-medium">
                      System Badge
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {badges.length > 6 && (
          <div className="flex justify-center mt-8">
            <button
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={() => setShowAll(prev => ({...prev, [tab]: !prev[tab]}))}
            >
              {showAll[tab] ? 'Show Less' : `Show ${badges.length - 6} More Badges`}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Badge Management</h3>
        <button
          onClick={fetchBadges}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {/* Add New Badge Button */}
      <div className="mb-4">
        <button
          onClick={() => onEditBadge && onEditBadge(null)}
          className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
        >
          + Create New Badge
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('coach')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'coach'
                ? 'text-cyan-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{
              borderBottomColor: activeTab === 'coach' ? '#06B6D4' : undefined
            }}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Badges ({coachBadges.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'system'
                ? 'text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{
              borderBottomColor: activeTab === 'system' ? '#A78BFA' : undefined
            }}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Default Badges ({systemBadges.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      ) : (
        <div className="mt-6">
          {activeTab === 'coach' && renderBadgeGrid(coachBadges, 'coach')}
          {activeTab === 'system' && renderBadgeGrid(systemBadges, 'system')}
        </div>
      )}
    </div>
  );
} 