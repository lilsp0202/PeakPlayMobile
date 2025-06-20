"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  calculateOverallProgress,
  calculatePhysicalAggregateScore,
  calculateMentalAggregateScore,
  calculateNutritionAggregateScore,
  calculateTechnicalAggregateScore,
} from "../../components/SkillSnap";
import RecentMatchScores from "../../components/RecentMatchScores";
import CoachFeedback from "../../components/CoachFeedback";
import CreateFeedbackModal from "../../components/CreateFeedbackModal";
import BadgeDisplay from "../../components/BadgeDisplay";
import BadgeManager from "../../components/BadgeManager";
import { PeakPlayLogo } from "../../components/Navigation";
import SessionTodoCoach from '../../components/SessionTodoCoach';
import SessionTodoStudent from '../../components/SessionTodoStudent';

// Dynamic import for SkillSnap to avoid SSR issues
import dynamic from 'next/dynamic';
const SkillSnapDynamic = dynamic(() => import('@/components/SkillSnap'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State variables
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skillData, setSkillData] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [badgeStats, setBadgeStats] = useState<any>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [availableStudentsRoleFilter, setAvailableStudentsRoleFilter] = useState<string>('ALL');

  // Mobile collapsible states
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showBadgeManager, setShowBadgeManager] = useState(false);

  // Helper functions
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BATSMAN': return 'Batsman';
      case 'BOWLER': return 'Bowler';
      case 'ALL_ROUNDER': return 'All Rounder';
      case 'KEEPER': return 'Wicket Keeper';
      default: return role;
    }
  };

  // Effects
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Data fetching functions
  const fetchSkillData = async () => {
    try {
      const response = await fetch("/api/skills");
      if (response.ok) {
        const data = await response.json();
        setSkillData(data);
      }
    } catch (error) {
      console.error("Error fetching skill data:", error);
    }
  };

  const fetchAvailableStudents = async (academy: string) => {
    try {
      const response = await fetch(`/api/students/by-academy?academy=${encodeURIComponent(academy)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching available students:", error);
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      const response = await fetch("/api/coach/profile");
      if (response.ok) {
        const data = await response.json();
        setAssignedStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching assigned students:", error);
    }
  };

  const fetchBadgeStats = async () => {
    if (session?.user.role === "COACH") {
      try {
        const response = await fetch('/api/badges?manage=true');
        if (response.ok) {
          const data = await response.json();
          setBadgeStats({
            totalBadges: data.coachBadges?.length || 0,
            systemBadges: data.systemBadges?.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching badge stats:', error);
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const endpoint = session.user.role === "ATHLETE" ? "/api/student/profile" : "/api/coach/profile";
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);

            if (session.user.role === "ATHLETE") {
              await fetchSkillData();
            }

            if (session.user.role === "COACH" && data.academy) {
              await fetchAvailableStudents(data.academy);
              await fetchAssignedStudents();
              await fetchBadgeStats();
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
        setLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Event handlers
  const handleStudentSelection = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleAssignStudents = async () => {
    await fetch('/api/coach/assign-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: selectedStudents }),
    });
    setSelectedStudents([]);
    await fetchAssignedStudents();
  };

  const handleCompleteProfile = () => {
    const role = session?.user.role?.toLowerCase();
    router.push(`/profile/complete?role=${role}`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/auth/signin', redirect: true });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <PeakPlayLogo size="small" />
            <div>
              <h1 className="text-sm font-bold text-gray-900">
                {session?.user.role === "ATHLETE" ? "PeakPlay" : "Coach Hub"}
              </h1>
              <div className="flex items-center space-x-1">
                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center space-x-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            {isSigningOut ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exit</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                </svg>
                <span>Exit</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="px-3 py-4">
        {!profileData ? (
          // Profile completion prompt
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold text-amber-900 mb-2">
              🚀 Complete Your Profile
            </h3>
            <p className="text-amber-800 text-sm mb-4">
              Complete your {session?.user.role?.toLowerCase()} profile to access all features.
            </p>
            <button
              onClick={handleCompleteProfile}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Complete Setup
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {session?.user.role === "ATHLETE" ? (
              // Mobile Athlete Dashboard
              <div className="space-y-3">
                {/* Status Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-lg font-bold">{profileData.studentName}</h1>
                        <p className="text-xs text-blue-100">@{profileData.academy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{Math.round(calculateOverallProgress(skillData))}%</p>
                      <p className="text-xs text-blue-100">Progress</p>
                    </div>
                  </div>
                </div>

                {/* Performance Details */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <button 
                    onClick={() => setShowPerformanceDetails(!showPerformanceDetails)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Performance Tracking</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showPerformanceDetails ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {showPerformanceDetails && (
                    <div className="px-3 pb-3 border-t">
                      <SkillSnapDynamic onSkillsUpdated={fetchSkillData} />
                    </div>
                  )}
                </div>

                {/* Match Performance */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <button 
                    onClick={() => setShowMatchDetails(!showMatchDetails)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Match Performance</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showMatchDetails ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {showMatchDetails && (
                    <div className="px-3 pb-3 border-t mt-3">
                      <RecentMatchScores />
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <button 
                    onClick={() => setShowAchievements(!showAchievements)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Achievements & Badges</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showAchievements ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {showAchievements && (
                    <div className="px-3 pb-3 border-t mt-3">
                      <BadgeDisplay studentId={session?.user?.id} showProgress={true} layout="grid" />
                    </div>
                  )}
                </div>

                {/* Session To-Do */}
                <div className="bg-white rounded-lg shadow-sm border p-3">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                      </svg>
                    </div>
                    Session To-Do
                  </h3>
                  <SessionTodoStudent 
                    studentId={session?.user?.id || ""} 
                    coachName={profileData?.coachName || "Coach"}
                  />
                </div>

                {/* Coach Feedback */}
                <div className="bg-white rounded-lg shadow-sm border p-3">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                    </div>
                    Coach Feedback
                  </h3>
                  <CoachFeedback />
                </div>
              </div>
            ) : (
              // Mobile Coach Dashboard
              <div className="space-y-3">
                {/* Coach Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-lg font-bold">Coach {profileData.name}</h1>
                        <p className="text-xs text-purple-100">@{profileData.academy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{assignedStudents.length}</p>
                      <p className="text-xs text-purple-100">Athletes</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                    <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{badgeStats?.totalBadges || 0}</p>
                    <p className="text-xs text-gray-600">Badges</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292"/>
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{assignedStudents.length}</p>
                    <p className="text-xs text-gray-600">Athletes</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border text-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4"/>
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{availableStudents.length}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                </div>

                {/* Student Management */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <button 
                    onClick={() => setShowStudentManagement(!showStudentManagement)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Student Management</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showStudentManagement ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {showStudentManagement && (
                    <div className="px-3 pb-3 border-t">
                      <div className="flex gap-2 mb-3 mt-3">
                        <select 
                          value={availableStudentsRoleFilter} 
                          onChange={(e) => setAvailableStudentsRoleFilter(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="BATSMAN">Batsman</option>
                          <option value="BOWLER">Bowler</option>
                          <option value="ALL_ROUNDER">All Rounder</option>
                          <option value="KEEPER">Wicket Keeper</option>
                        </select>
                        {selectedStudents.length > 0 && (
                          <button
                            onClick={handleAssignStudents}
                            className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors"
                          >
                            Assign ({selectedStudents.length})
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {availableStudents
                          .filter(student => availableStudentsRoleFilter === 'ALL' || student.role === availableStudentsRoleFilter)
                          .slice(0, 5)
                          .map((student) => (
                          <div key={student.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {student.studentName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{student.studentName}</p>
                              <p className="text-xs text-gray-500">@{student.username} • {getRoleDisplayName(student.role)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Management */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <button 
                    onClick={() => setShowBadgeManager(!showBadgeManager)}
                    className="w-full p-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/>
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900">Badge Management</h3>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${showBadgeManager ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {showBadgeManager && (
                    <div className="px-3 pb-3 border-t">
                      <BadgeManager />
                    </div>
                  )}
                </div>

                {/* Session To-Do */}
                <div className="bg-white rounded-lg shadow-sm border p-3">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      </svg>
                    </div>
                    Session To-Do
                  </h3>
                  <SessionTodoCoach assignedStudents={assignedStudents} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      {feedbackModalOpen && selectedStudentForFeedback && (
        <CreateFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedStudentForFeedback(null);
          }}
          student={selectedStudentForFeedback}
          onFeedbackCreated={() => console.log('Feedback created')}
        />
      )}
    </div>
  );
}
