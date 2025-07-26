"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';
import { 
  FiActivity, 
  FiHeart, 
  FiZap, 
  FiTarget,
  FiAward,
  FiChevronRight,
  FiInfo,
  FiUser,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import type { Session } from "next-auth";

// Dynamic import for DailyCheckInModal to prevent chunk loading issues
const DailyCheckInModal = dynamic(() => import('./DailyCheckInModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      <p className="text-sm text-gray-600 mt-2">Loading...</p>
    </div>
  </div>
});

// Dynamic import for WellnessReportModal
const WellnessReportModal = dynamic(() => import('./WellnessReportModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      <p className="text-sm text-gray-600 mt-2">Loading...</p>
    </div>
  </div>
});

// Note: We'll implement our own calculation functions since SkillSnap exports are complex

interface SkillData {
  // Physical Skills
  pushupScore?: number;
  pullupScore?: number;
  verticalJump?: number;
  gripStrength?: number;
  sprint50m?: number;
  shuttleRun?: number;
  run5kTime?: number;
  yoyoTest?: number;
  sprintTime?: number;
  
  // Mental Skills
  moodScore?: number;
  sleepScore?: number;
  
  // Nutrition Skills
  totalCalories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  waterIntake?: number;
  
  // Technical Skills
  battingGrip?: number;
  battingStance?: number;
  battingBalance?: number;
  cockingOfWrist?: number;
  backLift?: number;
  topHandDominance?: number;
  highElbow?: number;
  runningBetweenWickets?: number;
  calling?: number;
  bowlingGrip?: number;
  runUp?: number;
  backFootLanding?: number;
  frontFootLanding?: number;
  hipDrive?: number;
  backFootDrag?: number;
  nonBowlingArm?: number;
  release?: number;
  followThrough?: number;
  positioningOfBall?: number;
  pickUp?: number;
  aim?: number;
  throw?: number;
  softHands?: number;
  receiving?: number;
  highCatch?: number;
  flatCatch?: number;
  
  student?: {
    studentName: string;
    age: number;
    academy: string;
    height?: number;
    weight?: number;
  };
}

interface PeakScoreProps {
  skillData: SkillData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Calculate aggregate scores for each category (out of 100 points each)
const calculatePhysicalScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Strength Component (40 points max) - REALISTIC BENCHMARKS
  const strengthScores = [];
  if (skillData.pushupScore) {
    // More challenging benchmarks: 80+ reps for perfect score
    const age = skillData.student?.age || 18;
    const pushupBenchmark = age < 16 ? 60 : age < 18 ? 70 : 80; // Much higher benchmarks
    strengthScores.push(Math.min(10, (skillData.pushupScore / pushupBenchmark) * 10));
  }
  if (skillData.pullupScore) {
    // 20+ pullups for perfect score (very challenging)
    strengthScores.push(Math.min(10, (skillData.pullupScore / 20) * 10));
  }
  if (skillData.verticalJump) {
    // 90cm+ for perfect score (elite level)
    strengthScores.push(Math.min(10, (skillData.verticalJump / 90) * 10));
  }
  if (skillData.gripStrength) {
    // Much higher grip strength benchmarks
    const age = skillData.student?.age || 18;
    const gripBenchmark = age < 16 ? 50 : age < 18 ? 60 : 70; // Elite level strength
    strengthScores.push(Math.min(10, (skillData.gripStrength / gripBenchmark) * 10));
  }
  
  if (strengthScores.length > 0) {
    const strengthAvg = strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length;
    totalScore += (strengthAvg / 10) * 40; // Scale to 40 points
    maxPossibleScore += 40;
  }
  
  // Speed & Agility Component (30 points max) - REALISTIC BENCHMARKS
  const speedScores = [];
  if (skillData.sprint50m) {
    // 6.5 seconds for perfect score (competitive level)
    const benchmark = 6.5; // Much more challenging
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprint50m) * 10)));
  }
  if (skillData.shuttleRun) {
    // 12 seconds for perfect score (assuming standard shuttle distance)
    const benchmark = 12; // More challenging
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.shuttleRun) * 10)));
  }
  if (skillData.sprintTime) {
    // 10 seconds for perfect score (depending on distance)
    const benchmark = 10; // More challenging
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprintTime) * 10)));
  }
  
  if (speedScores.length > 0) {
    const speedAvg = speedScores.reduce((a, b) => a + b, 0) / speedScores.length;
    totalScore += (speedAvg / 10) * 30; // Scale to 30 points
    maxPossibleScore += 30;
  }
  
  // Endurance Component (30 points max) - REALISTIC BENCHMARKS
  const enduranceScores = [];
  if (skillData.run5kTime) {
    // Much more challenging 5K benchmarks
    const age = skillData.student?.age || 18;
    const benchmark = age < 16 ? 18 : age < 18 ? 17 : 16; // Elite running times (minutes)
    enduranceScores.push(Math.max(0, Math.min(10, (benchmark / skillData.run5kTime) * 10)));
  }
  if (skillData.yoyoTest) {
    // Level 25+ for perfect score (elite endurance)
    enduranceScores.push(Math.min(10, (skillData.yoyoTest / 25) * 10));
  }
  
  if (enduranceScores.length > 0) {
    const enduranceAvg = enduranceScores.reduce((a, b) => a + b, 0) / enduranceScores.length;
    totalScore += (enduranceAvg / 10) * 30; // Scale to 30 points
    maxPossibleScore += 30;
  }
  
  // Return score out of 100, scaled based on available data
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

