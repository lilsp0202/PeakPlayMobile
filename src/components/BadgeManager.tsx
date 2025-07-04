"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAward, FiPlus, FiFilter, FiUsers, FiSearch } from "react-icons/fi";
import CreateBadgeModal from "./CreateBadgeModal";

interface Badge {
  id: string;
  name: string;
  description: string;
  motivationalText: string;
  level: string;
  icon: string;
  sport: string;
  _count?: {
    studentBadges: number;
  };
  category?: {
    name: string;
  };
  createdBy?: string;
  isCustom?: boolean;
}

const levelColors = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#E5E4E2',
  ROOKIE: '#10B981',
  AMATEUR: '#3B82F6',
  PRO: '#9333EA'
};

const categoryColors: Record<string, string> = {
  'Physical Fitness': '#EF4444',
  'Technical Skills': '#3B82F6',
  'Wellness & Nutrition': '#10B981',
  'Match Performance': '#F59E0B',
  'Consistency': '#8B5CF6',
  'Mental': '#EC4899',
  'Custom': '#6B7280'
};

export default function BadgeManager() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyCustom, setShowOnlyCustom] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/badges?manage=true');
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

  const getFilteredBadges = () => {
    return badges.filter(badge => {
      // Category filter
      if (selectedCategory !== 'ALL' && badge.category?.name !== selectedCategory) {
        return false;
      }
      
      // Level filter
      if (selectedLevel !== 'ALL' && badge.level !== selectedLevel) {
        return false;
      }
      
      // Custom badge filter
      if (showOnlyCustom && !badge.isCustom) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return badge.name.toLowerCase().includes(query) || 
               badge.description.toLowerCase().includes(query);
      }
      
      return true;
    });
  };

  const uniqueCategories = Array.from(new Set(badges.map(b => b.category?.name).filter(Boolean)));
  const uniqueLevels = Array.from(new Set(badges.map(b => b.level)));
  
  const filteredBadges = getFilteredBadges();
  const customBadgesCount = badges.filter(b => b.isCustom).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Badge Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {badges.length} badges • Custom: {customBadgesCount} badges
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all font-medium shadow-lg flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Create Custom Badge
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search badges by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          >
            <option value="ALL">All Levels</option>
            {uniqueLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showOnlyCustom}
              onChange={(e) => setShowOnlyCustom(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <span className="text-sm font-medium text-gray-700">Custom Only</span>
          </label>

          <div className="flex items-center justify-center text-sm text-gray-600">
            {filteredBadges.length} badges found
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-600"></div>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="text-center py-12">
          <FiAward className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No badges found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBadges.map((badge) => {
            const levelColor = levelColors[badge.level as keyof typeof levelColors] || '#6B7280';
            const categoryColor = categoryColors[badge.category?.name || 'Custom'] || '#6B7280';
            
            return (
              <motion.div
                key={badge.id}
                className="relative rounded-xl p-4 bg-white border-2 border-gray-200 hover:shadow-lg transition-all duration-300"
                style={{
                  borderTop: `4px solid ${categoryColor}`
                }}
                whileHover={{ y: -5 }}
              >
                {/* Custom Badge Indicator */}
                {badge.isCustom && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    CUSTOM
                  </div>
                )}

                {/* Level Badge */}
                <div
                  className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${levelColor}20`,
                    color: levelColor,
                    border: `2px solid ${levelColor}`
                  }}
                >
                  {badge.level}
                </div>

                {/* Badge Content */}
                <div className="text-center mt-4">
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{badge.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <FiUsers className="w-3 h-3" />
                    <span>{badge._count?.studentBadges || 0} earned</span>
                  </div>
                  
                  {/* Category */}
                  <div className="mt-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor
                      }}
                    >
                      {badge.category?.name || 'Custom'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Badge Modal */}
      <CreateBadgeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onBadgeCreated={() => {
          fetchBadges();
          setShowCreateModal(false);
        }}
      />
    </div>
  );
} 