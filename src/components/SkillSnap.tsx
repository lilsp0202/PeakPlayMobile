"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Edit, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity, FiSave, FiX, FiEdit } from "react-icons/fi";
import type { Session } from "next-auth";

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
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
      </svg>
    ),
    colorScheme: {
      primary: "slate-600",
      secondary: "slate-100",
      background: "slate-50",
      gradient: "from-slate-50 to-gray-50"
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
        colorScheme: { primary: "red-600", secondary: "red-100", background: "red-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
            <rect x="6" y="10" width="2" height="8" rx="1"/>
            <rect x="16" y="6" width="2" height="8" rx="1"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
            <path d="M12 3v18" strokeWidth="1"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 11H7v3h2v-3zm4 0h-2v3h2v-3zm4 0h-2v3h2v-3zm2-7h-2V2h-2v2H9V2H7v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            <path d="M18 8l-2-2m0 0L14 8m2-2v6" strokeWidth="1"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            <path d="M16 6l-2-2m0 0L12 6m2-2v4" strokeWidth="1"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18m-5 4l4-4m0 0l-4-4"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
            <circle cx="12" cy="12" r="9" strokeWidth="1"/>
            <path d="M8 12l2-2m6 2l-2-2" strokeWidth="1"/>
          </svg>
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
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16l8-8 8 8V4H4z"/>
            <circle cx="12" cy="12" r="2" strokeWidth="1"/>
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
      primary: "violet-600",
      secondary: "violet-100",
      background: "violet-50",
      gradient: "from-violet-50 to-purple-50"
    },
    skills: [
      {
        id: "moodScore",
        name: "Mood Score",
        unit: "/10",
        type: "score",
        description: "Daily mood and motivation rating",
        colorScheme: { primary: "violet-600", secondary: "violet-100", background: "violet-50" },
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
        colorScheme: { primary: "violet-600", secondary: "violet-100", background: "violet-50" },
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
      primary: "amber-600",
      secondary: "amber-100",
      background: "amber-50",
      gradient: "from-amber-50 to-orange-50"
    },
    skills: [
      {
        id: "totalCalories",
        name: "Total Calories",
        unit: "kcal",
        type: "calories",
        description: "Daily caloric intake",
        colorScheme: { primary: "amber-600", secondary: "amber-100", background: "amber-50" },
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
        colorScheme: { primary: "amber-600", secondary: "amber-100", background: "amber-50" },
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
        colorScheme: { primary: "amber-600", secondary: "amber-100", background: "amber-50" },
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
        colorScheme: { primary: "amber-600", secondary: "amber-100", background: "amber-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
          </svg>
        ),
      },
      {
        id: "waterIntake",
        name: "Water Intake",
        unit: "liters",
        type: "score",
        description: "Daily water intake in liters",
        colorScheme: { primary: "amber-600", secondary: "amber-100", background: "amber-50" },
        icon: (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8l6 6m0-6l-6 6m6-6v12"/>
            <path d="M19 13l-7 7-7-7c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0l1.5 1.5 1.5-1.5c1.5-1.5 4-1.5 5.5 0s1.5 4 0 5.5z"/>
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
      primary: "teal-600",
      secondary: "teal-100",
      background: "teal-50",
      gradient: "from-teal-50 to-cyan-50"
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
        colorScheme: { primary: "teal-600", secondary: "teal-100", background: "teal-50" }
      },
      {
        id: "bowlingGrip", 
        name: "Bowling Skills",
        unit: "avg",
        type: "score" as const,
        description: "Bowling technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><circle cx="12" cy="12" r="9" strokeWidth="1"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="14" cy="10" r="1" fill="currentColor"/></svg>,
        colorScheme: { primary: "teal-600", secondary: "teal-100", background: "teal-50" }
      },
      {
        id: "positioningOfBall",
        name: "Fielding Skills", 
        unit: "avg",
        type: "score" as const,
        description: "Fielding technique mastery",
        icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m-3-3a1.5 1.5 0 013 0"/><circle cx="12" cy="12" r="2" strokeWidth="1"/></svg>,
        colorScheme: { primary: "teal-600", secondary: "teal-100", background: "teal-50" }
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
  
  // Strength Skills
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
  
  // Vertical Jump (0-80 cm range, normalize to 0-10)
  if (skillData.verticalJump !== undefined && skillData.verticalJump !== null) {
    const verticalJumpNormalized = Math.min(10, Math.max(0, (skillData.verticalJump / 80) * 10));
    normalizedScores.push(verticalJumpNormalized);
  }
  
  // Grip Strength (0-70 kg range, normalize to 0-10)
  if (skillData.gripStrength !== undefined && skillData.gripStrength !== null) {
    const gripStrengthNormalized = Math.min(10, Math.max(0, (skillData.gripStrength / 70) * 10));
    normalizedScores.push(gripStrengthNormalized);
  }
  
  // Speed & Agility Skills
  // Sprint time (8-20 seconds, lower is better)
  if (skillData.sprintTime !== undefined && skillData.sprintTime !== null) {
    const sprintNormalized = Math.min(10, Math.max(0, 10 - ((skillData.sprintTime - 8) / (20 - 8)) * 10));
    normalizedScores.push(sprintNormalized);
  }
  
  // 50m Sprint (6-12 seconds, lower is better)
  if (skillData.sprint50m !== undefined && skillData.sprint50m !== null) {
    const sprint50mNormalized = Math.min(10, Math.max(0, 10 - ((skillData.sprint50m - 6) / (12 - 6)) * 10));
    normalizedScores.push(sprint50mNormalized);
  }
  
  // Shuttle Run (12-20 seconds, lower is better)
  if (skillData.shuttleRun !== undefined && skillData.shuttleRun !== null) {
    const shuttleRunNormalized = Math.min(10, Math.max(0, 10 - ((skillData.shuttleRun - 12) / (20 - 12)) * 10));
    normalizedScores.push(shuttleRunNormalized);
  }
  
  // Endurance Skills
  // 5K time (15-40 minutes, lower is better)
  if (skillData.run5kTime !== undefined && skillData.run5kTime !== null) {
    const run5kNormalized = Math.min(10, Math.max(0, 10 - ((skillData.run5kTime - 15) / (40 - 15)) * 10));
    normalizedScores.push(run5kNormalized);
  }
  
  // Yo-Yo Test (0-21 levels, higher is better)
  if (skillData.yoyoTest !== undefined && skillData.yoyoTest !== null) {
    const yoyoTestNormalized = Math.min(10, Math.max(0, (skillData.yoyoTest / 21) * 10));
    normalizedScores.push(yoyoTestNormalized);
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
    
    // Normalize water intake (1-5 liters range to 0-10 scale)
    if (skillData.waterIntake !== undefined && skillData.waterIntake !== null) {
      const waterScore = Math.min(10, Math.max(0, ((skillData.waterIntake - 1) / (5 - 1)) * 10));
      scores.push(waterScore);
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
  
  if (skillData.waterIntake !== undefined && skillData.waterIntake !== null) {
    // Recommended water intake is 2.5 liters
    const recommendedWater = 2.5;
    const waterScore = Math.max(0, 10 - Math.abs((skillData.waterIntake - recommendedWater) / recommendedWater) * 10);
    scores.push(Math.min(10, waterScore));
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
      className={`bg-white rounded-xl p-4 sm:p-6 border-2 shadow-sm transition-all duration-200 ${
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
  const [averages, setAverages] = useState<SkillAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check if editing is allowed based on user type and context
  const canEdit = isCoachView || (session?.user?.role === 'ATHLETE' && !studentId);

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
    setSelectedCategory(null);
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
                showComparison={category.id !== "MENTAL"}
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
            // Remove onClick prop - no more individual skill modals
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
      {selectedCategory && (
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
                  <div className="p-4 sm:p-6 max-w-5xl mx-auto">
                    {/* Close button */}
                    <button
                      onClick={closeModal}
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
                        <button
                          onClick={() => handleStartEdit(selectedCategory.id)}
                          className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <FiEdit className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                          Edit All Skills
                        </button>
                      ) : (
                        <div className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gray-300 text-gray-600 rounded-xl text-sm sm:text-base font-medium">
                          <FiActivity className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                          View Only
                        </div>
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
    </div>
  );
} 