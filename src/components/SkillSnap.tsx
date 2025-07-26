"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Edit, Check, X, RefreshCw, Edit2, Info, Target, Droplet, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiSave, FiX, FiEdit, FiRefreshCw, FiEdit2, FiCheck, FiChevronDown, FiChevronUp, FiInfo, FiTarget, FiDroplet, FiZap } from "react-icons/fi";
import type { Session } from "next-auth";

// Nutrition Goal Types
type NutritionGoal = 'bulking' | 'maintaining' | 'cutting';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'intense' | 'very_intense';
type Sex = 'male' | 'female';

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}

interface MacroTooltip {
  name: string;
  purpose: string;
  importance: string;
}

// Types for skills and analytics
interface SkillData {
  id?: string;
  // Physical Skills - Strength
  pushupScore?: number;
  pullupScore?: number;
  verticalJump?: number;
  gripStrength?: number;
  // Physical Skills - Speed & Agility
  sprintTime?: number;
  sprint50m?: number;
  shuttleRun?: number;
  // Physical Skills - Endurance
  run5kTime?: number;
  yoyoTest?: number;
  // Mental Skills
  moodScore?: number;
  sleepScore?: number;
  // Nutrition Skills
  totalCalories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
  waterIntake?: number;
  // Technical skills - Batting
  battingGrip?: number;
  battingStance?: number;
  battingBalance?: number;
  cockingOfWrist?: number;
  backLift?: number;
  topHandDominance?: number;
  highElbow?: number;
  runningBetweenWickets?: number;
  calling?: number;
  // Technical skills - Bowling
  bowlingGrip?: number;
  runUp?: number;
  backFootLanding?: number;
  frontFootLanding?: number;
  hipDrive?: number;
  backFootDrag?: number;
  nonBowlingArm?: number;
  release?: number;
  followThrough?: number;
  // Technical skills - Fielding
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

interface SkillAverages {
  ageGroup: string;
  averages: {
    [key: string]: number;
  };
  sampleSize: number;
}

interface SkillItem {
  id: string;
  name: string;
  unit: string;
  type: "count" | "time" | "score" | "grams" | "calories";
  icon: React.ReactNode;
  description: string;
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
  };
}

interface SkillCategory {
  id: "PHYSICAL" | "TECHNIQUE" | "MENTAL" | "NUTRITION" | "TACTICAL";
  name: string;
  description: string;
  icon: React.ReactNode;
  skills: SkillItem[];
  colorScheme: {
    primary: string;
    secondary: string;
    background: string;
    gradient: string;
  };
}

interface SkillSnapProps {
  studentId?: string;
  isCoachView?: boolean;
  onSkillsUpdated?: () => void;
  onModalChange?: (isOpen: boolean) => void; // Add this new prop
}

interface TechnicalSkillsProps {
  skillData: SkillData | null;
  isEditing: boolean;
  editedScores: Record<string, number>;
  onScoreChange: (skillId: string, value: number) => void;
  averages: SkillAverages | null;
}

// Helper functions for body scroll locking
const lockBodyScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.add('modal-open');
  }
};

const unlockBodyScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modal-open');
  }
};

// Skill definitions for all categories
const skillCategories: SkillCategory[] = [
  {
    id: "PHYSICAL",
    name: "Physical",
    description: "Track physical fitness and performance metrics",
    icon: (
      <span className="text-2xl">🏋️</span>
    ),
    colorScheme: {
      primary: "red-600",
      secondary: "red-100",
      background: "red-50",
      gradient: "from-red-50 to-pink-50"
    },
    skills: [
      // Strength Skills - Red/Crimson (Power & Force)
      {
        id: "pushupScore",
        name: "Push-ups",
        unit: "reps",
        type: "count",
        description: "Maximum push-ups in 1 minute",
        colorScheme: { primary: "red-600", secondary: "red-100", background: "red-50" },
        icon: (
          <span className="text-xl">💪🏾</span>
        ),
      },
      {
        id: "pullupScore",
        name: "Pull-ups",
        unit: "reps",
        type: "count",
        description: "Maximum pull-ups in 1 set",
        colorScheme: { primary: "red-600", secondary: "red-100", background: "red-50" },
        icon: (
          <span className="text-xl">💪🏾</span>
        ),
      },
      {
        id: "verticalJump",
        name: "Vertical Jump",
        unit: "cm",
        type: "score",
        description: "Vertical jump height in centimeters",
        colorScheme: { primary: "red-600", secondary: "red-100", background: "red-50" },
        icon: (
          <span className="text-xl">🔝</span>
        ),
      },
      {
        id: "gripStrength",
        name: "Grip Strength",
        unit: "kg",
        type: "score",
        description: "Grip strength measured in kilograms",
        colorScheme: { primary: "red-600", secondary: "red-100", background: "red-50" },
        icon: (
          <span className="text-xl">👊🏾</span>
        ),
      },
      // Speed & Agility Skills - Blue/Electric (Quick movements)
      {
        id: "sprintTime",
        name: "100m Sprint",
        unit: "seconds",
        type: "time",
        description: "100 meter sprint time",
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" },
        icon: (
          <span className="text-xl">⚡️</span>
        ),
      },
      {
        id: "sprint50m",
        name: "50m Sprint",
        unit: "seconds",
        type: "time",
        description: "50 meter sprint time",
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" },
        icon: (
          <span className="text-xl">⚡️</span>
        ),
      },
      {
        id: "shuttleRun",
        name: "Shuttle Run",
        unit: "seconds",
        type: "time",
        description: "Shuttle run time",
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" },
        icon: (
          <span className="text-xl">🪃</span>
        ),
      },
      // Endurance Skills - Emerald/Green (Stamina & Vitality)
      {
        id: "run5kTime",
        name: "5K Run",
        unit: "minutes",
        type: "time",
        description: "5 kilometer run time",
        colorScheme: { primary: "emerald-600", secondary: "emerald-100", background: "emerald-50" },
        icon: (
          <span className="text-xl">🏃</span>
        ),
      },
      {
        id: "yoyoTest",
        name: "Yo-Yo Test",
        unit: "level",
        type: "score",
        description: "Yo-Yo intermittent recovery test level",
        colorScheme: { primary: "emerald-600", secondary: "emerald-100", background: "emerald-50" },
        icon: (
          <span className="text-xl">😓</span>
        ),
      },
    ]
  },
  {
    id: "MENTAL",
    name: "Mental",
    description: "Monitor mental wellness and psychological performance",
    icon: (
      <span className="text-2xl">🧠</span>
    ),
    colorScheme: {
      primary: "purple-600",
      secondary: "purple-100",
      background: "purple-50",
      gradient: "from-purple-50 to-violet-50"
    },
    skills: [
      {
        id: "moodScore",
        name: "Mood Score",
        unit: "/10",
        type: "score",
        description: "Daily mood and motivation rating",
        colorScheme: { primary: "purple-600", secondary: "purple-100", background: "purple-50" },
        icon: (
          <span className="text-xl">🧠</span>
        ),
      },
      {
        id: "sleepScore",
        name: "Sleep Quality",
        unit: "/10",
        type: "score",
        description: "Sleep quality and recovery rating",
        colorScheme: { primary: "purple-600", secondary: "purple-100", background: "purple-50" },
        icon: (
          <span className="text-xl">😴</span>
        ),
      },
    ]
  },
  {
    id: "NUTRITION",
    name: "Nutrition",
    description: "Track daily nutrition intake and dietary habits",
    icon: (
      <span className="text-2xl">🥗</span>
    ),
    colorScheme: {
      primary: "green-600",
      secondary: "green-100",
      background: "green-50",
      gradient: "from-green-50 to-emerald-50"
    },
    skills: [
      {
        id: "totalCalories",
        name: "Total Calories",
        unit: "kcal",
        type: "calories",
        description: "Daily caloric intake",
        colorScheme: { primary: "green-600", secondary: "green-100", background: "green-50" },
        icon: (
          <span className="text-xl">🍽️</span>
        ),
      },
      {
        id: "protein",
        name: "Protein",
        unit: "g",
        type: "grams",
        description: "Daily protein intake",
        colorScheme: { primary: "green-600", secondary: "green-100", background: "green-50" },
        icon: (
          <span className="text-xl">🥚</span>
        ),
      },
      {
        id: "carbohydrates",
        name: "Carbohydrates",
        unit: "g",
        type: "grams",
        description: "Daily carbohydrate intake",
        colorScheme: { primary: "green-600", secondary: "green-100", background: "green-50" },
        icon: (
          <span className="text-xl">🍞</span>
        ),
      },
      {
        id: "fats",
        name: "Fats",
        unit: "g",
        type: "grams",
        description: "Daily fat intake",
        colorScheme: { primary: "green-600", secondary: "green-100", background: "green-50" },
        icon: (
          <span className="text-xl">🧀</span>
        ),
      },
      {
        id: "waterIntake",
        name: "Water Intake",
        unit: "liters",
        type: "score",
        description: "Daily water intake in liters",
        colorScheme: { primary: "green-600", secondary: "green-100", background: "green-50" },
        icon: (
          <span className="text-xl">💧</span>
        ),
      },
    ]
  },
  {
    id: "TECHNIQUE",
    name: "Technique",
    description: "Technical skills and sport-specific abilities",
    icon: (
      <span className="text-2xl">🛠️</span>
    ),
    colorScheme: {
      primary: "blue-600",
      secondary: "blue-100",
      background: "blue-50",
      gradient: "from-blue-50 to-indigo-50"
    },
    skills: [
      // Technical skills placeholders for proper counting
      {
        id: "battingGrip",
        name: "Batting Skills",
        unit: "avg",
        type: "score" as const,
        description: "Batting technique mastery",
        icon: <span className="text-xl">🏏</span>,
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" }
      },
      {
        id: "bowlingGrip", 
        name: "Bowling Skills",
        unit: "avg",
        type: "score" as const,
        description: "Bowling technique mastery",
        icon: <span className="text-xl">🔴</span>,
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" }
      },
      {
        id: "positioningOfBall",
        name: "Fielding Skills", 
        unit: "avg",
        type: "score" as const,
        description: "Fielding technique mastery",
        icon: <span className="text-xl">🏃</span>,
        colorScheme: { primary: "blue-600", secondary: "blue-100", background: "blue-50" }
      }
    ]
  },
  {
    id: "TACTICAL",
    name: "Tactical",
    description: "Game intelligence and strategic understanding",
    icon: (
      <span className="text-2xl">🧭</span>
    ),
    colorScheme: {
      primary: "indigo-600",
      secondary: "indigo-100",
      background: "indigo-50",
      gradient: "from-indigo-50 to-slate-50"
    },
    skills: []
  }
];

