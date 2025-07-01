"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUser, FiAward, FiLogOut, FiCheckSquare, FiMessageSquare, FiTrendingUp, FiUsers, FiPlusCircle, FiActivity, FiTarget, FiX, FiCalendar, FiBarChart, FiChevronRight } from "react-icons/fi";
import { Check } from "lucide-react";
import PeakPlayLogo from "@/components/PeakPlayLogo";
import SkillSnap from "@/components/SkillSnap";
import BadgeDisplay from "@/components/BadgeDisplay";
import BadgeManager from "@/components/BadgeManager";
import SessionTodoStudent from "@/components/SessionTodoStudent";
import SessionTodoCoach from "@/components/SessionTodoCoach";
import RecentMatchScores from "@/components/RecentMatchScores";
import CoachFeedback from "@/components/CoachFeedback";
import CreateFeedbackModal from "@/components/CreateFeedbackModal";
import OverallStats from "@/components/OverallStats";
import Portal from '../../components/Portal';
import PeakScore from "@/components/PeakScore";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "COACH" | "ATHLETE";
  sport: string;
  academy?: string;
  students?: any[];
  badges?: any[];
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full opacity-30"
      />
    </div>
  </div>
);

const TabButton = ({ text, icon, active, onClick }: { text: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'text-white' 
        : 'text-gray-600 hover:text-purple-600'
    }`}
  >
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/25"
        transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      />
    )}
    <div className={`relative mb-1 ${active ? 'animate-bounce' : ''}`}>
      {icon}
    </div>
    <span className="relative text-xs font-medium">{text}</span>
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
  const [isSkillSnapModalOpen, setIsSkillSnapModalOpen] = useState(false);

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
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const endpoint = session?.user?.role === "COACH" 
        ? "/api/coach/profile"
        : "/api/student/profile";

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 404) {
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
      setProfileData(data);

      if (data.role === "COACH" && data.academy) {
        fetchAvailableStudents(data.academy);
        fetchAssignedStudents();
      }
    } catch (err) {
      console.error("Dashboard - Profile fetch error:", err);
      setError(err instanceof Error ? err.message : "An error occurred loading your profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchResource = async (setter: Function, endpoint: string) => {
    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
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

  // Add body scroll lock when SkillSnap modal is open
  useEffect(() => {
    if (isSkillSnapModalOpen) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Unlock body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isSkillSnapModalOpen]);

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
      await Promise.all([
        fetchAssignedStudents(),
        profileData?.academy ? fetchAvailableStudents(profileData.academy) : Promise.resolve()
      ]);
      
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
    { id: 'todo', label: 'To-Do', icon: <FiCheckSquare className="w-5 h-5" /> },
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
          className="text-center glass p-8 rounded-3xl max-w-md"
        >
          <PeakPlayLogo size="large" variant="gradient" className="mb-8" />
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4"
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
            className="btn-gradient btn-modern text-white font-semibold"
          >
            Complete Profile
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center glass p-8 rounded-3xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-6xl mb-4"
          >
            ⚠️
          </motion.div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-modern bg-red-600 text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  const renderAthleteContent = () => {
    switch (activeTab) {
      case 'overview':
  return (
          <div className="space-y-6">
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                >
                  <FiActivity className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Overall Progress
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Track your journey to athletic excellence</p>
                </div>
              </div>
              <OverallStats />
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                >
                  <FiTarget className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Recent Matches
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your latest performance scores</p>
                </div>
              </div>
              <RecentMatchScores />
            </motion.div>

            <motion.div 
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                >
                  <FiMessageSquare className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    Coach Feedback
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Latest insights from your coaches</p>
                </div>
              </div>
              <CoachFeedback />
            </motion.div>
          </div>
        );

            case 'skillsnap':
              return (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="card-modern glass">
                    <div className="p-6">
                      <div className="flex items-center mb-6">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                        >
                          <FiActivity className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            SkillSnap
                          </h2>
                          <p className="text-sm text-gray-600 mt-1">Track and improve your athletic skills</p>
                        </div>
                      </div>
                      
                      {/* Open SkillSnap Button */}
                      <motion.button
                        onClick={() => setIsSkillSnapModalOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FiActivity className="w-5 h-5" />
                          Open SkillSnap
                        </span>
                      </motion.button>
                    </div>
                  </div>

                  {/* PeakScore Component */}
                  <PeakScore 
                    skillData={skillData}
                    isLoading={loading}
                  />
                </motion.div>
              );

            case 'matches':
              return (
                <motion.div 
                  className="card-modern"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="mr-2"
                      >
                        <FiTarget className="text-green-600" />
                      </motion.div>
                      Recent Match Scores
                    </h2>
                    <RecentMatchScores />
                  </div>
                </motion.div>
              );

            case 'badges':
              return (
                <motion.div 
                  className="card-modern glass"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                      >
                        <FiAward className="w-6 h-6 text-white" />
                      </motion.div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Your Badges
                      </h2>
                    </div>
                    <BadgeDisplay />
                  </div>
                </motion.div>
              );

            case 'feedback':
              return (
                <motion.div 
                  className="card-modern"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2"
                      >
                        <FiMessageSquare className="text-blue-600" />
                      </motion.div>
                      Coach Feedback
                    </h2>
                    <CoachFeedback />
                  </div>
                </motion.div>
              );

            case 'todo':
              return (
                <motion.div 
                  className="card-modern"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="mr-2"
                      >
                        <FiCheckSquare className="text-indigo-600" />
                      </motion.div>
                      Training To-Do
                    </h2>
                    <SessionTodoStudent studentId={profileData?.id || ''} coachName={profileData?.name || ''} />
                  </div>
                </motion.div>
              );

            default:
              return null;
          }
  };

  const renderCoachContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 stagger-children">
            {/* Success/Error Messages */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass bg-green-50/80 border border-green-200 rounded-2xl p-4"
                >
                  <div className="flex items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="flex-shrink-0"
                    >
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass bg-red-50/80 border border-red-200 rounded-2xl p-4"
                >
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="flex-shrink-0"
                    >
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        {assignedStudents.length}
                      </motion.p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"
                    >
                      <FiUsers className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                      >
                        {assignedStudents.length * 2}
                      </motion.p>
                    </div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center"
                    >
                      <FiActivity className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Badges Awarded</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      >
                        {badges.length}
                      </motion.p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center"
                    >
                      <FiAward className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div 
              className="card-modern p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  onClick={() => setActiveTab('students')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                      <FiUsers className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">Manage Students</h4>
                      <p className="text-sm text-gray-600">View and assign students</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('badges')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">Badge Manager</h4>
                      <p className="text-sm text-gray-600">Create and award badges</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <FiCalendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">Schedule Session</h4>
                      <p className="text-sm text-gray-600">Plan training sessions</p>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>
            </motion.div>
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

      case 'todo':
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card-modern glass">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                  >
                    <FiCheckSquare className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Session To-Do Lists
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Create and manage training checklists for your students</p>
                  </div>
                </div>
                <SessionTodoCoach assignedStudents={assignedStudents} />
              </div>
            </div>
          </motion.div>
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
      {!isSkillSnapModalOpen && (
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
      )}

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
                    <SkillSnap studentId={selectedStudentModal.id} isCoachView={true} />
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

      {/* Athlete SkillSnap Modal */}
      {session?.user.role === 'ATHLETE' && isSkillSnapModalOpen && (
        <Portal>
          <div 
            className="fixed inset-0 z-[999999] overflow-hidden"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999999,
              isolation: 'isolate'
            }}
          >
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999998
              }}
              onClick={() => setIsSkillSnapModalOpen(false)}
            />

            {/* Modal content - absolute full screen positioning */}
            <div 
              className="absolute inset-0"
              style={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: 'white'
              }}
            >
              <div className="w-full h-full bg-white overflow-hidden">
                {/* Fixed Close button - positioned absolutely */}
                <button
                  onClick={() => setIsSkillSnapModalOpen(false)}
                  className="absolute top-4 right-4 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 shadow-lg"
                  aria-label="Close SkillSnap"
                  style={{ 
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 1000000
                  }}
                >
                  <FiX className="w-6 h-6" />
                </button>

                {/* SkillSnap Component - full height with overflow */}
                <div className="w-full h-full overflow-y-auto">
                  <div className="pt-16 pb-6 px-4">
                    <SkillSnap onModalChange={setIsSkillSnapModalOpen} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}