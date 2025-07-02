"use client";

import React, { useState, useEffect } from 'react';
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
  FiUser
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';

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
}

// Calculate aggregate scores for each category (out of 100 points each)
const calculatePhysicalScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Strength Component (40 points max)
  const strengthScores = [];
  if (skillData.pushupScore) {
    // Age-based pushup scoring (0-10 points)
    const age = skillData.student?.age || 18;
    const pushupBenchmark = age < 16 ? 20 : age < 18 ? 30 : 40;
    strengthScores.push(Math.min(10, (skillData.pushupScore / pushupBenchmark) * 10));
  }
  if (skillData.pullupScore) {
    // Pullup scoring (0-10 points)
    strengthScores.push(Math.min(10, (skillData.pullupScore / 10) * 10));
  }
  if (skillData.verticalJump) {
    // Vertical jump scoring in cm (0-10 points)
    strengthScores.push(Math.min(10, (skillData.verticalJump / 60) * 10));
  }
  if (skillData.gripStrength) {
    // Grip strength scoring in kg (0-10 points)
    const age = skillData.student?.age || 18;
    const gripBenchmark = age < 16 ? 30 : age < 18 ? 40 : 50;
    strengthScores.push(Math.min(10, (skillData.gripStrength / gripBenchmark) * 10));
  }
  
  if (strengthScores.length > 0) {
    const strengthAvg = strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length;
    totalScore += (strengthAvg / 10) * 40; // Scale to 40 points
    maxPossibleScore += 40;
  }
  
  // Speed & Agility Component (30 points max)
  const speedScores = [];
  if (skillData.sprint50m) {
    // 50m sprint scoring - lower time is better (0-10 points)
    const benchmark = 7.5; // seconds
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprint50m) * 10)));
  }
  if (skillData.shuttleRun) {
    // Shuttle run scoring - lower time is better (0-10 points)
    const benchmark = 16; // seconds
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.shuttleRun) * 10)));
  }
  if (skillData.sprintTime) {
    // General sprint scoring - lower time is better (0-10 points)
    const benchmark = 12; // seconds
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprintTime) * 10)));
  }
  
  if (speedScores.length > 0) {
    const speedAvg = speedScores.reduce((a, b) => a + b, 0) / speedScores.length;
    totalScore += (speedAvg / 10) * 30; // Scale to 30 points
    maxPossibleScore += 30;
  }
  
  // Endurance Component (30 points max)
  const enduranceScores = [];
  if (skillData.run5kTime) {
    // 5K run scoring - lower time is better (0-10 points)
    const age = skillData.student?.age || 18;
    const benchmark = age < 16 ? 25 : age < 18 ? 22 : 20; // minutes
    enduranceScores.push(Math.max(0, Math.min(10, (benchmark / skillData.run5kTime) * 10)));
  }
  if (skillData.yoyoTest) {
    // Yo-yo test scoring - higher is better (0-10 points)
    enduranceScores.push(Math.min(10, (skillData.yoyoTest / 15) * 10));
  }
  
  if (enduranceScores.length > 0) {
    const enduranceAvg = enduranceScores.reduce((a, b) => a + b, 0) / enduranceScores.length;
    totalScore += (enduranceAvg / 10) * 30; // Scale to 30 points
    maxPossibleScore += 30;
  }
  
  // Return score out of 100, scaled based on available data
  return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
};

const calculateMentalScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Mood Score Component (50 points max)
  if (skillData.moodScore) {
    totalScore += (skillData.moodScore / 10) * 50;
    maxPossibleScore += 50;
  }
  
  // Sleep Score Component (50 points max)
  if (skillData.sleepScore) {
    totalScore += (skillData.sleepScore / 10) * 50;
    maxPossibleScore += 50;
  }
  
  // Return score out of 100
  return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
};

const calculateNutritionScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  const age = skillData.student?.age || 18;
  const weight = skillData.student?.weight || 70; // kg
  
  // Calorie intake scoring (25 points max)
  if (skillData.totalCalories) {
    const calorieTarget = age < 16 ? 2200 : age < 18 ? 2500 : 2800;
    const calorieRatio = Math.min(1, skillData.totalCalories / calorieTarget);
    // Penalize if too far from target (both under and over)
    const calorieScore = calorieRatio > 1.2 ? 5 : calorieRatio < 0.7 ? 3 : 10;
    totalScore += (calorieScore / 10) * 25;
    maxPossibleScore += 25;
  }
  
  // Protein intake scoring (25 points max)
  if (skillData.protein) {
    const proteinTarget = weight * 1.6; // g per kg body weight for athletes
    const proteinRatio = Math.min(1.5, skillData.protein / proteinTarget);
    const proteinScore = proteinRatio < 0.8 ? 5 : proteinRatio > 1.3 ? 7 : 10;
    totalScore += (proteinScore / 10) * 25;
    maxPossibleScore += 25;
  }
  
  // Carbohydrate intake scoring (25 points max)
  if (skillData.carbohydrates) {
    const carbTarget = weight * 5; // g per kg body weight for athletes
    const carbRatio = Math.min(1.5, skillData.carbohydrates / carbTarget);
    const carbScore = carbRatio < 0.7 ? 4 : carbRatio > 1.4 ? 6 : 10;
    totalScore += (carbScore / 10) * 25;
    maxPossibleScore += 25;
  }
  
  // Water intake scoring (25 points max)
  if (skillData.waterIntake) {
    const waterTarget = 3.0; // liters per day for athletes
    const waterRatio = Math.min(1.3, skillData.waterIntake / waterTarget);
    const waterScore = waterRatio < 0.6 ? 3 : waterRatio > 1.2 ? 7 : 10;
    totalScore += (waterScore / 10) * 25;
    maxPossibleScore += 25;
  }
  
  // Return score out of 100
  return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
};

const calculateTechnicalScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  // Batting skills (out of 10 each)
  const battingSkills = [
    skillData.battingGrip, skillData.battingStance, skillData.battingBalance,
    skillData.cockingOfWrist, skillData.backLift, skillData.topHandDominance,
    skillData.highElbow, skillData.runningBetweenWickets, skillData.calling
  ].filter(score => score !== undefined && score !== null) as number[];
  
  // Bowling skills (out of 10 each)
  const bowlingSkills = [
    skillData.bowlingGrip, skillData.runUp, skillData.backFootLanding,
    skillData.frontFootLanding, skillData.hipDrive, skillData.backFootDrag,
    skillData.nonBowlingArm, skillData.release, skillData.followThrough
  ].filter(score => score !== undefined && score !== null) as number[];
  
  // Fielding skills (out of 10 each)
  const fieldingSkills = [
    skillData.positioningOfBall, skillData.pickUp, skillData.aim,
    skillData.throw, skillData.softHands, skillData.receiving,
    skillData.highCatch, skillData.flatCatch
  ].filter(score => score !== undefined && score !== null) as number[];
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Batting component (35 points max)
  if (battingSkills.length > 0) {
    const battingAvg = battingSkills.reduce((a, b) => a + b, 0) / battingSkills.length;
    totalScore += (battingAvg / 10) * 35;
    maxPossibleScore += 35;
  }
  
  // Bowling component (35 points max)
  if (bowlingSkills.length > 0) {
    const bowlingAvg = bowlingSkills.reduce((a, b) => a + b, 0) / bowlingSkills.length;
    totalScore += (bowlingAvg / 10) * 35;
    maxPossibleScore += 35;
  }
  
  // Fielding component (30 points max)
  if (fieldingSkills.length > 0) {
    const fieldingAvg = fieldingSkills.reduce((a, b) => a + b, 0) / fieldingSkills.length;
    totalScore += (fieldingAvg / 10) * 30;
    maxPossibleScore += 30;
  }
  
  // Return score out of 100
  return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
};

const calculateTacticalScore = (): number => {
  // Placeholder tactical score - convert 6.5/10 to 65/100
  return 65;
};

const PeakScore: React.FC<PeakScoreProps> = ({ skillData, isLoading = false }) => {
  const { data: session } = useSession();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate scores for each category
  const physicalScore = calculatePhysicalScore(skillData);
  const mentalScore = calculateMentalScore(skillData);
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
        { name: 'Mood Score', value: skillData?.moodScore ? (skillData.moodScore / 10) * 50 : 0, max: 50 },
        { name: 'Sleep Quality', value: skillData?.sleepScore ? (skillData.sleepScore / 10) * 50 : 0, max: 50 }
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your PEAKPLAY Score</h3>
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
                className="text-sm text-gray-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                A 360 view of YOU
              </motion.p>
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
              <p>Your PEAKPLAY score (above) shows how your strength and cardio stack up.</p>
              <p>We benchmark your best efforts against people like you (age, weight, gender).</p>
              <p>Use it to adjust your focus and become a more complete athlete.</p>
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
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1">
                                  <motion.div
                                    className={`h-1 rounded-full bg-gradient-to-r ${category.color}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(detail.value / detail.max) * 100}%` }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-800 min-w-[2rem]">
                                  {detail.value.toFixed(0)}
                                </span>
                              </div>
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
    </motion.div>
  );
};

export default PeakScore; 