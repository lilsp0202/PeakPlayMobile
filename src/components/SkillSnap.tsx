"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Types for skills and analytics
interface SkillData {
  id?: string;
  // Physical Skills
  pushupScore?: number;
  pullupScore?: number;
  sprintTime?: number;
  run5kTime?: number;
  // Mental Skills
  moodScore?: number;
  sleepScore?: number;
  // Nutrition Skills
  totalCalories?: number;
  protein?: number;
  carbohydrates?: number;
  fats?: number;
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
}

interface TechnicalSkillsProps {
  skillData: SkillData | null;
  isEditing: boolean;
  editedScores: Record<string, number>;
  onScoreChange: (skillId: string, value: number) => void;
  averages: SkillAverages | null;
}

// Skill definitions for all categories
const skillCategories: SkillCategory[] = [
  {
    id: "PHYSICAL",
    name: "Physical",
    description: "Track physical fitness and performance metrics",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
    ),
    colorScheme: {
      primary: "indigo-600",
      secondary: "indigo-100",
      background: "indigo-50",
      gradient: "from-indigo-50 to-blue-50"
    },
    skills: [
      {
        id: "pushupScore",
        name: "Push-ups",
        unit: "reps",
        type: "count",
        description: "Maximum push-ups in 1 minute",
        colorScheme: { primary: "indigo-600", secondary: "indigo-100", background: "indigo-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        ),
      },
      {
        id: "pullupScore",
        name: "Pull-ups",
        unit: "reps",
        type: "count",
        description: "Maximum pull-ups in 1 set",
        colorScheme: { primary: "indigo-600", secondary: "indigo-100", background: "indigo-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        ),
      },
      {
        id: "sprintTime",
        name: "100m Sprint",
        unit: "seconds",
        type: "time",
        description: "100 meter sprint time",
        colorScheme: { primary: "indigo-600", secondary: "indigo-100", background: "indigo-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6.3 8.1 7.8 12 4.9 13.8 3.8 12.6c-.4-.6-1.2-.6-1.6-.2s-.4 1.2 0 1.6l2 2L7.8 14 8.9 21H11l1.1-2.1z"/>
          </svg>
        ),
      },
      {
        id: "run5kTime",
        name: "5K Run",
        unit: "minutes",
        type: "time",
        description: "5 kilometer run time",
        colorScheme: { primary: "indigo-600", secondary: "indigo-100", background: "indigo-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 12c2.49 0 4.5-2.01 4.5-4.5S17.99 3 15.5 3 11 5.01 11 7.5s2.01 4.5 4.5 4.5zM5 8.5c0-.83.67-1.5 1.5-1.5S8 7.67 8 8.5 7.33 10 6.5 10 5 9.33 5 8.5zm7 8.5c-2.33 0-7 1.17-7 3.5V22h14v-1.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
        ),
      },
    ]
  },
  {
    id: "MENTAL",
    name: "Mental",
    description: "Monitor mental wellness and psychological performance",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    ),
    colorScheme: {
      primary: "purple-600",
      secondary: "purple-100",
      background: "purple-50",
      gradient: "from-purple-50 to-pink-50"
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 9c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S14 10.33 14 9.5 14.67 9 15.5 9zM12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20.5 10.48 17.83 6.55 12.5 2zm3.5 13.5c0 1.38-1.12 2.5-2.5 2.5s-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5z"/>
          </svg>
        ),
      },
    ]
  },
  {
    id: "NUTRITION",
    name: "Nutrition",
    description: "Track daily nutrition intake and dietary habits",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
      </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.15 3.4L7.43 9.48c-.41.68-1.08 1.16-1.86 1.33L2.66 11.25c-.79.18-1.28 1.05-.96 1.79.32.74 1.17 1.17 1.96.99l2.91-.54c.78-.15 1.45-.63 1.86-1.33L11.15 3.4z"/>
            <circle cx="17.5" cy="6.5" r="4.5"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.9 8.89l-1.05-4.37c-.22-.9-1-1.52-1.91-1.52H5.05C4.15 3 3.36 3.63 3.15 4.52L2.1 8.89c-.24 1.02-.02 2.06.62 2.88C2.8 11.88 2.91 11.96 3 12.06V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-6.94c.09-.09.2-.18.28-.28.64-.82.87-1.87.62-2.89zM7 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1z"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.47 2.05c-.14-.4-.6-.4-.74 0L9.75 8.79c-.41-.02-.82.08-1.18.3-.77.47-1.26 1.3-1.32 2.23-.05.93.32 1.83 1 2.42.41.36.92.56 1.45.56.19 0 .38-.02.56-.07l1.97 5.46c.14.4.6.4.74 0l1.97-5.46c.18.05.37.07.56.07.53 0 1.04-.2 1.45-.56.68-.59 1.05-1.49 1-2.42-.06-.93-.55-1.76-1.32-2.23-.36-.22-.77-.32-1.18-.3L12.47 2.05z"/>
          </svg>
        ),
      },
    ]
  },
  {
    id: "TECHNIQUE",
    name: "Technique",
    description: "Technical skills and sport-specific abilities",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    ),
    colorScheme: {
      primary: "orange-600",
      secondary: "orange-100",
      background: "orange-50",
      gradient: "from-orange-50 to-amber-50"
    },
    skills: [
      // Technical skills placeholders for proper counting
      {
        id: "battingGrip",
        name: "Batting Skills",
        unit: "avg",
        type: "score" as const,
        description: "Batting technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 17.5L7 13l11 11-4.5 4.5L2.5 17.5z"/></svg>,
        colorScheme: { primary: "orange-600", secondary: "orange-100", background: "orange-50" }
      },
      {
        id: "bowlingGrip", 
        name: "Bowling Skills",
        unit: "avg",
        type: "score" as const,
        description: "Bowling technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>,
        colorScheme: { primary: "orange-600", secondary: "orange-100", background: "orange-50" }
      },
      {
        id: "positioningOfBall",
        name: "Fielding Skills", 
        unit: "avg",
        type: "score" as const,
        description: "Fielding technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>,
        colorScheme: { primary: "orange-600", secondary: "orange-100", background: "orange-50" }
      }
    ]
  },
  {
    id: "TACTICAL",
    name: "Tactical",
    description: "Game intelligence and strategic understanding",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 11H7v3h2v-3zm4 0h-2v3h2v-3zm4 0h-2v3h2v-3zm2-7h-2V2h-2v2H9V2H7v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
      </svg>
    ),
    colorScheme: {
      primary: "blue-600",
      secondary: "blue-100",
      background: "blue-50",
      gradient: "from-blue-50 to-cyan-50"
    },
    skills: []
  }
];

