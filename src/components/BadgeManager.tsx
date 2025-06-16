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
        <div className="text-center py-8">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {tab === 'coach' ? 'No custom badges' : 'No default badges'}
          </h3>
          <p className="mt-1 text-sm text-gray-700">
            {tab === 'coach' 
              ? 'Get started by creating your first custom badge.' 
              : 'Default system badges will appear here.'}
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgesToShow.map((badge) => (
            <div
              key={`badge-${badge.id}`}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-2xl font-bold ${
                  badge.level === 'CHAMPION' ? 'text-amber-800' :  // Dark text for gold background
                  badge.level === 'ATHLETE' ? 'text-cyan-800' :    // Dark text for cyan background  
                  badge.level === 'ROOKIE' ? 'text-purple-800' :   // Dark text for purple background
                  badge.level === 'GOLD' ? 'bg-yellow-100 text-yellow-600' :
                  badge.level === 'SILVER' ? 'bg-gray-100 text-gray-600' :
                  badge.level === 'BRONZE' ? 'bg-orange-100 text-orange-600' :
                  'bg-indigo-100 text-indigo-600'
                }`} style={{
                  backgroundColor: 
                    badge.level === 'CHAMPION' ? '#FDE68A' :  // Light gold background
                    badge.level === 'ATHLETE' ? '#CFFAFE' :   // Light cyan background (#06B6D4 tint)
                    badge.level === 'ROOKIE' ? '#DDD6FE' :    // Light purple background (#A78BFA tint)
                    undefined
                }}>
                  <Trophy />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">{badge.name}</h4>
                  <p className="text-xs text-gray-500">{badge.level} • {badge.category?.name || 'General'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-800 mb-2 line-clamp-2">{badge.description || 'No description'}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-500">{badge.sport || 'ALL'} Sport</span>
                <div className="flex gap-2">
                  {tab === 'coach' && (
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="p-1 text-red-500 hover:text-white hover:bg-red-500 rounded transition"
                      title="Delete badge"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  {tab === 'system' && (
                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                      System Badge
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {badges.length > 6 && (
          <div className="flex justify-center mt-4">
            <button
              className="text-indigo-600 hover:underline font-medium"
              onClick={() => setShowAll(prev => ({...prev, [tab]: !prev[tab]}))}
            >
              {showAll[tab] ? 'Show Less' : `Show More (${badges.length - 6} more)`}
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