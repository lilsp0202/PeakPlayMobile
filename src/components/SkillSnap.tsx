"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Edit, Check, X } from "lucide-react";

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
  onSkillsUpdated?: () => void;
}

interface TechnicalSkillsProps {
  skillData: SkillData | null;
  isEditing: boolean;
  editedScores: Record<string, number>;
  onScoreChange: (skillId: string, value: number) => void;
  averages: SkillAverages | null;
}

// Body scroll lock utilities
const lockBodyScroll = () => {
  // Get the current scroll position
  const scrollY = window.scrollY;
  
  // Store the scroll position
  document.body.style.top = `-${scrollY}px`;
  
  // Add the lock class
  document.body.classList.add('modal-scroll-lock');
  
  // Apply styles
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.overflowY = 'hidden';
};

const unlockBodyScroll = () => {
  // Remove the lock class
  document.body.classList.remove('modal-scroll-lock');
  
  // Get the stored scroll position
  const scrollY = document.body.style.top;
  
  // Reset styles
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflowY = '';
  
  // Restore scroll position
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  }
};

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
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 17.5L7 13l11 11-4.5 4.5L2.5 17.5zm15-15L13 7l1.5 1.5L19 4l-1.5-1.5zM6 3l3 3-3 3-3-3 3-3z"/></svg>,
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

// Helper function to calculate aggregate scores for each category
const calculatePhysicalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  const scores = [
    skillData.pushupScore || 0,
    skillData.pullupScore || 0,
    skillData.sprintTime ? 10 - (skillData.sprintTime / 2) : 0, // Convert time to score (lower is better)
    skillData.run5kTime ? 10 - (skillData.run5kTime / 30) : 0, // Convert time to score (lower is better)
  ];

  const validScores = scores.filter(score => score > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
};

const calculateMentalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  const scores = [
    skillData.moodScore || 0,
    skillData.sleepScore || 0,
  ];

  const validScores = scores.filter(score => score > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
};

const calculateNutritionAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  // Calculate recommended values based on student data
  const student = skillData.student;
  if (!student || !student.weight || !student.height) return 0;

  const nutrition = calculatePersonalizedNutrition(student.weight, student.height, student.age);

  // Calculate scores based on how close actual values are to recommended values
  const scores = [
    skillData.totalCalories ? 10 - Math.abs((skillData.totalCalories - nutrition.totalCalories) / nutrition.totalCalories) * 10 : 0,
    skillData.protein ? 10 - Math.abs((skillData.protein - nutrition.protein) / nutrition.protein) * 10 : 0,
    skillData.carbohydrates ? 10 - Math.abs((skillData.carbohydrates - nutrition.carbohydrates) / nutrition.carbohydrates) * 10 : 0,
    skillData.fats ? 10 - Math.abs((skillData.fats - nutrition.fats) / nutrition.fats) * 10 : 0,
  ];

  const validScores = scores.filter(score => score > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
};

const calculateTacticalAggregateScore = (skillData: SkillData | null): number => {
  // For now, return 0 as we haven't implemented tactical skills yet
  return 0;
};

// Helper function to calculate aggregate score for a skillset
const calculateAggregateScore = (category: SkillCategory, skillData: SkillData | null): number => {
  switch (category.id) {
    case "PHYSICAL":
      return calculatePhysicalAggregateScore(skillData);
    case "MENTAL":
      return calculateMentalAggregateScore(skillData);
    case "NUTRITION":
      return calculateNutritionAggregateScore(skillData);
    case "TECHNIQUE":
      return calculateTechnicalAggregateScore(skillData);
    case "TACTICAL":
      return calculateTacticalAggregateScore(skillData);
    default:
      return 0;
  }
};

