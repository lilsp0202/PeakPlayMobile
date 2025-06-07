"use client";

import { useState, useEffect } from "react";
import { 
  Edit, 
  Trash2, 
  X, 
  Trophy
} from "lucide-react";

interface BadgeManagerProps {
  onEditBadge?: (badge: any) => void;
  onDeleteBadge?: (badgeId: string) => void;
}

export default function BadgeManager({ onEditBadge, onDeleteBadge }: BadgeManagerProps = {}) {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/badges?manage=true');
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch badges: ${response.status} ${errorData}`);
      }

      const data = await response.json();
      console.log('BadgeManager - Fetched badges:', data);
      setBadges(Array.isArray(data.badges) ? data.badges : []);
    } catch (err) {
      console.error('BadgeManager - Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;
    
    try {
      const response = await fetch(`/api/badges/${badgeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete badge');
      }

      setBadges(prev => prev.filter(badge => badge.id !== badgeId));
      
      if (onDeleteBadge) {
        onDeleteBadge(badgeId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete badge');
    }
  };

  const handleEditBadge = (badge: any) => {
    if (onEditBadge) {
      onEditBadge(badge);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <X className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Badge Management</h3>
        <button
          onClick={fetchBadges}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No badges</h3>
          <p className="mt-1 text-sm text-gray-700">
            Get started by creating your first badge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={`badge-${badge.id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    badge.level === 'GOLD' ? 'bg-yellow-100' :
                    badge.level === 'SILVER' ? 'bg-gray-100' :
                    badge.level === 'BRONZE' ? 'bg-orange-100' :
                    'bg-indigo-100'
                  }`}>
                    <Trophy className={`h-4 w-4 ${
                      badge.level === 'GOLD' ? 'text-yellow-600' :
                      badge.level === 'SILVER' ? 'text-gray-600' :
                      badge.level === 'BRONZE' ? 'text-orange-600' :
                      'text-indigo-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{String(badge.name || 'Unnamed Badge')}</h4>
                    <p className="text-xs text-gray-700">
                      {String(badge.level || 'BRONZE')} • {String(badge.category?.name || badge.categoryName || 'General')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditBadge(badge)}
                    className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    title="Edit badge"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(String(badge.id))}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete badge"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-3">{String(badge.description || 'No description')}</p>

              {badge.motivationalText && (
                <div className="bg-gray-50 rounded-md p-2 mb-3">
                  <p className="text-xs text-gray-800 italic">"{String(badge.motivationalText)}"</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>{String(badge.sport || 'ALL')} Sports</span>
                <span>{Array.isArray(badge.rules) ? badge.rules.length : 0} Rules</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 