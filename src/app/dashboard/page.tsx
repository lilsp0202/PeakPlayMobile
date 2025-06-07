"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SkillSnap from "../../components/SkillSnap";
import { ProgressRing, calculateOverallProgress } from "../../components/SkillSnap";
import RecentMatchScores from "../../components/RecentMatchScores";
import CoachFeedback from "../../components/CoachFeedback";
import CreateFeedbackModal from "../../components/CreateFeedbackModal";
import BadgeDisplay from "../../components/BadgeDisplay";
import BadgeManager from "../../components/BadgeManager";
import BadgeForm from "@/components/BadgeForm";

// Dynamic import for SkillSnap to avoid SSR issues
import dynamic from 'next/dynamic';
const SkillSnapDynamic = dynamic(() => import('@/components/SkillSnap'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skillData, setSkillData] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStudentForSkills, setSelectedStudentForSkills] = useState<string | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] = useState<any>(null);
  const [showBadgeManager, setShowBadgeManager] = useState(false);
  const [badgeStats, setBadgeStats] = useState<any>(null);
  const [selectedStudentForBadges, setSelectedStudentForBadges] = useState<string | null>(null);
  const [showBadgeForm, setShowBadgeForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const endpoint = session.user.role === "ATHLETE" ? "/api/student/profile" : "/api/coach/profile";
          const response = await fetch(endpoint);
          
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);

            // If athlete, fetch skill data for overall progress
            if (session.user.role === "ATHLETE") {
              await fetchSkillData();
            }

            // If coach, fetch available students and assigned students
            if (session.user.role === "COACH" && data.academy) {
              await fetchAvailableStudents(data.academy);
              await fetchAssignedStudents();
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

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return;

    setIsAssigning(true);
    try {
      const response = await fetch("/api/coach/assign-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      if (response.ok) {
        // Refresh available and assigned students
        if (profileData?.academy) {
          await fetchAvailableStudents(profileData.academy);
          await fetchAssignedStudents();
        }
        setSelectedStudents([]);
      }
    } catch (error) {
      console.error("Error assigning students:", error);
    }
    setIsAssigning(false);
  };

  const handleOpenFeedbackModal = (student: any) => {
    setSelectedStudentForFeedback(student);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setSelectedStudentForFeedback(null);
  };

  const handleFeedbackCreated = () => {
    // Optionally refresh any data or show a success message
    console.log('Feedback created successfully');
  };

  // Badge-related functions
  const fetchBadgeStats = async () => {
    if (session?.user.role === "COACH") {
      try {
        const response = await fetch('/api/badges/admin');
        if (response.ok) {
          const data = await response.json();
          setBadgeStats(data);
        }
      } catch (error) {
        console.error('Error fetching badge stats:', error);
      }
    }
  };

  const handleEvaluateBadges = async (studentId?: string) => {
    try {
      const evalUrl = studentId ? `/api/badges/evaluate?studentId=${studentId}` : '/api/badges/evaluate';
      console.log('Dashboard - Evaluating badges:', { evalUrl, studentId });
      
      const response = await fetch(evalUrl, { method: 'POST' });
      console.log('Dashboard - Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Dashboard - Badges evaluated successfully:', result);
        await fetchBadgeStats();
        
        // Show user feedback
        if (result.newBadges && result.newBadges.length > 0) {
          alert(`Great! ${result.newBadges.length} new badge(s) awarded!`);
        } else {
          alert('Badge evaluation completed. No new badges awarded.');
        }
      } else {
        const errorText = await response.text();
        console.error('Dashboard - Badge evaluation failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        alert(`Badge evaluation failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Dashboard - Error evaluating badges:', error);
      alert('Error evaluating badges: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleCreateBadge = () => {
    setShowBadgeForm(true);
  };

  const handleEditBadge = (badge: any) => {
    setEditingBadge(badge);
    setShowBadgeForm(true);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge?')) return;
    
    try {
      const response = await fetch(`/api/badges/${badgeId}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        console.log('Badge deleted successfully');
        await fetchBadgeStats();
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
    }
  };

  const handleBadgeFormClose = () => {
    setShowBadgeForm(false);
    setEditingBadge(null);
  };

  const handleBadgeCreated = () => {
    setShowBadgeForm(false);
    setEditingBadge(null);
    fetchBadgeStats();
  };

  // Fetch badge stats when coach profile is loaded
  useEffect(() => {
    if (session?.user.role === "COACH" && profileData) {
      fetchBadgeStats();
    }
  }, [session, profileData]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleCompleteProfile = () => {
    const onboardingPath = session.user.role === "ATHLETE" ? "/onboarding/athlete" : "/onboarding/coach";
    router.push(onboardingPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Enhanced Dashboard Header */}
      <header className="relative bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-blue-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Enhanced Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center group">
                <div className="relative">
                  <div className="h-11 w-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                </div>
                <div className="ml-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    PeakPlay
                  </span>
                </div>
              </div>
              
              <div className="hidden md:block h-8 w-px bg-gray-300"></div>
              
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-900">
                  {session.user.role === "ATHLETE" ? "Athlete Hub" : "Coach Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-medium text-indigo-600">{(session.user as any).username || session.user.name || session.user.email}</span>
                </p>
              </div>
            </div>

            {/* Enhanced User Section */}
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <div className="hidden sm:flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide uppercase ${
                  session.user.role === "ATHLETE" 
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200" 
                    : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200"
                }`}>
                  <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    {session.user.role === "ATHLETE" ? (
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                    )}
                  </svg>
                  {session.user.role}
                </span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 7.05V4a3 3 0 00-6 0v3.05"/>
                </svg>
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {((session.user as any).username || session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="group relative px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 font-medium text-sm rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span>Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {!profileData ? (
            // Profile not completed
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Complete Your Profile
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Complete your {session.user.role.toLowerCase()} profile to get started with PeakPlay.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleCompleteProfile}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Profile completed - show role-specific dashboard
            <div className="space-y-6">
              {session.user.role === "ATHLETE" ? (
                // Athlete Dashboard
                <div>
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Athlete Performance Hub
                        </h2>
                        <p className="text-gray-600">Track your progress across all performance dimensions</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Athlete Dashboard Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                    {/* Left Column - Progress & Profile */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Overall Progress Card */}
                      <div className="group bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-indigo-200">
                        <div className="p-6">
                          <ProgressRing 
                            progress={calculateOverallProgress(skillData)} 
                            size={120} 
                            strokeWidth={8} 
                          />
                        </div>
                      </div>

                      {/* Profile Information Card */}
                      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="p-6">
                          {/* Simple Header */}
                          <h3 className="text-lg font-semibold text-gray-900 mb-5">Athlete Profile</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                                <p className="text-sm font-semibold text-gray-900">{profileData.studentName}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Academy</p>
                                <p className="text-sm font-semibold text-gray-900">{profileData.academy}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
                                <p className="text-sm font-semibold text-gray-900">{profileData.role?.replace('_', ' ')}</p>
                              </div>
                            </div>
                            
                            {/* Divider */}
                            <div className="border-t border-gray-100 pt-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="h-8 w-8 bg-orange-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</p>
                                  <p className="text-sm font-bold text-gray-900">{profileData.age}</p>
                                  <p className="text-xs text-gray-400">years</p>
                                </div>
                                <div className="text-center">
                                  <div className="h-8 w-8 bg-cyan-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Height</p>
                                  <p className="text-sm font-bold text-gray-900">{profileData.height}</p>
                                  <p className="text-xs text-gray-400">cm</p>
                                </div>
                                <div className="text-center">
                                  <div className="h-8 w-8 bg-pink-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <svg className="h-4 w-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m-3 1l-3-1"/>
                                    </svg>
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</p>
                                  <p className="text-sm font-bold text-gray-900">{profileData.weight}</p>
                                  <p className="text-xs text-gray-400">kg</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Coach Feedback Section */}
                      <CoachFeedback />
                    </div>

                    {/* SkillSnap */}
                    <div className="lg:col-span-4">
                      <SkillSnap isCoachView={profileData.role === 'COACH'} />
                    </div>
                  </div>
                  
                  {/* Badges Section for Athletes */}
                  <div className="mb-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Your Achievements & Badges</h3>
                              <p className="text-sm text-gray-600">Track your progress with our performance badge system</p>
                            </div>
                          </div>
                        </div>
                        <BadgeDisplay 
                          studentId={profileData.id}
                          showProgress={true}
                          layout="grid"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Match Scores Component */}
                  <div className="lg:col-span-5">
                    <RecentMatchScores isCoachView={false} />
                  </div>
                </div>
              ) : (
                // Coach Dashboard
                <div>
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Coach Command Center
                        </h2>
                        <p className="text-gray-600">Manage and analyze your athletes' performance</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="group bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Coach Profile</dt>
                              <dd className="text-lg font-bold text-gray-900">{profileData.name}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"/>
                              </svg>
                            </div>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">Academy</dt>
                              <dd className="text-lg font-bold text-gray-900">{profileData.academy}</dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Available Students Section */}
                  {availableStudents.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                            Student Management
                          </h3>
                          <p className="text-gray-600">Select students to supervise and track their progress</p>
                        </div>
                      </div>
                      
                      <div className="bg-white shadow-xl overflow-hidden rounded-2xl border border-gray-100">
                        <ul className="divide-y divide-gray-200">{availableStudents.map((student) => (
                            <li key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <div className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => handleStudentSelection(student.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="h-10 w-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {student.studentName.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="text-base font-semibold text-gray-900">{student.studentName}</p>
                                        <p className="text-sm text-gray-500">@{student.username} • {student.role.replace('_', ' ')} • Age {student.age}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {selectedStudents.length > 0 && (
                          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-t border-gray-200">
                            <button
                              onClick={handleAssignStudents}
                              disabled={isAssigning}
                              className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                </svg>
                                <span>{isAssigning ? 'Assigning Students...' : `Assign ${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}`}</span>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Badge Management Section for Coaches */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            Badge Management
                          </h3>
                          <p className="text-gray-600">Manage achievements and evaluate student progress</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowBadgeManager(!showBadgeManager)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          {showBadgeManager ? 'Hide Manager' : 'Manage Badges'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                      <div className="p-6">
                        {/* Badge Statistics */}
                        {badgeStats && (
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Badges</p>
                                  <p className="text-lg font-bold text-gray-900">{badgeStats.totalBadges || 0}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Awarded</p>
                                  <p className="text-lg font-bold text-gray-900">{badgeStats.totalAwarded || 0}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Categories</p>
                                  <p className="text-lg font-bold text-gray-900">{badgeStats.totalCategories || 0}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Students</p>
                                  <p className="text-lg font-bold text-gray-900">{assignedStudents.length}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mb-6">
                          <button
                            onClick={handleCreateBadge}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Create New Badge
                          </button>
                          <button
                            onClick={() => handleEvaluateBadges()}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Evaluate All Students
                          </button>
                          {selectedStudentForSkills && (
                            <button
                              onClick={() => handleEvaluateBadges(selectedStudentForSkills)}
                              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              Evaluate Selected Student
                            </button>
                          )}
                        </div>

                        {/* Badge Manager Component */}
                        {showBadgeManager && (
                          <div className="border-t border-gray-200 pt-6">
                            <BadgeManager 
                              onEditBadge={handleEditBadge}
                              onDeleteBadge={handleDeleteBadge}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Students Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Athletes</h3>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      {assignedStudents.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {assignedStudents.map((student) => (
                            <li key={student.id}>
                              <div className="px-4 py-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                                    <p className="text-sm text-gray-500">@{student.username} • {student.role.replace('_', ' ')} • Age {student.age}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm text-gray-500">
                                      {student.height}cm, {student.weight}kg
                                    </div>
                                    <button
                                      onClick={() => handleOpenFeedbackModal(student)}
                                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                                    >
                                      Give Feedback
                                    </button>
                                    <button
                                      onClick={() => setSelectedStudentForSkills(
                                        selectedStudentForSkills === student.id ? null : student.id
                                      )}
                                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                    >
                                      {selectedStudentForSkills === student.id ? 'Hide Skills' : 'View Skills'}
                                    </button>
                                    <button
                                      onClick={() => setSelectedStudentForBadges(
                                        selectedStudentForBadges === student.id ? null : student.id
                                      )}
                                      className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                                    >
                                      {selectedStudentForBadges === student.id ? 'Hide Badges' : 'View Badges'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-5 sm:p-6">
                          <p className="text-gray-500">
                            No athletes assigned yet. Select students from your academy above to begin coaching them.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SkillSnap Component for Coaches */}
                  {selectedStudentForSkills && (
                    <div className="mb-8">
                      <SkillSnapDynamic 
                        studentId={selectedStudentForSkills}
                        isCoachView={true} 
                      />
                    </div>
                  )}

                  {/* Badge Display for Selected Student */}
                  {selectedStudentForBadges && (
                    <div className="mb-8">
                      <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">Student Achievements</h3>
                                <p className="text-sm text-gray-600">View badges and progress for selected student</p>
                              </div>
                            </div>
                          </div>
                          <BadgeDisplay 
                            studentId={selectedStudentForBadges}
                            showProgress={true}
                            layout="grid"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coach Controls */}
                  {session.user.role === 'COACH' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <button
                        onClick={handleCreateBadge}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Badge
                      </button>
                      <button
                        onClick={() => setShowBadgeManager(!showBadgeManager)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        {showBadgeManager ? 'Hide' : 'Manage'} Badges
                      </button>
                      <button
                        onClick={() => handleEvaluateBadges()}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        Evaluate All Badges
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Feedback Creation Modal */}
      {selectedStudentForFeedback && (
        <CreateFeedbackModal
          isOpen={feedbackModalOpen}
          onClose={handleCloseFeedbackModal}
          student={selectedStudentForFeedback}
          onFeedbackCreated={handleFeedbackCreated}
        />
      )}

      {/* Badge Form Modal */}
      {showBadgeForm && (
        <BadgeForm
          isOpen={showBadgeForm}
          onClose={handleBadgeFormClose}
          onBadgeCreated={handleBadgeCreated}
          editingBadge={editingBadge}
        />
      )}
    </div>
  );
}