// Helper function to calculate overall progress percentage (exported)
export const calculateOverallProgress = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  const scores = [
    calculatePhysicalAggregateScore(skillData),
    calculateMentalAggregateScore(skillData),
    calculateNutritionAggregateScore(skillData),
    calculateTechnicalAggregateScore(skillData),
    calculateTacticalAggregateScore(skillData)
  ];
  
  const validScores = scores.filter(score => score > 0);
  if (validScores.length === 0) return 0;

  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24">
      <svg
          height={radius * 2}
          width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
            stroke="#E5E7EB"
          fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
        />
        {/* Progress circle */}
        <circle
            stroke="url(#progressGradient)"
          fill="transparent"
            strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
          strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
        />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {progress}%
          </span>
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
  // Fix: For 'score' type skills (e.g., moodScore, sleepScore), use 10 as max
  let maxValue: number;
  if (skill.type === "score") {
    maxValue = 10;
  } else if (personalizedTarget) {
    maxValue = Math.max(userScore || 0, personalizedTarget, 100);
  } else {
    maxValue = Math.max(userScore || 0, averageScore || 0, 100);
  }

  const userPercentage = userScore ? (userScore / maxValue) * 100 : 0;
  const avgPercentage = averageScore ? (averageScore / maxValue) * 100 : 0;
  const targetPercentage = personalizedTarget ? (personalizedTarget / maxValue) * 100 : 0;

  return (
    <div 
      className={`bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:border-indigo-200 ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-gradient-to-br ${
            skill.colorScheme.primary === 'blue-600' ? 'from-blue-500 to-blue-600' :
            skill.colorScheme.primary === 'green-600' ? 'from-green-500 to-green-600' :
            skill.colorScheme.primary === 'orange-600' ? 'from-orange-500 to-orange-600' :
            skill.colorScheme.primary === 'purple-600' ? 'from-purple-500 to-purple-600' :
            'from-indigo-500 to-indigo-600'
          } rounded-xl text-white shadow-lg hover:scale-110 transition-transform duration-200`}>
            {skill.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{skill.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
            {onClick && !isEditing && (
              <p className="text-xs text-indigo-600 mt-1 font-medium">Click to edit individually →</p>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="relative">
          <input
            type="number"
            value={userScore || ""}
            onChange={(e) => onScoreChange(skill.id, Number(e.target.value))}
            placeholder="0"
              className="w-24 px-4 py-3 border-2 border-indigo-300 rounded-xl text-lg font-bold text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-lg transition-all duration-200"
            min="0"
            step={skill.type === "time" ? "0.1" : "1"}
              onClick={(e) => e.stopPropagation()} // Prevent modal opening when clicking input
          />
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 font-medium">
              {skill.unit}
            </span>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {userScore || "--"}
            </div>
            <span className="text-sm font-medium text-gray-600 block mt-1">
              {skill.unit}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced Progress bars with animations */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700 font-medium">Your Score</span>
            <span className="font-bold text-indigo-600">
              {userScore || 0} {skill.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ 
                width: `${userPercentage}%`,
                transform: `scaleX(${userPercentage > 0 ? 1 : 0})`,
                transformOrigin: 'left center'
              }}
            />
          </div>
        </div>

        {/* Show personalized target for nutrition */}
        {personalizedTarget && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">Recommended</span>
              <span className="font-bold text-emerald-600">
                {personalizedTarget} {skill.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ 
                  width: `${targetPercentage}%`,
                  animationDelay: '200ms'
                }}
              />
            </div>
          </div>
        )}

        {/* Show age group average only for physical skills and technique (when showComparison is true) */}
        {showComparison && averageScore !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-700 font-medium">Age Group Average</span>
              <span className="font-bold text-gray-600">
                {averageScore} {skill.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ 
                  width: `${avgPercentage}%`,
                  animationDelay: '400ms'
                }}
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
  onOpen: () => void;
  skillData: SkillData | null;
}> = ({ category, onOpen, skillData }) => {
  const completedSkills = category.skills.filter(skill => {
    const score = skillData?.[skill.id as keyof SkillData] as number;
    return score && score > 0;
  }).length;

  return (
    <div 
      onClick={onOpen}
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${category.colorScheme.gradient} text-${category.colorScheme.primary}`}>
              {category.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
            <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-600">
            {completedSkills} / {category.skills.length} skills
          </div>
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
                      ? editedScores[skill.id] 
                      : skillData?.[skill.id as keyof SkillData] as number
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
            <path d="M2.5 17.5L7 13l11 11-4.5 4.5L2.5 17.5zm15-15L13 7l1.5 1.5L19 4l-1.5-1.5zM6 3l3 3-3 3-3-3 3-3z"/></svg>
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

export const calculateTechnicalAggregateScore = (skillData: SkillData | null): number => {
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
      // All technical skills are out of 10, cap at 10 for safety
      totalScore += Math.min(10, Math.max(0, value));
      skillCount++;
    }
  });

  return skillCount > 0 ? Math.min(10, totalScore / skillCount) : 0;
};

export default function SkillSnap({
  studentId,
  isCoachView = false,
  onSkillsUpdated
}: SkillSnapProps) {
  const { data: session } = useSession();
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [averages, setAverages] = useState<SkillAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add effect to manage body scroll when modals are open
  useEffect(() => {
    if (selectedCategory || selectedSkill) {
      // Prevent background scroll when modal is open
      lockBodyScroll();
    } else {
      // Restore scroll when modal is closed
      unlockBodyScroll();
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      unlockBodyScroll();
    };
  }, [selectedCategory, selectedSkill]);

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
    try {
      setLoading(true);
      
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

      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Update local state immediately for better UX
        setSkillData(prev => ({
          ...prev,
          ...categoryScores
        }));
        
        // Reset editing state
        setIsEditing(null);
        setSelectedCategory(null);
        setSelectedSkill(null);
        
        // Call callback if provided
        onSkillsUpdated?.();
        
        // Fetch fresh data in background
        setTimeout(() => {
          fetchSkillData();
        }, 100);
      } else {
        const errorData = await response.json();
        console.error("Failed to save skills:", response.status, errorData);
        
        // Show user-friendly error message
        alert("Failed to save skills. Please try again.");
      }
    } catch (error) {
      console.error("Error saving skills:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
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
    setSelectedSkill(null);
  };

  const openCategoryModal = (category: SkillCategory) => {
    // Prevent scroll restoration while opening modal
    document.documentElement.style.scrollBehavior = 'auto';
    setSelectedCategory(category);
    setSelectedSkill(null);
    // Re-enable smooth scrolling after modal is open
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 150);
  };

  const openSkillModal = (skill: SkillItem, category: SkillCategory) => {
    // Prevent scroll restoration while opening modal
    document.documentElement.style.scrollBehavior = 'auto';
    setSelectedCategory(category);
    setSelectedSkill(skill);
    
    // Initialize edit state for this skill
    if (!isEditing) {
      setEditedScores(prev => ({
        ...prev,
        [skill.id]: skillData?.[skill.id as keyof SkillData] as number || 0
      }));
    }
    
    // Re-enable smooth scrolling after modal is open
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 150);
  };

  const closeModal = () => {
    // Prevent scroll restoration while closing modal
    document.documentElement.style.scrollBehavior = 'auto';
    setSelectedCategory(null);
    setSelectedSkill(null);
    // Cancel any ongoing edits
    if (isEditing) {
      handleCancel(isEditing);
    }
    // Re-enable smooth scrolling after modal is closed and scroll is restored
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = '';
    }, 150);
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
        <div className="pb-8">
          {renderTechnicalSkills()}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {category.skills.map((skill) => (
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
            showComparison={category.id !== "MENTAL"}
            personalizedTarget={
              category.id === "NUTRITION" && skillData?.student?.height && skillData?.student?.weight
                ? (() => {
                    const nutrition = calculatePersonalizedNutrition(
                      skillData.student.weight,
                      skillData.student.height,
                      skillData.student.age
                    );
                    const nutritionKey = skill.id as keyof NutritionData;
                    return nutritionKey in nutrition ? nutrition[nutritionKey] : undefined;
                  })()
                : undefined
            }
            onClick={() => openSkillModal(skill, category)}
          />
        ))}
      </div>
    );
  };

  const renderIndividualSkillModal = () => {
    if (!selectedSkill || !selectedCategory) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-modalFadeIn"
        onClick={closeModal}
        style={{ 
          touchAction: 'none',
          overscrollBehavior: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Modal Container - Enhanced Mobile PWA Optimization */}
        <div className="min-h-screen max-h-screen flex items-start justify-center pt-4 sm:pt-8 modal-mobile-safe modal-pwa-safe">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl animate-slideUpBounce relative mx-4 sm:mx-6"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxHeight: 'calc(100vh - 10rem)',
              height: 'fit-content'
            }}
          >
            {/* Modal Header - Fixed */}
            <div className="modal-header-glass p-4 sm:p-6 border-b border-gray-200 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${selectedCategory.colorScheme.gradient} text-${selectedCategory.colorScheme.primary} flex-shrink-0`}>
                    {selectedSkill.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{selectedSkill.name}</h3>
                    <p className="text-sm md:text-base text-gray-600 line-clamp-2">{selectedSkill.description}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 -m-2 flex-shrink-0 ml-4 touch-target"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content - Enhanced Mobile Scrolling */}
            <div 
              className="p-4 sm:p-6 modal-scroll-enhanced modal-mobile-content overflow-y-auto overscroll-contain" 
              style={{ 
                maxHeight: 'calc(100vh - 14rem)',
                minHeight: '15vh'
              }}
            >
              <SkillBar
                skill={selectedSkill}
                userScore={skillData?.[selectedSkill.id as keyof SkillData] as number}
                averageScore={averages?.averages[selectedSkill.id] || 0}
                isEditing={isEditing === selectedCategory.id}
                onScoreChange={handleScoreChange}
                showComparison={selectedCategory.id !== "MENTAL"}
                personalizedTarget={
                  selectedCategory.id === "NUTRITION" && skillData?.student?.height && skillData?.student?.weight
                    ? (() => {
                        const nutrition = calculatePersonalizedNutrition(
                          skillData.student.weight,
                          skillData.student.height,
                          skillData.student.age
                        );
                        const nutritionKey = selectedSkill.id as keyof NutritionData;
                        return nutritionKey in nutrition ? nutrition[nutritionKey] : undefined;
                      })()
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Overall progress and insights sections removed

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
      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-6">
        {skillCategories.map((category) => (
            <CategoryCard
            key={category.id}
              category={category}
            onOpen={() => openCategoryModal(category)}
              skillData={skillData}
            />
        ))}
      </div>

      {/* Category Modal */}
      {selectedCategory && !selectedSkill && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-modalFadeIn"
          onClick={closeModal}
          style={{ 
            touchAction: 'none',
            overscrollBehavior: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Modal Container - Enhanced Mobile PWA Optimization */}
          <div className="min-h-screen max-h-screen flex items-start justify-center pt-4 sm:pt-8 modal-mobile-safe modal-pwa-safe">
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col animate-slideUpBounce relative mx-4 sm:mx-6"
              onClick={(e) => e.stopPropagation()}
              style={{ 
                maxHeight: 'calc(100vh - 10rem)',
                height: 'fit-content'
              }}
            >
              {/* Modal Header - Fixed */}
              <div className="modal-header-glass p-4 sm:p-6 border-b border-gray-200 rounded-t-xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${selectedCategory.colorScheme.gradient} text-${selectedCategory.colorScheme.primary} flex-shrink-0`}>
                      {selectedCategory.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{selectedCategory.name}</h3>
                      <p className="text-sm md:text-base text-gray-600 line-clamp-2">{selectedCategory.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 -m-2 flex-shrink-0 ml-4 touch-target"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Action Buttons - Fixed */}
              <div className="p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
                {isEditing === selectedCategory.id ? (
                  <div className="flex justify-end space-x-3 sm:space-x-4">
                    <button
                      onClick={() => handleCancel(selectedCategory.id)}
                      className="px-3 sm:px-4 py-2 text-gray-700 hover:text-gray-900 font-medium flex items-center space-x-2 modal-btn-enhanced text-sm sm:text-base"
                    >
                      <X className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                    <button
                      onClick={() => handleSave(selectedCategory.id)}
                      className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2 modal-btn-enhanced text-sm sm:text-base"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleStartEdit(selectedCategory.id)}
                      className="px-3 sm:px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-2 modal-btn-enhanced text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit All</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Skills Content - Enhanced Mobile Scrolling */}
              <div 
                className="flex-1 p-4 sm:p-6 modal-scroll-enhanced modal-category-content overflow-y-auto overscroll-contain" 
                style={{ 
                  maxHeight: 'calc(100vh - 20rem)',
                  minHeight: '20vh'
                }}
              >
                {renderSkillsForCategory(selectedCategory)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Skill Modal */}
      {selectedSkill && renderIndividualSkillModal()}
    </div>
  );
} 