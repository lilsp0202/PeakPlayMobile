"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid, FiUser, FiAward, FiLogOut, FiCheckSquare, FiMessageSquare, FiMessageCircle, FiTrendingUp, FiUsers, FiPlusCircle, FiActivity, FiTarget, FiX, FiCalendar, FiBarChart, FiChevronRight, FiBell, FiClock, FiZap, FiRefreshCw, FiEye, FiPlus, FiUpload, FiImage, FiVideo, FiCheck, FiPlay, FiTrash, FiUserPlus, FiUserX, FiCheckCircle } from "react-icons/fi";
import { Check } from "lucide-react";
import dynamic from 'next/dynamic';
import PeakPlayLogo from "@/components/PeakPlayLogo";
import Portal from '../../components/Portal';
import AttendanceModal from '@/components/AttendanceModal';
import type { Session } from "next-auth";
import { Team, TeamMember, TeamRole } from "@/types/team";
import CricketMatchList from "@/components/cricket/CricketMatchList";

// Enhanced dynamic imports with better error handling and loading states
const SkillSnap = dynamic(() => import("@/components/SkillSnap").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Component temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><div className="text-gray-500">Loading SkillSnap...</div></div>
});

const BadgeDisplay = dynamic(() => import("@/components/BadgeDisplay").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Badges temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center"><div className="text-gray-500">Loading badges...</div></div>
});

const AthleteTeams = dynamic(() => import("@/components/AthleteTeams").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Teams temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><div className="text-gray-500">Loading Teams...</div></div>
});

const TeamManagement = dynamic(() => import("@/components/TeamManagement").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Team Management temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center"><div className="text-gray-500">Loading Team Management...</div></div>
});

const TeamMemberManagement = dynamic(() => import("@/components/TeamMemberManagement").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Member Management temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center"><div className="text-gray-500">Loading Member Management...</div></div>
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

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });
// // const CoachCard = dynamic(() => import("@/components/CoachCard"), { ssr: false });
const DirectChatPanel = dynamic(() => import("@/components/chat/DirectChatPanel"), { ssr: false });

const CreateFeedbackModal = dynamic(() => import("@/components/CreateFeedbackModal").catch(() => ({ default: () => null })), { 
  ssr: false
});

const CreateActionModal = dynamic(() => import("@/components/CreateActionModal").catch(() => ({ default: () => null })), { 
  ssr: false
});

const OverallStats = dynamic(() => import("@/components/OverallStats").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Stats temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
});

