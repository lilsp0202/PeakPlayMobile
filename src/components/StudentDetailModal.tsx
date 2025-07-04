"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiActivity, FiAward, FiUser, FiMail, FiCalendar } from "react-icons/fi";
import SkillSnap from "./SkillSnap";
import { categoryColors, levelColors } from "@/app/badge-centre/page";

interface Student {
  id: string;
  studentName: string;
  username: string;
  email: string;
  age: number;
  height?: number;
  weight?: number;
  academy: string;
  role: string;
  sport: string;
}

interface Badge {
  badgeId: string;
  awardedAt: string;
  progress: number;
  badge: {
    name: string;
    description: string;
    level: string;
    icon: string;
    category?: {
      name: string;
    };
  };
}

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  activeView: 'skillsnap' | 'badges';
}

export default function StudentDetailModal({ 
  isOpen, 
  onClose, 
  student,
  activeView 
}: StudentDetailModalProps) {
  const [selectedView, setSelectedView] = useState<'skillsnap' | 'badges'>(activeView);
  const [skillsData, setSkillsData] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData();
    }
  }, [isOpen, student]);

  useEffect(() => {
    setSelectedView(activeView);
  }, [activeView]);

  const fetchStudentData = async () => {
    if (!student) return;
    
    setLoading(true);
    setError('');

    try {
      // Fetch skills data
      const skillsResponse = await fetch(`/api/skills?studentId=${student.id}`);
      if (skillsResponse.ok) {
        const data = await skillsResponse.json();
        setSkillsData(data);
      }

      // Fetch badges
      const badgesResponse = await fetch(`/api/badges?studentId=${student.id}&completed=true`);
      if (badgesResponse.ok) {
        const data = await badgesResponse.json();
        setBadges(data.badges || []);
      }
    } catch (err) {
      setError('Failed to load student data');
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BATSMAN': return 'Batsman';
      case 'BOWLER': return 'Bowler';
      case 'ALL_ROUNDER': return 'All Rounder';
      case 'KEEPER': return 'Wicket Keeper';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{student.studentName}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      @{student.username}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMail className="w-4 h-4" />
                      {student.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      Age: {student.age}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {getRoleDisplayName(student.role)}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {student.academy}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {student.sport}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedView('skillsnap')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedView === 'skillsnap'
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiActivity className="w-4 h-4" />
                SkillSnap
              </button>
              <button
                onClick={() => setSelectedView('badges')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedView === 'badges'
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FiAward className="w-4 h-4" />
                Badges ({badges.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {selectedView === 'skillsnap' ? (
                  <motion.div
                    key="skillsnap"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {skillsData ? (
                      <SkillSnap 
                        skills={skillsData} 
                        profileData={{
                          ...student,
                          studentName: student.studentName,
                          sport: student.sport,
                          age: student.age
                        }}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No skills data available for this student</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {badges.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((studentBadge) => {
                          const badge = studentBadge.badge;
                          const levelColor = levelColors[badge.level as keyof typeof levelColors] || '#6B7280';
                          const categoryColor = categoryColors[badge.category?.name || ''] || '#6B7280';
                          
                          return (
                            <motion.div
                              key={studentBadge.badgeId}
                              className="relative rounded-xl p-4 bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-xl transition-all duration-300"
                              style={{
                                borderTop: `4px solid ${categoryColor}`
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
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

                              {/* Icon and Details */}
                              <div className="text-center">
                                <div className="text-4xl mb-2">{badge.icon}</div>
                                <h3 className="text-sm font-bold text-white mb-1">{badge.name}</h3>
                                <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                                <p className="text-xs text-green-400">
                                  Earned: {formatDate(studentBadge.awardedAt)}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FiAward className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No badges earned yet</p>
                        <p className="text-sm mt-2">Badges will appear here as the student achieves them</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 