// Helper function to calculate aggregate scores for each category (returns 0-100 to match PeakScore)
const calculatePhysicalAggregateScore = (skillData: SkillData | null): number => {
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

const calculateMentalAggregateScore = (skillData: SkillData | null): number => {
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

// NEW: Enhanced nutrition goal-based calculation function
const calculateGoalBasedNutritionTargets = (
  weight: number, 
  height: number, 
  age: number, 
  goal: NutritionGoal = 'maintaining',
  activityLevel: ActivityLevel = 'moderate',
  sex: Sex = 'male'
): NutritionTargets => {
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
  const calculateBMR = (weight: number, height: number, age: number, sex: Sex): number => {
    const baseCalc = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'male' ? baseCalc + 5 : baseCalc - 161;
  };

  // Calculate TDEE
  const bmr = calculateBMR(weight, height, age, sex);
  const tdee = bmr * activityMultipliers[activityLevel];

  // Adjust calories based on goal
  let targetCalories = tdee;
  if (goal === 'bulking') targetCalories *= 1.15;
  else if (goal === 'cutting') targetCalories *= 0.85;

  const macros = macroSplits[goal];
  
  // Calculate macronutrients
  const protein = macros.protein * weight;
  const carbs = macros.carbs * weight;
  
  // Calculate fats (remaining calories after protein and carbs)
  const fatCalories = targetCalories * (macros.fatPercent / 100);
  const fats = fatCalories / 9;

  // Water intake: base formula + extra for intense training
  const baseWater = weight * 0.035;
  const water = activityLevel === 'intense' || activityLevel === 'very_intense' 
    ? baseWater + 0.5 
    : baseWater;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats),
    water: Math.round(water * 10) / 10 // Round to 1 decimal
  };
};

