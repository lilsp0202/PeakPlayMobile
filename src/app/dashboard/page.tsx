"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUser, FiAward, FiLogOut, FiCheckSquare, FiMessageSquare, FiTrendingUp, FiUsers, FiPlusCircle, FiActivity, FiTarget, FiX, FiCalendar, FiBarChart, FiChevronRight, FiBell, FiClock, FiZap, FiRefreshCw, FiEye } from "react-icons/fi";
import { Check } from "lucide-react";
import dynamic from 'next/dynamic';
import PeakPlayLogo from "@/components/PeakPlayLogo";
import Portal from '../../components/Portal';
import type { Session } from "next-auth";

// Enhanced dynamic imports with better error handling and loading states
const SkillSnap = dynamic(() => import("@/components/SkillSnap").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Component temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><div className="text-gray-500">Loading SkillSnap...</div></div>
});

const BadgeDisplay = dynamic(() => import("@/components/BadgeDisplay").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Badges temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center"><div className="text-gray-500">Loading badges...</div></div>
});



const SessionTodoStudent = dynamic(() => import("@/components/SessionTodoStudent").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Session todos temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>
});

const SessionTodoCoach = dynamic(() => import("@/components/SessionTodoCoach").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Coach todos temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>
});

const RecentMatchScores = dynamic(() => import("@/components/RecentMatchScores").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Match scores temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
});

const CoachFeedback = dynamic(() => import("@/components/CoachFeedback").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Feedback temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
});

const FeedbackActions = dynamic(() => import("@/components/FeedbackActions").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Feedback & Actions temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>
});

const CreateFeedbackModal = dynamic(() => import("@/components/CreateFeedbackModal").catch(() => ({ default: () => null })), { 
  ssr: false
});

const CreateFeedbackActionModal = dynamic(() => import("@/components/CreateFeedbackActionModal").catch(() => ({ default: () => null })), { 
  ssr: false
});

const OverallStats = dynamic(() => import("@/components/OverallStats").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Stats temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
});

// New coach components
const StudentDetailModal = dynamic(() => import("@/components/StudentDetailModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const MultiStudentFeedbackModal = dynamic(() => import("@/components/MultiStudentFeedbackModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const PeakScore = dynamic(() => import("@/components/PeakScore").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">PeakScore temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96 flex items-center justify-center"><div className="text-gray-500">Loading PeakScore...</div></div>
});

const MatchCentre = dynamic(() => import("@/components/MatchCentre").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Match Centre temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96 flex items-center justify-center"><div className="text-gray-500">Loading Match Centre...</div></div>
});

const AthleteProgressTracker = dynamic(() => import("@/components/AthleteProgressTracker"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96 flex items-center justify-center"><div className="text-gray-500">Loading Progress Tracker...</div></div>
});

const SmartNotifications = dynamic(() => import("@/components/SmartNotifications").catch(() => ({ default: () => null })), {
  ssr: false
});