// Helper function to calculate aggregate score for a skillset
const calculateAggregateScore = (category: SkillCategory, skillData: SkillData | null): number => {
  if (!skillData || category.skills.length === 0) return 0;

  let totalScore = 0;
  let skillCount = 0;

  // Get personalized nutrition targets if this is nutrition category and we have body metrics
  let personalizedNutrition: any = null;
  if (category.id === "NUTRITION" && skillData.student?.height && skillData.student?.weight) {
    personalizedNutrition = calculatePersonalizedNutrition(
      skillData.student.weight,
      skillData.student.height,
      skillData.student.age
    );
  }

  category.skills.forEach(skill => {
    const value = skillData[skill.id as keyof SkillData] as number;
    if (value !== undefined && value !== null) {
      let normalizedScore = value;
      
      // Normalize different types of scores to a 0-10 scale
      if (skill.type === "time") {
        // For time-based skills, lower is better, convert to score out of 10
        // These are rough estimates - could be made more sophisticated
        if (skill.id === "sprintTime") {
          // 100m sprint: 10-20 seconds range, lower is better
          normalizedScore = Math.max(0, 10 - ((value - 10) * 2));
        } else if (skill.id === "run5kTime") {
          // 5K run: 15-30 minutes range, lower is better  
          normalizedScore = Math.max(0, 10 - ((value - 15) * 0.67));
        }
      } else if (skill.type === "count") {
        // For count-based skills (pushups, pullups), normalize to 0-10 scale
        normalizedScore = Math.min(10, value / 5); // Rough normalization
      } else if (skill.type === "score") {
        // Already on 0-10 scale
        normalizedScore = Math.min(10, value);
      } else if (skill.type === "calories" || skill.type === "grams") {
        // Use personalized targets for nutrition if available
        if (personalizedNutrition && category.id === "NUTRITION") {
          let target: number;
          switch (skill.id) {
            case "totalCalories":
              target = personalizedNutrition.calories;
              break;
            case "protein":
              target = personalizedNutrition.protein;
              break;
            case "carbohydrates":
              target = personalizedNutrition.carbohydrates;
              break;
            case "fats":
              target = personalizedNutrition.fats;
              break;
            default:
              target = value; // fallback
          }
          
          // Score based on how close to target (within 10% = perfect score)
          const percentageDiff = Math.abs(value - target) / target;
          if (percentageDiff <= 0.1) {
            normalizedScore = 10; // Perfect score within 10%
          } else if (percentageDiff <= 0.2) {
            normalizedScore = 8; // Good score within 20%
          } else if (percentageDiff <= 0.3) {
            normalizedScore = 6; // Fair score within 30%
          } else if (percentageDiff <= 0.5) {
            normalizedScore = 4; // Poor score within 50%
          } else {
            normalizedScore = 2; // Very poor score beyond 50%
          }
        } else {
          // Fallback to old method if no personalized targets
          if (skill.type === "calories") {
            // Normalize calories to 0-10 scale (1500-3000 kcal range)
            normalizedScore = Math.min(10, Math.max(0, (value - 1500) / 150));
          } else if (skill.type === "grams") {
            // Normalize nutrition values (rough estimates)
            if (skill.id === "protein") {
              // 50-150g protein range
              normalizedScore = Math.min(10, Math.max(0, (value - 50) / 10));
            } else if (skill.id === "carbohydrates") {
              // 150-400g carbs range
              normalizedScore = Math.min(10, Math.max(0, (value - 150) / 25));
            } else if (skill.id === "fats") {
              // 50-100g fats range
              normalizedScore = Math.min(10, Math.max(0, (value - 50) / 5));
            }
          }
        }
      }
      
      totalScore += normalizedScore;
      skillCount++;
    }
  });

  return skillCount > 0 ? totalScore / skillCount : 0;
};

