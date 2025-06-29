"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Edit, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { FiActivity, FiSave, FiX, FiEdit } from "react-icons/fi";

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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            <circle cx="12" cy="8" r="2" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            <rect x="6" y="10" width="2" height="8" rx="1"/>
            <rect x="16" y="6" width="2" height="8" rx="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            <path d="M18 8l-2-2m0 0L14 8m2-2v6" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            <circle cx="12" cy="12" r="9" strokeWidth="1"/>
            <path d="M8 12l2-2m6 2l-2-2" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
            <circle cx="12" cy="12" r="2" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            <circle cx="8" cy="8" r="1" strokeWidth="1"/>
            <circle cx="16" cy="8" r="1" strokeWidth="1"/>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
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
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>,
        colorScheme: { primary: "orange-600", secondary: "orange-100", background: "orange-50" }
      },
      {
        id: "bowlingGrip", 
        name: "Bowling Skills",
        unit: "avg",
        type: "score" as const,
        description: "Bowling technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><circle cx="12" cy="12" r="9" strokeWidth="1"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="14" cy="10" r="1" fill="currentColor"/></svg>,
        colorScheme: { primary: "orange-600", secondary: "orange-100", background: "orange-50" }
      },
      {
        id: "positioningOfBall",
        name: "Fielding Skills", 
        unit: "avg",
        type: "score" as const,
        description: "Fielding technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m-3-3a1.5 1.5 0 013 0"/><circle cx="12" cy="12" r="2" strokeWidth="1"/></svg>,
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

  // Normalize raw scores to 0-10 scale based on the new logical ranges
  const normalizedScores = [];
  
  // Push-ups (0-100 range, normalize to 0-10)
  if (skillData.pushupScore !== undefined && skillData.pushupScore !== null) {
    const pushupNormalized = Math.min(10, Math.max(0, (skillData.pushupScore / 100) * 10));
    normalizedScores.push(pushupNormalized);
  }
  
  // Pull-ups (0-50 range, normalize to 0-10)
  if (skillData.pullupScore !== undefined && skillData.pullupScore !== null) {
    const pullupNormalized = Math.min(10, Math.max(0, (skillData.pullupScore / 50) * 10));
    normalizedScores.push(pullupNormalized);
  }
  
  // Sprint time (8-20 seconds, lower is better)
  if (skillData.sprintTime !== undefined && skillData.sprintTime !== null) {
    const sprintNormalized = Math.min(10, Math.max(0, 10 - ((skillData.sprintTime - 8) / (20 - 8)) * 10));
    normalizedScores.push(sprintNormalized);
  }
  
  // 5K time (15-40 minutes, lower is better)
  if (skillData.run5kTime !== undefined && skillData.run5kTime !== null) {
    const run5kNormalized = Math.min(10, Math.max(0, 10 - ((skillData.run5kTime - 15) / (40 - 15)) * 10));
    normalizedScores.push(run5kNormalized);
  }

  if (normalizedScores.length === 0) return 0;

  const average = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
  return Math.min(10, Math.max(0, Math.round(average * 10) / 10)); // Round to 1 decimal and ensure 0-10 range
};

const calculateMentalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  const scores = [
    skillData.moodScore || 0,
    skillData.sleepScore || 0,
  ];

  // Ensure all mental scores are capped at 10
  const cappedScores = scores.map(score => Math.min(10, Math.max(0, score)));
  const validScores = cappedScores.filter(score => score > 0);
  if (validScores.length === 0) return 0;

  const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  return Math.min(10, Math.max(0, Math.round(average * 10) / 10));
};

const calculateNutritionAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;

  // Calculate recommended values based on student data
  const student = skillData.student;
  if (!student || !student.weight || !student.height) {
    // If no student data, use the values as percentages within their ranges
    const scores = [];
    
    // Normalize calories (1000-4000 range to 0-10 scale)
    if (skillData.totalCalories !== undefined && skillData.totalCalories !== null) {
      const calorieScore = Math.min(10, Math.max(0, ((skillData.totalCalories - 1000) / (4000 - 1000)) * 10));
      scores.push(calorieScore);
    }
    
    // Normalize protein (20-200g range to 0-10 scale) 
    if (skillData.protein !== undefined && skillData.protein !== null) {
      const proteinScore = Math.min(10, Math.max(0, ((skillData.protein - 20) / (200 - 20)) * 10));
      scores.push(proteinScore);
    }
    
    // Normalize carbs (50-500g range to 0-10 scale)
    if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null) {
      const carbScore = Math.min(10, Math.max(0, ((skillData.carbohydrates - 50) / (500 - 50)) * 10));
      scores.push(carbScore);
    }
    
    // Normalize fats (20-150g range to 0-10 scale)
    if (skillData.fats !== undefined && skillData.fats !== null) {
      const fatScore = Math.min(10, Math.max(0, ((skillData.fats - 20) / (150 - 20)) * 10));
      scores.push(fatScore);
    }

    if (scores.length === 0) return 0;
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.min(10, Math.max(0, Math.round(average * 10) / 10));
  }

  const nutrition = calculatePersonalizedNutrition(student.weight, student.height, student.age);

  // Calculate scores based on how close actual values are to recommended values (0-10 scale)
  const scores = [];
  
  if (skillData.totalCalories !== undefined && skillData.totalCalories !== null) {
    const calorieScore = Math.max(0, 10 - Math.abs((skillData.totalCalories - nutrition.totalCalories) / nutrition.totalCalories) * 10);
    scores.push(Math.min(10, calorieScore));
  }
  
  if (skillData.protein !== undefined && skillData.protein !== null) {
    const proteinScore = Math.max(0, 10 - Math.abs((skillData.protein - nutrition.protein) / nutrition.protein) * 10);
    scores.push(Math.min(10, proteinScore));
  }
  
  if (skillData.carbohydrates !== undefined && skillData.carbohydrates !== null) {
    const carbScore = Math.max(0, 10 - Math.abs((skillData.carbohydrates - nutrition.carbohydrates) / nutrition.carbohydrates) * 10);
    scores.push(Math.min(10, carbScore));
  }
  
  if (skillData.fats !== undefined && skillData.fats !== null) {
    const fatScore = Math.max(0, 10 - Math.abs((skillData.fats - nutrition.fats) / nutrition.fats) * 10);
    scores.push(Math.min(10, fatScore));
  }

  if (scores.length === 0) return 0;

  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.min(10, Math.max(0, Math.round(average * 10) / 10));
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

  const average = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  // Convert 0-10 scale to 0-100 percentage and ensure it's capped at 100
  return Math.min(100, Math.max(0, Math.round(average * 10)));
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
    if (score >= 8) return 'from-green-500 to-emerald-600';
    if (score >= 6) return 'from-blue-500 to-indigo-600';
    if (score >= 4) return 'from-yellow-500 to-orange-600';
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
            {aggregateScore >= 8 ? 'Excellent' : 
             aggregateScore >= 6 ? 'Good' : 
             aggregateScore >= 4 ? 'Fair' : 'Needs Improvement'}
          </p>
        </div>
      </div>
      <motion.div 
        className="text-3xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        {aggregateScore >= 8 ? '🌟' : 
         aggregateScore >= 6 ? '⭐' : 
         aggregateScore >= 4 ? '💪' : '🎯'}
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
    switch (skill.type) {
      case "count":
        return { min: 0, max: 100, step: 1 };
      case "time":
        if (skill.id === "sprintTime") {
          return { min: 0, max: 30, step: 0.1 };
        } else {
          return { min: 0, max: 60, step: 1 };
        }
      case "score":
        return { min: 0, max: 10, step: 1 };
      case "grams":
        if (skill.id === "protein") {
          return { min: 0, max: 200, step: 5 };
        } else if (skill.id === "carbohydrates") {
          return { min: 0, max: 500, step: 10 };
        } else {
          return { min: 0, max: 150, step: 5 };
        }
      case "calories":
        return { min: 0, max: 5000, step: 50 };
      default:
        return { min: 0, max: 100, step: 1 };
    }
  };

  const range = getSkillRange();

  const getPercentage = () => {
    if (skill.type === "time") {
      // For time-based skills, invert the percentage (lower is better)
      if (score === 0) return 0;
      const percentage = ((range.max - score) / range.max) * 100;
      return Math.max(0, Math.min(100, percentage));
    } else {
      // For other skills, higher is better
      const percentage = (score / range.max) * 100;
      return Math.max(0, Math.min(100, percentage));
    }
  };

  const getAveragePercentage = () => {
    if (!showComparison || !average) return 0;
    if (skill.type === "time") {
      // For time-based skills, invert the percentage (lower is better)
      if (average === 0) return 0;
      const percentage = ((range.max - average) / range.max) * 100;
      return Math.max(0, Math.min(100, percentage));
    } else {
      // For other skills, higher is better
      const percentage = (average / range.max) * 100;
      return Math.max(0, Math.min(100, percentage));
    }
  };

  const getProgressColor = () => {
    const percentage = getPercentage();
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const formatValue = (value: number) => {
    switch (skill.type) {
      case "time":
        return skill.id === "sprintTime" ? `${value.toFixed(1)}s` : `${value} min`;
      case "count":
        return `${value} reps`;
      case "score":
        return `${value}/10`;
      case "grams":
        return `${value}g`;
      case "calories":
        return `${value} kcal`;
      default:
        return value.toString();
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl p-4 sm:p-6 border-2 shadow-sm hover:shadow-md transition-all duration-200 ${
        isEditing 
          ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
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
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={score}
                onChange={(e) => onScoreChange(skill.id, parseFloat(e.target.value) || 0)}
                min={range.min}
                max={range.max}
                step={range.step}
                className="w-20 sm:w-24 px-3 py-3 text-lg font-semibold border-2 border-blue-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200"
                inputMode="decimal"
                autoComplete="off"
              />
              <span className="text-sm font-medium text-gray-600">{skill.unit}</span>
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
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${skill.colorScheme.background}`}
            style={{ width: `${Math.min(getPercentage(), 100)}%` }}
          />
        </div>
      </div>

      {/* Validation feedback for editing */}
      {isEditing && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-600">
            Range: {range.min} - {range.max} {skill.unit}
          </p>
          <div className="flex items-center space-x-2">
            {score < range.min && (
              <span className="text-xs text-red-500 font-medium">Too low</span>
            )}
            {score > range.max && (
              <span className="text-xs text-red-500 font-medium">Too high</span>
            )}
            {score >= range.min && score <= range.max && score > 0 && (
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

// Category Card component for main grid
const CategoryCard: React.FC<{
  category: SkillCategory;
  onOpen: () => void;
  skillData: SkillData | null;
}> = ({ category, onOpen, skillData }) => {
  const aggregateScore = calculateAggregateScore(category, skillData);
  // Convert 0-10 aggregate score to 0-100 percentage, properly capped
  const progress = Math.min(100, Math.max(0, Math.round(aggregateScore * 10)));

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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userProgressPercentage}%` }}
              />
            </div>
            <div
              className="absolute top-0 h-2 w-0.5 bg-gray-400 rounded-full"
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
        icon={
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.5 17.5L7 13l11 11-4.5 4.5L2.5 17.5zm15-15L13 7l1.5 1.5L19 4l-1.5-1.5zM6 3l3 3-3 3-3-3 3-3z"/></svg>
        }
      />

      <SectionCard
        title="Bowling"
        sectionId="bowling"
        skills={bowlingSkills}
        colorScheme="bowling"
        icon={
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
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
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
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
  onSkillsUpdated,
  onModalChange // Add this new prop
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
  const [isSaving, setIsSaving] = useState(false);

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
    if (selectedSkill) {
      // For individual skill editing, only initialize that specific skill
      setEditedScores(prev => ({
        ...prev,
        [selectedSkill.id]: skillData?.[selectedSkill.id as keyof SkillData] as number || 0
      }));
    } else if (categoryId === "TECHNIQUE") {
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
      setLoading(true);
      
      let categoryScores: Record<string, number> = {};
      
      if (selectedSkill) {
        // For individual skill editing, only save that specific skill
        categoryScores[selectedSkill.id] = editedScores[selectedSkill.id] || 0;
      } else if (categoryId === "TECHNIQUE") {
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
      setIsSaving(false);
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
    setSelectedCategory(category);
    setSelectedSkill(null);
    // Lock body scroll when modal opens
    lockBodyScroll();
    // Notify parent component
    onModalChange?.(true);
  };

  const openSkillModal = (skill: SkillItem, category: SkillCategory) => {
    setSelectedCategory(category);
    setSelectedSkill(skill);
    
    // Initialize edit state for this skill
    setEditedScores(prev => ({
      ...prev,
      [skill.id]: skillData?.[skill.id as keyof SkillData] as number || 0
    }));
    
    // Lock body scroll when modal opens
    lockBodyScroll();
    // Notify parent component
    onModalChange?.(true);
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setSelectedSkill(null);
    // Cancel any ongoing edits
    if (isEditing) {
      handleCancel(isEditing);
    }
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

    return (
      <div className="space-y-4 pb-16">
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
        <>
          {/* Background overlay - separate from modal content */}
          <div 
            className="fixed inset-0 z-[9998] bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          
          {/* Modal container - independent of scroll context */}
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="fixed inset-0 pointer-events-auto">
              <div className="w-full h-full bg-white flex flex-col">
                {/* Fixed Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                  <div className="p-6 max-w-5xl mx-auto">
                    {/* Close button */}
                    <button
                      onClick={closeModal}
                      className="absolute top-4 right-4 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 z-[10000] shadow-lg"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {/* Modal header */}
                    <div className="mb-6">
                      <div className="flex items-center space-x-4 pr-16">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedCategory.colorScheme.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          {selectedCategory.icon}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h2>
                          <p className="text-base text-gray-700 leading-relaxed">{selectedCategory.description}</p>
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
                            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-1"
                          >
                            <FiSave className="mr-2 w-5 h-5" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => handleCancel(selectedCategory.id)}
                            className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl order-2 sm:order-2"
                          >
                            <FiX className="mr-2 w-5 h-5" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(selectedCategory.id)}
                          className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <FiEdit className="mr-2 w-5 h-5" />
                          Edit All Skills
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-6 pb-32 max-w-5xl mx-auto min-h-full">
                    {renderSkillsForCategory(selectedCategory)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Individual Skill Modal */}
      {selectedSkill && selectedCategory && (
        <>
          {/* Background overlay - separate from modal content */}
          <div 
            className="fixed inset-0 z-[9998] bg-black bg-opacity-80 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          
          {/* Modal container - independent of scroll context */}
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div className="fixed inset-0 pointer-events-auto">
              <div className="w-full h-full bg-white overflow-y-auto custom-scrollbar">
                {/* Close button */}
                <button
                  onClick={closeModal}
                  className="fixed top-4 right-4 p-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 z-[10000] shadow-lg"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Modal content */}
                <div className="p-6 pt-16 max-w-5xl mx-auto">
                  {/* Modal header */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedCategory.colorScheme.gradient} flex items-center justify-center shadow-lg`}>
                        {selectedSkill.icon}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedSkill.name}
                        </h3>
                        <p className="text-base text-gray-700 capitalize">
                          {selectedSkill.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mb-8">
                    {isEditing === selectedCategory.id ? (
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                        <button
                          onClick={() => handleCancel(selectedCategory.id)}
                          className="flex items-center justify-center px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl order-2 sm:order-1"
                        >
                          <X className="w-5 h-5 mr-2" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={() => handleSave(selectedCategory.id)}
                          disabled={isSaving}
                          className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleStartEdit(selectedCategory.id)}
                          className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Edit className="w-5 h-5 mr-2" />
                          <span>Edit</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Modal content */}
                  <div className="pb-8">
                    <div className="space-y-6">
                      <div className={`bg-gradient-to-r ${selectedCategory.colorScheme.gradient} rounded-xl p-6 border border-${selectedCategory.colorScheme.primary}-200 shadow-lg`}>
                        <h4 className={`text-xl font-bold text-${selectedCategory.colorScheme.primary}-900 mb-3 flex items-center`}>
                          <FiActivity className="mr-3 w-6 h-6" />
                          Skill Development Tracking
                        </h4>
                        <p className={`text-${selectedCategory.colorScheme.primary}-700 text-base mb-4`}>
                          Track and monitor your {selectedSkill.name.toLowerCase()} progress.
                        </p>
                      </div>
                      <div className="pb-8">
                        <SkillBar
                          skill={selectedSkill}
                          userScore={
                            isEditing === selectedCategory.id
                              ? editedScores[selectedSkill.id]
                              : skillData?.[selectedSkill.id as keyof SkillData] as number
                          }
                          averageScore={averages?.averages?.[selectedSkill.id] || 0}
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 