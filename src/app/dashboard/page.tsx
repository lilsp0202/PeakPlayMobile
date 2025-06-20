"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SkillSnap from "../../components/SkillSnap";
import { 
  ProgressRing, 
  calculateOverallProgress,
  calculatePhysicalAggregateScore,
  calculateMentalAggregateScore,
  calculateNutritionAggregateScore,
  calculateTechnicalAggregateScore,
  calculateTacticalAggregateScore
} from "../../components/SkillSnap";
import RecentMatchScores from "../../components/RecentMatchScores";
import CoachFeedback from "../../components/CoachFeedback";
import CreateFeedbackModal from "../../components/CreateFeedbackModal";
import BadgeDisplay from "../../components/BadgeDisplay";
import BadgeManager from "../../components/BadgeManager";
import BadgeForm from "@/components/BadgeForm";
import { PeakPlayLogo } from "../../components/Navigation";
import SessionTodoCoach from '../../components/SessionTodoCoach';
import SessionTodoStudent from '../../components/SessionTodoStudent';
import PWAStatus from '@/components/PWAStatus';

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
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [showAllAssigned, setShowAllAssigned] = useState(false);
  const [showSkillSnapModal, setShowSkillSnapModal] = useState(false);
  const [badgeRefreshTrigger, setBadgeRefreshTrigger] = useState(0);
  const [availableStudentsRoleFilter, setAvailableStudentsRoleFilter] = useState<string>('ALL');
  const [assignedStudentsRoleFilter, setAssignedStudentsRoleFilter] = useState<string>('ALL');

  // Add sign out loading state
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Filter functions
  const getFilteredAvailableStudents = () => {
    if (availableStudentsRoleFilter === 'ALL') return availableStudents;
    return availableStudents.filter(student => student.role === availableStudentsRoleFilter);
  };

  const getFilteredAssignedStudents = () => {
    if (assignedStudentsRoleFilter === 'ALL') return assignedStudents;
    return assignedStudents.filter(student => student.role === assignedStudentsRoleFilter);
  };

  // Select All functionality for available students
  const handleSelectAllAvailable = () => {
    const filteredStudents = getFilteredAvailableStudents();
    const allFilteredIds = filteredStudents.map(s => s.id);
    const isAllSelected = allFilteredIds.every(id => selectedStudents.includes(id));
    
    if (isAllSelected) {
      // Deselect all filtered students
      setSelectedStudents(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered students (add those not already selected)
      const newIds = allFilteredIds.filter(id => !selectedStudents.includes(id));
      setSelectedStudents(prev => [...prev, ...newIds]);
    }
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'BATSMAN': return 'Batsman';
      case 'BOWLER': return 'Bowler';
      case 'ALL_ROUNDER': return 'All Rounder';
      case 'KEEPER': return 'Wicket Keeper';
      default: return role;
    }
  };

  const filteredAvailableStudents = getFilteredAvailableStudents();
  const filteredAssignedStudents = getFilteredAssignedStudents();
  const studentsToShow = showAllStudents ? filteredAvailableStudents : filteredAvailableStudents.slice(0, 3);
  const assignedToShow = showAllAssigned ? filteredAssignedStudents : filteredAssignedStudents.slice(0, 3);
  const isAllFilteredAvailableSelected = filteredAvailableStudents.length > 0 && filteredAvailableStudents.every(s => selectedStudents.includes(s.id));

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

  const handleStudentSelection = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleAssignStudents = async () => {
    // Call API to assign students to coach
    await fetch('/api/coach/assign-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: selectedStudents }),
    });
    setSelectedStudents([]);
    // Optionally, refresh assigned students list
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
        // Use the manage endpoint to get separated coach vs system badges
        const response = await fetch('/api/badges?manage=true');
        if (response.ok) {
          const data = await response.json();
          // Set badge stats with only coach-created badges count
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
        console.error('Dashboard - Badge evaluation failed:', errorText);
        alert('Failed to evaluate badges. Please try again.');
      }
    } catch (error) {
      console.error('Dashboard - Error evaluating badges:', error);
      alert('An error occurred while evaluating badges.');
    }
  };

  const handleCreateBadge = () => {
    setEditingBadge(null);
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
        setBadgeRefreshTrigger(prev => prev + 1);
        await fetchBadgeStats();
      } else {
        alert('Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('An error occurred while deleting the badge');
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
    setBadgeRefreshTrigger(prev => prev + 1);
  };

  // Use useEffect for badge stats
  useEffect(() => {
    if (session?.user.role === "COACH") {
      fetchBadgeStats();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleCompleteProfile = () => {
    if (session?.user.role === "ATHLETE") {
      router.push("/onboarding/athlete");
    } else if (session?.user.role === "COACH") {
      router.push("/onboarding/coach");
    }
  };

  // Enhanced sign out function for mobile PWA support
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      // Clear any local storage or cached data if needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pwa-dismissed');
        
        // For PWA, try multiple sign out approaches
        try {
          // Primary: Use NextAuth signOut
          await signOut({ 
            callbackUrl: '/auth/signin',
            redirect: false // Don't auto-redirect, we'll handle it manually for PWA
          });
          
          // Secondary: Call our custom sign out API for PWA reliability
          await fetch('/api/auth/signout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          // Manual redirect for PWA
          window.location.href = '/auth/signin';
          
        } catch (signOutError) {
          console.error('Primary sign out failed, trying fallback:', signOutError);
          
          // Fallback: Force clear everything and redirect
          localStorage.clear();
          sessionStorage.clear();
          
          // Try the API route as backup
          try {
            await fetch('/api/auth/signout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          } catch (apiError) {
            console.error('API sign out failed:', apiError);
          }
          
          // Force redirect to sign in page
          window.location.href = '/auth/signin?message=Session expired';
        }
      } else {
        // Server-side fallback
        await signOut({ 
          callbackUrl: '/auth/signin',
          redirect: true 
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Ultimate fallback - force redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin?error=signout_failed';
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-gray-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Branding */}
            <div className="flex items-center space-x-6">
              <PeakPlayLogo size="default" />
              <div className="hidden md:block h-8 w-0.5 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {session?.user.role === "ATHLETE" ? "Performance Hub" : "Coach Center"}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-indigo-600">{(session?.user as any)?.username || session?.user?.name || session?.user?.email}</span>
                </p>
              </div>
            </div>

            {/* Enhanced User Controls */}
            <div className="flex items-center space-x-4">
              {/* PWA Status */}
              <div className="hidden lg:block">
                <PWAStatus />
              </div>

              {/* Role Badge */}
              <div className="hidden sm:flex">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg ${
                  session?.user.role === "ATHLETE" 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" 
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  {session?.user.role}
                </span>
              </div>

              {/* User Avatar with Status */}
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                  {((session?.user as any)?.username || session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Enhanced Sign Out */}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="flex items-center space-x-2">
                  {isSigningOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing out...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>Exit</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {!profileData ? (
            // Profile not completed
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full"></div>
              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-amber-900">
                    🚀 Complete Your Journey Setup
                  </h3>
                  <p className="mt-2 text-amber-800 leading-relaxed">
                    You're just one step away from unlocking your full potential! Complete your {session?.user.role?.toLowerCase()} profile to access personalized training insights, progress tracking, and performance analytics.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCompleteProfile}
                      className="group relative px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                        <span>Complete Profile Setup</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Profile completed - show role-specific dashboard
            <div className="space-y-8">
              {session?.user.role === "ATHLETE" ? (
                // 🎨 NEW MODERN ATHLETE DASHBOARD DESIGN
                <div className="space-y-8">
                  {/* Mobile-Optimized Performance Hub */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-6 text-white shadow-2xl animate-pulse-slow">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-float-delayed"></div>
                    
                    <div className="relative z-10">
                      {/* Compact Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                          </div>
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Performance Hub</h1>
                            <p className="text-indigo-100 text-sm">Track. Train. Transform.</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Compact Mobile Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 bg-emerald-400 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-sm">Athlete</h3>
                          </div>
                          <p className="text-lg font-bold truncate">{profileData.studentName}</p>
                          <p className="text-indigo-200 text-xs">@{profileData.username}</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 bg-blue-400 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"/>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-sm">Academy</h3>
                          </div>
                          <p className="text-lg font-bold">{profileData.academy}</p>
                          <p className="text-indigo-200 text-xs">{getRoleDisplayName(profileData.role)}</p>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transform hover:scale-105 transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 bg-yellow-400 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                              </svg>
                            </div>
                            <h3 className="font-semibold text-sm">Progress</h3>
                          </div>
                          <p className="text-lg font-bold">{Math.round(calculateOverallProgress(skillData))}%</p>
                          <p className="text-indigo-200 text-xs">Overall Performance</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-Optimized Overall Progress Section */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.01] transition-all duration-500 animate-fade-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all duration-300">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-2xl animate-bounce">🎯</span>
                            Overall Progress
                          </h2>
                          <p className="text-gray-600 text-sm">Your complete performance overview</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {Math.round(calculateOverallProgress(skillData))}%
                          </p>
                          <p className="text-gray-500 text-xs font-medium">Complete</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-white to-indigo-50/30">
                      {/* Progress Ring - Mobile Centered */}
                      <div className="flex justify-center mb-6">
                        <div className="relative">
                          <ProgressRing 
                            progress={calculateOverallProgress(skillData)} 
                            size={120} 
                          />
                          {/* Remove duplicate text overlay since ProgressRing already has it */}
                        </div>
                      </div>

                      {/* Progress Breakdown - Mobile Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform hover:scale-105 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-700">Physical</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{Math.round(calculatePhysicalAggregateScore(skillData))}%</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform hover:scale-105 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-700">Mental</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{Math.round(calculateMentalAggregateScore(skillData))}%</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform hover:scale-105 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-700">Nutrition</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{Math.round(calculateNutritionAggregateScore(skillData))}%</p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform hover:scale-105 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-3 w-3 bg-purple-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium text-gray-700">Technical</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">{Math.round(calculateTechnicalAggregateScore(skillData))}%</p>
                        </div>
                      </div>
                      
                      {/* Progress Message - Compact */}
                      <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {calculateOverallProgress(skillData) < 30 ? "Getting Started! 🚀" :
                               calculateOverallProgress(skillData) < 60 ? "Making Progress! 💪" :
                               calculateOverallProgress(skillData) < 80 ? "Almost There! 🔥" :
                               "Excellent Work! ⭐"}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {calculateOverallProgress(skillData) < 30 ? "Keep training to build your foundation" :
                               calculateOverallProgress(skillData) < 60 ? "You're on the right track, keep going!" :
                               calculateOverallProgress(skillData) < 80 ? "Great momentum, push to the finish!" :
                               "Outstanding performance across all areas!"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Progress & Skills */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Performance Overview Card */}
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                              </svg>
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Performance Tracking</h2>
                              <p className="text-gray-600">Monitor your progress across all skill dimensions</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                          <SkillSnapDynamic onSkillsUpdated={fetchSkillData} />
                        </div>
                      </div>

                      {/* Match Performance */}
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                              </svg>
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Match Performance</h2>
                              <p className="text-gray-600">Track your recent game statistics and performance</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                          <RecentMatchScores isCoachView={false} />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Sidebar Content */}
                    <div className="space-y-6">


                      {/* Achievements */}
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform duration-300">
                              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                              <p className="text-gray-600 text-sm">Your badges & milestones</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50 min-h-[300px]">
                          <BadgeDisplay 
                            studentId={profileData.id}
                            showProgress={true}
                            layout="grid"
                          />
                        </div>
                      </div>

                      {/* Session To-Do Section for Students */}
                      <div className="transform hover:scale-[1.02] transition-all duration-300">
                        <SessionTodoStudent studentId={profileData.id} coachName={profileData.coachName || ''} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section - Full Width Components */}
                  <div className="mt-8">
                    {/* Coach Feedback - Full Width */}
                    <div className="transform hover:scale-[1.02] transition-all duration-300">
                      <CoachFeedback />
                    </div>

                    {/* Coaching Marketplace - Full Width */}
                    <div className="mt-6">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-3xl p-8 shadow-xl text-white transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                          <div className="flex items-center space-x-4">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2">Specialized Coaching</h3>
                              <p className="text-teal-100 leading-relaxed">
                                Connect with expert coaches for personalized training sessions and accelerated skill development.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 min-w-[280px]">
                            <button
                              onClick={() => router.push('/marketplace')}
                              className="flex-1 bg-white text-teal-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              Explore Coaches
                            </button>
                            <button
                              onClick={() => router.push('/bookings')}
                              className="flex-1 bg-white/20 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
                            >
                              My Bookings
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Enhanced Coach Dashboard with Professional Design
                <div className="space-y-12 animate-fade-in">
                  {/* Coach Header Card - Enhanced */}
                  <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 rounded-3xl shadow-2xl border border-indigo-200 overflow-hidden transform hover:scale-[1.01] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative p-8 md:p-12">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl border border-white/30 transform hover:rotate-6 transition-all duration-300">
                                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                </svg>
                              </div>
                              <div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-yellow-900">✨</span>
                              </div>
                            </div>
                            <div className="text-white">
                              <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                Coach Command Center
                              </h1>
                              <p className="text-xl text-blue-100 mb-1">
                                Welcome back, <span className="font-semibold text-white">{profileData.name}</span>
                              </p>
                              <div className="flex items-center gap-2 text-blue-200">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"/>
                                </svg>
                                <span className="text-sm font-medium">{profileData.academy}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Stats Cards */}
                          <div className="flex gap-6">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                              <div className="flex flex-col items-center text-center min-w-[140px]">
                                <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg transform hover:rotate-12 transition-all duration-300">
                                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                  </svg>
                                </div>
                                <span className="text-3xl font-bold text-white mb-1">{badgeStats?.totalBadges || 0}</span>
                                <span className="text-sm text-blue-100 font-medium">Total Badges</span>
                              </div>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all duration-300 hover:bg-white/15">
                              <div className="flex flex-col items-center text-center min-w-[140px]">
                                <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mb-3 shadow-lg transform hover:rotate-12 transition-all duration-300">
                                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                  </svg>
                                </div>
                                <span className="text-3xl font-bold text-white mb-1">{assignedStudents.length}</span>
                                <span className="text-sm text-blue-100 font-medium">Athletes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Management Section - Enhanced */}
                  <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.005] transition-all duration-500">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-8 border-b border-gray-100">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-all duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 4a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">Student Management</h2>
                            <p className="text-gray-600 text-lg">Select and assign talented athletes to your coaching roster</p>
                          </div>
                        </div>
                        
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <select 
                            value={availableStudentsRoleFilter} 
                            onChange={(e) => setAvailableStudentsRoleFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 min-w-[160px]"
                          >
                            <option value="ALL">All Roles</option>
                            <option value="BATSMAN">Batsman</option>
                            <option value="BOWLER">Bowler</option>
                            <option value="ALL_ROUNDER">All Rounder</option>
                            <option value="KEEPER">Wicket Keeper</option>
                          </select>
                          
                          {filteredAvailableStudents.length > 0 && (
                            <button 
                              onClick={handleSelectAllAvailable}
                              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                isAllFilteredAvailableSelected 
                                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700' 
                                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                              }`}
                            >
                              {isAllFilteredAvailableSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {/* Filter Summary */}
                      {availableStudentsRoleFilter !== 'ALL' && (
                        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl animate-fade-in">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-blue-900 font-semibold">Filter Active</p>
                              <p className="text-blue-700 text-sm">Showing {getRoleDisplayName(availableStudentsRoleFilter)} students ({studentsToShow.length} of {availableStudents.length} available)</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Student Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
                        {studentsToShow.map((student, index) => (
                          <div 
                            key={student.id} 
                            className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 relative overflow-hidden transform hover:scale-[1.02]"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {/* Background Animation */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                              className="absolute top-4 right-4 h-6 w-6 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 transition-all duration-200 cursor-pointer"
                              title="Select student"
                            />
                            
                            {/* Student Info */}
                            <div className="relative">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                                    {student.studentName.charAt(0)}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors duration-300">{student.studentName}</h3>
                                  <p className="text-gray-500 text-sm">@{student.username}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 rounded-full text-sm font-semibold">
                                  {getRoleDisplayName(student.role)}
                                </span>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                  </svg>
                                  <span className="text-sm font-medium">Age {student.age}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Empty State */}
                      {studentsToShow.length === 0 && (
                        <div className="text-center py-16">
                          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Available</h3>
                          <p className="text-gray-500">
                            {availableStudentsRoleFilter !== 'ALL' 
                              ? `No ${getRoleDisplayName(availableStudentsRoleFilter)} students available for assignment.`
                              : 'No students available for assignment at the moment.'
                            }
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {selectedStudents.length > 0 && (
                          <button
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                            onClick={handleAssignStudents}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Assign {selectedStudents.length} Selected Student{selectedStudents.length > 1 ? 's' : ''}
                          </button>
                        )}
                        
                        {filteredAvailableStudents.length > 3 && (
                          <button
                            className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline transition-all duration-200 flex items-center gap-2"
                            onClick={() => setShowAllStudents(s => !s)}
                          >
                            {showAllStudents ? (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                                </svg>
                                Show Less
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                </svg>
                                Show More
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Assigned Students Section - Enhanced */}
                  <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.005] transition-all duration-500">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 p-8 border-b border-gray-100">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-all duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 4a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">Your Athletes</h2>
                            <p className="text-gray-600 text-lg">Manage and track your assigned athletes' progress</p>
                          </div>
                        </div>
                        
                        <select 
                          value={assignedStudentsRoleFilter} 
                          onChange={(e) => setAssignedStudentsRoleFilter(e.target.value)}
                          className="px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 min-w-[160px]"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="BATSMAN">Batsman</option>
                          <option value="BOWLER">Bowler</option>
                          <option value="ALL_ROUNDER">All Rounder</option>
                          <option value="KEEPER">Wicket Keeper</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {/* Filter Summary */}
                      {assignedStudentsRoleFilter !== 'ALL' && (
                        <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl animate-fade-in">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-emerald-900 font-semibold">Filter Active</p>
                              <p className="text-emerald-700 text-sm">Showing {getRoleDisplayName(assignedStudentsRoleFilter)} athletes ({assignedToShow.length} of {assignedStudents.length} assigned)</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Athletes List */}
                      <div className="space-y-6">
                        {assignedToShow.map((student, index) => (
                          <div 
                            key={student.id} 
                            className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 transform hover:scale-[1.01]"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                              {/* Student Info */}
                              <div className="flex items-center gap-6">
                                <div className="relative">
                                  <div className="h-16 w-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-all duration-300">
                                    {student.studentName.charAt(0)}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-400 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900 text-xl group-hover:text-emerald-600 transition-colors duration-300 mb-1">{student.studentName}</h3>
                                  <div className="flex items-center gap-4 text-gray-500">
                                    <span className="text-sm">@{student.username}</span>
                                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full text-sm font-semibold">
                                      {getRoleDisplayName(student.role)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                      </svg>
                                      <span className="text-sm font-medium">Age {student.age}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() => handleOpenFeedbackModal(student)}
                                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                  type="button"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                                  </svg>
                                  Give Feedback
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStudentForSkills(selectedStudentForSkills === student.id ? null : student.id);
                                    setShowSkillSnapModal(selectedStudentForSkills !== student.id);
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                  type="button"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                  </svg>
                                  {selectedStudentForSkills === student.id && showSkillSnapModal ? 'Hide Skills' : 'View Skills'}
                                </button>
                                <button
                                  onClick={() => setSelectedStudentForBadges(selectedStudentForBadges === student.id ? null : student.id)}
                                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                  type="button"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                  </svg>
                                  {selectedStudentForBadges === student.id ? 'Hide Badges' : 'View Badges'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Empty State */}
                      {assignedToShow.length === 0 && (
                        <div className="text-center py-16">
                          <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 4a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Athletes Assigned</h3>
                          <p className="text-gray-500">
                            {assignedStudentsRoleFilter !== 'ALL' 
                              ? `No ${getRoleDisplayName(assignedStudentsRoleFilter)} athletes assigned to you.`
                              : 'No athletes assigned to you yet. Start by assigning students from the management section above.'
                            }
                          </p>
                        </div>
                      )}
                      
                      {/* Show More/Less Button */}
                      {filteredAssignedStudents.length > 3 && (
                        <div className="flex justify-center mt-8">
                          <button
                            className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline transition-all duration-200 flex items-center gap-2"
                            onClick={() => setShowAllAssigned(s => !s)}
                          >
                            {showAllAssigned ? (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/>
                                </svg>
                                Show Less
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                </svg>
                                Show More
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Badge Management Section - Enhanced */}
                  <section className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform hover:scale-[1.005] transition-all duration-500">
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 p-8 border-b border-gray-100">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-all duration-300">
                            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                            </svg>
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Badge Management</h2>
                            <p className="text-gray-600 text-lg">Create, manage, and evaluate student achievements</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setShowBadgeManager(!showBadgeManager)}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showBadgeManager ? "M19 9l-7 7-7-7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}/>
                          </svg>
                          {showBadgeManager ? 'Hide Badge Manager' : 'Open Badge Manager'}
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Badge Statistics */}
                      {badgeStats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-700 mb-1">Total Badges Created</p>
                                <p className="text-3xl font-bold text-gray-900">{badgeStats.totalBadges || 0}</p>
                                <p className="text-blue-600 text-sm font-medium mt-1">Academy achievements</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200 transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                </svg>
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-700 mb-1">Athletes Under Training</p>
                                <p className="text-3xl font-bold text-gray-900">{assignedStudents.length}</p>
                                <p className="text-emerald-600 text-sm font-medium mt-1">Active students</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          Quick Actions
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {selectedStudentForSkills && (
                            <button
                              onClick={() => handleEvaluateBadges(selectedStudentForSkills)}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                              </svg>
                              Evaluate Selected Student
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // Could add functionality to evaluate all students
                              alert('Feature coming soon: Evaluate all assigned students at once');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 10-8 0v3m12 4a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                            </svg>
                            Bulk Evaluation
                          </button>
                        </div>
                      </div>

                      {/* Badge Manager Component */}
                      {showBadgeManager && (
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 animate-fade-in">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Advanced Badge Manager</h3>
                          </div>
                          <BadgeManager 
                            onEditBadge={handleEditBadge}
                            onDeleteBadge={handleDeleteBadge}
                            refreshTrigger={badgeRefreshTrigger}
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Session To-Do Section for Coaches */}
                  <SessionTodoCoach assignedStudents={assignedStudents} />

                  {/* SkillSnap Component for Coaches */}
                  {selectedStudentForSkills && (
                    <div className="mb-8">
                      <SkillSnapDynamic 
                        studentId={selectedStudentForSkills}
                        isCoachView={true}
                        onSkillsUpdated={() => {
                          // Re-fetch badge stats when skills are updated for a student in modal
                          fetchBadgeStats();
                        }}
                      />
                    </div>
                  )}

                  {/* Badge Display for Selected Student */}
                  {selectedStudentForBadges && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[95vh] overflow-y-auto">
                        <button
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                          onClick={() => setSelectedStudentForBadges(null)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <BadgeDisplay 
                          studentId={selectedStudentForBadges}
                          showProgress={true}
                          layout="grid"
                        />
                      </div>
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

      {/* SkillSnap Modal */}
      {showSkillSnapModal && selectedStudentForSkills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[95vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => {
                setShowSkillSnapModal(false);
                setSelectedStudentForSkills(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <SkillSnapDynamic 
              studentId={selectedStudentForSkills} 
              isCoachView={true}
              onSkillsUpdated={() => {
                // Re-fetch badge stats when skills are updated for a student in modal
                fetchBadgeStats();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}