const InlineMediaViewer = dynamic(() => import("@/components/InlineMediaViewer").catch(() => ({ default: () => <div className="p-4 text-center text-gray-500">Media viewer temporarily unavailable</div> })), { 
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center"><div className="text-gray-500">Loading media viewer...</div></div>
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

const AthleteProgressTracker = dynamic(() => import("@/components/EnhancedAthleteProgressTracker"), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-96 flex items-center justify-center"><div className="text-gray-500">Loading Enhanced Progress Tracker...</div></div>
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




const TeamDetailsModal = dynamic(() => import("@/components/TeamDetailsModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const TeamFeedbackModal = dynamic(() => import("@/components/TeamFeedbackModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const TeamActionModal = dynamic(() => import("@/components/TeamActionModal").catch(() => ({ default: () => null })), {
  ssr: false
});

const CreateTeamModal = dynamic(() => import("@/components/CreateTeamModal").catch(() => ({ default: () => null })), {
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
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [directThreadId, setDirectThreadId] = useState<string | null>(null);
  useEffect(() => {
    function onOpen(e: any) { setDirectThreadId(e.detail?.threadId ?? null); setShowDirectChat(true); }
    window.addEventListener('open-direct-chat', onOpen as any);
    return () => window.removeEventListener('open-direct-chat', onOpen as any);
  }, []);
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
  const [isUnassigning, setIsUnassigning] = useState<string | null>(null); // Track which student is being unassigned
  
  // Modal states for student features
  const [selectedStudentModal, setSelectedStudentModal] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'skillsnap' | 'badges' | 'feedback' | 'actions' | 'progress' | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
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
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  // Track tab state variables
  const [trackViewType, setTrackViewType] = useState<'feedback' | 'actions'>('feedback');
  const [trackData, setTrackData] = useState<any[]>([]);
  const [isLoadingTrackData, setIsLoadingTrackData] = useState(false);
  const [trackFilters, setTrackFilters] = useState({
    student: 'all',
    category: 'all',
    priority: 'all',
    dateRange: 'week',
    status: 'all',
    feedbackType: 'all' // 'all', 'individual', 'team'
  });

  // Chat state (local-only)
  const [chatState, setChatState] = useState<{
    open: boolean;
    type: "FEEDBACK" | "ACTION";
    itemId: string;
    title: string;
  } | null>(null);

  // Teams state variables
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [selectedTeamForRoles, setSelectedTeamForRoles] = useState<Team | null>(null);
  const [isTeamRolesModalOpen, setIsTeamRolesModalOpen] = useState(false);
  
  // Team details, feedback, and actions state
  const [isTeamDetailsModalOpen, setIsTeamDetailsModalOpen] = useState(false);
  const [isTeamFeedbackModalOpen, setIsTeamFeedbackModalOpen] = useState(false);
  const [isTeamActionModalOpen, setIsTeamActionModalOpen] = useState(false);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<Team | null>(null);
  const [teamDetailsData, setTeamDetailsData] = useState<{ feedback: any[], actions: any[] }>({ feedback: [], actions: [] });
  const [isLoadingTeamDetails, setIsLoadingTeamDetails] = useState(false);
  const [teamDetailsViewType, setTeamDetailsViewType] = useState<'feedback' | 'actions'>('feedback');
  const [expandedTeamItems, setExpandedTeamItems] = useState<string[]>([]);
  
  // Team member management state
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [isManagingMembers, setIsManagingMembers] = useState(false);
  
  // Team deletion state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedTeamForDeletion, setSelectedTeamForDeletion] = useState<Team | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  // Inline media viewer state for Coach Dashboard
  const [openInlineViewers, setOpenInlineViewers] = useState<Set<string>>(new Set());

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(endpoint, {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Only redirect to onboarding if we're certain the user is authenticated
          // but their profile doesn't exist
          if ((session as unknown as Session)?.user?.id) {
            const onboardingPath = (session as unknown as Session)?.user?.role === "COACH"
              ? "/onboarding/coach"
              : "/onboarding/athlete";
            router.push(onboardingPath);
            return;
          } else {
            // If no session, it's an auth issue, not missing profile
            throw new Error("Please log in to access your profile.");
          }
        } else if (response.status === 503) {
          // FIXED: Don't redirect to onboarding for service errors - show error and retry
          console.error("Service temporarily unavailable - will retry");
          setError("Service temporarily unavailable. Please refresh the page.");
          return; // Don't redirect to onboarding
        } else if (response.status >= 500) {
          console.error("Server error encountered - likely from action creation issues");
          setError("Temporary server issue. Please refresh the page and try again.");
          return; // Don't redirect to onboarding
        } else if (response.status === 401) {
          console.error("Authentication expired");
          setError("Session expired. Please log in again.");
          // Only redirect to signin for auth errors
          setTimeout(() => router.replace("/auth/signin"), 2000);
          return;
        } else {
          console.error("Profile load failed with status:", response.status);
          setError("Failed to load your profile. Please try again.");
          return;
        }
      }

      const data = await response.json();
      
      // Validate that we have the expected data structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid profile data received.");
      }
      
      setProfileData(data);

      // Only fetch additional data if we have a valid coach profile with academy
      if (data.role === "COACH" && data.academy) {
        try {
          // PERFORMANCE: Load coach data in parallel instead of sequentially
          Promise.all([
            fetchAvailableStudents(data.academy),
            fetchAssignedStudents()
          ]).catch(fetchError => {
            console.error("Error fetching additional coach data:", fetchError);
            // Don't fail the entire profile load for secondary data
          });
        } catch (fetchError) {
          console.error("Error fetching additional coach data:", fetchError);
          // Don't fail the entire profile load for secondary data
        }
      }
    } catch (err) {
      console.error("Dashboard - Profile fetch error:", err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError("Request timeout. Please check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred loading your profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchResource = async (setter: Function, endpoint: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(endpoint, {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle different HTTP status codes gracefully
        if (response.status === 401) {
          console.warn(`Unauthorized access to ${endpoint} - skipping`);
          setter([]);
          return;
        } else if (response.status === 403) {
          console.warn(`Forbidden access to ${endpoint} - skipping`);
          setter([]);
          return;
        } else if (response.status === 404) {
          console.warn(`Resource not found: ${endpoint} - setting empty data`);
          setter([]);
          return;
        } else if (response.status === 503) {
          console.warn(`Service temporarily unavailable: ${endpoint}`);
          setter([]);
          return;
        } else if (response.status >= 500) {
          console.error(`Server error on ${endpoint}: ${response.status}`);
          setter([]);
          return;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      // Validate data structure before setting
      if (!data || typeof data !== 'object') {
        console.warn(`Invalid data received from ${endpoint}`);
        setter([]);
        return;
      }
      
      // Handle different response structures
      if (endpoint.includes('/api/students/by-academy')) {
        setter(Array.isArray(data.students) ? data.students : []);
      } else if (endpoint.includes('/api/badges')) {
        const badges = data.badges || data || [];
        setter(Array.isArray(badges) ? badges : []);
      } else if (Array.isArray(data)) {
        setter(data);
      } else {
        setter(data);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Request timeout for ${endpoint}`);
      }
      
      // Set safe fallback data to prevent null errors
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

  // UNASSIGN ATHLETE FEATURE: Handle unassigning a single student from coach
  const handleUnassignStudent = async (studentId: string, studentName: string) => {
    setIsUnassigning(studentId);
    try {
      const response = await fetch('/api/coach/unassign-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unassign student');
      }
      
      const result = await response.json();
      
      // Refresh both lists immediately
      await Promise.all([
        fetchAssignedStudents(),
        profileData?.academy ? fetchAvailableStudents(profileData.academy) : Promise.resolve()
      ]);
      
      // Show success message
      setSuccessMessage(`Successfully unassigned ${studentName}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('Error unassigning student:', error);
      setError(error instanceof Error ? error.message : 'Failed to unassign student');
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsUnassigning(null);
    }
  };

  // Modal handler functions
  const openStudentModal = (student: any, modalType: 'skillsnap' | 'badges' | 'feedback' | 'actions' | 'progress') => {
    // Close all modals first
    closeModal();
    
    setSelectedStudentModal(student);
    setActiveModal(modalType);
    
    if (modalType === 'feedback') {
      setFeedbackModalOpen(true);
      setActionModalOpen(false); // Ensure action modal is closed
    } else if (modalType === 'actions') {
      setActionModalOpen(true);
      setFeedbackModalOpen(false); // Ensure feedback modal is closed
    } else if (modalType === 'skillsnap') {
      // For SkillSnap, open the inline modal directly
      // Don't open StudentDetailModal for SkillSnap
      setFeedbackModalOpen(false);
      setActionModalOpen(false);
    } else if (modalType === 'badges') {
      setStudentDetailView(modalType);
      setStudentDetailModalOpen(true);
      setFeedbackModalOpen(false);
      setActionModalOpen(false);
    } else if (modalType === 'progress') {
      setSelectedStudentForProgress(student);
      setProgressModalOpen(true);
      setFeedbackModalOpen(false);
      setActionModalOpen(false);
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
    setActionModalOpen(false);
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

  // Track tab helper functions - OPTIMIZED bulk API call
  const fetchTrackData = async () => {
    if (!assignedStudents || assignedStudents.length === 0) {
      setTrackData([]);
      return;
    }

    setIsLoadingTrackData(true);
    try {
      console.log('📊 Fetching track data with optimized bulk API...');
      
      // Build query parameters for the bulk API
      const params = new URLSearchParams({
        type: trackViewType,
        student: trackFilters.student,
        category: trackFilters.category,
        priority: trackFilters.priority,
        status: trackFilters.status,
        dateRange: trackFilters.dateRange,
        feedbackType: trackFilters.feedbackType
      });

      const response = await fetch(`/api/track?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        
        // Check if the API returned an error message (graceful error handling)
        if (result.message && result.message.includes('error')) {
          console.error('❌ Track API returned error:', result.message);
          setTrackData([]);
          return;
        }
        
        console.log(`✅ Track data loaded in ${result.totalTime}ms - ${result.data?.length || 0} items`);
        setTrackData(result.data || []);
      } else {
        throw new Error(`Track API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching track data:', error);
      setTrackData([]);
    } finally {
      setIsLoadingTrackData(false);
    }
  };

  // Helper functions for track data display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const viewMedia = (mediaUrl: string, fileName?: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow && mediaUrl) {
      newWindow.document.write(`
        <html>
          <head><title>${fileName || 'Media Viewer'}</title></head>
          <body style="margin:0; padding:20px; background:#f5f5f5; display:flex; justify-content:center; align-items:center; min-height:100vh;">
            <div style="text-align:center; max-width:90vw;">
              <h2 style="margin-bottom:20px; color:#333;">${fileName || 'Media'}</h2>
              ${mediaUrl.includes('image') || mediaUrl.startsWith('data:image') 
                ? `<img src="${mediaUrl}" style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);" />` 
                : `<video src="${mediaUrl}" controls style="max-width:100%; max-height:80vh; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">Your browser does not support video.</video>`
              }
            </div>
          </body>
        </html>
      `);
    }
  };

  // Media viewer for lazy-loaded media (proof/demo)
  const viewProofMedia = async (actionId: string, mediaType: 'demo' | 'proof', fileName?: string) => {
    try {
      console.log(`🎥 Fetching ${mediaType} media URL for action:`, actionId);
      
      const response = await fetch(`/api/actions/${actionId}/media`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('❌ Please log in again to view media.');
          return;
        }
        if (response.status === 403) {
          alert('❌ You do not have permission to view this media.');
          return;
        }
        if (response.status === 404) {
          alert(`❌ ${mediaType === 'demo' ? 'Demo video not available.' : 'Proof media not uploaded yet.'}`);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const mediaData = await response.json();
      
      // Check if the API returned an error message (graceful error handling)
      if (mediaData.message && mediaData.message.includes('error')) {
        console.error('❌ Media API returned error:', mediaData.message);
        alert(`❌ ${mediaData.message}`);
        return;
      }
      
      const mediaInfo = mediaType === 'demo' ? mediaData.demoMedia : mediaData.proofMedia;
      
      if (!mediaInfo || !mediaInfo.url) {
        alert(`❌ ${mediaType === 'demo' ? 'Demo video not available from coach.' : 'Please upload your proof media.'}`);
        return;
      }

      // Open media in new window
      viewMedia(mediaInfo.url, mediaInfo.fileName || fileName);
      
    } catch (error) {
      console.error(`❌ Error viewing ${mediaType} media:`, error);
      alert(`Failed to load ${mediaType} media. Please try again.`);
    }
  };

  // Inline media viewer handlers for Coach Dashboard - optimized for performance
  const openInlineViewer = (actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    setOpenInlineViewers(prev => new Set(prev).add(viewerId));
  };

  const closeInlineViewer = (actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    setOpenInlineViewers(prev => {
      const newSet = new Set(prev);
      newSet.delete(viewerId);
      return newSet;
    });
  };

  const isInlineViewerOpen = (actionId: string, mediaType: 'demo' | 'proof') => {
    const viewerId = `${actionId}-${mediaType}`;
    return openInlineViewers.has(viewerId);
  };

  // Fetch track data when view type or filters change
  useEffect(() => {
    if (studentsSubTab === 'track' && assignedStudents.length > 0) {
      fetchTrackData();
    }
  }, [trackViewType, trackFilters, assignedStudents, studentsSubTab]);

  // Team helper functions - PERFORMANCE OPTIMIZED
  const fetchTeams = async (includeDetails = false, skipCache = false) => {
    setIsLoadingTeams(true);
    try {
      console.log('🏈 Fetching teams with stats and member data...');
      // Always include stats for accurate counts - they're lightweight
      const url = `/api/teams?includeStats=true${includeDetails ? '&includeMembers=true' : ''}${skipCache ? '&skipCache=true' : ''}`;
      console.log('🔗 Teams API URL:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Teams API response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Raw teams data from API:', data);
        
        if (data.teams && Array.isArray(data.teams)) {
          setTeams(data.teams);
          console.log(`✅ Teams loaded: ${data.teams.length} teams with data:`, data.teams.map(t => ({ 
            id: t.id, 
            name: t.name, 
            memberCount: t._count?.members,
            feedbackCount: t._count?.feedback,
            actionsCount: t._count?.actions
          })));
        } else {
          console.error('❌ Invalid teams data structure:', data);
          setTeams([]);
        }
      } else {
        console.error('❌ Failed to fetch teams:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        setTeams([]);
      }
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // PERFORMANCE: Separate function to load detailed team data when needed
  const fetchTeamDetails = async (teamId: string) => {
    try {
      console.log('🔄 Fetching detailed data for team:', teamId);
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Team details loaded:', data.team);
        
        setTeamDetailsData({
          feedback: data.team.feedback || [],
          actions: data.team.actions || []
        });
        
        return data.team;
      } else {
        console.error('❌ Failed to fetch team details:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching team details:', error);
      throw error;
    }
  };

  const handleCreateTeam = async (teamData: any) => {
    console.log('🏈 Creating team with data:', teamData);
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      // Handle both 200 and 201 as success (201 is more semantically correct for creation)
      if (!response.ok && response.status !== 201) {
        // Get the error message from the response
        let errorMessage = 'Failed to create team';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If parsing JSON fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      console.log('✅ Team created successfully:', result);
      
      // Show success message (you can add a toast notification here)
      alert(`Team "${result.name}" created successfully with ${result._count?.members || 0} members!`);
      
      // Refresh teams list - no need to include heavy member data in list view
      await fetchTeams(false);
      
      return result;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    }
  };

  const handleTeamSelect = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTeam(data.team);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };

  const handleTeamMemberToggle = (studentId: string) => {
    // setTeamFormData(prev => ({
    //   ...prev,
    //   memberIds: prev.memberIds.includes(studentId)
    //     ? prev.memberIds.filter(id => id !== studentId)
    //     : [...prev.memberIds, studentId]
    // }));
  };

  // Enhanced team details functionality with better error handling
  const handleViewTeamDetails = async (team: any) => {
    console.log('🏈 Loading team details for:', team.name, team.id);
    
    // Ensure we have a valid team
    if (!team || !team.id) {
      console.error('❌ Invalid team data:', team);
      alert('Unable to load team details. Invalid team data.');
      return;
    }
    
    setSelectedTeamForDetails(team);
    setIsLoadingTeamDetails(true);
    setIsTeamDetailsModalOpen(true);
    
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Team details loaded:', data.team);
        
        setTeamDetailsData({
          feedback: data.team.feedback || [],
          actions: data.team.actions || []
        });
      } else {
        console.error('❌ Failed to fetch team details:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching team details:', error);
      
      // Show error to user and provide fallback
      setTeamDetailsData({
        feedback: [],
        actions: []
      });
      
      // Simple error message like the original version
      alert(`Failed to load team details. Please try again.`);
    } finally {
      setIsLoadingTeamDetails(false);
    }
  };

  const toggleTeamItemExpanded = (itemId: string) => {
    setExpandedTeamItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isTeamItemExpanded = (itemId: string) => {
    return expandedTeamItems.includes(itemId);
  };

  // Team feedback functionality
  const handleTeamFeedback = (team: any) => {
    setSelectedTeamForDetails(team);
    setIsTeamFeedbackModalOpen(true);
  };

  const handleCreateTeamFeedback = async (feedbackData: any) => {
    try {
      console.log('📝 Creating team feedback for team:', selectedTeamForDetails?.id);
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...feedbackData,
          teamId: selectedTeamForDetails?.id
          // Note: API will create feedback for all team members automatically
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Team feedback created:', result);
        
        setIsTeamFeedbackModalOpen(false);
        
        // Refresh all team-related data
        await Promise.all([
          fetchTeams(),
          // Force refresh of team details if modal is open
          selectedTeamForDetails && fetchTeamDetails(selectedTeamForDetails.id)
        ]);
        
        // Show success message
        if (result.count) {
          console.log(`🎉 Created feedback for ${result.count} team members`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team feedback');
      }
    } catch (error) {
      console.error('Error creating team feedback:', error);
      alert(`Failed to create team feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Team actions functionality
  const handleTeamActions = (team: any) => {
    setSelectedTeamForDetails(team);
    setIsTeamActionModalOpen(true);
  };

  const handleCreateTeamAction = async (actionData: any) => {
    try {
      console.log('⚡ Creating team action for team:', selectedTeamForDetails?.id);
      
      const response = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...actionData,
          teamId: selectedTeamForDetails?.id
          // Note: API will create actions for all team members automatically
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Team action created:', result);
        
        setIsTeamActionModalOpen(false);
        
        // Refresh all team-related data
        await Promise.all([
          fetchTeams(),
          // Force refresh of team details if modal is open
          selectedTeamForDetails && fetchTeamDetails(selectedTeamForDetails.id)
        ]);
        
        // Show success message
        if (result.count) {
          console.log(`🎉 Created action for ${result.count} team members`);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create team action');
      }
    } catch (error) {
      console.error('Error creating team action:', error);
      alert(`Failed to create team action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Team roles functionality
  const handleTeamRoles = async (team: Team) => {
    console.log('🎯 Loading team roles for:', team.name, team.id);
    
    // Validate team data first
    if (!team || !team.id) {
      console.error('❌ Invalid team data:', team);
      alert('Invalid team data. Please refresh the page and try again.');
      return;
    }
    
    // First, fetch the complete team data including members
    try {
      console.log('🔍 Fetching team details from API:', `/api/teams/${team.id}`);
      
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Team data with members loaded:', data);
        
        if (data.team) {
          setSelectedTeamForRoles(data.team);
          setIsTeamRolesModalOpen(true);
        } else {
          console.error('❌ No team data in response:', data);
          alert('Team data is incomplete. Please try refreshing the teams list.');
        }
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to load team data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('❌ Could not parse error response:', e);
        }
        
        console.error('❌ Failed to fetch team data:', response.status, response.statusText, errorMessage);
        alert(`Failed to load team data: ${errorMessage}. Please try again.`);
      }
    } catch (error) {
      console.error('❌ Network error fetching team data:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Enhanced team member management functionality
  const handleTeamMembers = async (team: Team) => {
    console.log('👥 Opening team member management for:', team.name, team.id);
    
    // Ensure we have a valid team
    if (!team || !team.id) {
      console.error('❌ Invalid team data:', team);
      alert('Unable to manage team members. Invalid team data.');
      return;
    }
    
    // Fetch the complete team data including members
    try {
      console.log('🔍 Fetching team details from API:', `/api/teams/${team.id}`);
      
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Team data with members loaded:', data);
        
        if (data.team) {
          setSelectedTeamForMembers(data.team);
          setIsTeamMemberModalOpen(true);
        } else {
          console.error('❌ No team data in response:', data);
          alert('Team data is incomplete. Please try refreshing the teams list.');
        }
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to load team data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('❌ Could not parse error response:', e);
        }
        
        console.error('❌ Failed to fetch team data:', response.status, response.statusText, errorMessage);
        alert(`Failed to load team data: ${errorMessage}. Please try again.`);
      }
    } catch (error) {
      console.error('❌ Network error fetching team data:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Team deletion handlers
  const handleDeleteTeam = (team: Team) => {
    setSelectedTeamForDeletion(team);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!selectedTeamForDeletion) return;

    setIsDeletingTeam(true);
    try {
      const response = await fetch(`/api/teams/${selectedTeamForDeletion.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(`Team "${selectedTeamForDeletion.name}" deleted successfully`);
        
        // Remove the deleted team from the teams list
        setTeams(prevTeams => prevTeams.filter(team => team.id !== selectedTeamForDeletion.id));
        
        // Close the confirmation dialog
        setIsDeleteConfirmOpen(false);
        setSelectedTeamForDeletion(null);
        
        console.log(`✅ Team deleted: ${data.deletedTeam.name} (${data.deletedTeam.membersCount} members affected)`);
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
              setError('Failed to delete team. Please try again.');
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const cancelDeleteTeam = () => {
    setIsDeleteConfirmOpen(false);
    setSelectedTeamForDeletion(null);
  };

  const athleteTabs = [
    { id: 'skillsnap', label: 'SkillSnap', icon: <FiActivity className="w-5 h-5" /> },
    { id: 'scorecard', label: 'Scorecard', icon: <FiTarget className="w-5 h-5" /> },
    { id: 'matches', label: 'Matches', icon: <FiTarget className="w-5 h-5" /> },
    { id: 'badges', label: 'Badges', icon: <FiAward className="w-5 h-5" /> },
    { id: 'feedback', label: 'Feedback', icon: <FiMessageSquare className="w-5 h-5" /> },
    { id: 'teams', label: 'Teams', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'todo', label: 'To-Do', icon: <FiCheckSquare className="w-5 h-5" /> },
  ];

  const coachTabs = [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-5 h-5" /> },
    { id: 'students', label: 'Athletes', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'teams', label: 'Teams', icon: <FiUsers className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <FiTrendingUp className="w-5 h-5" /> },
    { id: 'badges', label: 'Badges', icon: <FiAward className="w-5 h-5" /> },
    { id: 'todo', label: 'To-Do', icon: <FiCheckSquare className="w-5 h-5" /> },
  ];

  const tabs = useMemo(() => (session as unknown as Session)?.user?.role === 'COACH' ? coachTabs : athleteTabs, [(session as unknown as Session)?.user?.role]);
  
  useEffect(() => {
    // Set default tab - coaches start on 'overview' tab, athletes on first tab
    const defaultTab = (session as unknown as Session)?.user?.role === 'COACH' ? 'overview' : tabs[0]?.id;
    const tabFromQuery = searchParams?.get('tab');
    if (tabFromQuery && tabs.some(t => t.id === tabFromQuery)) {
      setActiveTab(tabFromQuery);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabs, (session as unknown as Session)?.user?.role]);

  // Fetch teams when teams tab is active - OPTIMIZED for performance
  useEffect(() => {
    if (activeTab === 'teams' && (session as unknown as Session)?.user?.role === 'COACH') {
      // PERFORMANCE: Load teams without heavy details initially
      fetchTeams(false); // Lightweight load first
    }
  }, [activeTab, (session as unknown as Session)?.user?.role]);


  // Show loading while session is loading or profile is being fetched
  if (status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  // If no session user is found, return null (useEffect will handle redirect)
  if (!session?.user) {
    return <LoadingSpinner />;
  }

  // Check if profile is incomplete - different criteria for coaches vs athletes
  // FIXED: Only check for incomplete profile if we have successfully fetched profile data
  // Don't show onboarding screen for API errors (when profileData is null due to errors)
  const isProfileIncomplete = profileData && (
    (session as unknown as Session)?.user?.role === 'COACH' 
      ? !profileData?.name || !profileData?.academy
      : !profileData?.sport || !profileData?.academy
  );

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

            case 'scorecard':
              return (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="card-modern glass">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FiTarget className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Scorecard</h2>
                          <p className="text-sm text-gray-600 mt-1">Create, resume, or review scored matches</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push('/scorecard/new')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:scale-95"
                        >Start New Match</button>
                        <button
                          onClick={() => setActiveTab('matches')}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 active:scale-95"
                        >Open Match Centre</button>
                      </div>
                    </div>
                  </div>

                  {/* Removed embedded Cricket matches list; use Match Centre instead */}
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

            case 'teams':
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
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2"
                      >
                        <FiUsers className="text-purple-600" />
                      </motion.div>
                      My Teams
                    </h2>
                    <AthleteTeams studentId={profileData?.id || ''} />
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
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                <motion.button
                  onClick={() => setStudentsSubTab('assigned')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-2 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 ${
                    studentsSubTab === 'assigned'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  <FiUsers className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
                  <span className="text-center leading-tight">Your<br className="sm:hidden" />Athletes</span>
                  {assignedStudents && assignedStudents.length > 0 && (
                    <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
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
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-2 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 ${
                    studentsSubTab === 'available'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
                  }`}
                >
                  <FiPlusCircle className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
                  <span className="text-center leading-tight">Available<br className="sm:hidden" />Athletes</span>
                  {availableStudents && availableStudents.length > 0 && (
                    <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
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
                  className={`flex-1 flex flex-col sm:flex-row items-center justify-center px-2 sm:px-4 py-2 sm:py-2 rounded-md font-medium text-xs sm:text-sm transition-all duration-200 ${
                    studentsSubTab === 'track'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                  }`}
                >
                  <FiEye className="w-4 h-4 sm:mr-2 mb-1 sm:mb-0" />
                  <span className="text-center leading-tight">Track</span>
                  {trackData && trackData.length > 0 && (
                    <span className={`ml-0 sm:ml-2 mt-1 sm:mt-0 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
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
              {/* Modern Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiUsers className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{assignedStudents?.length || 0}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Your Athletes</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {assignedStudents?.length ? `Managing ${assignedStudents.length} athletes` : 'No students assigned yet'}
                    </p>
                  </div>
                </div>
                
                {/* Modern Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {assignedStudents?.length > 0 && (
                    <>
                      <motion.button 
                        onClick={() => setIsAttendanceModalOpen(true)}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-emerald-700 min-h-[48px]"
                      >
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Attendance</span>
                      </motion.button>
                      <motion.button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:from-purple-600 hover:to-purple-700 min-h-[48px]"
                      >
                        <FiUsers className="w-4 h-4" />
                        <span>Create Team</span>
                      </motion.button>
                    </>
                  )}
                  <motion.button 
                    onClick={() => {
                      console.log('🔄 Manual refresh triggered');
                      fetchAssignedStudents();
                    }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 min-h-[48px]"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(showAllStudents ? assignedStudents : assignedStudents?.slice(0, 6))?.map((student: any, index: number) => (
                      <motion.div 
                        key={student.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="bg-white rounded-2xl p-6 hover:bg-gray-50/50 transition-all duration-300 border border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200 group"
                      >
                        {/* Modern Student Info */}
                        <div className="flex items-center space-x-4 mb-5">
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              <FiUser className="w-8 h-8 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{student.studentName || student.name}</h3>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {student.sport || 'No sport'}
                                  </span>
                                  {student.age && (
                                    <span className="text-sm text-gray-500 font-medium">{student.age}y</span>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                onClick={() => toggleStudentExpanded(student.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                              >
                                <motion.div
                                  animate={{ rotate: isStudentExpanded(student.id) ? 180 : 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                  <FiChevronRight className="w-5 h-5" />
                                </motion.div>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      
                        {/* Modern Student Details - Expandable */}
                        <AnimatePresence>
                          {isStudentExpanded(student.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, scale: 0.95 }}
                              animate={{ opacity: 1, height: "auto", scale: 1 }}
                              exit={{ opacity: 0, height: 0, scale: 0.95 }}
                              transition={{ duration: 0.4, ease: "easeInOut" }}
                              className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</span>
                                  <span className="text-sm font-bold text-gray-900">{student.age || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                                  <span className="text-sm font-bold text-gray-900 truncate">{student.email || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Height</span>
                                  <span className="text-sm font-bold text-gray-900">{student.height ? `${student.height}cm` : 'N/A'}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weight</span>
                                  <span className="text-sm font-bold text-gray-900">{student.weight ? `${student.weight}kg` : 'N/A'}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Mobile-Optimized Action Buttons */}
                        <div className="space-y-3 sm:space-y-4">
                          {/* Responsive Button Grid - Updated to 2x2 for unassign button */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Direct Chat Button */}
                            <motion.button
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/chat/direct/init', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify({ athleteId: student.id }),
                                  });
                                  if (!res.ok) return;
                                  const data = await res.json();
                                  // Fire a custom event to open page-level DirectChatPanel
                                  window.dispatchEvent(new CustomEvent('open-direct-chat', { detail: { threadId: data.thread.id } }));
                                } catch {}
                              }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[64px] flex items-center justify-center active:scale-95"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="relative flex items-center space-x-2 sm:space-x-2">
                                <FiMessageSquare className="w-6 h-6 sm:w-5 sm:h-5" />
                                <span className="font-bold text-base sm:text-sm">Chat</span>
                              </div>
                            </motion.button>
                            {/* Skills Button */}
                            <motion.button
                              onClick={() => openStudentModal(student, 'skillsnap')}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[64px] flex items-center justify-center active:scale-95"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="relative flex items-center space-x-2 sm:space-x-2">
                                <FiActivity className="w-6 h-6 sm:w-5 sm:h-5" />
                                <span className="font-bold text-base sm:text-sm">Skills</span>
                              </div>
                            </motion.button>
                            
                            {/* Feedback Button */}
                            <motion.button
                              onClick={() => openStudentModal(student, 'feedback')}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[64px] flex items-center justify-center active:scale-95"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="relative flex items-center space-x-2 sm:space-x-2">
                                <FiMessageSquare className="w-6 h-6 sm:w-5 sm:h-5" />
                                <span className="font-bold text-base sm:text-sm">Feedback</span>
                              </div>
                            </motion.button>
                            
                            {/* Actions Button */}
                            <motion.button
                              onClick={() => openStudentModal(student, 'actions')}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[64px] flex items-center justify-center active:scale-95"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="relative flex items-center space-x-2 sm:space-x-2">
                                <FiCheckSquare className="w-6 h-6 sm:w-5 sm:h-5" />
                                <span className="font-bold text-base sm:text-sm">Actions</span>
                              </div>
                            </motion.button>
                            
                            {/* UNASSIGN ATHLETE FEATURE: Unassign Button */}
                            <motion.button
                              onClick={() => handleUnassignStudent(student.id, student.studentName || student.name)}
                              disabled={isUnassigning === student.id}
                              whileHover={{ scale: isUnassigning === student.id ? 1 : 1.02, y: isUnassigning === student.id ? 0 : -2 }}
                              whileTap={{ scale: isUnassigning === student.id ? 1 : 0.98 }}
                              className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white rounded-2xl sm:rounded-xl p-5 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[64px] flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                              <div className="relative flex items-center space-x-2 sm:space-x-2">
                                {isUnassigning === student.id ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                                  />
                                ) : (
                                  <FiUserX className="w-6 h-6 sm:w-5 sm:h-5" />
                                )}
                                <span className="font-bold text-base sm:text-sm">
                                  {isUnassigning === student.id ? 'Unassigning...' : 'Unassign'}
                                </span>
                              </div>
                            </motion.button>
                          </div>
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
              {/* Modern Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FiPlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{availableStudents?.length || 0}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Available Athletes</h3>
                    <p className="text-sm text-gray-600 font-medium">
                                              {availableStudents?.length ? `${availableStudents.length} athletes ready to assign` : 'No available athletes'}
                    </p>
                  </div>
                </div>

                {selectedStudents.length > 0 && (
                  <motion.button
                    onClick={handleAssignStudents}
                    disabled={isAssigning}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative flex items-center gap-2">
                      {isAssigning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Assigning...</span>
                        </>
                      ) : (
                        <>
                          <FiUsers className="w-5 h-5" />
                          <span>Assign Selected ({selectedStudents.length})</span>
                        </>
                      )}
                    </div>
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
                  <h3 className="text-lg sm:text-base font-medium text-gray-900 mb-2">No available athletes</h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {(showAllStudents ? availableStudents : availableStudents?.slice(0, 6))?.map((student: any, index: number) => (
                      <motion.div 
                        key={student.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        onClick={() => handleStudentSelection(student.id)}
                        className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 border-2 active:scale-95 touch-manipulation shadow-lg hover:shadow-xl group ${
                          selectedStudents.includes(student.id) 
                            ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 transform scale-105' 
                            : 'bg-white border-gray-100 hover:bg-gray-50/50 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                selectedStudents.includes(student.id) 
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-indigo-500'
                              }`}>
                                <FiUser className="w-7 h-7 text-white" />
                              </div>
                              {selectedStudents.includes(student.id) && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-600 rounded-full border-2 border-white flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{student.studentName || student.name}</h3>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  selectedStudents.includes(student.id) 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {student.sport || 'No sport'}
                                </span>
                                {student.age && (
                                  <span className="text-sm text-gray-500 font-medium">{student.age}y</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            {selectedStudents.includes(student.id) ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            ) : (
                              <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center group-hover:border-blue-400 transition-colors duration-300">
                                <div className="w-3 h-3 border border-gray-400 rounded-full group-hover:border-blue-400 transition-colors duration-300"></div>
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
                          {showAllStudents ? 'Show Less' : `Show All ${availableStudents.length} Available Athletes`}
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

                  {/* Filters - Show for feedback/actions */}
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

                      {/* Feedback/Action Type Filter */}
                      <div className="flex-1 min-w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={trackFilters.feedbackType}
                          onChange={(e) => setTrackFilters(prev => ({ ...prev, feedbackType: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="all">
                            {trackViewType === 'feedback' ? 'All Feedbacks' : 'All Actions'}
                          </option>
                          <option value="individual">
                            👤 Individual {trackViewType === 'feedback' ? 'Feedback' : 'Actions'}
                          </option>
                          <option value="team">
                            👥 Team {trackViewType === 'feedback' ? 'Feedback' : 'Actions'}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Track Data Display with Media Previews */}
                  <>
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
                      <div className="space-y-6">
                        {trackData.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                          >
                            {/* Header */}
                            <div className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                    <div className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200">
                                      <FiUser className="w-4 h-4" />
                                      <span>{item.student?.studentName || item.studentName || 'Unknown Student'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                                      {item.priority}
                                    </span>
                                    <span className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border">
                                      {item.category}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center gap-1">
                                      <FiCalendar className="w-4 h-4" />
                                      <span>Created: {formatDate(item.createdAt)}</span>
                                    </div>
                                    {trackViewType === 'actions' && item.dueDate && (
                                      <div className="flex items-center gap-1">
                                        <FiClock className="w-4 h-4" />
                                        <span><strong>Due:</strong> {formatDate(item.dueDate)}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <p className="text-gray-800 leading-relaxed">
                                    {trackViewType === 'feedback' ? item.content : item.description}
                                  </p>
                                </div>
                                
                                {/* Status Badges */}
                                <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0 sm:ml-4">
                                  {trackViewType === 'feedback' ? (
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                      item.isRead 
                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                        : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                      {item.isRead ? '✅ Read' : '📖 Unread'}
                                    </span>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                        item.isCompleted 
                                          ? 'bg-green-100 text-green-700 border border-green-200' 
                                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                      }`}>
                                        {item.isCompleted ? '✅ Completed' : '⏳ Pending'}
                                      </span>
                                      {item.isAcknowledged && (
                                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                          👀 Acknowledged
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Demo Media (Coach provided) - INLINE VIEWER */}
                              {trackViewType === 'actions' && item.demoMediaType && item.demoFileName && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    {item.demoMediaType === 'image' ? <FiImage className="w-5 h-5 text-blue-600" /> : <FiVideo className="w-5 h-5 text-blue-600" />}
                                    <h4 className="text-sm font-semibold text-blue-900">Coach Demo Media</h4>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                      onClick={() => openInlineViewer(item.id, 'demo')}
                                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                                    >
                                      <FiPlay className="w-3 h-3" />
                                      {isInlineViewerOpen(item.id, 'demo') ? 'Hide Demo' : 'View Demo'}
                                      {item.demoFileSize && (
                                        <span className="text-xs opacity-75">
                                          ({Math.round(item.demoFileSize / 1024)}KB)
                                        </span>
                                      )}
                                    </button>
                                    <div className="text-xs text-blue-700 flex items-center">
                                      <span><strong>Type:</strong> {item.demoMediaType} | <strong>Uploaded:</strong> {item.demoUploadedAt ? formatDate(item.demoUploadedAt) : 'N/A'}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Inline Demo Media Viewer */}
                                  {item.demoMediaType && item.demoFileName && (
                                    <InlineMediaViewer
                                      actionId={item.id}
                                      mediaType="demo"
                                      fileName={item.demoFileName}
                                      fileSize={item.demoFileSize}
                                      mediaFileType={item.demoMediaType}
                                      isOpen={isInlineViewerOpen(item.id, 'demo')}
                                      onClose={() => closeInlineViewer(item.id, 'demo')}
                                      className="mt-4"
                                    />
                                  )}
                                </div>
                              )}

                              {/* Student Proof (Athlete uploaded) - INLINE VIEWER */}
                              {trackViewType === 'actions' && item.proofMediaType && item.proofFileName && (
                                <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <FiUpload className="w-5 h-5 text-green-600" />
                                    <h4 className="text-sm font-semibold text-green-900">Student Proof Submission</h4>
                                    {item.isCompleted && <FiCheck className="w-4 h-4 text-green-600" />}
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                      onClick={() => openInlineViewer(item.id, 'proof')}
                                      className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                                    >
                                      <FiEye className="w-3 h-3" />
                                      {isInlineViewerOpen(item.id, 'proof') ? 'Hide Proof' : 'View Proof'}
                                      {item.proofFileSize && (
                                        <span className="text-xs opacity-75">
                                          ({Math.round(item.proofFileSize / 1024)}KB)
                                        </span>
                                      )}
                                    </button>
                                    <div className="text-xs text-green-700 flex items-center">
                                      <span><strong>Type:</strong> {item.proofMediaType} | <strong>Submitted:</strong> {item.proofUploadedAt ? formatDate(item.proofUploadedAt) : 'N/A'}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Inline Proof Media Viewer */}
                                  {item.proofMediaType && item.proofFileName && (
                                    <InlineMediaViewer
                                      actionId={item.id}
                                      mediaType="proof"
                                      fileName={item.proofFileName}
                                      fileSize={item.proofFileSize}
                                      mediaFileType={item.proofMediaType}
                                      isOpen={isInlineViewerOpen(item.id, 'proof')}
                                      onClose={() => closeInlineViewer(item.id, 'proof')}
                                      className="mt-4"
                                    />
                                  )}
                                </div>
                              )}

                              {/* Action Notes */}
                              {trackViewType === 'actions' && item.notes && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Student Notes:</h4>
                                  <p className="text-sm text-gray-700">{item.notes}</p>
                                </div>
                              )}

                              {/* Team Info */}
                              {item.team && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
                                  <FiUsers className="w-4 h-4" />
                                  <span><strong>Team:</strong> {item.team.name}</span>
                                </div>
                              )}

                              {/* Chat Button */}
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-end">
                                  <button
                                    onClick={() =>
                                      setChatState({
                                        open: true,
                                        type: trackViewType === 'feedback' ? 'FEEDBACK' : 'ACTION',
                                        itemId: item.id,
                                        title: item.title,
                                      })
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md active:scale-[0.98] transition-all duration-200"
                                  >
                                    <FiMessageCircle className="w-4 h-4" />
                                    <span>Chat</span>
                                  </button>

                                  {(session?.user as any)?.role === 'COACH' && (
                                    <button
                                      onClick={async () => {
                                        const confirmed = window.confirm(`Delete this ${trackViewType === 'feedback' ? 'feedback' : 'action'}? You can restore it later.`);
                                        if (!confirmed) return;
                                        try {
                                          // Optimistic remove from track list
                                          setTrackData(prev => prev.filter((d: any) => d.id !== item.id));
                                          const url = trackViewType === 'feedback' ? `/api/feedback/${item.id}/delete` : `/api/actions/${item.id}/delete`;
                                          await fetch(url, { method: 'PATCH' });
                                        } catch (e) {
                                          console.error('Delete failed', e);
                                        }
                                      }}
                                      className="ml-2 inline-flex items-center gap-2 px-3 py-2 text-sm rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                                      title="Delete"
                                    >
                                      <FiTrash className="w-4 h-4" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div 
            className="min-h-[calc(100vh-12rem)] lg:min-h-[calc(100vh-8rem)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {assignedStudents && assignedStudents.length > 0 ? (
              <div className="w-full">
                <AthleteProgressTracker 
                  athletes={assignedStudents.map((student: any) => ({
                    id: student.id,
                    name: student.studentName || student.name,
                    sport: student.sport || 'Basketball'
                  }))}
                />
              </div>
            ) : (
              <motion.div 
                className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-center p-8 max-w-md mx-auto">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="mb-6"
                  >
                    <FiUsers className="w-20 h-20 text-gray-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">No Athletes Assigned</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Start tracking athlete progress by assigning athletes from the Athletes tab.
                  </p>
                  <motion.button
                    onClick={() => setActiveTab('students')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Go to Athletes Tab
                  </motion.button>
                </div>
              </motion.div>
            )}
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

      case 'teams':
        
        return (
          <motion.div 
            className="space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Teams Header with Sub-Navigation */}
            <div className="card-modern glass bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-100">
              <div className="p-4 md:p-6">
                {/* Header - Mobile Optimized Layout */}
                <div className="flex flex-col gap-4 mb-4 md:mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-lg"
                      >
                        <FiUsers className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </motion.div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          Teams & Roles
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-1 hidden md:block">
                          Create and manage athlete teams for group feedback and actions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {/* Refresh Button - Mobile Optimized */}
                    <motion.button 
                      onClick={() => fetchTeams(true, true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoadingTeams}
                      className={`flex items-center justify-center gap-2 px-4 py-3 sm:px-3 sm:py-2 rounded-xl sm:rounded-lg transition-all duration-200 shadow-lg font-medium text-sm sm:text-base min-h-[48px] sm:min-h-[40px] w-full sm:w-auto ${
                        isLoadingTeams 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 hover:border-purple-300 active:bg-purple-100'
                      }`}
                      title="Refresh teams data (clears cache)"
                    >
                      <motion.div
                        animate={isLoadingTeams ? { rotate: 360 } : { rotate: 0 }}
                        transition={isLoadingTeams ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
                      >
                        <FiRefreshCw className="w-5 h-5 sm:w-4 sm:h-4" />
                      </motion.div>
                                              <span className="text-sm sm:text-base font-medium">
                        {isLoadingTeams ? 'Refreshing...' : 'Force Refresh'}
                      </span>
                    </motion.button>

                    {/* Create Team Button - Mobile Optimized */}
                    {assignedStudents?.length > 0 && (
                      <motion.button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl sm:rounded-lg hover:from-purple-700 hover:to-blue-700 active:from-purple-800 active:to-blue-800 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base min-h-[48px] sm:min-h-[40px] w-full sm:w-auto"
                      >
                        <FiPlus className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span className="font-medium">Create Team</span>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white/60 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-purple-600">{teams?.length || 0}</div>
                    <div className="text-xs md:text-sm text-gray-600">Total Teams</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-blue-600">
                      {teams?.reduce((total, team) => total + ((team as any)._count?.members || 0), 0) || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Team Members</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 md:p-4 text-center">
                    <div className="text-xl md:text-2xl font-bold text-green-600">
                      {teams?.reduce((total, team) => total + ((team as any)._count?.feedback || 0) + ((team as any)._count?.actions || 0), 0) || 0}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">Total Activities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Management Content */}
            {isLoadingTeams ? (
              <div className="card-modern p-6 md:p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm md:text-base">Loading teams...</p>
              </div>
            ) : teams?.length === 0 ? (
              <div className="card-modern p-6 md:p-8 text-center">
                <FiUsers className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No Teams Created Yet</h3>
                <p className="text-sm md:text-base text-gray-500 mb-6">Create your first team to organize students for group activities</p>
                {assignedStudents?.length > 0 ? (
                  <motion.button
                    onClick={() => setIsCreateTeamModalOpen(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg min-h-[44px]"
                  >
                    <FiPlus className="w-4 h-4 mr-2 inline" />
                    Create Your First Team
                  </motion.button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm md:text-base">
                      You need to assign students first before creating teams.
                    </p>
                    <motion.button
                      onClick={() => setActiveTab('students')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                    >
                      Go to Students
                    </motion.button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {teams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.01 }}
                    className="card-modern p-4 md:p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <FiUsers className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800">{team.name}</h3>
                            <p className="text-sm md:text-base text-gray-600">{team.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
                            {(team as any)._count?.members || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMessageSquare className="w-3 h-3 md:w-4 md:h-4" />
                            {(team as any)._count?.feedback || 0} messages
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCheckSquare className="w-3 h-3 md:w-4 md:h-4" />
                            {(team as any)._count?.actions || 0} actions
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🖱️ Details button clicked for team:', team?.name);
                            handleViewTeamDetails(team);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center justify-center cursor-pointer"
                          title="View team details"
                        >
                          <FiEye className="w-4 h-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Details</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleTeamFeedback(team)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center justify-center"
                        >
                          <FiMessageSquare className="w-4 h-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Message</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleTeamActions(team)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center justify-center"
                        >
                          <FiCheckSquare className="w-4 h-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Actions</span>
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🟣 Purple Roles button clicked for team:', team?.name, team?.id);
                            handleTeamRoles(team);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base min-h-[44px] md:min-h-0 flex items-center justify-center"
                        >
                          <FiUsers className="w-4 h-4 sm:mr-0 mr-2" />
                          <span className="sm:hidden">Roles</span>
                        </motion.button>
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🖱️ Manage Members button clicked for team:', team?.name);
                            handleTeamMembers(team);
                          }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex-1 sm:flex-none px-2 py-2 md:py-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors text-xs md:text-sm min-h-[36px] md:min-h-0 flex items-center justify-center cursor-pointer"
                          title="Add or remove team members"
                        >
                          <FiUserPlus className="w-3 h-3 sm:mr-0 mr-1" />
                          <span className="sm:hidden text-xs">Members</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTeam(team)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex-1 sm:flex-none px-2 py-2 md:py-1.5 bg-gray-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs md:text-sm min-h-[36px] md:min-h-0 flex items-center justify-center opacity-75 hover:opacity-100"
                          title="Delete team (only team creator can delete)"
                        >
                          <FiTrash className="w-3 h-3 sm:mr-0 mr-1" />
                          <span className="sm:hidden text-xs">Delete</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
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
          {(session as unknown as Session)?.user?.role === 'ATHLETE' && (
            <></>
          )}
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
      {showDirectChat && (
        <DirectChatPanel onClose={() => setShowDirectChat(false)} threadId={directThreadId || undefined} />
      )}
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

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Independent Feedback and Action Modals - Outside main modal to prevent background artifacts */}
      {/* Feedback Modal - Only render when specifically opened */}
      {selectedStudentModal && feedbackModalOpen && activeModal === 'feedback' && (
          <CreateFeedbackModal
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
      )}

      {/* Action Modal - Only render when specifically opened */}
      {selectedStudentModal && actionModalOpen && activeModal === 'actions' && (
          <CreateActionModal
            isOpen={actionModalOpen}
            onClose={closeModal}
            student={{
              id: selectedStudentModal.id,
              studentName: selectedStudentModal.studentName || selectedStudentModal.name || 'Student',
              username: selectedStudentModal.username || selectedStudentModal.email || 'student',
              age: selectedStudentModal.age || 18
            }}
            onCreated={handleFeedbackCreated}
          />
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

      {/* Create Team Modal */}
              {isAttendanceModalOpen && (
          <AttendanceModal
            isOpen={isAttendanceModalOpen}
            onClose={() => setIsAttendanceModalOpen(false)}
          />
        )}

        {isCreateTeamModalOpen && (
          <CreateTeamModal
            isOpen={isCreateTeamModalOpen}
            onClose={() => setIsCreateTeamModalOpen(false)}
          availableStudents={assignedStudents || []}
          onTeamCreated={() => {
            // Refresh teams list with member details
            if (studentsSubTab === 'assigned') {
              fetchTeams(true); // Include team members for new team
            }
            setSuccessMessage('Team created successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
          onCreateTeam={handleCreateTeam}
        />
      )}

      {/* Team Details Modal */}
      {isTeamDetailsModalOpen && selectedTeamForDetails && (
        <TeamDetailsModal
          isOpen={isTeamDetailsModalOpen}
          onClose={() => {
            setIsTeamDetailsModalOpen(false);
            setSelectedTeamForDetails(null);
            setExpandedTeamItems([]);
          }}
          team={selectedTeamForDetails}
          teamData={teamDetailsData}
          isLoading={isLoadingTeamDetails}
          viewType={teamDetailsViewType}
          setViewType={setTeamDetailsViewType}
          expandedItems={expandedTeamItems}
          onToggleItemExpanded={toggleTeamItemExpanded}
        />
      )}

      {/* Team Feedback Modal */}
      {isTeamFeedbackModalOpen && selectedTeamForDetails && (
        <TeamFeedbackModal
          isOpen={isTeamFeedbackModalOpen}
          onClose={() => {
            setIsTeamFeedbackModalOpen(false);
            setSelectedTeamForDetails(null);
          }}
          team={selectedTeamForDetails}
          onCreateFeedback={handleCreateTeamFeedback}
        />
      )}

      {/* Team Action Modal */}
      {isTeamActionModalOpen && selectedTeamForDetails && (
        <TeamActionModal
          isOpen={isTeamActionModalOpen}
          onClose={() => {
            setIsTeamActionModalOpen(false);
            setSelectedTeamForDetails(null);
          }}
          team={selectedTeamForDetails}
          onCreateAction={handleCreateTeamAction}
        />
      )}

      {/* Team Roles Modal - Mobile Optimized */}
      {isTeamRolesModalOpen && selectedTeamForRoles && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Mobile-friendly header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-48 sm:max-w-none">
                      {selectedTeamForRoles.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Team Role Management</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsTeamRolesModalOpen(false);
                    setSelectedTeamForRoles(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Scrollable content */}
              <div className="overflow-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-120px)]">
                <TeamManagement 
                  teams={[selectedTeamForRoles]} 
                  onTeamsUpdate={() => {
                    fetchTeams(true); // Include team members after role updates
                    if (studentsSubTab === 'assigned') {
                      fetchProfile();
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Team Member Management Modal */}
      {isTeamMemberModalOpen && selectedTeamForMembers && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate max-w-48 sm:max-w-none">
                      {selectedTeamForMembers.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Manage Team Members</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsTeamMemberModalOpen(false);
                    setSelectedTeamForMembers(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)] overflow-auto">
                <TeamMemberManagement 
                  team={selectedTeamForMembers}
                  assignedStudents={assignedStudents || []}
                  onUpdate={() => {
                    fetchTeams(true);
                    fetchProfile();
                  }}
                />
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Team Deletion Confirmation Dialog */}
      {isDeleteConfirmOpen && selectedTeamForDeletion && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <FiTrash className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Team</h3>
                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to delete <strong>"{selectedTeamForDeletion.name}"</strong>?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm font-medium">⚠️ Warning:</p>
                    <ul className="text-red-700 text-sm mt-1 space-y-1">
                      <li>• All team members will be removed from this team</li>
                      <li>• All team messages and actions will be deleted</li>
                      <li>• This change will be reflected in all members' dashboards</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    onClick={cancelDeleteTeam}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isDeletingTeam}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDeleteTeam}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isDeletingTeam}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeletingTeam ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FiTrash className="w-4 h-4 mr-2" />
                        Delete Team
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}

      {/* Chat Panel */}
      {chatState?.open && (
        <ChatPanel
          type={chatState.type}
          itemId={chatState.itemId}
          title={chatState.title}
          counterpartName="Chat"
          onClose={() => setChatState(null)}
        />
      )}

    </div>
  );
}