// NEW: Realistic goal-based nutrition scoring with forgiving curve (out of 100)
const calculateGoalBasedNutritionScore = (
  skillData: SkillData | null, 
  nutritionGoal: NutritionGoal = 'maintaining',
  activityLevel: ActivityLevel = 'moderate',
  sex: Sex = 'male'
): number => {
  if (!skillData) return 0;

  // Helper function for realistic scoring curve
  // Examples: 12% deviation = 75-80%, 50% deviation = 50%
  const calculateNutrientScore = (userInput: number, target: number): number => {
    if (target === 0) return 0;
    
    const deviation = Math.abs(userInput - target) / target;
    
    // Exponential decay curve: score = 100 * e^(-1.5 * deviation)
    // This gives: 12% deviation ≈ 83%, 50% deviation ≈ 47%
    const score = 100 * Math.exp(-1.5 * deviation);
    
    return Math.max(0, Math.min(100, score));
  };

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Check if we have student data for personalized targets
  const student = skillData.student;
  if (student && student.weight && student.height) {
    // Use goal-based personalized targets
    const targets = calculateGoalBasedNutritionTargets(
      student.weight, 
      student.height, 
      student.age, 
      nutritionGoal,
      activityLevel,
      sex
    );
    
    // Calories (25 points max) - Realistic scoring curve
    if (skillData.totalCalories !== undefined && skillData.totalCalories !== null && targets.calories > 0) {
      const calorieScore = calculateNutrientScore(skillData.totalCalories, targets.calories);
      totalScore += (calorieScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Protein (25 points max) - Realistic scoring curve
    if (skillData.protein !== undefined && skillData.protein !== null && targets.protein > 0) {
      const proteinScore = calculateNutrientScore(skillData.protein, targets.protein);
      totalScore += (proteinScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Carbohydrates (25 points max) - Realistic scoring curve
    if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null && targets.carbs > 0) {
      const carbScore = calculateNutrientScore(skillData.carbohydrates, targets.carbs);
      totalScore += (carbScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }

    // Fats (12.5 points max) - Realistic scoring curve
    if (skillData.fats !== undefined && skillData.fats !== null && targets.fats > 0) {
      const fatScore = calculateNutrientScore(skillData.fats, targets.fats);
      totalScore += (fatScore / 100) * 12.5; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
    
    // Water intake (12.5 points max) - Realistic scoring curve
    if (skillData.waterIntake !== undefined && skillData.waterIntake !== null && targets.water > 0) {
      const waterScore = calculateNutrientScore(skillData.waterIntake, targets.water);
      totalScore += (waterScore / 100) * 12.5; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
  } else {
    // Fallback to generic scoring when no personalized data available
    // Use basic ranges for scoring when targets can't be calculated
    
    // Calories (25 points max) - Generic range
    if (skillData.totalCalories !== undefined && skillData.totalCalories !== null) {
      const calorieScore = Math.min(100, Math.max(0, ((skillData.totalCalories - 1000) / (4000 - 1000)) * 100));
      totalScore += (calorieScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Protein (25 points max) - Generic range
    if (skillData.protein !== undefined && skillData.protein !== null) {
      const proteinScore = Math.min(100, Math.max(0, ((skillData.protein - 20) / (200 - 20)) * 100));
      totalScore += (proteinScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }
    
    // Carbohydrates (25 points max) - Generic range
    if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null) {
      const carbScore = Math.min(100, Math.max(0, ((skillData.carbohydrates - 50) / (500 - 50)) * 100));
      totalScore += (carbScore / 100) * 25; // Scale to 25 points
      maxPossibleScore += 25;
    }

    // Fats (12.5 points max) - Generic range
    if (skillData.fats !== undefined && skillData.fats !== null) {
      const fatScore = Math.min(100, Math.max(0, ((skillData.fats - 20) / (150 - 20)) * 100));
      totalScore += (fatScore / 100) * 12.5; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
    
    // Water intake (12.5 points max) - Generic range
    if (skillData.waterIntake !== undefined && skillData.waterIntake !== null) {
      const waterScore = Math.min(100, Math.max(0, ((skillData.waterIntake - 1) / (5 - 1)) * 100));
      totalScore += (waterScore / 100) * 12.5; // Scale to 12.5 points
      maxPossibleScore += 12.5;
    }
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

// DEPRECATED: Keep old function for backward compatibility but mark as deprecated
const calculateNutritionAggregateScore = (skillData: SkillData | null): number => {
  // This function is deprecated - use calculateGoalBasedNutritionScore instead
  console.warn('calculateNutritionAggregateScore is deprecated. Use calculateGoalBasedNutritionScore instead.');
  return calculateGoalBasedNutritionScore(skillData, 'maintaining', 'moderate', 'male');
};

const calculateTacticalAggregateScore = (skillData: SkillData | null): number => {
  // For now, return a fixed score of 65 to match PeakScore component
  return 65;
};

// Helper function to calculate aggregate score for a skillset
const calculateAggregateScore = (
  category: SkillCategory, 
  skillData: SkillData | null,
  nutritionGoal: NutritionGoal = 'maintaining',
  activityLevel: ActivityLevel = 'moderate',
  sex: Sex = 'male'
): number => {
  switch (category.id) {
    case "PHYSICAL":
      return calculatePhysicalAggregateScore(skillData);
    case "MENTAL":
      return calculateMentalAggregateScore(skillData);
    case "NUTRITION":
      // Use the new goal-based nutrition scoring with current settings
      return calculateGoalBasedNutritionScore(skillData, nutritionGoal, activityLevel, sex);
    case "TECHNIQUE":
      return calculateTechnicalAggregateScore(skillData);
    case "TACTICAL":
      return calculateTacticalAggregateScore(skillData);
    default:
      return 0;
  }
};

// Helper function to calculate overall progress percentage (exported) - UPDATED for goal-based nutrition
export const calculateOverallProgress = (
  skillData: SkillData | null, 
  nutritionGoal: NutritionGoal = 'maintaining',
  activityLevel: ActivityLevel = 'moderate',
  sex: Sex = 'male'
): number => {
  if (!skillData) return 0;

  const scores = [
    calculatePhysicalAggregateScore(skillData),
    calculateMentalAggregateScore(skillData),
    calculateGoalBasedNutritionScore(skillData, nutritionGoal, activityLevel, sex), // Updated
    calculateTechnicalAggregateScore(skillData),
    calculateTacticalAggregateScore(skillData)
  ];
  
  // Include all categories in average calculation (0 is a valid score)
  const nonNullScores = scores.filter(score => score !== null && score !== undefined);
  if (nonNullScores.length === 0) return 0;

  const average = nonNullScores.reduce((a, b) => a + b, 0) / nonNullScores.length;
  // Scores are already 0-100, just ensure they're properly capped
  return Math.min(100, Math.max(0, Math.round(average)));
};

// DEPRECATED: Keep old function for backward compatibility
const calculateOverallProgressLegacy = (skillData: SkillData | null): number => {
  return calculateOverallProgress(skillData, 'maintaining', 'moderate', 'male');
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  // Ensure progress is capped between 0 and 100
  const cappedProgress = Math.min(100, Math.max(0, progress));
  
  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (cappedProgress / 100) * circumference;

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="filter drop-shadow-lg"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {cappedProgress}%
        </span>
      </motion.div>
    </div>
  );
};

// Aggregate Score Display Component
const AggregateScoreDisplay: React.FC<{
  category: SkillCategory;
  aggregateScore: number;
}> = ({ category, aggregateScore }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <motion.div 
      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div 
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getScoreColor(aggregateScore)} flex items-center justify-center shadow-lg`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-white font-bold text-lg">{aggregateScore}</span>
        </motion.div>
        <div>
          <p className="text-sm text-gray-600">Overall Score</p>
          <p className="font-semibold text-gray-900">
            {aggregateScore >= 80 ? 'Excellent' : 
             aggregateScore >= 60 ? 'Good' : 
             aggregateScore >= 40 ? 'Fair' : 'Needs Improvement'}
          </p>
        </div>
      </div>
      <motion.div 
        className="text-3xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        {aggregateScore >= 80 ? '🌟' : 
         aggregateScore >= 60 ? '⭐' : 
         aggregateScore >= 40 ? '💪' : '🎯'}
      </motion.div>
    </motion.div>
  );
};

// BMI calculation and nutrition recommendation functions
type NutritionData = {
  totalCalories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  bmi: number;
};

const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'yellow' };
  if (bmi < 25) return { category: 'Normal', color: 'green' };
  if (bmi < 30) return { category: 'Overweight', color: 'orange' };
  return { category: 'Obese', color: 'red' };
};

const calculatePersonalizedNutrition = (weight: number, height: number, age: number): NutritionData => {
  const bmi = calculateBMI(weight, height);
  const weightInLbs = weight * 2.20462; // Convert kg to lbs
  
  // Base calorie calculation using BMR (Basal Metabolic Rate)
  // Using Harris-Benedict equation simplified for athletes
  const baseCalories = age <= 18 
    ? Math.round(1500 + (weight * 15) + (height * 2)) // Growing athletes need more
    : Math.round(1200 + (weight * 12) + (height * 1.5)); // Adult maintenance
  
  // Protein: 0.75 * bodyweight in lbs as requested
  const proteinGrams = Math.round(weightInLbs * 0.75);
  
  // Carbs: 45-65% of total calories (using 55% as target)
  const carbCalories = baseCalories * 0.55;
  const carbGrams = Math.round(carbCalories / 4); // 4 calories per gram of carbs
  
  // Fats: 20-35% of total calories (using 25% as target)
  const fatCalories = baseCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram of fat
  
  return {
    totalCalories: baseCalories,
    protein: proteinGrams,
    carbohydrates: carbGrams,
    fats: fatGrams,
    bmi: Math.round(bmi * 10) / 10, // Round to 1 decimal place
  };
};

// Enhanced Skill comparison bar component (removed comparison for mental skills)
const SkillBar: React.FC<{
  skill: SkillItem;
  userScore?: number;
  averageScore?: number; // Made optional
  isEditing: boolean;
  onScoreChange: (skillId: string, value: number) => void;
  showComparison?: boolean; // New prop to control comparison display
  personalizedTarget?: number; // For nutrition values
  onClick?: () => void; // New prop for click handling
}> = ({ skill, userScore, averageScore, isEditing, onScoreChange, showComparison = true, personalizedTarget, onClick }) => {
  const score = userScore || 0;
  const average = averageScore || 0;

  const getSkillRange = () => {
    // Define specific ranges based on skill ID for proper scoring
    switch (skill.id) {
      // Physical Skills - Strength
      case "pushupScore":
        return { min: 0, max: 100, step: 1 };
      case "pullupScore":
        return { min: 0, max: 50, step: 1 };
      case "verticalJump":
        return { min: 0, max: 100, step: 1 }; // cm
      case "gripStrength":
        return { min: 0, max: 80, step: 1 }; // kg
      
      // Physical Skills - Speed & Agility  
      case "sprintTime":
        return { min: 8, max: 20, step: 0.01 }; // 100m sprint in seconds
      case "sprint50m":
        return { min: 4, max: 15, step: 0.01 }; // 50m sprint in seconds
      case "shuttleRun":
        return { min: 8, max: 25, step: 0.1 }; // shuttle run in seconds
      
      // Physical Skills - Endurance
      case "run5kTime":
        return { min: 15, max: 60, step: 0.01 }; // 5K in minutes
      case "yoyoTest":
        return { min: 1, max: 25, step: 0.1 }; // yo-yo test level
      
      // Mental Skills
      case "moodScore":
      case "sleepScore":
        return { min: 1, max: 10, step: 0.1 };
      
      // Nutrition Skills
      case "totalCalories":
        return { min: 0, max: 5000, step: 10 };
      case "protein":
          return { min: 0, max: 200, step: 1 };
      case "carbohydrates":
          return { min: 0, max: 500, step: 1 };
      case "fats":
          return { min: 0, max: 150, step: 1 };
      case "waterIntake":
        return { min: 0, max: 5, step: 0.1 }; // liters
      
      // Technical Skills - All are scored 0-10
      case "battingGrip":
      case "battingStance":
      case "battingBalance":
      case "cockingOfWrist":
      case "backLift":
      case "topHandDominance":
      case "highElbow":
      case "runningBetweenWickets":
      case "calling":
      case "bowlingGrip":
      case "runUp":
      case "backFootLanding":
      case "frontFootLanding":
      case "hipDrive":
      case "backFootDrag":
      case "nonBowlingArm":
      case "release":
      case "followThrough":
      case "positioningOfBall":
      case "pickUp":
      case "aim":
      case "throw":
      case "softHands":
      case "receiving":
      case "highCatch":
      case "flatCatch":
        return { min: 0, max: 10, step: 0.1 };
      
      // Default fallback
      default:
        if (skill.type === "time") {
          return { min: 0, max: 60, step: 0.1 };
        } else if (skill.type === "count") {
        return { min: 0, max: 100, step: 1 };
        } else {
          return { min: 0, max: 10, step: 0.1 };
        }
    }
  };

  const range = getSkillRange();
  
  const getPercentage = () => {
      if (score === 0) return 0;
    
    // For nutrition skills with personalized targets, use realistic scoring
    if (personalizedTarget && personalizedTarget > 0 && 
        (skill.id === "totalCalories" || skill.id === "protein" || skill.id === "carbohydrates" || 
         skill.id === "fats" || skill.id === "waterIntake")) {
      
      // Use the realistic scoring curve: score = 100 * e^(-1.5 * deviation)
      const deviation = Math.abs(score - personalizedTarget) / personalizedTarget;
      const realisticScore = 100 * Math.exp(-1.5 * deviation);
      return Math.max(0, Math.min(100, realisticScore));
    }
    
    // Time-based skills: lower is better
    if (skill.type === "time" || skill.id === "sprintTime" || skill.id === "sprint50m" || skill.id === "shuttleRun" || skill.id === "run5kTime") {
      // For time skills, lower values are better - invert the percentage
      const percentage = ((range.max - score) / (range.max - range.min)) * 100;
      return Math.max(0, Math.min(100, percentage));
    } 
    // All other skills: higher is better
    else {
      const percentage = ((score - range.min) / (range.max - range.min)) * 100;
      return Math.max(0, Math.min(100, percentage));
    }
  };

  const getAveragePercentage = () => {
    if (!showComparison || !average) return 0;
      if (average === 0) return 0;
    
    // Time-based skills: lower is better
    if (skill.type === "time" || skill.id === "sprintTime" || skill.id === "sprint50m" || skill.id === "shuttleRun" || skill.id === "run5kTime") {
      // For time skills, lower values are better - invert the percentage
      const percentage = ((range.max - average) / (range.max - range.min)) * 100;
      return Math.max(0, Math.min(100, percentage));
    } 
    // All other skills: higher is better
    else {
      const percentage = ((average - range.min) / (range.max - range.min)) * 100;
      return Math.max(0, Math.min(100, percentage));
    }
  };

  const getProgressColor = () => {
  const percentage = getPercentage();
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 60) return "bg-yellow-600";
    if (percentage >= 40) return "bg-orange-600";
    return "bg-red-600";
  };

  const formatValue = (value: number) => {
    // Format values based on specific skill ID for correct units
    switch (skill.id) {
      // Physical Skills - Strength
      case "pushupScore":
      case "pullupScore":
        return `${Math.round(value)} reps`;
      case "verticalJump":
        return `${Math.round(value)} cm`;
      case "gripStrength":
        return `${Math.round(value)} kg`;
      
      // Physical Skills - Speed & Agility
      case "sprintTime":
        return `${value.toFixed(2)}s`;
      case "sprint50m":
        return `${value.toFixed(2)}s`; // seconds, not minutes
      case "shuttleRun":
        return `${value.toFixed(1)}s`;
      
      // Physical Skills - Endurance
      case "run5kTime":
        return `${value.toFixed(2)} min`;
      case "yoyoTest":
        return `Level ${value.toFixed(1)}`;
      
      // Mental Skills
      case "moodScore":
      case "sleepScore":
        return `${value.toFixed(1)}/10`;
      
      // Nutrition Skills
      case "totalCalories":
        return `${Math.round(value)} kcal`;
      case "protein":
      case "carbohydrates":
      case "fats":
        return `${Math.round(value)}g`;
      case "waterIntake":
        return `${value.toFixed(1)}L`;
      
      // Technical Skills - All scored 0-10
      case "battingGrip":
      case "battingStance":
      case "battingBalance":
      case "cockingOfWrist":
      case "backLift":
      case "topHandDominance":
      case "highElbow":
      case "runningBetweenWickets":
      case "calling":
      case "bowlingGrip":
      case "runUp":
      case "backFootLanding":
      case "frontFootLanding":
      case "hipDrive":
      case "backFootDrag":
      case "nonBowlingArm":
      case "release":
      case "followThrough":
      case "positioningOfBall":
      case "pickUp":
      case "aim":
      case "throw":
      case "softHands":
      case "receiving":
      case "highCatch":
      case "flatCatch":
        return `${value.toFixed(1)}/10`;
      
      // Default fallback based on type
      default:
        if (skill.type === "time") {
          return `${value.toFixed(1)}s`;
        } else if (skill.type === "count") {
          return `${Math.round(value)} reps`;
        } else if (skill.type === "score") {
          return `${value.toFixed(1)}/10`;
        } else if (skill.type === "grams") {
          return `${Math.round(value)}g`;
        } else if (skill.type === "calories") {
          return `${Math.round(value)} kcal`;
        } else {
        return value.toString();
        }
    }
  };

  const getInputType = () => {
    // Use number input for all types but with appropriate attributes
    return "number";
  };

  const getPlaceholder = () => {
    switch (skill.id) {
      // Physical Skills - Strength
      case "pushupScore":
        return "e.g., 25";
      case "pullupScore":
        return "e.g., 8";
      case "verticalJump":
        return "e.g., 45";
      case "gripStrength":
        return "e.g., 40";
      
      // Physical Skills - Speed & Agility
      case "sprintTime":
          return "e.g., 12.50";
      case "sprint50m":
        return "e.g., 7.20";
      case "shuttleRun":
        return "e.g., 15.5";
      
      // Physical Skills - Endurance
      case "run5kTime":
          return "e.g., 25.30";
      case "yoyoTest":
        return "e.g., 12.5";
      
      // Mental Skills
      case "moodScore":
      case "sleepScore":
        return "e.g., 7.5";
      
      // Nutrition Skills
      case "totalCalories":
        return "e.g., 2500";
      case "protein":
        return "e.g., 120";
      case "carbohydrates":
        return "e.g., 300";
      case "fats":
        return "e.g., 80";
      case "waterIntake":
        return "e.g., 3.5";
      
      // Technical Skills - All scored 0-10
      case "battingGrip":
      case "battingStance":
      case "battingBalance":
      case "cockingOfWrist":
      case "backLift":
      case "topHandDominance":
      case "highElbow":
      case "runningBetweenWickets":
      case "calling":
      case "bowlingGrip":
      case "runUp":
      case "backFootLanding":
      case "frontFootLanding":
      case "hipDrive":
      case "backFootDrag":
      case "nonBowlingArm":
      case "release":
      case "followThrough":
      case "positioningOfBall":
      case "pickUp":
      case "aim":
      case "throw":
      case "softHands":
      case "receiving":
      case "highCatch":
      case "flatCatch":
        return "e.g., 7.5";
      
      default:
        return "0";
    }
  };

  const isValidInput = (value: number) => {
    return value >= range.min && value <= range.max && !isNaN(value);
  };

  return (
    <div 
      className={`bg-${skill.colorScheme.background} rounded-xl p-4 sm:p-6 border-2 shadow-sm transition-all duration-200 ${
        isEditing 
          ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50' 
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className={`p-2.5 sm:p-3 rounded-xl ${skill.colorScheme.background} shadow-sm flex-shrink-0`}>
            {skill.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-0.5 sm:mb-1 truncate">{skill.name}</h4>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2">{skill.description}</p>
        </div>
      </div>
        <div className="text-right ml-3 sm:ml-4 flex-shrink-0">
      {isEditing ? (
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
          <input
                type={getInputType()}
                  value={score || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) || e.target.value === '') {
                      onScoreChange(skill.id, value || 0);
                    }
                  }}
            min={range.min}
            max={range.max}
            step={range.step}
                  placeholder={getPlaceholder()}
                  className={`w-24 sm:w-28 px-3 py-3 text-base font-semibold border-2 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 ${
                    isValidInput(score) ? 'border-blue-300' : 'border-red-300'
                  }`}
                  inputMode="decimal"
                  autoComplete="off"
                />
                <span className="text-sm font-medium text-gray-600 min-w-0">{skill.unit}</span>
        </div>
              {/* Validation feedback */}
              <div className="text-xs text-center">
                {score < range.min && score !== 0 && (
                  <span className="text-red-500 font-medium">Min: {range.min}</span>
                )}
                {score > range.max && (
                  <span className="text-red-500 font-medium">Max: {range.max}</span>
                )}
                {isValidInput(score) && score > 0 && (
                  <span className="text-green-600 font-medium flex items-center justify-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Valid
              </span>
            )}
        </div>
          </div>
      ) : (
        <>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {formatValue(score)}
        </div>
              {showComparison && (
                <div className="text-xs sm:text-sm text-gray-700">
                  Avg: {formatValue(average)}
        </div>
              )}
            </>
            )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-800">Progress</span>
          <span className="text-sm text-gray-700">{Math.round(getPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 sm:h-3">
          <div
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(getPercentage(), 100)}%` }}
          />
          </div>
        </div>

      {/* Enhanced validation feedback for editing with tips */}
      {isEditing && (
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-700">
              Valid Range: {range.min} - {range.max} {skill.unit}
            </p>
            {personalizedTarget && (
              <p className="text-xs text-blue-600 font-medium">
                Target: {formatValue(personalizedTarget)}
              </p>
          )}
    </div>
          
          {/* Tips for different skill types */}
          <div className="text-xs text-gray-600">
            {skill.id === "sprintTime" && (
              <p className="italic">💡 Elite: 8-10s, Good: 10-12s, Average: 12-15s</p>
            )}
            {skill.id === "sprint50m" && (
              <p className="italic">💡 Elite: 4-6s, Good: 6-8s, Average: 8-12s</p>
            )}
            {skill.id === "run5kTime" && (
              <p className="italic">💡 Elite: 15-20min, Good: 20-30min, Average: 30-45min</p>
            )}
            {skill.id === "pushupScore" && (
              <p className="italic">💡 Good: 30+, Average: 15-25, Beginner: 5-15</p>
            )}
            {skill.id === "pullupScore" && (
              <p className="italic">💡 Good: 15+, Average: 5-10, Beginner: 1-5</p>
            )}
            {skill.id === "verticalJump" && (
              <p className="italic">💡 Elite: 70+ cm, Good: 50-70 cm, Average: 30-50 cm</p>
            )}
            {skill.id === "gripStrength" && (
              <p className="italic">💡 Good: 50+ kg, Average: 35-50 kg, Beginner: 20-35 kg</p>
            )}
            {skill.id === "yoyoTest" && (
              <p className="italic">💡 Elite: 20+ levels, Good: 15-20, Average: 10-15</p>
            )}
            {(skill.id === "moodScore" || skill.id === "sleepScore") && (
              <p className="italic">💡 Rate from 1-10 based on your daily experience</p>
            )}
          </div>
        </div>
          )}
    </div>
  );
};

// Category Card component for main grid
const CategoryCard: React.FC<{
  category: SkillCategory;
  onOpen: () => void;
  skillData: SkillData | null;
  nutritionGoal?: NutritionGoal;
  activityLevel?: ActivityLevel;
  sex?: Sex;
}> = ({ category, onOpen, skillData, nutritionGoal = 'maintaining', activityLevel = 'moderate', sex = 'male' }) => {
  const aggregateScore = calculateAggregateScore(category, skillData, nutritionGoal, activityLevel, sex);
  // Aggregate scores now return 0-100 directly, no need to multiply by 10
  const progress = Math.min(100, Math.max(0, Math.round(aggregateScore)));

  return (
    <motion.div
      onClick={onOpen}
      className="card-gradient card-modern p-6 cursor-pointer group"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div 
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.colorScheme.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-gray-900">{category.icon}</div>
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>
        <motion.div
          className="text-gray-400 group-hover:text-purple-600 transition-colors"
          whileHover={{ x: 5 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <motion.span 
            className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {progress}%
          </motion.span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${category.colorScheme.gradient} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </motion.div>
        </div>
      </div>
      
      {aggregateScore > 0 && (
        <motion.div
          className="mt-4 flex items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                className={`w-5 h-5 ${i < Math.round(aggregateScore / 2) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring", bounce: 0.5 }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// BMI and Nutrition Display Component
const BMICard: React.FC<{
  skillData: SkillData | null;
}> = ({ skillData }) => {
  if (!skillData?.student?.height || !skillData?.student?.weight) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-green-500 rounded-lg text-gray-800">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">BMI & Nutrition Analysis</h3>
            <p className="text-sm text-gray-600">Personalized nutrition recommendations</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Height and weight data required</p>
          <p className="text-sm text-gray-500">Complete your profile to see personalized nutrition recommendations</p>
        </div>
      </div>
    );
  }

  const { height, weight, age } = skillData.student;
  const personalizedNutrition = calculatePersonalizedNutrition(weight, height, age);
  const bmiCategory = getBMICategory(personalizedNutrition.bmi);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-green-500 rounded-lg text-gray-800">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">BMI & Nutrition Analysis</h3>
          <p className="text-sm text-gray-600">Personalized recommendations based on your body metrics</p>
        </div>
      </div>

      {/* BMI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <h4 className="font-medium text-gray-900 mb-2">Body Mass Index (BMI)</h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{personalizedNutrition.bmi}</div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                bmiCategory.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                bmiCategory.color === 'green' ? 'bg-green-100 text-green-800' :
                bmiCategory.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {bmiCategory.category}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>{height} cm</div>
              <div>{weight} kg</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
          <h4 className="font-medium text-gray-900 mb-2">Daily Calorie Target</h4>
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {personalizedNutrition.totalCalories}
            <span className="text-sm font-normal text-gray-600 ml-1">kcal</span>
          </div>
          <p className="text-xs text-gray-500">Based on age, height, weight & activity level</p>
        </div>
      </div>

      {/* Macronutrient Breakdown */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
        <h4 className="font-medium text-gray-900 mb-4">Recommended Daily Macronutrients</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{personalizedNutrition.protein}g</div>
            <div className="text-xs text-gray-600">Protein</div>
            <div className="text-xs text-gray-500">0.75 × body weight (lbs)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{personalizedNutrition.carbohydrates}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
            <div className="text-xs text-gray-500">55% of total calories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{personalizedNutrition.fats}g</div>
            <div className="text-xs text-gray-600">Fats</div>
            <div className="text-xs text-gray-500">25% of total calories</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 These recommendations are personalized based on your BMI and athletic needs
      </div>
    </div>
  );
};



const TechnicalSkillsComponent: React.FC<TechnicalSkillsProps> = ({ 
  skillData, 
  isEditing, 
  editedScores, 
  onScoreChange,
  averages 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const battingSkills = [
    { id: 'battingGrip', name: 'Grip', maxPoints: 10, description: 'Proper batting grip technique' },
    { id: 'battingStance', name: 'Stance', maxPoints: 10, description: 'Balanced batting stance' },
    { id: 'battingBalance', name: 'Balance', maxPoints: 10, description: 'Body balance during batting' },
    { id: 'cockingOfWrist', name: 'Cocking of Wrist', maxPoints: 10, description: 'Wrist positioning and movement' },
    { id: 'backLift', name: 'Back Lift', maxPoints: 10, description: 'Bat lifting technique' },
    { id: 'topHandDominance', name: 'Top Hand Dominance', maxPoints: 10, description: 'Top hand control and dominance' },
    { id: 'highElbow', name: 'High Elbow', maxPoints: 10, description: 'Elbow positioning during batting' },
    { id: 'runningBetweenWickets', name: 'Running Between Wickets', maxPoints: 10, description: 'Speed and coordination while running' },
    { id: 'calling', name: 'Calling', maxPoints: 10, description: 'Communication during runs' }
  ];

  const bowlingSkills = [
    { id: 'bowlingGrip', name: 'Grip', maxPoints: 10, description: 'Proper bowling grip' },
    { id: 'runUp', name: 'Run Up', maxPoints: 10, description: 'Bowling run-up consistency' },
    { id: 'backFootLanding', name: 'Back-foot Landing', maxPoints: 10, description: 'Back foot placement and landing' },
    { id: 'frontFootLanding', name: 'Front-foot Landing', maxPoints: 10, description: 'Front foot placement' },
    { id: 'hipDrive', name: 'Hip Drive', maxPoints: 10, description: 'Hip rotation and drive' },
    { id: 'backFootDrag', name: 'Back-foot Drag', maxPoints: 10, description: 'Back foot dragging technique' },
    { id: 'nonBowlingArm', name: 'Non-bowling Arm', maxPoints: 10, description: 'Non-bowling arm coordination' },
    { id: 'release', name: 'Release', maxPoints: 10, description: 'Ball release timing and technique' },
    { id: 'followThrough', name: 'Follow Through', maxPoints: 10, description: 'Follow through after release' }
  ];

  const fieldingSkills = [
    { id: 'positioningOfBall', name: 'Positioning of Ball', maxPoints: 10, description: 'Field positioning awareness' },
    { id: 'pickUp', name: 'Pick Up', maxPoints: 10, description: 'Ball pickup technique' },
    { id: 'aim', name: 'Aim', maxPoints: 10, description: 'Throwing accuracy' },
    { id: 'throw', name: 'Throw', maxPoints: 10, description: 'Throwing power and technique' },
    { id: 'softHands', name: 'Soft Hands', maxPoints: 10, description: 'Gentle ball handling' },
    { id: 'receiving', name: 'Receiving', maxPoints: 10, description: 'Ball receiving technique' },
    { id: 'highCatch', name: 'High Catch', maxPoints: 10, description: 'High ball catching ability' },
    { id: 'flatCatch', name: 'Flat Catch', maxPoints: 10, description: 'Low/flat ball catching ability' }
  ];

  const TechnicalSkillBar: React.FC<{
    skill: any;
    userScore: number;
    averageScore: number;
    isEditing: boolean;
    onScoreChange: (skillId: string, value: number) => void;
  }> = ({ skill, userScore, averageScore, isEditing, onScoreChange }) => {
    const normalizedUserScore = Math.min(10, Math.max(0, (userScore / skill.maxPoints) * 10));
    const normalizedAverageScore = Math.min(10, Math.max(0, (averageScore / skill.maxPoints) * 10));
    const userProgressPercentage = Math.min(100, Math.max(0, (normalizedUserScore / 10) * 100));
    const averageProgressPercentage = Math.min(100, Math.max(0, (normalizedAverageScore / 10) * 100));

    const getTechnicalProgressColor = () => {
      const percentage = userProgressPercentage;
      if (percentage >= 80) return "bg-green-600";
      if (percentage >= 60) return "bg-yellow-600";
      if (percentage >= 40) return "bg-orange-600";
      return "bg-red-600";
    };

    return (
      <div className={`bg-white rounded-lg p-3 sm:p-4 border-2 shadow-sm transition-all duration-200 ${
        isEditing 
          ? 'border-orange-300 ring-2 ring-orange-100 bg-orange-50' 
          : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{skill.name}</h4>
            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{skill.description}</p>
          </div>
          <div className="text-right ml-3 flex-shrink-0">
            <div className="text-base sm:text-lg font-bold text-orange-600">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  max={skill.maxPoints}
                  value={userScore}
                  onChange={(e) => onScoreChange(skill.id, parseInt(e.target.value) || 0)}
                    className="w-16 sm:w-20 px-2 py-1.5 text-sm font-semibold border-2 border-orange-300 rounded-lg text-center focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200"
                    inputMode="numeric"
                    autoComplete="off"
                />
                  <span className="text-xs text-gray-500">/{skill.maxPoints}</span>
                </div>
              ) : (
                <div>
                  <span>{userScore}</span>
                  <span className="text-xs text-gray-500 ml-1">/{skill.maxPoints}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Your Score</span>
            <span>Avg: {averageScore.toFixed(1)}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className={`${getTechnicalProgressColor()} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${userProgressPercentage}%` }}
              />
            </div>
            <div
              className="absolute top-0 h-2 w-0.5 bg-gray-500 rounded-full"
              style={{ left: `${averageProgressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Validation feedback for editing */}
        {isEditing && (
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Range: 0 - {skill.maxPoints}
            </p>
            <div className="flex items-center space-x-2">
              {userScore < 0 && (
                <span className="text-xs text-red-500 font-medium">Too low</span>
              )}
              {userScore > skill.maxPoints && (
                <span className="text-xs text-red-500 font-medium">Too high</span>
              )}
              {userScore >= 0 && userScore <= skill.maxPoints && userScore > 0 && (
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Valid
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const SectionCard: React.FC<{
    title: string;
    sectionId: string;
    skills: any[];
    icon: React.ReactNode;
    colorScheme: 'batting' | 'bowling' | 'fielding';
  }> = ({ title, sectionId, skills, icon, colorScheme }) => {
    const isExpanded = expandedSections.has(sectionId);
    const totalSkills = skills.length;
    const completedSkills = skills.filter(skill => {
      const score = skillData?.[skill.id as keyof SkillData] as number;
      return score && score > 0;
    }).length;

    // Define color schemes with hardcoded values
    const colorSchemes = {
      batting: {
        border: 'border-orange-200',
        background: 'bg-gradient-to-r from-orange-400 to-orange-500',
        hover: 'hover:from-orange-500 hover:to-orange-600',
        expanded: 'bg-gradient-to-br from-orange-50 to-orange-100'
      },
      bowling: {
        border: 'border-red-200',
        background: 'bg-gradient-to-r from-red-400 to-red-500',
        hover: 'hover:from-red-500 hover:to-red-600',
        expanded: 'bg-gradient-to-br from-red-50 to-red-100'
      },
      fielding: {
        border: 'border-green-200',
        background: 'bg-gradient-to-r from-green-400 to-green-500',
        hover: 'hover:from-green-500 hover:to-green-600',
        expanded: 'bg-gradient-to-br from-green-50 to-green-100'
      }
    };

    const colors = colorSchemes[colorScheme];

    return (
      <div className={`border-2 ${colors.border} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}>
        <div
          className={`${colors.background} ${colors.hover} p-4 cursor-pointer transition-all duration-200`}
          onClick={() => toggleSection(sectionId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {icon}
              </div>
              <div>
                            <h3 className="text-xl font-bold text-gray-800 drop-shadow-sm">{title}</h3>
            <p className="text-gray-700 text-sm font-medium">
                  {completedSkills}/{totalSkills} skills tracked
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {completedSkills > 0 && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
              <svg
                className={`w-6 h-6 text-gray-800 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className={`${colors.expanded} p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <TechnicalSkillBar
                  key={skill.id}
                  skill={skill}
                  userScore={
                    isEditing
                      ? editedScores[skill.id] 
                      : skillData?.[skill.id as keyof SkillData] as number
                  }
                  averageScore={averages?.averages?.[skill.id] || 0}
                  isEditing={isEditing}
                  onScoreChange={onScoreChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Batting"
        sectionId="batting"
        skills={battingSkills}
        colorScheme="batting"
        icon={<span className="text-xl">🏏</span>}
      />

      <SectionCard
        title="Bowling"
        sectionId="bowling"
        skills={bowlingSkills}
        colorScheme="bowling"
        icon={<span className="text-xl">🔴</span>}
      />

      <SectionCard
        title="Fielding"
        sectionId="fielding"
        skills={fieldingSkills}
        colorScheme="fielding"
        icon={<span className="text-xl">🏃</span>}
      />
    </div>
  );
};

export const calculateTechnicalAggregateScore = (skillData: SkillData | null): number => {
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

// Nutrition Tracker Component
const NutritionTracker: React.FC<{
  studentData: any;
  onGoalChange?: (goal: NutritionGoal) => void;
  onActivityLevelChange?: (level: ActivityLevel) => void;
  onSexChange?: (sex: Sex) => void;
  selectedGoal?: NutritionGoal;
  selectedActivityLevel?: ActivityLevel;
  selectedSex?: Sex;
}> = ({ 
  studentData, 
  onGoalChange, 
  onActivityLevelChange, 
  onSexChange,
  selectedGoal = 'maintaining',
  selectedActivityLevel = 'moderate',
  selectedSex = 'male'
}) => {
  const [showMissingData, setShowMissingData] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Check if we have required data
  const hasRequiredData = studentData?.weight && studentData?.height && studentData?.age;
  
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
  const calculateBMR = (weight: number, height: number, age: number, sex: Sex): number => {
    const baseCalc = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'male' ? baseCalc + 5 : baseCalc - 161;
  };

  // Calculate TDEE
  const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
    return bmr * activityMultipliers[activityLevel];
  };

  // Calculate nutrition targets
  const calculateNutritionTargets = (): NutritionTargets | null => {
    if (!hasRequiredData) return null;

    const weight = studentData.weight;
    const height = studentData.height;
    const age = studentData.age;

    const bmr = calculateBMR(weight, height, age, selectedSex);
    const tdee = calculateTDEE(bmr, selectedActivityLevel);

    // Adjust calories based on goal
    let targetCalories = tdee;
    if (selectedGoal === 'bulking') targetCalories *= 1.15;
    else if (selectedGoal === 'cutting') targetCalories *= 0.85;

    const macros = macroSplits[selectedGoal];
    
    // Calculate macronutrients
    const protein = macros.protein * weight;
    const carbs = macros.carbs * weight;
    
    // Calculate fats (remaining calories after protein and carbs)
    const proteinCalories = protein * 4;
    const carbCalories = carbs * 4;
    const fatCalories = targetCalories * (macros.fatPercent / 100);
    const fats = fatCalories / 9;

    // Water intake: base formula + extra for intense training
    const baseWater = weight * 0.035;
    const water = selectedActivityLevel === 'intense' || selectedActivityLevel === 'very_intense' 
      ? baseWater + 0.5 
      : baseWater;

    return {
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      water: Math.round(water * 10) / 10 // Round to 1 decimal
    };
  };

  const targets = calculateNutritionTargets();

  // Macro tooltips
  const macroTooltips: Record<string, MacroTooltip> = {
    calories: {
      name: "Calories",
      purpose: "Total energy for daily activities and training",
      importance: "Proper calorie intake fuels performance and supports your body composition goals"
    },
    protein: {
      name: "Protein",
      purpose: "Muscle building, repair, and recovery",
      importance: "Essential for strength gains, injury prevention, and optimal body composition"
    },
    carbs: {
      name: "Carbohydrates", 
      purpose: "Primary fuel for high-intensity training",
      importance: "Powers explosive movements, batting, bowling, and sustained energy during matches"
    },
    fats: {
      name: "Fats",
      purpose: "Hormone production and sustained energy",
      importance: "Supports testosterone, growth hormone, and long-term endurance capacity"
    },
    water: {
      name: "Water",
      purpose: "Hydration and optimal body function",
      importance: "Critical for performance, temperature regulation, and preventing fatigue"
    }
  };

  const goalOptions = [
    { 
      id: 'bulking' as NutritionGoal, 
      label: 'Bulking', 
      icon: '🏋️', 
      description: 'Build muscle mass',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'maintaining' as NutritionGoal, 
      label: 'Maintaining', 
      icon: '⚖️', 
      description: 'Maintain current weight',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'cutting' as NutritionGoal, 
      label: 'Cutting', 
      icon: '🏃', 
      description: 'Reduce body fat',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const handleGoalChange = (goal: NutritionGoal) => {
    onGoalChange?.(goal);
  };

  const handleActivityLevelChange = (level: ActivityLevel) => {
    onActivityLevelChange?.(level);
  };

  const handleSexChange = (sex: Sex) => {
    onSexChange?.(sex);
  };

  // Missing data component
  if (!hasRequiredData) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <FiInfo className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">Complete Your Profile</h3>
            <p className="text-xs text-yellow-700 mb-3">
              To get personalized nutrition targets, please update your profile with:
            </p>
            <div className="flex flex-wrap gap-2">
              {!studentData?.age && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">Age</span>
              )}
              {!studentData?.weight && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">Weight</span>
              )}
              {!studentData?.height && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">Height</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FiTarget className="w-5 h-5 text-green-600" />
          <h3 className="text-sm font-bold text-green-800">Nutrition Targets</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMissingData(!showMissingData)}
          className="text-xs text-green-600 hover:text-green-700"
        >
          Settings
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showMissingData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-lg p-3 mb-4 border border-green-200"
          >
            {/* Activity Level */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-700 mb-1 block">Activity Level</label>
              <select
                value={selectedActivityLevel}
                onChange={(e) => handleActivityLevelChange(e.target.value as ActivityLevel)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="sedentary">Sedentary (desk job, no exercise)</option>
                <option value="light">Light (light exercise 1-3 days/week)</option>
                <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                <option value="intense">Intense (hard exercise 6-7 days/week)</option>
                <option value="very_intense">Very Intense (2x/day or intense training)</option>
              </select>
            </div>

            {/* Sex */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Sex</label>
              <div className="flex space-x-2">
                {['male', 'female'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSexChange(option as Sex)}
                    className={`flex-1 py-2 px-3 text-xs rounded-md transition-colors ${
                      selectedSex === option
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Selection */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {goalOptions.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGoalChange(option.id)}
            className={`p-2 rounded-lg border-2 transition-all ${
              selectedGoal === option.id
                ? 'border-green-400 bg-white shadow-md'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="text-lg mb-1">{option.icon}</div>
            <div className="text-xs font-medium text-green-800">{option.label}</div>
            <div className="text-xs text-green-600">{option.description}</div>
          </motion.button>
        ))}
      </div>

      {/* Targets Display */}
      {targets && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {/* Calories */}
          <motion.div
            onHoverStart={() => setActiveTooltip('calories')}
            onHoverEnd={() => setActiveTooltip(null)}
            className="relative bg-white rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <FiZap className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500">kcal</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{targets.calories}</div>
            <div className="text-xs text-gray-600">Calories</div>
            
            {activeTooltip === 'calories' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10"
              >
                <div className="font-medium mb-1">{macroTooltips.calories.name}</div>
                <div>{macroTooltips.calories.importance}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </motion.div>

          {/* Protein */}
          <motion.div
            onHoverStart={() => setActiveTooltip('protein')}
            onHoverEnd={() => setActiveTooltip(null)}
            className="relative bg-white rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-500">g</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{targets.protein}</div>
            <div className="text-xs text-gray-600">Protein</div>
            
            {activeTooltip === 'protein' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10"
              >
                <div className="font-medium mb-1">{macroTooltips.protein.name}</div>
                <div>{macroTooltips.protein.importance}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </motion.div>

          {/* Carbs */}
          <motion.div
            onHoverStart={() => setActiveTooltip('carbs')}
            onHoverEnd={() => setActiveTooltip(null)}
            className="relative bg-white rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-500">g</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{targets.carbs}</div>
            <div className="text-xs text-gray-600">Carbs</div>
            
            {activeTooltip === 'carbs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10"
              >
                <div className="font-medium mb-1">{macroTooltips.carbs.name}</div>
                <div>{macroTooltips.carbs.importance}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </motion.div>

          {/* Fats */}
          <motion.div
            onHoverStart={() => setActiveTooltip('fats')}
            onHoverEnd={() => setActiveTooltip(null)}
            className="relative bg-white rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-500">g</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{targets.fats}</div>
            <div className="text-xs text-gray-600">Fats</div>
            
            {activeTooltip === 'fats' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10"
              >
                <div className="font-medium mb-1">{macroTooltips.fats.name}</div>
                <div>{macroTooltips.fats.importance}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </motion.div>

          {/* Water */}
          <motion.div
            onHoverStart={() => setActiveTooltip('water')}
            onHoverEnd={() => setActiveTooltip(null)}
            className="relative bg-white rounded-lg p-3 border border-green-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1">
              <FiDroplet className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">L</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{targets.water}</div>
            <div className="text-xs text-gray-600">Water</div>
            
            {activeTooltip === 'water' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 z-10"
              >
                <div className="font-medium mb-1">{macroTooltips.water.name}</div>
                <div>{macroTooltips.water.importance}</div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-900"></div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
        <div className="text-xs text-green-800 font-medium mb-1">🏏 Cricket Nutrition Tip</div>
        <div className="text-xs text-green-700">
          {selectedGoal === 'bulking' && "Focus on post-training meals with protein + carbs for muscle growth and recovery."}
          {selectedGoal === 'maintaining' && "Balance your plate: lean protein, complex carbs, and healthy fats for sustained performance."}
          {selectedGoal === 'cutting' && "Prioritize protein to maintain muscle while creating a calorie deficit for fat loss."}
        </div>
      </div>
    </div>
  );
};

export default function SkillSnap({
  studentId,
  isCoachView = false,
  onSkillsUpdated,
  onModalChange // Add this new prop
}: SkillSnapProps) {
  const { data: session } = useSession();
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [averages, setAverages] = useState<SkillAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPhysicalLearnMore, setShowPhysicalLearnMore] = useState(false);

  // NEW: Nutrition goal state for enhanced scoring
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal>('maintaining');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [sex, setSex] = useState<Sex>('male');

  const canEdit = !isCoachView || (isCoachView && (session as any)?.user?.role === 'COACH');

  // Refresh function to reload skill data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await fetchSkillData();
      // Also refresh averages if we have age data
      if (skillData?.student?.age) {
        await fetchAverages(skillData.student.age);
      }
      // Call the callback if provided
      if (onSkillsUpdated) {
        onSkillsUpdated();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add effect to manage body scroll when modals are open
  useEffect(() => {
    if (selectedCategory) {
      // Prevent background scroll when modal is open
      lockBodyScroll();
    } else {
      // Restore background scroll when modal is closed
      unlockBodyScroll();
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      unlockBodyScroll();
    };
  }, [selectedCategory]);

  // Prevent scroll restoration on page navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      unlockBodyScroll();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unlockBodyScroll();
    };
  }, []);

  useEffect(() => {
    fetchSkillData();
  }, [studentId]);

  useEffect(() => {
    if (skillData?.student?.age) {
      fetchAverages(skillData.student.age);
    }
  }, [skillData]);

  const fetchSkillData = async () => {
    try {
      setLoading(true);
      const params = studentId ? `?studentId=${studentId}` : "";
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`/api/skills${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setSkillData(data);
        if (data) {
          // Initialize all possible scores including technical skills
          const allSkills = skillCategories.flatMap(cat => cat.skills);
          const scores: Record<string, number> = {};
          
          // Initialize regular category skills
          allSkills.forEach(skill => {
            scores[skill.id] = data[skill.id] || 0;
          });
          
          // Initialize technical skills
          const technicalSkillIds = [
            'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
            'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
            'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
            'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
            'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
          ];
          
          technicalSkillIds.forEach(skillId => {
            scores[skillId] = data[skillId] || 0;
          });
          
          setEditedScores(scores);
        }
      } else if (response.status === 404) {
        // No skills data yet, that's okay
        setSkillData(null);
        setEditedScores({});
      } else {
        console.error("Failed to fetch skill data:", response.status);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Request timeout - please check your connection");
      } else {
      console.error("Error fetching skill data:", error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAverages = async (age: number) => {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`/api/skills/analytics?age=${age}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAverages(data);
      } else {
        console.error("Failed to fetch averages:", response.status);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Averages request timeout");
      } else {
      console.error("Error fetching averages:", error);
      }
      // Don't clear existing averages on error
    }
  };

  const handleScoreChange = (skillId: string, value: number) => {
    setEditedScores(prev => ({
      ...prev,
      [skillId]: value,
    }));
  };

  const handleStartEdit = (categoryId: string) => {
    // Initialize editedScores with current values when starting to edit
    if (categoryId === "TECHNIQUE") {
      const technicalSkillIds = [
        'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
        'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
        'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
        'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
        'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
      ];
      
      const technicalScores: Record<string, number> = {};
      technicalSkillIds.forEach(skillId => {
        technicalScores[skillId] = skillData?.[skillId as keyof SkillData] as number || 0;
      });
      
      setEditedScores(prev => ({ ...prev, ...technicalScores }));
    } else {
      // For other categories
      const categorySkills = skillCategories.find(cat => cat.id === categoryId)?.skills || [];
      const categoryScores: Record<string, number> = {};
      categorySkills.forEach(skill => {
        categoryScores[skill.id] = skillData?.[skill.id as keyof SkillData] as number || 0;
      });
      
      setEditedScores(prev => ({ ...prev, ...categoryScores }));
    }
    
    setIsEditing(categoryId);
  };

  const handleSave = async (categoryId: string) => {
      setIsSaving(true);
    try {
      // Only include non-zero scores and valid ranges for each skill type
      const validScores: Record<string, number> = {};
      
      if (categoryId === "TECHNIQUE") {
        // Special handling for technical skills - validate all 26 technical skills
        const technicalSkillIds = [
          // Batting skills (9)
          'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
          'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
          // Bowling skills (9)
          'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
          'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
          // Fielding skills (8)
          'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
        ];
        
        for (const [skillId, score] of Object.entries(editedScores)) {
          if (technicalSkillIds.includes(skillId) && score > 0) {
            // All technical skills are scored 0-10
            if (score >= 0 && score <= 10) {
              validScores[skillId] = score;
            }
          }
        }
      } else {
        // Regular handling for other categories
      const category = skillCategories.find(cat => cat.id === categoryId);
      
      for (const [skillId, score] of Object.entries(editedScores)) {
        const skill = category?.skills.find(s => s.id === skillId);
        if (skill && score > 0) {
          const range = getSkillRange(skill);
          if (score >= range.min && score <= range.max) {
            validScores[skillId] = score;
            }
          }
        }
      }

      if (Object.keys(validScores).length === 0) {
        alert("Please enter at least one valid score before saving.");
        setIsSaving(false);
        return;
      }

      const endpoint = studentId 
        ? `/api/skills?studentId=${studentId}` 
        : "/api/skills";

      const requestBody = {
        ...validScores,
        ...(studentId && { studentId })
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to save skills");
      }

      // Refresh skill data to get the latest values
      await fetchSkillData();
        setIsEditing(null);
      setEditedScores({});
        onSkillsUpdated?.();
        
      // Show success feedback
      const savedCount = Object.keys(validScores).length;
      alert(`✅ Successfully saved ${savedCount} skill${savedCount !== 1 ? 's' : ''}!`);
      
    } catch (error) {
      console.error("Failed to save skills:", error);
      alert("❌ Failed to save skills. Please check your internet connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get skill range for validation
  const getSkillRange = (skill: SkillItem) => {
    // Define specific ranges based on skill ID for proper scoring
    switch (skill.id) {
      // Physical Skills - Strength
      case "pushupScore":
        return { min: 0, max: 100, step: 1 };
      case "pullupScore":
        return { min: 0, max: 50, step: 1 };
      case "verticalJump":
        return { min: 0, max: 100, step: 1 }; // cm
      case "gripStrength":
        return { min: 0, max: 80, step: 1 }; // kg
      
      // Physical Skills - Speed & Agility  
      case "sprintTime":
        return { min: 8, max: 20, step: 0.01 }; // 100m sprint in seconds
      case "sprint50m":
        return { min: 4, max: 15, step: 0.01 }; // 50m sprint in seconds
      case "shuttleRun":
        return { min: 8, max: 25, step: 0.1 }; // shuttle run in seconds
      
      // Physical Skills - Endurance
      case "run5kTime":
        return { min: 15, max: 60, step: 0.01 }; // 5K in minutes
      case "yoyoTest":
        return { min: 1, max: 25, step: 0.1 }; // yo-yo test level
      
      // Mental Skills
      case "moodScore":
      case "sleepScore":
        return { min: 1, max: 10, step: 0.1 };
      
      // Nutrition Skills
      case "totalCalories":
        return { min: 0, max: 5000, step: 10 };
      case "protein":
          return { min: 0, max: 200, step: 1 };
      case "carbohydrates":
          return { min: 0, max: 500, step: 1 };
      case "fats":
          return { min: 0, max: 150, step: 1 };
      case "waterIntake":
        return { min: 0, max: 5, step: 0.1 }; // liters
      
      // Technical Skills - All are scored 0-10
      case "battingGrip":
      case "battingStance":
      case "battingBalance":
      case "cockingOfWrist":
      case "backLift":
      case "topHandDominance":
      case "highElbow":
      case "runningBetweenWickets":
      case "calling":
      case "bowlingGrip":
      case "runUp":
      case "backFootLanding":
      case "frontFootLanding":
      case "hipDrive":
      case "backFootDrag":
      case "nonBowlingArm":
      case "release":
      case "followThrough":
      case "positioningOfBall":
      case "pickUp":
      case "aim":
      case "throw":
      case "softHands":
      case "receiving":
      case "highCatch":
      case "flatCatch":
        return { min: 0, max: 10, step: 0.1 };
      
      // Default fallback
      default:
        if (skill.type === "time") {
          return { min: 0, max: 60, step: 0.1 };
        } else if (skill.type === "count") {
        return { min: 0, max: 100, step: 1 };
        } else {
          return { min: 0, max: 10, step: 0.1 };
        }
    }
  };

  const handleCancel = (categoryId: string) => {
    let resetScores: Record<string, number> = {};
    
    if (categoryId === "TECHNIQUE") {
      // For TECHNIQUE category, reset all technical skills directly
      const technicalSkillIds = [
        'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
        'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
        'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
        'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
        'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
      ];
      
      technicalSkillIds.forEach(skillId => {
        resetScores[skillId] = skillData?.[skillId as keyof SkillData] as number || 0;
      });
    } else {
      // For other categories, use the skills from the category definition
      const categorySkills = skillCategories.find(cat => cat.id === categoryId)?.skills || [];
      categorySkills.forEach(skill => {
        resetScores[skill.id] = skillData?.[skill.id as keyof SkillData] as number || 0;
      });
    }
    
    setEditedScores(prev => ({ ...prev, ...resetScores }));
    setIsEditing(null);
    setSelectedCategory(null);
  };

  const openCategoryModal = (category: SkillCategory) => {
    setSelectedCategory(category);
    
    // Lock body scroll when modal opens
    lockBodyScroll();
    // Notify parent component
    onModalChange?.(true);
  };

  const closeModal = () => {
    // First, reset any ongoing edits
    if (isEditing) {
      setIsEditing(null);
      // Reset edited scores without calling handleCancel to avoid duplicate state updates
      const resetScores: Record<string, number> = {};
      if (isEditing === "TECHNIQUE") {
        const technicalSkillIds = [
          'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
          'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
          'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
          'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
          'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
        ];
        technicalSkillIds.forEach(skillId => {
          resetScores[skillId] = skillData?.[skillId as keyof SkillData] as number || 0;
        });
      } else {
        const categorySkills = skillCategories.find(cat => cat.id === isEditing)?.skills || [];
        categorySkills.forEach(skill => {
          resetScores[skill.id] = skillData?.[skill.id as keyof SkillData] as number || 0;
        });
      }
      setEditedScores(prev => ({ ...prev, ...resetScores }));
    }
    
    // Close the modal by clearing selected category
    setSelectedCategory(null);
    
    // Unlock body scroll when modal closes
    unlockBodyScroll();
    
    // Notify parent component
    onModalChange?.(false);
  };

  const renderTechnicalSkills = () => {
    return (
      <TechnicalSkillsComponent
        skillData={skillData}
        isEditing={isEditing === "TECHNIQUE"}
        editedScores={editedScores}
        onScoreChange={handleScoreChange}
        averages={averages}
      />
    );
  };

  const renderSkillsForCategory = (category: SkillCategory) => {
    if (category.id === "TECHNIQUE") {
      return (
        <div className="pb-16">
          {renderTechnicalSkills()}
        </div>
      );
    }

    // Special handling for Physical category with grouped skills
    if (category.id === "PHYSICAL") {
      // Define skill groups for Physical category
      const strengthSkills = category.skills.filter(skill => 
        ['pushupScore', 'verticalJump', 'gripStrength'].includes(skill.id)
      );
      const speedAgilitySkills = category.skills.filter(skill => 
        ['sprint50m', 'shuttleRun'].includes(skill.id)
      );
      const enduranceSkills = category.skills.filter(skill => 
        ['run5kTime', 'yoyoTest'].includes(skill.id)
      );

      const renderSkillGroup = (skills: SkillItem[], title: string, icon: React.ReactNode) => (
        <div className="mb-8">
          {/* Group Header */}
          <div className="flex items-center space-x-3 mb-4 pb-2 border-b border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-500">({skills.length} skills)</div>
          </div>
          
          {/* Skills in Group */}
          <div className="space-y-4">
            {skills.map((skill) => (
              <SkillBar
                key={skill.id}
                skill={skill}
                userScore={
                  isEditing === category.id
                    ? editedScores[skill.id] 
                    : skillData?.[skill.id as keyof SkillData] as number
                }
                averageScore={averages?.averages?.[skill.id] || 0}
                isEditing={isEditing === category.id}
                onScoreChange={handleScoreChange}
                showComparison={category.id !== "MENTAL" && category.id !== "NUTRITION"}
              />
            ))}
          </div>
        </div>
      );

      return (
        <div className="pb-16">
          {/* Strength Section */}
          {renderSkillGroup(
            strengthSkills, 
            "Strength", 
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )}

          {/* Speed & Agility Section */}
          {renderSkillGroup(
            speedAgilitySkills, 
            "Speed & Agility", 
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          )}

          {/* Endurance Section */}
          {renderSkillGroup(
            enduranceSkills, 
            "Endurance", 
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              <circle cx="12" cy="12" r="9" strokeWidth="1"/>
            </svg>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-16">
        {/* Add Nutrition Tracker for NUTRITION category */}
        {category.id === "NUTRITION" && (
          <NutritionTracker 
            studentData={skillData?.student} 
            onGoalChange={handleNutritionGoalChange}
            onActivityLevelChange={handleActivityLevelChange}
            onSexChange={handleSexChange}
            selectedGoal={nutritionGoal}
            selectedActivityLevel={activityLevel}
            selectedSex={sex}
          />
        )}
        
        {category.skills.map((skill) => (
          <SkillBar
            key={skill.id}
            skill={skill}
            userScore={
              isEditing === category.id
                ? editedScores[skill.id] 
                : skillData?.[skill.id as keyof SkillData] as number
            }
            averageScore={averages?.averages?.[skill.id] || 0}
            isEditing={isEditing === category.id}
            onScoreChange={handleScoreChange}
            showComparison={category.id !== "MENTAL" && category.id !== "NUTRITION"}
            personalizedTarget={
              category.id === "NUTRITION" && skillData?.student?.height && skillData?.student?.weight
                ? (() => {
                    const targets = calculateGoalBasedNutritionTargets(
                      skillData.student.weight,
                      skillData.student.height,
                      skillData.student.age,
                      nutritionGoal,
                      activityLevel,
                      sex
                    );
                    // Map skill IDs to target values
                    switch (skill.id) {
                      case "totalCalories":
                        return targets.calories;
                      case "protein":
                        return targets.protein;
                      case "carbohydrates":
                        return targets.carbs;
                      case "fats":
                        return targets.fats;
                      case "waterIntake":
                        return targets.water;
                      default:
                        return undefined;
                    }
                  })()
                : undefined
            }
            // Remove onClick prop - no more individual skill modals
          />
        ))}
      </div>
    );
  };

  // UPDATED: Helper function to calculate overall progress percentage with goal-based nutrition
  const calculateOverallProgressWithGoals = (skillData: SkillData | null): number => {
    if (!skillData) return 0;

    const scores = [
      calculatePhysicalAggregateScore(skillData),
      calculateMentalAggregateScore(skillData),
      calculateGoalBasedNutritionScore(skillData, nutritionGoal, activityLevel, sex), // Updated
      calculateTechnicalAggregateScore(skillData),
      calculateTacticalAggregateScore(skillData)
    ];
    
    // Include all categories in average calculation (0 is a valid score)
    const nonNullScores = scores.filter(score => score !== null && score !== undefined);
    if (nonNullScores.length === 0) return 0;

    const average = nonNullScores.reduce((a, b) => a + b, 0) / nonNullScores.length;
    // Scores are already 0-100, just ensure they're properly capped
    return Math.min(100, Math.max(0, Math.round(average)));
  };

  // Handlers for nutrition goal updates
  const handleNutritionGoalChange = (goal: NutritionGoal) => {
    setNutritionGoal(goal);
  };

  const handleActivityLevelChange = (level: ActivityLevel) => {
    setActivityLevel(level);
  };

  const handleSexChange = (newSex: Sex) => {
    setSex(newSex);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Refresh Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
          >
            <FiActivity className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SkillSnap Overview</h3>
            <p className="text-sm text-gray-600">Track your progress across all skill categories</p>
          </div>
        </div>
        
        <motion.button
          onClick={handleRefresh}
          disabled={isRefreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </motion.button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6">
        {skillCategories.map((category) => (
            <CategoryCard
            key={category.id}
              category={category}
            onOpen={() => openCategoryModal(category)}
              skillData={skillData}
              nutritionGoal={nutritionGoal}
              activityLevel={activityLevel}
              sex={sex}
            />
        ))}
      </div>

      {/* Category Modal */}
      {selectedCategory && (
        <>
          {/* Background overlay - separate from modal content */}
        <div 
            className="fixed inset-0 z-[9998] bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
            aria-hidden="true"
          />
          
          {/* Modal container - independent of scroll context */}
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="fixed inset-0 pointer-events-auto">
              <div className="w-full h-full bg-white flex flex-col">
                {/* Fixed Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeModal();
                      }}
                      className="absolute top-4 right-4 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 z-[10000] shadow-lg"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Modal header */}
                    <div className="mb-4 sm:mb-6 pr-16">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r ${selectedCategory.colorScheme.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          {selectedCategory.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">{selectedCategory.name}</h2>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{selectedCategory.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {isEditing === selectedCategory.id ? (
                        <>
                          <button
                            onClick={() => handleSave(selectedCategory.id)}
                            disabled={isSaving}
                            className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-1"
                          >
                            <FiSave className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => handleCancel(selectedCategory.id)}
                            className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl order-2 sm:order-2"
                          >
                            <FiX className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                            Cancel
                          </button>
                        </>
                      ) : canEdit ? (
                        <>
                        <button
                          onClick={() => handleStartEdit(selectedCategory.id)}
                          className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <FiEdit className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                          Edit All Skills
                          </button>
                          {/* Learn More Button for Physical Category */}
                          {selectedCategory.id === "PHYSICAL" && (
                            <button
                              onClick={() => setShowPhysicalLearnMore(true)}
                              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <svg className="mr-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Learn More
                        </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-300 text-gray-600 rounded-xl text-sm sm:text-base font-medium">
                            <FiActivity className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                            View Only
                          </div>
                          {/* Learn More Button for Physical Category - View Only Mode */}
                          {selectedCategory.id === "PHYSICAL" && (
                            <button
                              onClick={() => setShowPhysicalLearnMore(true)}
                              className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <svg className="mr-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Learn More
                            </button>
                          )}
                        </>
                      )}
                      
                      {/* Progress indicator for mobile */}
                      {isEditing === selectedCategory.id && (
                        <div className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium sm:hidden">
                          <FiActivity className="mr-2 w-4 h-4" />
                          {Object.keys(editedScores).length} skills being edited
                        </div>
                      )}
                    </div>
                    </div>
                  </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 sm:p-6 pb-32 max-w-5xl mx-auto min-h-full">
                    {isEditing === selectedCategory.id && (
                      <div className="mb-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
                        <div className="flex items-center mb-2">
                          <FiEdit className="w-5 h-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-blue-900">Editing Mode</h3>
                  </div>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          Update all your {selectedCategory.name.toLowerCase()} skills in one place. 
                          Enter your scores using decimal numbers where appropriate (e.g., 12.45 seconds for sprints).
                        </p>
                        {selectedCategory.id === "PHYSICAL" && (
                          <p className="text-blue-600 text-xs mt-2 italic">
                            💡 Tip: Lower times are better for sprints and runs. Higher numbers are better for reps and scores.
                          </p>
                        )}
                  </div>
                )}
                    {renderSkillsForCategory(selectedCategory)}
              </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Physical Learn More Modal */}
      {showPhysicalLearnMore && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 z-[9998] bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPhysicalLearnMore(false);
              }
            }}
            aria-hidden="true"
          />
          
          {/* Modal container */}
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="fixed inset-0 pointer-events-auto">
              <div className="w-full h-full bg-white flex flex-col">
                {/* Fixed Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                  <div className="p-4 sm:p-6 max-w-4xl mx-auto">
                    {/* Close button */}
                    <button
                      onClick={() => setShowPhysicalLearnMore(false)}
                      className="absolute top-4 right-4 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 z-[10000] shadow-lg"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Modal header */}
                    <div className="pr-16">
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">🏋️‍♂️ Physical Fitness: What It Means for Your Game</h2>
                          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">Understanding why we test these exercises and how they improve your cricket performance</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-3 sm:p-6 pb-20 max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-indigo-200 shadow-sm">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xl sm:text-2xl">🎯</span>
                        <h3 className="text-base sm:text-lg font-bold text-indigo-900">Why We Test Your Fitness</h3>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        At PeakPlay, we test different areas of your fitness to help you grow into a stronger, faster, and smarter athlete. 
                        Each test is chosen carefully to reflect what's important in cricket.
                      </p>
                    </div>

                    {/* Strength & Power Section */}
                    <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl sm:text-2xl">💪</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Strength & Power</h3>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          Build the explosive power you need for cricket excellence
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="grid gap-4">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Push-ups & Bench Press</p>
                              <p className="text-xs sm:text-sm text-gray-600">Upper body strength for batting power and stable shoulders</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Pull-ups</p>
                              <p className="text-xs sm:text-sm text-gray-600">Back and arm strength for throwing and injury prevention</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Squats & Vertical Jump</p>
                              <p className="text-xs sm:text-sm text-gray-600">Leg power for sprinting between wickets and fielding jumps</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Cricket Ball Throw</p>
                              <p className="text-xs sm:text-sm text-gray-600">Arm strength for accurate and powerful fielding throws</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-800 leading-relaxed">
                            <span className="font-medium">🏏 Cricket Impact:</span> Hit bigger shots, bowl faster, throw accurately, and move with confidence on the field.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Speed & Agility Section */}
                    <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl sm:text-2xl">⚡</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Speed & Agility</h3>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          React fast and change direction quickly like a pro
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="grid gap-4">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">50m Sprint</p>
                              <p className="text-xs sm:text-sm text-gray-600">Pure straight-line speed for quick singles and boundaries</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Shuttle Run</p>
                              <p className="text-xs sm:text-sm text-gray-600">Quick direction changes for fielding and wicket-keeping</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-800 leading-relaxed">
                            <span className="font-medium">🏏 Cricket Impact:</span> Run between wickets faster, chase balls in the field, and react quickly to every play.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Endurance Section */}
                    <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl sm:text-2xl">🫀</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Endurance</h3>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          Stay strong and focused throughout the entire match
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="grid gap-4">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">5K Run</p>
                              <p className="text-xs sm:text-sm text-gray-600">Stamina for long matches and extended batting innings</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Yo-Yo Test</p>
                              <p className="text-xs sm:text-sm text-gray-600">Recovery between quick bursts, just like in real matches</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-800 leading-relaxed">
                            <span className="font-medium">🏏 Cricket Impact:</span> Stay sharp through long overs, big innings, and full matches without getting tired.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Flexibility Section */}
                    <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-xl sm:text-2xl">🧘‍♂️</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Flexibility</h3>
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          Move smoothly and prevent injuries with better mobility
                        </p>
                      </div>
                      
                      <div className="p-4 sm:p-6">
                        <div className="grid gap-4">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Sit-and-Reach</p>
                              <p className="text-xs sm:text-sm text-gray-600">Hamstring and lower back flexibility for injury prevention</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Shoulder Mobility</p>
                              <p className="text-xs sm:text-sm text-gray-600">Full arm range for powerful throws and bowling actions</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Hip & Ankle Mobility</p>
                              <p className="text-xs sm:text-sm text-gray-600">Quick footwork and deep squats for batting and fielding</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-800 leading-relaxed">
                            <span className="font-medium">🏏 Cricket Impact:</span> Prevent injuries and move smoothly whether you're diving, batting, or bowling.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Conclusion */}
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-2xl sm:text-3xl">💥</span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Journey to Peak Performance</h3>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                        Each of these tests helps us understand where you are and where you can improve. You don't need to be perfect — 
                        but with effort, you'll start seeing progress in your scores and your performance on the field.
                      </p>
                      <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-purple-200">
                        <span className="text-lg">🚀</span>
                        <p className="text-sm font-medium text-purple-800">Let's get better, one step at a time!</p>
                      </div>
                    </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 