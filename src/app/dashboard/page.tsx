"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUser, FiAward, FiLogOut, FiCheckSquare, FiMessageSquare, FiTrendingUp, FiUsers, FiPlusCircle, FiActivity, FiTarget, FiX, FiCalendar, FiBarChart } from "react-icons/fi";
import { Check } from "lucide-react";
import { Badge, Student } from "@prisma/client";

import PeakPlayLogo from "@/components/PeakPlayLogo";
import SkillSnap from "@/components/SkillSnap";
import BadgeDisplay from "@/components/BadgeDisplay";
import BadgeManager from "@/components/BadgeManager";
import SessionTodoStudent from "@/components/SessionTodoStudent";
import SessionTodoCoach from "@/components/SessionTodoCoach";
import RecentMatchScores from "@/components/RecentMatchScores";
import CoachFeedback from "@/components/CoachFeedback";
import CreateFeedbackModal from "@/components/CreateFeedbackModal";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "COACH" | "ATHLETE";
  sport: string;
  academy?: string;
  students?: Student[];
  badges?: Badge[];
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
    />
  </div>
);

const TabButton = ({ text, icon, active, onClick }: { text: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25' 
        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
    }`}
  >
    <div className="mb-1">
      {icon}
    </div>
    <span className="text-xs font-medium">{text}</span>
  </motion.button>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [skillData, setSkillData] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('skillsnap');
  const [badges, setBadges] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Modal states for student features
  const [selectedStudentModal, setSelectedStudentModal] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'skillsnap' | 'badges' | 'feedback' | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - Status:', status, 'Session exists:', !!session);
    console.log('🔍 Dashboard useEffect - Full session object:', session);
    console.log('🔍 Dashboard useEffect - User role:', session?.user?.role);
    
    if (status === "loading") {
      console.log('🔍 Dashboard - Still loading session...');
      return;
    }
    
    // More permissive authentication check - proceed if we have a user in session
    if (session?.user) {
      console.log('🔍 Dashboard - User found in session, proceeding to fetch profile...');
      fetchProfile();
    } else if (status === "unauthenticated") {
      console.log('🔍 Dashboard - Unauthenticated, redirecting to signin...');
      router.replace("/auth/signin");
    } else {
      console.log('🔍 Dashboard - No user in session yet, waiting...');
      // If we don't have a user after some time, redirect
      const timer = setTimeout(() => {
        if (!session?.user) {
          console.log('🔍 Dashboard - Still no user after timeout, redirecting...');
          router.replace("/auth/signin");
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      console.log('🔍 Dashboard - Starting profile fetch...');
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const endpoint = session?.user?.role === "COACH" 
        ? "/api/coach/profile"
        : "/api/student/profile";

      console.log('🔍 Dashboard - Fetching from endpoint:', endpoint);
        const response = await fetch(endpoint);
      console.log('🔍 Dashboard - Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('🔍 Dashboard - Profile not found, redirecting to onboarding...');
          // Profile doesn't exist, redirect to onboarding
          const onboardingPath = session?.user?.role === "COACH"
            ? "/onboarding/coach"
            : "/onboarding/athlete";
          router.push(onboardingPath);
          return;
        }
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

          const data = await response.json();
      console.log('🔍 Dashboard - Profile data received:', data);
          setProfileData(data);

      if (data.role === "COACH" && data.academy) {
        console.log('🔍 Dashboard - Fetching coach-specific data...');
        fetchAvailableStudents(data.academy);
        fetchAssignedStudents();
      }
    } catch (err) {
      console.error("❌ Dashboard - Profile fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred loading your profile");
    } finally {
      console.log('🔍 Dashboard - Setting loading to false');
      setLoading(false);
    }
  };

  const fetchResource = async (setter: Function, endpoint: string) => {
    try {
      console.log(`🌐 fetchResource - Calling endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      console.log(`🌐 fetchResource - Response status: ${response.status} for ${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
        const data = await response.json();
      console.log(`🌐 fetchResource - Response data for ${endpoint}:`, data);
      
      // Handle different response structures
      if (endpoint.includes('/api/students/by-academy')) {
        setter(data.students || []);
      } else if (endpoint.includes('/api/badges')) {
        setter(data.badges || data || []);
      } else if (Array.isArray(data)) {
        setter(data);
      } else {
        setter(data);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      // Set empty array for failed requests to prevent null errors
      setter([]);
    }
  };

  const fetchAvailableStudents = (academy: string) => {
    fetchResource(setAvailableStudents, `/api/students/by-academy?academy=${encodeURIComponent(academy)}`);
  };
  const fetchAssignedStudents = () => fetchResource((data: any) => {
    // The coach profile API returns the coach object directly, not wrapped in a data object
    console.log('🔍 fetchAssignedStudents - Raw data received:', data);
    console.log('🔍 fetchAssignedStudents - Students array:', data.students);
    console.log('🔍 fetchAssignedStudents - Students length:', data.students?.length || 0);
        setAssignedStudents(data.students || []);
  }, "/api/coach/profile");
  
  useEffect(() => {
    if (profileData) {
      fetchResource(setSkillData, "/api/skills");
      fetchResource(setBadges, session?.user.role === 'COACH' ? "/api/badges?manage=true" : "/api/badges?type=progress");
      
      // For coaches, also fetch their assigned and available students
      if (session?.user.role === 'COACH' && profileData.academy) {
        fetchAssignedStudents();
        fetchAvailableStudents(profileData.academy);
      }
    }
  }, [profileData, session?.user.role]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: '/auth/signin' });
  };
  
  const handleCompleteProfile = () => {
    const role = session?.user.role?.toLowerCase();
    router.push(`/onboarding/${role}`);
  };

  const handleStudentSelection = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    setIsAssigning(true);
    try {
      const response = await fetch('/api/coach/assign-students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: selectedStudents }),
    });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign students');
      }
      
      const result = await response.json();
      
      // Clear selected students first
      setSelectedStudents([]);
      
      // Refresh both lists immediately
      console.log('🔄 Refreshing student lists after assignment...');
      await Promise.all([
        fetchAssignedStudents(),
        profileData?.academy ? fetchAvailableStudents(profileData.academy) : Promise.resolve()
      ]);
      console.log('✅ Student lists refreshed successfully');
      
      // Show success message
      setSuccessMessage(`Successfully assigned ${result.assignedCount} student${result.assignedCount !== 1 ? 's' : ''}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      } catch (error) {
      console.error('Error assigning students:', error);
      setError(error instanceof Error ? error.message : 'Failed to assign students');
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsAssigning(false);
    }
  };

  // Modal handler functions
  const openStudentModal = (student: any, modalType: 'skillsnap' | 'badges' | 'feedback') => {
    setSelectedStudentModal(student);
    setActiveModal(modalType);
    if (modalType === 'feedback') {
      setFeedbackModalOpen(true);
    }
    // Prevent body scroll when modal is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setSelectedStudentModal(null);
    setActiveModal(null);
    setFeedbackModalOpen(false);
    // Restore body scroll when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  const handleFeedbackCreated = () => {
    // Optionally refresh data or show success message
    console.log('Feedback created successfully');
    closeModal();
  };

  const athleteTabs = [
    { id: 'skillsnap', label: 'SkillSnap', icon: <FiActivity className="w-5 h-5" /> },
    { id: 'matches', label: 'Matches', icon: <FiTarget className="w-5 h-5" /> },
    { id: 'badges', label: 'Badges', icon: <FiAward className="w-5 h-5" /> },
    { id: 'feedback', label: 'Feedback', icon: <FiMessageSquare className="w-5 h-5" /> },
    { id: 'todo', label: 'To-Do', icon: <FiCheckSquare className="w-5 h-5" /> },
  ];

  const coachTabs = [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'students', label: 'Students', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'badges', label: 'Badges', icon: <FiAward className="w-5 h-5" /> },
  ];

  const tabs = useMemo(() => session?.user.role === 'COACH' ? coachTabs : athleteTabs, [session?.user.role]);
  
  useEffect(() => {
    // Set default tab - coaches start on 'students' tab, athletes on first tab
    const defaultTab = session?.user.role === 'COACH' ? 'students' : tabs[0]?.id;
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabs, session?.user.role]);


  // Show loading while session is loading or profile is being fetched
  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  // If no session user is found, return null (useEffect will handle redirect)
  if (!session?.user) {
    return <LoadingSpinner />;
  }

  // Check if profile is incomplete - different criteria for coaches vs athletes
  const isProfileIncomplete = session?.user.role === 'COACH' 
    ? !profileData?.name || !profileData?.academy
    : !profileData?.sport || !profileData?.academy;

  if (isProfileIncomplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <PeakPlayLogo size="large" variant="gradient" className="mb-8" />
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome, {session?.user.name || 'User'}!
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Please complete your profile to access your dashboard.
          </motion.p>
          <motion.button
            onClick={handleCompleteProfile}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            Complete Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const renderAthleteContent = () => {
  return (
      <div className="space-y-6">
        {(() => {
          switch(activeTab) {
            case 'skillsnap':
              return (
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                      <FiActivity className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Skill Tracking
                    </h2>
                  </div>
                  <SkillSnap />
                </motion.div>
              );
            case 'matches':
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiTarget className="mr-2 text-green-600" />
                    Recent Match Scores
                  </h2>
                  <RecentMatchScores />
            </div>
              );
            case 'badges':
              return (
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                      <FiAward className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Your Badges
                    </h2>
                  </div>
                  <BadgeDisplay />
                </motion.div>
              );
            case 'feedback':
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiMessageSquare className="mr-2 text-blue-600" />
                    Coach Feedback
                  </h2>
                  <CoachFeedback />
                </div>
              );
            case 'todo':
              return (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <FiCheckSquare className="mr-2 text-indigo-600" />
                    Training To-Do
                  </h2>
                  <SessionTodoStudent studentId={profileData?.id || ''} coachName={profileData?.name || ''} />
              </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  const renderCoachContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                      </div>
                  </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
                        </div>
            )}
            
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                        <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, Coach {profileData?.name}!</h1>
                  <p className="text-blue-100">
                    {profileData?.academy ? `${profileData.academy} Academy` : 'Your coaching dashboard'}
                  </p>
                        </div>
                <div className="hidden md:block">
                  <FiActivity className="w-16 h-16 text-blue-200" />
                      </div>
                            </div>
                        </div>
                        
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUsers className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Assigned Students</p>
                    <p className="text-2xl font-bold text-gray-900">{assignedStudents?.length || 0}</p>
                        </div>
                            </div>
                          </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <FiPlusCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Students</p>
                    <p className="text-2xl font-bold text-gray-900">{availableStudents?.length || 0}</p>
                  </div>
                    </div>
                  </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <FiAward className="w-6 h-6 text-yellow-600" />
                            </div>
                            </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Badges Created</p>
                    <p className="text-2xl font-bold text-gray-900">{badges?.length || 0}</p>
                          </div>
                        </div>
                      </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiTarget className="w-6 h-6 text-purple-600" />
                            </div>
                            </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Academy</p>
                    <p className="text-lg font-bold text-gray-900">{profileData?.academy || 'Not Set'}</p>
                          </div>
                        </div>
                        </div>
                      </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FiActivity className="mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <FiUsers className="w-8 h-8 text-blue-600 mr-3" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Manage Students</h3>
                    <p className="text-sm text-gray-600">Assign and view students</p>
                    </div>
                </button>

                <button
                  onClick={() => setActiveTab('badges')}
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
                >
                  <FiAward className="w-8 h-8 text-yellow-600 mr-3" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-yellow-700">Badge System</h3>
                    <p className="text-sm text-gray-600">Create and manage badges</p>
                          </div>
                </button>

                <button
                  onClick={() => setActiveTab('skillsnap')}
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <FiTrendingUp className="w-8 h-8 text-green-600 mr-3" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700">SkillSnap</h3>
                    <p className="text-sm text-gray-600">Track student progress</p>
                          </div>
                </button>
                        </div>
                      </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FiActivity className="mr-2 text-blue-600" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {assignedStudents?.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUsers className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                          <h3 className="font-semibold text-gray-900">Student Management</h3>
                          <p className="text-sm text-gray-600">You have {assignedStudents.length} students assigned</p>
                            </div>
                          </div>
                      <button
                        onClick={() => setActiveTab('students')}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Manage →
                      </button>
                        </div>
                    
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <FiAward className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Badge System</h3>
                          <p className="text-sm text-gray-600">Track and reward student achievements</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('badges')}
                        className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                      >
                        Create →
                      </button>
                      </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FiTrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">SkillSnap Analytics</h3>
                          <p className="text-sm text-gray-600">Monitor student progress and performance</p>
                    </div>
                  </div>
                      <button
                        onClick={() => setActiveTab('skillsnap')}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        View →
                      </button>
                    </div>


                  </>
                ) : (
                  <div className="text-center py-8">
                    <FiActivity className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Get Started</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Assign students and start tracking their progress
                    </p>
                            <button
                      onClick={() => setActiveTab('students')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                      Manage Students
                            </button>
                          </div>
                )}
                        </div>
                      </div>
                    </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                      </div>
                    </div>
                      </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                      </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
              </div>
            )}
            
            {/* Assigned Students */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiUsers className="mr-2 text-blue-600" />
                  Your Students
                        </h2>
                          <button 
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered');
                    fetchAssignedStudents();
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  Refresh
                          </button>
                    </div>
                    
              {assignedStudents?.length === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assigned students</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any students assigned yet.</p>
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left">
                    <p className="text-xs text-yellow-800 font-mono">
                      <strong>Debug Info:</strong><br/>
                      assignedStudents: {assignedStudents ? JSON.stringify(assignedStudents, null, 2) : 'null'}<br/>
                      assignedStudents length: {assignedStudents?.length}<br/>
                      assignedStudents type: {typeof assignedStudents}<br/>
                      profileData academy: {profileData?.academy}<br/>
                      session user role: {session?.user.role}
                        </p>
                      </div>
                              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedStudents?.map((student: any) => (
                    <div key={student.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <FiUser className="w-6 h-6 text-white" />
                            </div>
                            </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{student.studentName || student.name}</h3>
                          <p className="text-sm text-gray-600">{student.sport || 'No sport selected'}</p>
                          </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openStudentModal(student, 'skillsnap')}
                          className="flex-1 min-w-0 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <FiActivity className="w-3 h-3" />
                          <span className="truncate">SkillSnap</span>
                        </button>
                        
                        <button
                          onClick={() => openStudentModal(student, 'badges')}
                          className="flex-1 min-w-0 px-3 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-medium rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <FiAward className="w-3 h-3" />
                          <span className="truncate">Badges</span>
                        </button>
                        
                            <button
                          onClick={() => openStudentModal(student, 'feedback')}
                          className="flex-1 min-w-0 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-1"
                        >
                          <FiMessageSquare className="w-3 h-3" />
                          <span className="truncate">Feedback</span>
                            </button>
                          </div>
                        </div>
                      ))}
                        </div>
                      )}
            </div>

            {/* Available Students */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FiPlusCircle className="mr-2 text-green-600" />
                  Available Students
                </h2>
                {selectedStudents.length > 0 && (
                          <button
                    onClick={handleAssignStudents}
                    disabled={isAssigning}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isAssigning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      `Assign Selected (${selectedStudents.length})`
                    )}
                          </button>
                      )}
                    </div>
              
              {availableStudents?.length === 0 ? (
                <div className="text-center py-8">
                  <FiPlusCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No available students</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No unassigned students found in your academy ({profileData?.academy}).
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Students need to register and complete their profiles to appear here.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>To get students:</strong>
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                      <li>Share the registration link with students</li>
                      <li>Students must select "{profileData?.academy}" as their academy</li>
                      <li>Students will appear here once they complete their profiles</li>
                    </ul>
                        </div>
                        </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableStudents?.map((student: any) => (
                    <div 
                      key={student.id} 
                      onClick={() => handleStudentSelection(student.id)}
                      className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedStudents.includes(student.id) 
                          ? 'ring-2 ring-green-600 bg-green-50' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-gray-600" />
                            </div>
                                </div>
                                <div>
                            <h3 className="text-lg font-semibold text-gray-800">{student.studentName || student.name}</h3>
                            <p className="text-sm text-gray-600">{student.sport || 'No sport selected'}</p>
                                </div>
                              </div>
                        {selectedStudents.includes(student.id) && (
                          <Check className="w-6 h-6 text-green-600" />
                        )}
                            </div>
                                </div>
                  ))}
                                </div>
              )}
                              </div>
                            </div>
        );

      case 'badges':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FiAward className="mr-2 text-yellow-600" />
              Badge Management
            </h2>
            <BadgeManager />
                          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 font-sans overscroll-none">
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl shadow-lg border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <PeakPlayLogo size="default" variant="gradient" className="h-8 w-auto" />
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div 
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-md font-semibold text-gray-900">{profileData?.name || session?.user.name}</p>
                <p className="text-sm text-purple-600 capitalize font-medium">{profileData?.role?.toLowerCase() || session?.user.role?.toLowerCase()}</p>
              </motion.div>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all duration-300 shadow-sm"
                disabled={isSigningOut}
                aria-label="Sign Out"
              >
                {isSigningOut ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full" 
                  />
                ) : (
                  <FiLogOut className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Desktop Tab Navigation */}
        <motion.div 
          className="hidden lg:block mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <nav className="flex space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </motion.div>
        
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {session?.user.role === 'ATHLETE' ? renderAthleteContent() : renderCoachContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Bottom Tab Navigation for Mobile */}
      <motion.footer 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-purple-100 lg:hidden shadow-2xl"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <nav className="flex items-center justify-around max-w-7xl mx-auto px-2 py-1">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.9 }}
            >
              <TabButton
                text={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            </motion.div>
          ))}
        </nav>
      </motion.footer>

      {/* Add padding to the bottom of the main content to prevent overlap with the footer */}
      <div className="pb-20 lg:pb-0"></div>
      
      {/* Modal Components */}
      {selectedStudentModal && activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            />

            {/* Modal content */}
            <div
              className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl relative"
            >
              {/* Close button */}
                        <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                        >
                <FiX className="w-6 h-6" />
                        </button>

              {/* Modal header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                      </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedStudentModal.studentName || selectedStudentModal.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {activeModal === 'skillsnap' && 'SkillSnap Tracking'}
                      {activeModal === 'badges' && 'Badge Progress'}
                      {activeModal === 'feedback' && 'Provide Feedback'}
                    </p>
                    </div>
                </div>
              </div>

              {/* Modal content based on active modal type */}
              <div className="max-h-[70vh] overflow-y-auto">
                {activeModal === 'skillsnap' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                        <FiActivity className="mr-2" />
                        Skill Development Tracking
                      </h4>
                      <p className="text-blue-700 text-sm mb-4">
                        Track and monitor {selectedStudentModal.studentName || selectedStudentModal.name}&apos;s skill development progress.
                      </p>
                    </div>
                    <SkillSnap studentId={selectedStudentModal.id} />
            </div>
          )}

                {activeModal === 'badges' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center">
                        <FiAward className="mr-2" />
                        Badge Achievement Progress
                      </h4>
                      <p className="text-yellow-700 text-sm mb-4">
                        View {selectedStudentModal.studentName || selectedStudentModal.name}&apos;s earned badges and progress toward new achievements.
                      </p>
        </div>
                    <BadgeDisplay studentId={selectedStudentModal.id} />
                  </div>
                )}

                {activeModal === 'feedback' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h4 className="text-lg font-semibold text-green-900 mb-2 flex items-center">
                        <FiMessageSquare className="mr-2" />
                        Provide Student Feedback
                      </h4>
                      <p className="text-green-700 text-sm mb-4">
                        Share constructive feedback with {selectedStudentModal.studentName || selectedStudentModal.name} to help them improve.
                      </p>
                    </div>
        <CreateFeedbackModal
          isOpen={feedbackModalOpen}
                      onClose={closeModal}
                      student={{
                        id: selectedStudentModal.id,
                        studentName: selectedStudentModal.studentName || selectedStudentModal.name || 'Student',
                        username: selectedStudentModal.username || selectedStudentModal.email || 'student',
                        age: selectedStudentModal.age || 18
                      }}
          onFeedbackCreated={handleFeedbackCreated}
        />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}