const calculateMentalScore = (skillData: SkillData | null, wellnessData: any = null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Mood Score (40 points max)
  if (skillData.moodScore !== undefined && skillData.moodScore !== null) {
    totalScore += (skillData.moodScore / 10) * 40;
    maxPossibleScore += 40;
  }
  
  // Sleep Score (40 points max)
  if (skillData.sleepScore !== undefined && skillData.sleepScore !== null) {
    totalScore += (skillData.sleepScore / 10) * 40;
    maxPossibleScore += 40;
  }
  
  // NOTE: Removed wellness placeholder to fix scoring accuracy
  // Future wellness metrics can be added with proper scoring implementation
  
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

// NEW: Goal-based nutrition scoring function (matching SkillSnap implementation)
const calculateGoalBasedNutritionScore = (
  skillData: SkillData | null, 
  nutritionGoal: 'bulking' | 'maintaining' | 'cutting' = 'maintaining',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense' = 'moderate',
  sex: 'male' | 'female' = 'male'
): number => {
  if (!skillData) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Activity multipliers for TDEE calculation
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    very_intense: 1.9
  };

  // Macro splits based on goals (per kg bodyweight and percentages)
  const macroSplits = {
    bulking: { protein: 2.0, carbs: 5.0, fatPercent: 20 },
    maintaining: { protein: 1.6, carbs: 4.0, fatPercent: 25 },
    cutting: { protein: 2.2, carbs: 3.0, fatPercent: 20 }
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (weight: number, height: number, age: number, sex: 'male' | 'female'): number => {
    const baseCalc = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'male' ? baseCalc + 5 : baseCalc - 161;
  };

  // Check if we have student data for personalized targets
  const student = skillData.student;
  if (student && student.weight && student.height) {
    // Use goal-based personalized targets
    const bmr = calculateBMR(student.weight, student.height, student.age, sex);
    const tdee = bmr * activityMultipliers[activityLevel];

    // Adjust calories based on goal
    let targetCalories = tdee;
    if (nutritionGoal === 'bulking') targetCalories *= 1.15;
    else if (nutritionGoal === 'cutting') targetCalories *= 0.85;

    const macros = macroSplits[nutritionGoal];
    
    // Calculate macronutrients
    const protein = macros.protein * student.weight;
    const carbs = macros.carbs * student.weight;
    const fatCalories = targetCalories * (macros.fatPercent / 100);
    const fats = fatCalories / 9;

    // Water intake: base formula + extra for intense training
    const baseWater = student.weight * 0.035;
    const water = activityLevel === 'intense' || activityLevel === 'very_intense' 
      ? baseWater + 0.5 
      : baseWater;

    const targets = {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      water: Math.round(water * 10) / 10
    };
    
    // Calories (25 points max) - Score based on proximity to goal-specific target
    if (skillData.totalCalories !== undefined && skillData.totalCalories !== null) {
      const calorieDeviation = Math.abs((skillData.totalCalories - targets.calories) / targets.calories);
      // Perfect score for within 5%, decreasing linearly to 0 at 50% deviation
      const calorieScore = Math.max(0, Math.min(10, 10 * (1 - (calorieDeviation / 0.5))));
      totalScore += calorieScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Protein (25 points max) - More lenient scoring for protein (within 10-20% is good)
    if (skillData.protein !== undefined && skillData.protein !== null) {
      const proteinDeviation = Math.abs((skillData.protein - targets.protein) / targets.protein);
      // Perfect score for within 10%, decreasing linearly to 0 at 40% deviation
      const proteinScore = Math.max(0, Math.min(10, 10 * (1 - (proteinDeviation / 0.4))));
      totalScore += proteinScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Carbohydrates (25 points max) - Goal-specific carb targets
    if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null) {
      const carbDeviation = Math.abs((skillData.carbohydrates - targets.carbs) / targets.carbs);
      // Perfect score for within 15%, decreasing linearly to 0 at 50% deviation
      const carbScore = Math.max(0, Math.min(10, 10 * (1 - (carbDeviation / 0.5))));
      totalScore += carbScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }

    // Fats (12.5 points max) - Less weight as it's often calculated from remaining calories
    if (skillData.fats !== undefined && skillData.fats !== null) {
      const fatDeviation = Math.abs((skillData.fats - targets.fats) / targets.fats);
      // Perfect score for within 20%, decreasing linearly to 0 at 60% deviation
      const fatScore = Math.max(0, Math.min(10, 10 * (1 - (fatDeviation / 0.6))));
      totalScore += fatScore * 1.25; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
    
    // Water intake (12.5 points max) - Activity-level adjusted
    if (skillData.waterIntake !== undefined && skillData.waterIntake !== null) {
      const waterDeviation = Math.abs((skillData.waterIntake - targets.water) / targets.water);
      // Perfect score for within 10%, decreasing linearly to 0 at 40% deviation
      const waterScore = Math.max(0, Math.min(10, 10 * (1 - (waterDeviation / 0.4))));
      totalScore += waterScore * 1.25; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
  } else {
    // Fallback to generic scoring when no personalized data available
    // Calories (25 points max) - Generic range
    if (skillData.totalCalories !== undefined && skillData.totalCalories !== null) {
      const calorieScore = Math.min(10, Math.max(0, ((skillData.totalCalories - 1000) / (4000 - 1000)) * 10));
      totalScore += calorieScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Protein (25 points max) - Generic range
    if (skillData.protein !== undefined && skillData.protein !== null) {
      const proteinScore = Math.min(10, Math.max(0, ((skillData.protein - 20) / (200 - 20)) * 10));
      totalScore += proteinScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Carbohydrates (25 points max) - Generic range
    if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null) {
      const carbScore = Math.min(10, Math.max(0, ((skillData.carbohydrates - 50) / (500 - 50)) * 10));
      totalScore += carbScore * 2.5; // Scale to 25 points
      maxPossibleScore += 25;
    }

    // Fats (12.5 points max) - Generic range
    if (skillData.fats !== undefined && skillData.fats !== null) {
      const fatScore = Math.min(10, Math.max(0, ((skillData.fats - 20) / (150 - 20)) * 10));
      totalScore += fatScore * 1.25; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
    
    // Water intake (12.5 points max) - Generic range
    if (skillData.waterIntake !== undefined && skillData.waterIntake !== null) {
      const waterScore = Math.min(10, Math.max(0, ((skillData.waterIntake - 1) / (5 - 1)) * 10));
      totalScore += waterScore * 1.25; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

// DEPRECATED: Keep old function for backward compatibility
const calculateNutritionScore = (skillData: SkillData | null): number => {
  // Use the new goal-based scoring with default values for backward compatibility
  return calculateGoalBasedNutritionScore(skillData, 'maintaining', 'moderate', 'male');
};

const calculateTechnicalScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Batting skills (35 points max)
  const battingSkills = ['battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
    'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling'];
  
  let battingScore = 0;
  let battingCount = 0;
  
  battingSkills.forEach(skillId => {
    const value = skillData[skillId as keyof SkillData] as number;
    if (value !== undefined && value !== null) {
      battingScore += Math.min(10, Math.max(0, value));
      battingCount++;
    }
  });
  
  if (battingCount > 0) {
    totalScore += (battingScore / battingCount) * 3.5; // Scale to 35 points
    maxPossibleScore += 35;
  }
  
  // Bowling skills (35 points max)
  const bowlingSkills = ['bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
    'backFootDrag', 'nonBowlingArm', 'release', 'followThrough'];
  
  let bowlingScore = 0;
  let bowlingCount = 0;
  
  bowlingSkills.forEach(skillId => {
    const value = skillData[skillId as keyof SkillData] as number;
    if (value !== undefined && value !== null) {
      bowlingScore += Math.min(10, Math.max(0, value));
      bowlingCount++;
    }
  });
  
  if (bowlingCount > 0) {
    totalScore += (bowlingScore / bowlingCount) * 3.5; // Scale to 35 points
    maxPossibleScore += 35;
  }
  
  // Fielding skills (30 points max)
  const fieldingSkills = ['positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'];
  
  let fieldingScore = 0;
  let fieldingCount = 0;
  
  fieldingSkills.forEach(skillId => {
    const value = skillData[skillId as keyof SkillData] as number;
    if (value !== undefined && value !== null) {
      fieldingScore += Math.min(10, Math.max(0, value));
      fieldingCount++;
    }
  });
  
  if (fieldingCount > 0) {
    totalScore += (fieldingScore / fieldingCount) * 3.0; // Scale to 30 points
    maxPossibleScore += 30;
  }
  
  // Return score out of 100, scaled based on available data
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

// Helper function to calculate personalized nutrition (if needed)
const calculatePersonalizedNutrition = (weight: number, height: number, age: number) => {
  // BMR calculation (Mifflin-St Jeor equation for males)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  
  // Activity factor for athletes (1.725 for very active)
  const tdee = bmr * 1.725;
  
  return {
    totalCalories: Math.round(tdee),
    protein: Math.round(weight * 1.6), // 1.6g per kg for athletes
    carbohydrates: Math.round(weight * 5), // 5g per kg for athletes
    fats: Math.round(weight * 1.2), // 1.2g per kg
    bmi: weight / Math.pow(height / 100, 2)
  };
};

const calculateTacticalScore = (): number => {
  // Placeholder tactical score - convert 6.5/10 to 65/100
  return 65;
};

const PeakScore: React.FC<PeakScoreProps> = ({ skillData, isLoading = false, onRefresh, isRefreshing }) => {
  const { data: session } = useSession();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showWellnessInfoModal, setShowWellnessInfoModal] = useState(false);
  const [showWellnessReportModal, setShowWellnessReportModal] = useState(false);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  // Fetch today's Wellness Score entry
  const fetchTodaysEntry = async () => {
    if (!(session as unknown as Session)?.user?.id) return;
    
    setIsLoadingEntry(true);
    try {
      const response = await fetch('/api/hooper-index');
      if (response.ok) {
        const data = await response.json();
        setTodaysEntry(data.entry);
      }
    } catch (error) {
      console.error('Error fetching today\'s entry:', error);
    } finally {
      setIsLoadingEntry(false);
    }
  };

  // Handle Wellness Score submission
  const handleWellnessSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/hooper-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setTodaysEntry(result.entry);
        setShowCheckInModal(false);
      } else {
        throw new Error('Failed to save check-in');
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Failed to save your check-in. Please try again.');
    }
  };

  // Load today's entry when component mounts
  useEffect(() => {
    fetchTodaysEntry();
  }, [(session as unknown as Session)?.user?.id]);

  // Calculate scores for each category
  const physicalScore = calculatePhysicalScore(skillData);
  const mentalScore = calculateMentalScore(skillData, todaysEntry);
  const nutritionScore = calculateNutritionScore(skillData);
  const technicalScore = calculateTechnicalScore(skillData);
  const tacticalScore = calculateTacticalScore();

  // Calculate overall PeakScore (sum of all categories out of 500)
  const peakScore = Math.round(physicalScore + mentalScore + nutritionScore + technicalScore + tacticalScore);

  // Prepare radar chart data (normalized to 0-100 scale for visualization)
  const radarData = [
    {
      skill: 'Physical',
      score: physicalScore,
      fullMark: 100,
      icon: '💪'
    },
    {
      skill: 'Mental',
      score: mentalScore,
      fullMark: 100,
      icon: '🧠'
    },
    {
      skill: 'Nutrition',
      score: nutritionScore,
      fullMark: 100,
      icon: '🥗'
    },
    {
      skill: 'Technical',
      score: technicalScore,
      fullMark: 100,
      icon: '⚡'
    },
    {
      skill: 'Tactical',
      score: tacticalScore,
      fullMark: 100,
      icon: '🎯'
    }
  ];

  // Define skill categories with detailed breakdown
  const skillCategories = [
    {
      id: 'physical',
      name: 'Physical',
      icon: <FiActivity className="w-6 h-6" />,
      score: physicalScore,
      color: 'from-red-500 to-orange-500',
      details: [
        { name: 'Strength', value: physicalScore * 0.4, max: 40 },
        { name: 'Speed & Agility', value: physicalScore * 0.3, max: 30 },
        { name: 'Endurance', value: physicalScore * 0.3, max: 30 }
      ]
    },
    {
      id: 'mental',
      name: 'Mental',
      icon: <FiUser className="w-6 h-6" />,
      score: mentalScore,
      color: 'from-purple-500 to-pink-500',
      details: [
        { name: 'Mood Score', value: skillData?.moodScore ? (skillData.moodScore / 10) * 40 : 0, max: 40 },
        { name: 'Sleep Quality', value: skillData?.sleepScore ? (skillData.sleepScore / 10) * 40 : 0, max: 40 },
        { 
          name: 'Wellness Score', 
          value: todaysEntry?.hooperIndex ? (() => {
            const wellnessScore = todaysEntry.hooperIndex;
            if (wellnessScore <= 16) return 20;
            if (wellnessScore <= 24) return 15;
            if (wellnessScore <= 32) return 10;
            if (wellnessScore <= 40) return 5;
            return 0;
          })() : 10, 
          max: 20,
          actualValue: todaysEntry?.hooperIndex,
          interpretation: todaysEntry?.hooperIndex ? (() => {
            const score = todaysEntry.hooperIndex;
            if (score <= 16) return 'Excellent';
            if (score <= 24) return 'Good';
            if (score <= 32) return 'Fair';
            if (score <= 40) return 'Poor';
            return 'Very Poor';
          })() : 'Not recorded'
        },
        { name: 'Daily Check-in', value: 0, max: 0, isAction: true }
      ]
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: <FiHeart className="w-6 h-6" />,
      score: nutritionScore,
      color: 'from-green-500 to-teal-500',
      details: [
        { name: 'Calories', value: nutritionScore * 0.25, max: 25 },
        { name: 'Protein', value: nutritionScore * 0.25, max: 25 },
        { name: 'Carbs', value: nutritionScore * 0.25, max: 25 },
        { name: 'Water', value: nutritionScore * 0.25, max: 25 }
      ]
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: <FiZap className="w-6 h-6" />,
      score: technicalScore,
      color: 'from-blue-500 to-indigo-500',
      details: [
        { name: 'Batting', value: technicalScore * 0.35, max: 35 },
        { name: 'Bowling', value: technicalScore * 0.35, max: 35 },
        { name: 'Fielding', value: technicalScore * 0.3, max: 30 }
      ]
    },
    {
      id: 'tactical',
      name: 'Tactical',
      icon: <FiTarget className="w-6 h-6" />,
      score: tacticalScore,
      color: 'from-yellow-500 to-orange-500',
      details: [
        { name: 'Game Reading', value: tacticalScore * 0.35, max: 35 },
        { name: 'Decision Making', value: tacticalScore * 0.35, max: 35 },
        { name: 'Strategy', value: tacticalScore * 0.3, max: 30 }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="mt-6 space-y-6">
        <div className="card-modern glass animate-pulse">
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="mt-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Daily Check-in Notification Banner */}
      <AnimatePresence>
        {!todaysEntry && !isLoadingEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Complete daily check-in
                    </p>
                    <p className="text-xs text-gray-600">
                      Quick wellness questionnaire
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWellnessInfoModal(true)}
                    className="text-orange-600 hover:text-orange-700 p-1"
                    title="Learn about Wellness Score"
                  >
                    <FiInfo className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCheckInModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Start
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Daily Check-in Completed Banner */}
        {todaysEntry && !isLoadingEntry && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Daily check-in complete
                  </p>
                </div>
                <div className="flex items-center space-x-1.5">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWellnessInfoModal(true)}
                    className="text-green-600 hover:text-green-700 p-1.5 rounded-md"
                    title="Learn about Wellness Score"
                  >
                    <FiInfo className="w-3.5 h-3.5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWellnessReportModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-md text-xs font-medium"
                  >
                    View Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCheckInModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-medium"
                  >
                    Update
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PeakScore Header */}
      <motion.div 
        className="card-modern glass overflow-hidden"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-green-600/10"></div>
          
          <div className="relative p-6">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">PeakScore</h3>
                  {onRefresh && (
                    <motion.button
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh PeakScore"
                    >
                      <motion.div
                        animate={isRefreshing ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                      >
                        <FiRefreshCw className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  )}
                </div>
                <motion.div 
                  className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  {peakScore}
                </motion.div>
              </motion.div>
              <motion.p 
                className="text-xs text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Score out of 500 (100 per skill category)
              </motion.p>
            </div>

            {/* Insight Text */}
            <motion.div 
              className="text-center text-sm text-gray-700 space-y-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
            </motion.div>

            {/* Show Details Toggle */}
            <motion.button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 rounded-xl text-purple-700 font-medium hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiInfo className="w-4 h-4" />
              {showDetails ? 'Hide Details' : 'View Detailed Breakdown'}
              <motion.div
                animate={{ rotate: showDetails ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Detailed Breakdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Radar Chart */}
            <motion.div 
              className="card-modern glass"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  Performance Overview
                </h4>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid 
                        gridType="polygon" 
                        radialLines={true}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                      <PolarAngleAxis 
                        dataKey="skill" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(value) => {
                          const item = radarData.find(d => d.skill === value);
                          return `${item?.icon} ${value}`;
                        }}
                      />
                      <PolarRadiusAxis 
                        angle={0} 
                        domain={[0, 100]} 
                        tickCount={6}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        axisLine={false}
                      />
                      <Radar
                        name="Your Scores"
                        dataKey="score"
                        stroke="url(#radarGradient)"
                        fill="url(#radarGradient)"
                        fillOpacity={0.3}
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                      />
                      <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Skill Category Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skillCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="card-modern glass cursor-pointer"
                  onClick={() => setExpandedSkill(expandedSkill === category.id ? null : category.id)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800">{category.name}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                              {category.score.toFixed(0)}
                            </span>
                            <span className="text-sm text-gray-500">/100</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSkill === category.id ? 90 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiChevronRight className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${category.score}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
                      />
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedSkill === category.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2 pt-2 border-t border-gray-200"
                        >
                          {category.details.map((detail, detailIndex) => (
                            <motion.div
                              key={detail.name}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: detailIndex * 0.05 }}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-600">{detail.name}</span>
                              {detail.isAction ? (
                                // Daily Check-in Button
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCheckInModal(true);
                                  }}
                                  className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${todaysEntry 
                                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }
                                  `}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <div className="flex items-center gap-1">
                                    <FiCalendar className="w-3 h-3" />
                                    {todaysEntry ? 'Update' : 'Start'} Check-in
                                  </div>
                                </motion.button>
                              ) : (
                                // Regular progress bar
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1">
                                    <motion.div
                                      className={`h-1 rounded-full bg-gradient-to-r ${category.color}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${detail.max > 0 ? (detail.value / detail.max) * 100 : 0}%` }}
                                      transition={{ delay: 0.2, duration: 0.5 }}
                                    />
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-medium text-gray-800 min-w-[2rem]">
                                      {detail.name === 'Wellness Score' && detail.actualValue ? 
                                        `${detail.actualValue} (${detail.interpretation})` : 
                                        detail.value.toFixed(0)}
                                    </span>
                                    {detail.name === 'Wellness Score' && detail.actualValue && (
                                      <span className="text-xs text-gray-500">
                                        Points: {detail.value.toFixed(0)}/{detail.max}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Achievement Insights */}
            <motion.div 
              className="card-modern glass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <FiAward className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Performance Insights</h4>
                </div>
                
                <div className="space-y-3">
                  {peakScore >= 400 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">🎉 Excellent overall performance! You're in the top tier of athletes with a score of {peakScore}/500.</p>
                    </div>
                  )}
                  {peakScore >= 300 && peakScore < 400 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">👍 Good progress! Focus on your weaker areas to reach the next level. Current score: {peakScore}/500.</p>
                    </div>
                  )}
                  {peakScore >= 200 && peakScore < 300 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">💪 Keep pushing! Every champion started somewhere. Consistency is key. Score: {peakScore}/500.</p>
                    </div>
                  )}
                  {peakScore < 200 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm">🚀 Great potential ahead! Focus on building fundamentals across all areas. Score: {peakScore}/500.</p>
                    </div>
                  )}
                  
                  {/* Specific recommendations */}
                  {physicalScore < 50 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">🏋️‍♂️ Focus on physical training to build your foundation. Current physical score: {physicalScore.toFixed(0)}/100.</p>
                    </div>
                  )}
                  {mentalScore < 50 && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 text-sm">🧘‍♂️ Consider meditation and sleep optimization for mental wellness. Current mental score: {mentalScore.toFixed(0)}/100.</p>
                    </div>
                  )}
                  {nutritionScore < 50 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm">🥗 Track your nutrition more consistently for better performance. Current nutrition score: {nutritionScore.toFixed(0)}/100.</p>
                    </div>
                  )}
                  {technicalScore < 50 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">⚡ Work on your technical skills through focused practice. Current technical score: {technicalScore.toFixed(0)}/100.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wellness Score Information Modal */}
      <AnimatePresence>
        {showWellnessInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWellnessInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <FiInfo className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Wellness Score</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowWellnessInfoModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiTarget className="w-5 h-5 rotate-45" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">What is the Wellness Score?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    The Wellness Score is an 8-question daily questionnaire that measures your readiness to train and perform. 
                    Each question is rated 1-7, with your total score ranging from 8-56 (lower scores indicate better wellness).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">What it measures:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600"><strong>Fatigue & Energy:</strong> How tired or energetic you feel</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600"><strong>Stress & Mood:</strong> Mental stress and irritability levels</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600"><strong>Sleep & Recovery:</strong> Sleep quality and feeling well-rested</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600"><strong>Physical State:</strong> Muscle soreness and overall health</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Understanding your score:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Excellent (8-16)</span>
                      <span className="text-xs text-green-600">Ready for intense training</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Good (17-24)</span>
                      <span className="text-xs text-blue-600">Normal training load</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-yellow-800">Fair (25-32)</span>
                      <span className="text-xs text-yellow-600">Moderate training</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-orange-800">Poor (33-40)</span>
                      <span className="text-xs text-orange-600">Light training</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-800">Very Poor (41+)</span>
                      <span className="text-xs text-red-600">Focus on recovery</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    💡 <strong>Pro tip:</strong> Track this daily to identify patterns and optimize your training schedule based on your body's readiness.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWellnessInfoModal(false)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Got it!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSubmit={handleWellnessSubmit}
        existingEntry={todaysEntry}
      />

      {/* Wellness Report Modal */}
      <WellnessReportModal
        isOpen={showWellnessReportModal}
        onClose={() => setShowWellnessReportModal(false)}
        currentEntry={todaysEntry}
      />
    </motion.div>
  );
};

export default PeakScore; 