const ProfileModal = dynamic(() => import("@/components/ProfileModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const StudentProgressModal = dynamic(() => import("@/components/StudentProgressModal").catch(() => ({ default: () => null })), {
  ssr: false
});

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
  const [activeModal, setActiveModal] = useState<'skillsnap' | 'badges' | 'feedback' | 'progress' | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isSkillSnapModalOpen, setIsSkillSnapModalOpen] = useState(false);
  const [multiStudentFeedbackOpen, setMultiStudentFeedbackOpen] = useState(false);
  const [studentDetailModalOpen, setStudentDetailModalOpen] = useState(false);
  const [studentDetailView, setStudentDetailView] = useState<'skillsnap' | 'badges'>('skillsnap');
  const [smartNotificationsOpen, setSmartNotificationsOpen] = useState(false);
  const [expandedStudents, setExpandedStudents] = useState<string[]>([]);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [studentsSubTab, setStudentsSubTab] = useState<'assigned' | 'available' | 'track'>('assigned');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<any>(null);
  const [isRefreshingSkills, setIsRefreshingSkills] = useState(false);

  // Track tab state variables
  const [trackViewType, setTrackViewType] = useState<'feedback' | 'actions'>('feedback');
  const [trackData, setTrackData] = useState<any[]>([]);
  const [isLoadingTrackData, setIsLoadingTrackData] = useState(false);
  const [trackFilters, setTrackFilters] = useState({
    student: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'week',
    status: 'all'
  });

  useEffect(() => {
    console.log('🔍 Dashboard useEffect - Status:', status, 'Session exists:', !!session);
    console.log('🔍 Dashboard useEffect - Full session object:', session);
    console.log('🔍 Dashboard useEffect - User role:', (session as unknown as Session)?.user?.role);
    
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

  // Handle badge centre navigation when badges tab is selected
  useEffect(() => {
    if (activeTab === 'badges') {
      router.push('/badge-centre');
    }
  }, [activeTab, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const endpoint = (session as unknown as Session)?.user?.role === "COACH" 
        ? "/api/coach/profile"
        : "/api/student/profile";

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist, redirect to onboarding
          const onboardingPath = (session as unknown as Session)?.user?.role === "COACH"
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
    setAssignedStudents(data?.students || []);
  }, "/api/coach/profile");
  
  useEffect(() => {
    if (profileData) {
      fetchResource(setSkillData, "/api/skills");
      fetchResource(setBadges, (session as unknown as Session)?.user?.role === 'COACH' ? "/api/badges?manage=true" : "/api/badges?type=progress");
      
      // For coaches, also fetch their assigned and available students
      if ((session as unknown as Session)?.user?.role === 'COACH' && profileData.academy) {
        fetchAssignedStudents();
        fetchAvailableStudents(profileData.academy);
      }
    }
  }, [profileData, (session as unknown as Session)?.user?.role]);

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
    const role = (session as unknown as Session)?.user?.role?.toLowerCase();
    router.push(`/onboarding/${role}`);
  };

  const handleRefreshSkills = async () => {
    setIsRefreshingSkills(true);
    try {
      const response = await fetch("/api/skills");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSkillData(data);
    } catch (error) {
      console.error("Error refreshing skills:", error);
      setError("Failed to refresh skills. Please try again.");
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsRefreshingSkills(false);
    }
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
  const openStudentModal = (student: any, modalType: 'skillsnap' | 'badges' | 'feedback' | 'progress') => {
    setSelectedStudentModal(student);
    setActiveModal(modalType);
    if (modalType === 'feedback') {
      setFeedbackModalOpen(true);
    } else if (modalType === 'skillsnap') {
      // For SkillSnap, open the inline modal directly
      // Don't open StudentDetailModal for SkillSnap
    } else if (modalType === 'badges') {
      setStudentDetailView(modalType);
      setStudentDetailModalOpen(true);
    } else if (modalType === 'progress') {
      setSelectedStudentForProgress(student);
      setProgressModalOpen(true);
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
    setStudentDetailModalOpen(false);
    setMultiStudentFeedbackOpen(false);
    setProgressModalOpen(false);
    setSelectedStudentForProgress(null);
    // Restore body scroll when modal is closed
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  const handleFeedbackCreated = () => {
    // Optionally refresh data or show success message
    closeModal();
  };

  const toggleStudentExpanded = (studentId: string) => {
    setExpandedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const isStudentExpanded = (studentId: string) => {
    return expandedStudents.includes(studentId);
  };

  // Track tab helper functions
  const fetchTrackData = async () => {
    if (!assignedStudents || assignedStudents.length === 0) {
      setTrackData([]);
      return;
    }

    setIsLoadingTrackData(true);
    try {
      const trackResults = [];
      
      for (const student of assignedStudents) {
        const endpoint = trackViewType === 'feedback' 
          ? `/api/feedback?studentId=${student.id}`
          : `/api/actions?studentId=${student.id}`;
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const enrichedData = data.map((item: any) => ({
            ...item,
            studentName: student.studentName || student.name,
            studentId: student.id
          }));
          trackResults.push(...enrichedData);
        }
      }
      
      // Apply filters
      const filteredData = applyTrackFilters(trackResults);
      setTrackData(filteredData);
    } catch (error) {
      console.error('Error fetching track data:', error);
      setTrackData([]);
    } finally {
      setIsLoadingTrackData(false);
    }
  };

  const applyTrackFilters = (data: any[]) => {
    let filtered = [...data];

    // Filter by student
    if (trackFilters.student !== 'all') {
      filtered = filtered.filter(item => item.studentId === trackFilters.student);
    }

    // Filter by category
    if (trackFilters.category !== 'all') {
      filtered = filtered.filter(item => item.category === trackFilters.category);
    }

    // Filter by priority
    if (trackFilters.priority !== 'all') {
      filtered = filtered.filter(item => item.priority === trackFilters.priority);
    }

    // Filter by date range
    const now = new Date();
    const dateFilterMap = {
      'today': 1,
      'week': 7,
      'month': 30,
      'quarter': 90,
      'all': null
    };
    
    const daysBack = dateFilterMap[trackFilters.dateRange as keyof typeof dateFilterMap];
    if (daysBack) {
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(item => new Date(item.createdAt) >= cutoffDate);
    }

    // Filter by status (for actions)
    if (trackViewType === 'actions' && trackFilters.status !== 'all') {
      if (trackFilters.status === 'completed') {
        filtered = filtered.filter(item => item.isCompleted);
      } else if (trackFilters.status === 'pending') {
        filtered = filtered.filter(item => !item.isCompleted);
      } else if (trackFilters.status === 'acknowledged') {
        filtered = filtered.filter(item => item.isAcknowledged);
      }
    }

    // Filter by status (for feedback)
    if (trackViewType === 'feedback' && trackFilters.status !== 'all') {
      if (trackFilters.status === 'read') {
        filtered = filtered.filter(item => item.isRead);
      } else if (trackFilters.status === 'unread') {
        filtered = filtered.filter(item => !item.isRead);
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  };

  // Fetch track data when view type or filters change
  useEffect(() => {
    if (studentsSubTab === 'track' && assignedStudents.length > 0) {
      fetchTrackData();
    }
  }, [trackViewType, trackFilters, assignedStudents, studentsSubTab]);

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
    { id: 'progress', label: 'Progress', icon: <FiTrendingUp className="w-5 h-5" /> },
    { id: 'badges', label: 'Badges', icon: <FiAward className="w-5 h-5" /> },
    { id: 'todo', label: 'To-Do', icon: <FiCheckSquare className="w-5 h-5" /> },
  ];

  const tabs = useMemo(() => (session as unknown as Session)?.user?.role === 'COACH' ? coachTabs : athleteTabs, [(session as unknown as Session)?.user?.role]);
  
  useEffect(() => {
    // Set default tab - coaches start on 'overview' tab, athletes on first tab
    const defaultTab = (session as unknown as Session)?.user?.role === 'COACH' ? 'overview' : tabs[0]?.id;
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabs, (session as unknown as Session)?.user?.role]);


  // Show loading while session is loading or profile is being fetched
  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  // If no session user is found, return null (useEffect will handle redirect)
  if (!session?.user) {
    return <LoadingSpinner />;
  }

  // Check if profile is incomplete - different criteria for coaches vs athletes
  const isProfileIncomplete = (session as unknown as Session)?.user?.role === 'COACH' 
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
                    onRefresh={handleRefreshSkills}
                    isRefreshing={isRefreshingSkills}
                  />
                </motion.div>
              );

            case 'matches':
              return (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <MatchCentre />
                </motion.div>
              );

            case 'badges':
              return (
                <motion.div 
                  className="card-modern glass flex items-center justify-center h-64"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Opening Badge Centre...</p>
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
                      Feedback & Actions
                    </h2>
                    <FeedbackActions />
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

            {/* Welcome Header */}
            <motion.div 
              className="card-modern glass bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h1 
                      className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome back, {profileData?.name}! 👋
                    </motion.h1>
                    <motion.p 
                      className="text-gray-600 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {profileData?.academy} • Today is {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="hidden sm:block"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiGrid className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Key Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ transition: 'delay: 0.1s' }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Students</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      >
                        {assignedStudents.length}
                      </motion.p>
                      <p className="text-xs text-green-600 mt-1">↗ All engaged</p>
                    </div>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <FiUsers className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ transition: 'delay: 0.2s' }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weekly Sessions</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                      >
                        {assignedStudents.length * 3}
                      </motion.p>
                      <p className="text-xs text-blue-600 mt-1">↗ +12% this week</p>
                    </div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <FiActivity className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ transition: 'delay: 0.3s' }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Badges Awarded</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.4 }}
                      >
                        {badges.length}
                      </motion.p>
                      <p className="text-xs text-yellow-600 mt-1">🏆 This month</p>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <FiAward className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card-gradient card-modern"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ transition: 'delay: 0.4s' }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                      <motion.p 
                        className="text-3xl font-bold text-gray-900 mt-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
                      >
                        87.3
                      </motion.p>
                      <p className="text-xs text-green-600 mt-1">↗ +5.2% improvement</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
                    >
                      <FiTrendingUp className="w-6 h-6 text-white" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Today's Summary & Smart Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Highlights */}
              <motion.div 
                className="card-modern p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiCalendar className="w-5 h-5 mr-2 text-blue-600" />
                    Today's Highlights
                  </h3>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">3 students completed SkillSnap</p>
                      <p className="text-xs text-gray-600">All showing improvement trends</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">2 new badges ready to award</p>
                      <p className="text-xs text-gray-600">Outstanding performance achievements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">1 student needs feedback</p>
                      <p className="text-xs text-gray-600">Overdue for weekly check-in</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Smart Notifications Preview */}
              <motion.div 
                className="card-modern p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FiBell className="w-5 h-5 mr-2 text-purple-600" />
                    Smart Insights
                  </h3>
                  <motion.button
                    onClick={() => setSmartNotificationsOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All →
                  </motion.button>
                </div>
                
                <div className="space-y-4">
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <FiTrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sarah Johnson improving!</p>
                        <p className="text-xs text-gray-600 mt-1">Physical performance up 15% this week</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <FiClock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Check-in reminder</p>
                        <p className="text-xs text-gray-600 mt-1">Mike hasn't updated SkillSnap in 3 days</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <FiAward className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">New achievement unlocked!</p>
                        <p className="text-xs text-gray-600 mt-1">Emma earned "Consistency Champion" badge</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div 
              className="card-modern p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FiZap className="w-5 h-5 mr-2 text-indigo-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.button
                  onClick={() => setActiveTab('students')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FiUsers className="w-6 h-6 text-white" />
                    </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Manage Students</h4>
                  <p className="text-xs text-gray-600 text-center">View, assign & track students</p>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('progress')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                    </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
                  <p className="text-xs text-gray-600 text-center">Monitor athlete development</p>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('badges')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FiAward className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Badge Centre</h4>
                  <p className="text-xs text-gray-600 text-center">Create & award achievements</p>
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('todo')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FiCheckSquare className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Session Planner</h4>
                  <p className="text-xs text-gray-600 text-center">Create training to-dos</p>
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Student Activity */}
            <motion.div 
              className="card-modern p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiActivity className="w-5 h-5 mr-2 text-green-600" />
                  Recent Student Activity
                </h3>
                <span className="text-sm text-gray-500">Last 24 hours</span>
              </div>
              
              {assignedStudents && assignedStudents.length > 0 ? (
                <div className="space-y-3">
                  {assignedStudents.slice(0, 3).map((student: any, index: number) => (
                    <motion.div 
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-white" />
                    </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{student.studentName || student.name}</h4>
                          <p className="text-sm text-gray-600">Completed SkillSnap • 2 hours ago</p>
                    </div>
                  </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          +2.3 pts
                        </span>
                        <motion.button
                          onClick={() => openStudentModal(student, 'skillsnap')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FiChevronRight className="w-4 h-4" />
                </motion.button>
                      </div>
                    </motion.div>
                  ))}

                  {assignedStudents.length > 3 && (
                <motion.button
                      onClick={() => setActiveTab('students')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                      className="w-full p-3 text-center text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                      View All {assignedStudents.length} Students →
                    </motion.button>
                  )}
                    </div>
              ) : (
                <div className="text-center py-8">
                  <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Students Yet</h4>
                  <p className="text-gray-500 mb-4">Start by assigning students to track their progress</p>
                  <motion.button
                    onClick={() => setActiveTab('students')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Assign Students
                </motion.button>
              </div>
              )}
            </motion.div>
          </div>
        );

      case 'students':
        return (
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Success/Error Messages */}
            <AnimatePresence>
            {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm"
                >
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
                </motion.div>
            )}
            </AnimatePresence>
            
            <AnimatePresence>
            {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm"
                >
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
                </motion.div>
            )}
            </AnimatePresence>

            {/* Students Sub-Tab Navigation */}
            <motion.div 
              className="card-modern p-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex bg-gray-100 rounded-lg p-1">
                <motion.button
                  onClick={() => setStudentsSubTab('assigned')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                    studentsSubTab === 'assigned'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <FiUsers className="w-4 h-4 mr-2" />
                  <span>Your Students</span>
                  {assignedStudents && assignedStudents.length > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      studentsSubTab === 'assigned' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {assignedStudents.length}
                    </span>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => setStudentsSubTab('available')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                    studentsSubTab === 'available'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
                  }`}
                >
                  <FiPlusCircle className="w-4 h-4 mr-2" />
                  <span>Available Students</span>
                  {availableStudents && availableStudents.length > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      studentsSubTab === 'available' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {availableStudents.length}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => setStudentsSubTab('track')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                    studentsSubTab === 'track'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                  }`}
                >
                  <FiEye className="w-4 h-4 mr-2" />
                  <span>Track</span>
                  {trackData && trackData.length > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      studentsSubTab === 'track' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-purple-100 text-purple-600'
                    }`}>
                      {trackData.length}
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
            
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {studentsSubTab === 'assigned' && (
                <motion.div 
                  key="assigned"
                  className="card-modern p-4 sm:p-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
              {/* Action Buttons Header */}
              <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="flex items-center mr-4 sm:mr-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                      <FiUsers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Your Students</h3>
                      <p className="text-xs text-gray-600 sm:hidden">Manage assigned students</p>
                    </div>
                  </div>
                </div>
                
                {/* Mobile-Optimized Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {assignedStudents?.length > 0 && (
                    <motion.button 
                      onClick={() => setMultiStudentFeedbackOpen(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center gap-1 min-h-[44px] sm:min-h-0"
                    >
                      <FiMessageSquare className="w-4 h-4" />
                      <span className="sm:inline">Multi-Feedback</span>
                    </motion.button>
                  )}
                  <motion.button 
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered');
                      fetchAssignedStudents();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm min-h-[44px] sm:min-h-0"
                  >
                    Refresh
                  </motion.button>
                </div>
              </div>
                    
              {assignedStudents?.length === 0 ? (
                <motion.div 
                  className="text-center py-12 sm:py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FiUsers className="mx-auto h-16 w-16 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-base font-medium text-gray-900 mb-2">No assigned students</h3>
                  <p className="text-base sm:text-sm text-gray-500 px-4">You don't have any students assigned yet.</p>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
                    {(showAllStudents ? assignedStudents : assignedStudents?.slice(0, 6))?.map((student: any, index: number) => (
                      <motion.div 
                        key={student.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-gray-50 rounded-xl p-5 sm:p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
                      >
                        {/* Student Info - Mobile Optimized */}
                        <div className="flex items-center space-x-4 sm:space-x-3 mb-4 sm:mb-3">
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <FiUser className="w-7 h-7 sm:w-6 sm:h-6 text-white" />
                            </div>
                            </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-base font-semibold text-gray-800 truncate">{student.studentName || student.name}</h3>
                                <p className="text-base sm:text-sm text-gray-600 flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  {student.sport || 'No sport selected'}
                                </p>
                              </div>
                              <motion.button
                                onClick={() => toggleStudentExpanded(student.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <motion.div
                                  animate={{ rotate: isStudentExpanded(student.id) ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <FiChevronRight className="w-4 h-4" />
                                </motion.div>
                              </motion.button>
                            </div>
                          </div>
                      </div>
                      
                        {/* Student Details - Expandable */}
                        <AnimatePresence>
                          {isStudentExpanded(student.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mb-4 p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">Age:</span>
                                  <span className="ml-2 font-medium">{student.age || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <span className="ml-2 font-medium text-xs truncate">{student.email || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Height:</span>
                                  <span className="ml-2 font-medium">{student.height ? `${student.height}cm` : 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Weight:</span>
                                  <span className="ml-2 font-medium">{student.weight ? `${student.weight}kg` : 'N/A'}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Mobile-Optimized Action Buttons - Added Track Progress */}
                        <div className="flex gap-2">
                          <motion.button
                          onClick={() => openStudentModal(student, 'skillsnap')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-3 py-3 sm:px-2 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-1 min-h-[48px] sm:min-h-0 shadow-md"
                          >
                              <FiActivity className="w-4 h-4 sm:w-3 sm:h-3" />
                            <span className="truncate">Skills</span>
                            </motion.button>
                          
                          <motion.button
                          onClick={() => openStudentModal(student, 'feedback')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-3 py-3 sm:px-2 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-1 min-h-[48px] sm:min-h-0 shadow-md"
                        >
                              <FiMessageSquare className="w-4 h-4 sm:w-3 sm:h-3" />
                          <span className="truncate">Feedback</span>
                            </motion.button>
                          </div>
                      </motion.div>
                      ))}
                        </div>
                  
                  {/* Show More Students Button */}
                  {assignedStudents && assignedStudents.length > 6 && (
                    <motion.div 
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        onClick={() => setShowAllStudents(!showAllStudents)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-md flex items-center gap-2 mx-auto"
                      >
                        <FiUsers className="w-4 h-4" />
                        <span>
                          {showAllStudents ? 'Show Less' : `Show All ${assignedStudents.length} Students`}
                        </span>
                        <motion.div
                          animate={{ rotate: showAllStudents ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  )}
                </>
              )}
                </motion.div>
              )}

              {studentsSubTab === 'available' && (
                <motion.div 
                  key="available"
                  className="card-modern p-4 sm:p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
              {/* Action Buttons Header */}
              <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="flex items-center mr-4 sm:mr-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
                      <FiPlusCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Available Students</h3>
                      <p className="text-xs text-gray-600 sm:hidden">Select to assign</p>
                    </div>
                  </div>
            </div>

                {selectedStudents.length > 0 && (
                  <motion.button
                    onClick={handleAssignStudents}
                    disabled={isAssigning}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-6 py-3 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] sm:min-h-0 shadow-md font-medium"
                  >
                    {isAssigning ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <FiUsers className="w-4 h-4" />
                        <span>Assign Selected ({selectedStudents.length})</span>
                      </>
                    )}
                  </motion.button>
                      )}
                    </div>
              
              {availableStudents?.length === 0 ? (
                <motion.div 
                  className="text-center py-12 sm:py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <FiPlusCircle className="mx-auto h-16 w-16 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-base font-medium text-gray-900 mb-2">No available students</h3>
                  <p className="text-base sm:text-sm text-gray-500 mb-2 px-4">
                    No unassigned students found in your academy ({profileData?.academy}).
                  </p>
                  <p className="text-sm sm:text-xs text-gray-400 px-4 mb-6">
                    Students need to register and complete their profiles to appear here.
                  </p>
                  <div className="mt-6 p-5 sm:p-4 bg-blue-50 rounded-xl mx-4 sm:mx-0">
                    <p className="text-base sm:text-sm text-blue-800 font-medium mb-3">
                      <strong>To get students:</strong>
                    </p>
                    <ul className="text-sm sm:text-sm text-blue-700 space-y-2 text-left">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Share the registration link with students
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Students must select "{profileData?.academy}" as their academy
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        Students will appear here once they complete their profiles
                      </li>
                    </ul>
                        </div>
                </motion.div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(showAllStudents ? availableStudents : availableStudents?.slice(0, 6))?.map((student: any, index: number) => (
                    <motion.div 
                      key={student.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      onClick={() => handleStudentSelection(student.id)}
                      className={`rounded-xl p-5 sm:p-4 cursor-pointer transition-all duration-200 border-2 active:scale-95 touch-manipulation ${
                        selectedStudents.includes(student.id) 
                          ? 'ring-2 ring-green-600 bg-green-50 border-green-200 shadow-md' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 sm:space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                              selectedStudents.includes(student.id) 
                                ? 'bg-green-100' 
                                : 'bg-gray-200'
                            }`}>
                              <FiUser className={`w-6 h-6 sm:w-5 sm:h-5 ${
                                selectedStudents.includes(student.id) 
                                  ? 'text-green-600' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                                </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-base font-semibold text-gray-800 truncate">{student.studentName || student.name}</h3>
                            <p className="text-base sm:text-sm text-gray-600 flex items-center">
                              <span className={`w-2 h-2 rounded-full mr-2 ${
                                selectedStudents.includes(student.id) ? 'bg-green-500' : 'bg-gray-400'
                              }`}></span>
                              {student.sport || 'No sport selected'}
                            </p>
                                </div>
                              </div>
                        <div className="flex-shrink-0 ml-3">
                          {selectedStudents.includes(student.id) ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-5 h-5 text-white" />
                            </motion.div>
                          ) : (
                            <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                            </div>
                        )}
                            </div>
                                </div>
                    </motion.div>
                  ))}
                                </div>
                  
                  {/* Show More Available Students Button */}
                  {availableStudents && availableStudents.length > 6 && (
                    <motion.div 
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        onClick={() => setShowAllStudents(!showAllStudents)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-md flex items-center gap-2 mx-auto"
                      >
                        <FiPlusCircle className="w-4 h-4" />
                        <span>
                          {showAllStudents ? 'Show Less' : `Show All ${availableStudents.length} Available Students`}
                        </span>
                        <motion.div
                          animate={{ rotate: showAllStudents ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  )}
                </>
                )}
                </motion.div>
              )}

              {studentsSubTab === 'track' && (
                <motion.div 
                  key="track"
                  className="card-modern p-4 sm:p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Track Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                        <FiEye className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Track Feedback & Actions</h3>
                        <p className="text-xs text-gray-600 sm:hidden">Monitor your provided feedback and actions</p>
                      </div>
                    </div>
                    
                    {/* Refresh Button */}
                    <motion.button
                      onClick={fetchTrackData}
                      disabled={isLoadingTrackData}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: isLoadingTrackData ? 360 : 0 }}
                        transition={{ duration: 1, repeat: isLoadingTrackData ? Infinity : 0 }}
                      >
                        <FiRefreshCw className="w-4 h-4" />
                      </motion.div>
                      <span>Refresh</span>
                    </motion.button>
                  </div>

                  {/* Toggle between Feedback and Actions */}
                  <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                    <motion.button
                      onClick={() => setTrackViewType('feedback')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                        trackViewType === 'feedback'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                      }`}
                    >
                      <FiMessageSquare className="w-4 h-4 mr-2" />
                      <span>Feedback</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setTrackViewType('actions')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 flex items-center justify-center px-4 py-3 sm:py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                        trackViewType === 'actions'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                          : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
                      }`}
                    >
                      <FiCheckSquare className="w-4 h-4 mr-2" />
                      <span>Actions</span>
                    </motion.button>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                      {/* Student Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Student</label>
                        <select
                          value={trackFilters.student}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, student: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Students</option>
                          {assignedStudents?.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.studentName || student.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={trackFilters.category}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Categories</option>
                          <option value="GENERAL">General</option>
                          <option value="TECHNICAL">Technical</option>
                          <option value="PHYSICAL">Physical</option>
                          <option value="MENTAL">Mental</option>
                          <option value="TACTICAL">Tactical</option>
                        </select>
                      </div>

                      {/* Priority Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={trackFilters.priority}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Priorities</option>
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>

                      {/* Date Range Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Time Period</label>
                        <select
                          value={trackFilters.dateRange}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="today">Today</option>
                          <option value="week">This Week</option>
                          <option value="month">This Month</option>
                          <option value="quarter">This Quarter</option>
                          <option value="all">All Time</option>
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={trackFilters.status}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">All Status</option>
                          {trackViewType === 'feedback' ? (
                            <>
                              <option value="read">Read</option>
                              <option value="unread">Unread</option>
                            </>
                          ) : (
                            <>
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="acknowledged">Acknowledged</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Track Data Display */}
                  {isLoadingTrackData ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading {trackViewType}...</p>
                      </div>
                    </div>
                  ) : trackData.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {trackViewType === 'feedback' ? (
                          <FiMessageSquare className="w-8 h-8 text-gray-400" />
                        ) : (
                          <FiCheckSquare className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        No {trackViewType} found
                      </h3>
                      <p className="text-gray-500">
                        {trackViewType === 'feedback' 
                          ? 'You haven\'t provided any feedback yet.'
                          : 'You haven\'t created any actions yet.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trackData.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {item.title}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.priority === 'HIGH' 
                                    ? 'bg-red-100 text-red-700' 
                                    : item.priority === 'MEDIUM'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {item.priority}
                                </span>
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>For:</strong> {item.studentName}
                              </p>
                              <p className="text-sm text-gray-800 mb-2">
                                {trackViewType === 'feedback' ? item.content : item.description}
                              </p>
                            </div>
                            <div className="flex flex-col sm:items-end space-y-1">
                              <span className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                              {trackViewType === 'feedback' ? (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.isRead 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.isRead ? 'Read' : 'Unread'}
                                </span>
                              ) : (
                                <div className="flex flex-col space-y-1">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    item.isCompleted 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {item.isCompleted ? 'Completed' : 'Pending'}
                                  </span>
                                  {item.isAcknowledged && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                      Acknowledged
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Additional info for actions */}
                          {trackViewType === 'actions' && item.dueDate && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-600">
                                <strong>Due:</strong> {new Date(item.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Smart Notifications Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={() => setSmartNotificationsOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FiBell className="w-5 h-5" />
                <span className="font-medium">Smart Notifications</span>
              </motion.button>
            </div>
            
            <div className="h-[calc(100vh-20rem)] bg-white rounded-xl shadow-lg overflow-hidden">
              {assignedStudents && assignedStudents.length > 0 ? (
              <AthleteProgressTracker 
                athletes={assignedStudents.map((student: any) => ({
                  id: student.id,
                  name: student.studentName || student.name,
                  sport: student.sport || 'Basketball'
                }))}
              />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Students Assigned</h3>
                    <p className="text-gray-500">Assign students from the Students tab to track their progress.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'badges':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting to Badge Centre...</h2>
                <p className="text-gray-600">Taking you to the complete badge management interface.</p>
              </div>
            </div>
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
        className="sticky top-0 z-40 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 backdrop-blur-xl shadow-2xl border-b border-indigo-300/50"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-300/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-purple-300/20 rounded-full blur-xl animate-pulse delay-300"></div>
          <div className="absolute top-2 left-1/2 w-8 h-8 bg-blue-300/20 rounded-full blur-lg animate-pulse delay-700"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.div 
              className="flex items-center space-x-2 md:space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="p-1.5 md:p-2"
              >
                <PeakPlayLogo size="default" variant="gradient" className="h-6 md:h-8 w-auto" />
            </motion.div>
              <div className="hidden md:block">
                <motion.h1 
                  className="text-lg md:text-xl font-bold text-indigo-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  PeakPlay Dashboard
                </motion.h1>
                <motion.p 
                  className="text-xs md:text-sm text-indigo-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Elevate your game to the next level
                </motion.p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Status indicator */}
              <motion.div 
                className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-white/60 rounded-full backdrop-blur-sm border border-indigo-200"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-indigo-800 font-medium">Online</span>
              </motion.div>
              
              {/* Notification bell - Only for coaches */}
              {(session as unknown as Session)?.user?.role === 'COACH' && (
                <motion.button
                  onClick={() => setSmartNotificationsOpen(true)}
                  whileHover={{ scale: 1.1, rotate: 12 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden md:flex p-2.5 rounded-full bg-white/60 hover:bg-white/80 text-indigo-700 hover:text-indigo-900 transition-all duration-300 shadow-lg backdrop-blur-sm border border-indigo-200"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <FiBell className="w-4 h-4" />
                </motion.button>
              )}
              
              {/* Profile section */}
              <motion.button
                onClick={() => setProfileModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 md:space-x-3 p-1.5 md:p-2 rounded-xl hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm md:text-md font-semibold text-indigo-900 truncate max-w-[120px]">{profileData?.name || session?.user.name}</p>
                  <div className="flex items-center justify-end space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <p className="text-xs text-indigo-700 capitalize font-medium">
                      {profileData?.role?.toLowerCase() || (session as unknown as Session)?.user?.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                <motion.div 
                  className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-300/50"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FiUser className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </motion.div>
              </motion.button>
              
              {/* Sign out button */}
              <motion.button
                onClick={handleSignOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 md:p-3 rounded-full bg-red-100/80 hover:bg-red-200/80 text-red-600 hover:text-red-700 transition-all duration-300 shadow-lg backdrop-blur-sm border border-red-200"
                disabled={isSigningOut}
                aria-label="Sign Out"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isSigningOut ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 md:w-5 md:h-5 border-2 border-red-600 border-t-transparent rounded-full" 
                  />
                ) : (
                  <FiLogOut className="w-4 h-4 md:w-5 md:h-5" />
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
                                {(session as unknown as Session)?.user?.role === 'ATHLETE' ? renderAthleteContent() : renderCoachContent()}
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
      
      {/* Smart Notifications Modal */}
      {smartNotificationsOpen && (
        <SmartNotifications onClose={() => setSmartNotificationsOpen(false)} />
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
      
      {/* Modal Components */}
      {selectedStudentModal && activeModal && !studentDetailModalOpen && (
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
        <CreateFeedbackActionModal
          isOpen={feedbackModalOpen}
                      onClose={closeModal}
                      student={{
                        id: selectedStudentModal.id,
                        studentName: selectedStudentModal.studentName || selectedStudentModal.name || 'Student',
                        username: selectedStudentModal.username || selectedStudentModal.email || 'student',
                        age: selectedStudentModal.age || 18
                      }}
          onCreated={handleFeedbackCreated}
        />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Athlete SkillSnap Modal */}
              {(session as unknown as Session)?.user?.role === 'ATHLETE' && isSkillSnapModalOpen && (
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

      {/* Student Detail Modal for Coaches */}
      {studentDetailModalOpen && selectedStudentModal && (
        <StudentDetailModal
          isOpen={studentDetailModalOpen}
          onClose={() => {
            setStudentDetailModalOpen(false);
            setSelectedStudentModal(null);
          }}
          student={selectedStudentModal}
        />
      )}

      {/* Multi-Student Feedback Modal */}
      {multiStudentFeedbackOpen && (
        <MultiStudentFeedbackModal
          isOpen={multiStudentFeedbackOpen}
          onClose={() => setMultiStudentFeedbackOpen(false)}
          students={assignedStudents || []}
          onFeedbackCreated={() => {
            setMultiStudentFeedbackOpen(false);
            // Optionally show success message
            setSuccessMessage('Feedback sent successfully to selected students');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
      )}

      {/* Student Progress Modal */}
      {progressModalOpen && selectedStudentForProgress && (
        <StudentProgressModal
          isOpen={progressModalOpen}
          onClose={() => {
            setProgressModalOpen(false);
            setSelectedStudentForProgress(null);
          }}
          student={{
            id: selectedStudentForProgress.id,
            studentName: selectedStudentForProgress.studentName || selectedStudentForProgress.name,
            username: selectedStudentForProgress.username || selectedStudentForProgress.email,
            sport: selectedStudentForProgress.sport || 'CRICKET',
            age: selectedStudentForProgress.age,
            email: selectedStudentForProgress.email
          }}
        />
      )}
    </div>
  );
}