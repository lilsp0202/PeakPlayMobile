"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiActivity, FiUser, FiMail, FiCalendar } from "react-icons/fi";
import SkillSnap from "./SkillSnap";

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



interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

export default function StudentDetailModal({ 
  isOpen, 
  onClose, 
  student
}: StudentDetailModalProps) {
  const [skillsData, setSkillsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData();
    }
  }, [isOpen, student]);

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



  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-t-2xl sm:rounded-2xl max-w-7xl w-full h-[100vh] sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl mt-0 sm:mt-auto flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.3 }}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{student.studentName}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                      @{student.username}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <FiMail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Age: {student.age}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 mt-2 flex-wrap">
                    <span className="px-2 py-1 sm:px-3 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {getRoleDisplayName(student.role)}
                    </span>
                    <span className="px-2 py-1 sm:px-3 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {student.academy}
                    </span>
                    <span className="px-2 py-1 sm:px-3 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {student.sport}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0"
              >
                <FiX className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* SkillSnap Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">SkillSnap</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[calc(100vh-200px)] sm:max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : (
                  <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {skillsData ? (
                      <SkillSnap 
                    studentId={student.id}
                    isCoachView={true}
                    onSkillsUpdated={() => {}}
                      />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FiActivity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>No skills data available for this student</p>
                      </div>
                    )}
                  </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 