// Helper function to calculate overall progress percentage (exported)
export const calculateOverallProgress = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  let totalScore = 0;
  let categoryCount = 0;

  skillCategories.forEach(category => {
    if (category.skills.length > 0) {
      const aggregateScore = calculateAggregateScore(category, skillData);
      totalScore += aggregateScore;
      categoryCount++;
    }
  });

  // Convert to percentage (0-100)
  return categoryCount > 0 ? (totalScore / categoryCount) * 10 : 0;
};

// Progress Ring Component
export const ProgressRing: React.FC<{ progress: number; size?: number }> = ({ progress, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Dynamic color based on progress
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-500";
    if (progress >= 40) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${getProgressColor(progress)} transition-all duration-500 ease-in-out`}
        />
      </svg>
      {/* Progress text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Progress
          </div>
        </div>
      </div>
    </div>
  );
};

// Aggregate Score Display Component
const AggregateScoreDisplay: React.FC<{
  category: SkillCategory;
  aggregateScore: number;
}> = ({ category, aggregateScore }) => {
  const percentage = (aggregateScore / 10) * 100;
  
  return (
    <div className={`mt-4 bg-gradient-to-r ${category.colorScheme.gradient} rounded-lg p-4 border border-gray-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${category.colorScheme.secondary} rounded-lg text-${category.colorScheme.primary}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{category.name} Average</h4>
            <p className="text-sm text-gray-600">Aggregate performance score</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {aggregateScore.toFixed(1)}/10
          </div>
          <div className="text-sm text-gray-600">
            {percentage.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-white rounded-full h-2">
          <div
            className={`bg-${category.colorScheme.primary} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// BMI calculation and nutrition recommendation functions
const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: "Underweight", color: "blue" };
  if (bmi < 25) return { category: "Normal", color: "green" };
  if (bmi < 30) return { category: "Overweight", color: "orange" };
  return { category: "Obese", color: "red" };
};

const calculatePersonalizedNutrition = (weight: number, height: number, age: number) => {
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
    calories: baseCalories,
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
}> = ({ skill, userScore, averageScore, isEditing, onScoreChange, showComparison = true, personalizedTarget }) => {
  const maxValue = personalizedTarget 
    ? Math.max(userScore || 0, personalizedTarget, 100)
    : Math.max(userScore || 0, averageScore || 0, 100);
  
  const userPercentage = userScore ? (userScore / maxValue) * 100 : 0;
  const avgPercentage = averageScore ? (averageScore / maxValue) * 100 : 0;
  const targetPercentage = personalizedTarget ? (personalizedTarget / maxValue) * 100 : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${skill.colorScheme.secondary} rounded-lg text-${skill.colorScheme.primary}`}>
            {skill.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{skill.name}</h3>
            <p className="text-sm text-gray-700">{skill.description}</p>
          </div>
        </div>
        {isEditing ? (
          <input
            type="number"
            value={userScore || ""}
            onChange={(e) => onScoreChange(skill.id, Number(e.target.value))}
            placeholder="0"
            className={`w-20 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-${skill.colorScheme.primary} focus:border-${skill.colorScheme.primary}`}
            min="0"
            step={skill.type === "time" ? "0.1" : "1"}
          />
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            {userScore || "--"}
            <span className="text-sm font-normal text-gray-700 ml-1">
              {skill.unit}
            </span>
          </div>
        )}
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Your Score</span>
            <span className={`font-medium text-${skill.colorScheme.primary}`}>
              {userScore || 0} {skill.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-${skill.colorScheme.primary} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${userPercentage}%` }}
            />
          </div>
        </div>

        {/* Show personalized target for nutrition */}
        {personalizedTarget && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Recommended</span>
              <span className="font-medium text-emerald-600">
                {personalizedTarget} {skill.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Show age group average only for physical skills and technique (when showComparison is true) */}
        {showComparison && averageScore !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Age Group Average</span>
              <span className="font-medium text-gray-600">
                {averageScore} {skill.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${avgPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Category Card component for main grid
const CategoryCard: React.FC<{
  category: SkillCategory;
  isExpanded: boolean;
  onToggle: () => void;
  skillData: SkillData | null;
}> = ({ category, isExpanded, onToggle, skillData }) => {
  // Special handling for TECHNIQUE category - count technical skills differently
  let hasData: boolean;
  let skillCount: number;
  
  if (category.id === "TECHNIQUE") {
    // Count technical skills from the actual skill data
    const technicalSkillIds = [
      'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
      'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
      'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
      'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
      'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
    ];
    
    hasData = technicalSkillIds.some(skillId => 
      skillData && skillData[skillId as keyof SkillData] !== undefined && skillData[skillId as keyof SkillData] !== null
    );
    skillCount = 3; // Three main categories: Batting, Bowling, Fielding
  } else {
    hasData = category.skills.some(skill => 
      skillData && skillData[skill.id as keyof SkillData] !== undefined
    );
    skillCount = category.skills.length;
  }

  return (
    <div 
      className={`bg-gradient-to-br ${category.colorScheme.gradient} rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer`}
      onClick={onToggle}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${category.colorScheme.primary} rounded-lg text-white shadow-lg`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasData && (
              <div className={`w-2 h-2 bg-${category.colorScheme.primary} rounded-full`} />
            )}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Skills count and preview */}
        <div className="flex items-center justify-between text-sm text-gray-700">
          <span>{skillCount} skills tracked</span>
          {skillCount === 0 ? (
            <span className="text-gray-500">Coming soon</span>
          ) : (
            <span className={`text-${category.colorScheme.primary} font-medium`}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
          )}
        </div>
      </div>
    </div>
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
          <div className="p-3 bg-green-500 rounded-lg text-white">
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
        <div className="p-3 bg-green-500 rounded-lg text-white">
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
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${bmiCategory.color}-100 text-${bmiCategory.color}-800`}>
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
            {personalizedNutrition.calories}
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
    const normalizedUserScore = (userScore / skill.maxPoints) * 10;
    const normalizedAverageScore = (averageScore / skill.maxPoints) * 10;

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{skill.name}</h4>
            <p className="text-sm text-gray-500">{skill.description}</p>
          </div>
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-orange-600">
              {isEditing ? (
                <input
                  type="number"
                  min={0}
                  max={skill.maxPoints}
                  value={userScore}
                  onChange={(e) => onScoreChange(skill.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                />
              ) : (
                userScore
              )}
            </div>
            <div className="text-xs text-gray-500">/ {skill.maxPoints}</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Your Score</span>
            <span>Avg: {averageScore.toFixed(1)}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(normalizedUserScore / 10) * 100}%` }}
              />
            </div>
            <div
              className="absolute top-0 h-2 w-0.5 bg-gray-400 rounded-full"
              style={{ left: `${(normalizedAverageScore / 10) * 100}%` }}
            />
          </div>
        </div>
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
                <h3 className="text-xl font-bold text-white drop-shadow-sm">{title}</h3>
                <p className="text-white text-opacity-90 text-sm font-medium">
                  {completedSkills}/{totalSkills} skills tracked
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {completedSkills > 0 && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
              <svg
                className={`w-6 h-6 text-white transition-transform duration-200 ${
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
                      ? editedScores[skill.id] || 0
                      : (skillData?.[skill.id as keyof SkillData] as number) || 0
                  }
                  averageScore={averages?.averages[skill.id] || 0}
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
        icon={
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.5 17.5L7 13l11 11-4.5 4.5L2.5 17.5zm15-15L13 7l1.5 1.5L19 4l-1.5-1.5zM6 3l3 3-3 3-3-3 3-3z"/>
          </svg>
        }
      />

      <SectionCard
        title="Bowling"
        sectionId="bowling"
        skills={bowlingSkills}
        colorScheme="bowling"
        icon={
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="8" cy="8" r="1"/>
            <circle cx="16" cy="8" r="1"/>
            <circle cx="8" cy="16" r="1"/>
            <circle cx="16" cy="16" r="1"/>
            <circle cx="12" cy="6" r="1"/>
            <circle cx="12" cy="18" r="1"/>
            <circle cx="6" cy="12" r="1"/>
            <circle cx="18" cy="12" r="1"/>
          </svg>
        }
      />

      <SectionCard
        title="Fielding"
        sectionId="fielding"
        skills={fieldingSkills}
        colorScheme="fielding"
        icon={
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        }
      />
    </div>
  );
};

const calculateTechnicalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  const technicalSkillIds = [
    // Batting skills
    'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
    'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
    // Bowling skills
    'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
    'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
    // Fielding skills
    'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
  ];

  let totalScore = 0;
  let skillCount = 0;

  technicalSkillIds.forEach(skillId => {
    const value = skillData[skillId as keyof SkillData] as number;
    if (value !== undefined && value !== null) {
      // All technical skills are now out of 10, so just use the value directly
      totalScore += value;
      skillCount++;
    }
  });

  return skillCount > 0 ? totalScore / skillCount : 0;
};

export default function SkillSnap({
  studentId,
  isCoachView = false
}: SkillSnapProps) {
  const { data: session } = useSession();
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [averages, setAverages] = useState<SkillAverages | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
      setIsLoading(true);
      const params = studentId ? `?studentId=${studentId}` : "";
      const response = await fetch(`/api/skills${params}`);
      
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
      }
    } catch (error) {
      console.error("Error fetching skill data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAverages = async (age: number) => {
    try {
      const response = await fetch(`/api/skills/analytics?age=${age}`);
      if (response.ok) {
        const data = await response.json();
        setAverages(data);
      }
    } catch (error) {
      console.error("Error fetching averages:", error);
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
    try {
      setIsSaving(true);
      
      let categoryScores: Record<string, number> = {};
      
      if (categoryId === "TECHNIQUE") {
        // For TECHNIQUE category, use all technical skills directly
        const technicalSkillIds = [
          'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
          'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
          'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive', 
          'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
          'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
        ];
        
        technicalSkillIds.forEach(skillId => {
          categoryScores[skillId] = editedScores[skillId] || 0;
        });
        
        console.log("Saving technical skills for student:", studentId);
        console.log("Category scores being sent:", categoryScores);
      } else {
        // For other categories, use the skills from the category definition
        const categorySkills = skillCategories.find(cat => cat.id === categoryId)?.skills || [];
        categorySkills.forEach(skill => {
          categoryScores[skill.id] = editedScores[skill.id] || 0;
        });
      }

      const requestBody = {
        ...categoryScores,
        studentId,
        category: categoryId,
      };
      
      console.log("Full request body:", requestBody);

      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Skills saved successfully:", responseData);
        await fetchSkillData();
        setIsEditing(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to save skills:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error saving skills:", error);
    } finally {
      setIsSaving(false);
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
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (isLoading) {
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
    <div className="bg-white rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">SkillSnap</h2>
            <p className="text-gray-600">
              {isCoachView && skillData?.student?.studentName 
                ? `${skillData.student.studentName} • `
                : ""
              }
              Complete athletic performance tracking
            </p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {skillCategories.map((category) => (
          <div key={category.id}>
            <CategoryCard
              category={category}
              isExpanded={expandedCategories.has(category.id)}
              onToggle={() => toggleCategory(category.id)}
              skillData={skillData}
            />

            {/* Expanded Skills */}
            {expandedCategories.has(category.id) && (
              <div className={`mt-4 bg-gradient-to-br ${category.colorScheme.gradient} rounded-xl p-6 shadow-inner`}>
                {/* Special handling for TECHNIQUE category */}
                {category.id === "TECHNIQUE" ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 bg-${category.colorScheme.primary} rounded-lg shadow-lg`}>
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Technical Skills</h3>
                          <p className="text-gray-600">Master the fundamentals of cricket</p>
                        </div>
                      </div>
                      
                      {/* Action buttons - Only show for coaches */}
                      {isCoachView && (
                        <div className="flex space-x-2">
                          {isEditing === category.id ? (
                            <>
                              <button
                                onClick={() => handleCancel(category.id)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSave(category.id)}
                                disabled={isSaving}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 shadow-md"
                              >
                                {isSaving ? "Saving..." : "Save"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(category.id)}
                              className="px-6 py-3 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                              {skillData ? "Edit Scores" : "Add Scores"}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Debug info for Technical Skills */}
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-4">
                      </div>
                    </div>

                    <TechnicalSkillsComponent
                      skillData={skillData}
                      isEditing={isEditing === category.id}
                      editedScores={editedScores}
                      onScoreChange={handleScoreChange}
                      averages={averages}
                    />

                    {/* Aggregate Score Display for Technical */}
                    <AggregateScoreDisplay
                      category={category}
                      aggregateScore={calculateTechnicalAggregateScore(skillData)}
                    />
                  </div>
                ) : category.skills.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">{category.name} Skills</h3>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        {isEditing === category.id ? (
                          <>
                            <button
                              onClick={() => handleCancel(category.id)}
                              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSave(category.id)}
                              disabled={isSaving}
                              className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 shadow-md"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(category.id)}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            {skillData ? "Edit Scores" : "Add Scores"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Skills grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.skills.map((skill) => {
                        // Get personalized nutrition targets if this is nutrition category
                        let personalizedTarget: number | undefined = undefined;
                        if (category.id === "NUTRITION" && skillData?.student?.height && skillData?.student?.weight) {
                          const personalizedNutrition = calculatePersonalizedNutrition(
                            skillData.student.weight,
                            skillData.student.height,
                            skillData.student.age
                          );
                          switch (skill.id) {
                            case "totalCalories":
                              personalizedTarget = personalizedNutrition.calories;
                              break;
                            case "protein":
                              personalizedTarget = personalizedNutrition.protein;
                              break;
                            case "carbohydrates":
                              personalizedTarget = personalizedNutrition.carbohydrates;
                              break;
                            case "fats":
                              personalizedTarget = personalizedNutrition.fats;
                              break;
                          }
                        }

                        return (
                          <SkillBar
                            key={skill.id}
                            skill={skill}
                            userScore={
                              isEditing === category.id
                                ? editedScores[skill.id] 
                                : skillData?.[skill.id as keyof SkillData] as number
                            }
                            averageScore={averages?.averages[skill.id] || 0}
                            isEditing={isEditing === category.id}
                            onScoreChange={handleScoreChange}
                            showComparison={category.id !== "MENTAL"} // Remove comparison for mental skills
                            personalizedTarget={personalizedTarget}
                          />
                        );
                      })}
                    </div>

                    {/* BMI Card for Nutrition Category */}
                    {category.id === "NUTRITION" && (
                      <div className="mt-6">
                        <BMICard skillData={skillData} />
                      </div>
                    )}

                    {/* Aggregate Score Display */}
                    <AggregateScoreDisplay
                      category={category}
                      aggregateScore={calculateAggregateScore(category, skillData)}
                    />
                  </div>
                ) : (
                  // Coming Soon message for empty categories
                  <div className={`bg-gradient-to-br ${category.colorScheme.gradient} rounded-xl p-12 shadow-inner text-center`}>
                    <div className={`p-4 bg-${category.colorScheme.secondary} rounded-lg inline-block mb-4`}>
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-600">
                      {category.name} skill tracking will be available in the next update. 
                      Stay tuned for exciting new features!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer stats */}
      {averages && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Age Group Statistics: {averages.ageGroup}</span>
            <span>Sample Size: {averages.sampleSize} athletes</span>
          </div>
        </div>
      )}
    </div>
  );
} 