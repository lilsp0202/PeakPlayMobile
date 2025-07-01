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

// Calculate aggregate scores for each category
const calculatePhysicalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  const scores = [];
  
  // Strength scores (using basic scoring for now)
  if (skillData.pushupScore) scores.push(Math.min(10, skillData.pushupScore / 5));
  if (skillData.pullupScore) scores.push(Math.min(10, skillData.pullupScore / 2));
  if (skillData.verticalJump) scores.push(Math.min(10, skillData.verticalJump / 3));
  if (skillData.gripStrength) scores.push(Math.min(10, skillData.gripStrength / 10));
  
  // Speed & Agility (lower is better for time-based)
  if (skillData.sprint50m) scores.push(Math.max(0, 10 - (skillData.sprint50m - 6) * 2));
  if (skillData.shuttleRun) scores.push(Math.max(0, 10 - (skillData.shuttleRun - 15) * 0.5));
  if (skillData.sprintTime) scores.push(Math.max(0, 10 - (skillData.sprintTime - 10) * 0.5));
  
  // Endurance (lower is better for time-based)
  if (skillData.run5kTime) scores.push(Math.max(0, 10 - (skillData.run5kTime - 20) * 0.2));
  if (skillData.yoyoTest) scores.push(Math.min(10, skillData.yoyoTest / 10));
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const calculateMentalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  const scores = [];
  if (skillData.moodScore) scores.push(skillData.moodScore);
  if (skillData.sleepScore) scores.push(skillData.sleepScore);
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const calculateNutritionAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  const scores = [];
  
  // Basic nutrition scoring (you can enhance this with age-based recommendations)
  if (skillData.totalCalories) scores.push(Math.min(10, skillData.totalCalories / 300));
  if (skillData.protein) scores.push(Math.min(10, skillData.protein / 15));
  if (skillData.carbohydrates) scores.push(Math.min(10, skillData.carbohydrates / 40));
  if (skillData.fats) scores.push(Math.min(10, skillData.fats / 8));
  if (skillData.waterIntake) scores.push(Math.min(10, skillData.waterIntake * 3.33)); // 0-3L -> 0-10
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const calculateTechnicalAggregateScore = (skillData: SkillData | null): number => {
  if (!skillData) return 0;
  
  const battingSkills = [
    skillData.battingGrip, skillData.battingStance, skillData.battingBalance,
    skillData.cockingOfWrist, skillData.backLift, skillData.topHandDominance,
    skillData.highElbow, skillData.runningBetweenWickets, skillData.calling
  ].filter(score => score !== undefined && score !== null) as number[];
  
  const bowlingSkills = [
    skillData.bowlingGrip, skillData.runUp, skillData.backFootLanding,
    skillData.frontFootLanding, skillData.hipDrive, skillData.backFootDrag,
    skillData.nonBowlingArm, skillData.release, skillData.followThrough
  ].filter(score => score !== undefined && score !== null) as number[];
  
  const fieldingSkills = [
    skillData.positioningOfBall, skillData.pickUp, skillData.aim,
    skillData.throw, skillData.softHands, skillData.receiving,
    skillData.highCatch, skillData.flatCatch
  ].filter(score => score !== undefined && score !== null) as number[];
  
  const allSkills = [...battingSkills, ...bowlingSkills, ...fieldingSkills];
  
  if (allSkills.length === 0) return 0;
  return allSkills.reduce((a, b) => a + b, 0) / allSkills.length;
};

const PeakScore: React.FC<PeakScoreProps> = ({ skillData, isLoading = false }) => {
  const { data: session } = useSession();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate scores for each category
  const physicalScore = calculatePhysicalAggregateScore(skillData);
  const mentalScore = calculateMentalAggregateScore(skillData);
  const nutritionScore = calculateNutritionAggregateScore(skillData);
  const technicalScore = calculateTechnicalAggregateScore(skillData);
  const tacticalScore = 6.5; // Placeholder for tactical skills

  // Calculate overall PeakScore (weighted average)
  const validScores = [
    { score: physicalScore, weight: 0.25 },
    { score: mentalScore, weight: 0.2 },
    { score: nutritionScore, weight: 0.2 },
    { score: technicalScore, weight: 0.25 },
    { score: tacticalScore, weight: 0.1 }
  ].filter(item => item.score > 0);

  const peakScore = validScores.length > 0 
    ? validScores.reduce((acc, item) => acc + (item.score * item.weight), 0) / 
      validScores.reduce((acc, item) => acc + item.weight, 0)
    : 0;

  const peakScoreScaled = Math.round(peakScore * 27.3); // Scale to match the 273 in the screenshot

  // Prepare radar chart data
  const radarData = [
    {
      skill: 'Physical',
      score: physicalScore,
      fullMark: 10,
      icon: '💪'
    },
    {
      skill: 'Mental',
      score: mentalScore,
      fullMark: 10,
      icon: '🧠'
    },
    {
      skill: 'Nutrition',
      score: nutritionScore,
      fullMark: 10,
      icon: '🥗'
    },
    {
      skill: 'Technical',
      score: technicalScore,
      fullMark: 10,
      icon: '⚡'
    },
    {
      skill: 'Tactical',
      score: tacticalScore,
      fullMark: 10,
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
        { name: 'Upper Strength', value: physicalScore * 0.8, max: 10 },
        { name: 'Lower Strength', value: physicalScore * 0.9, max: 10 },
        { name: 'Short Duration', value: physicalScore * 0.7, max: 10 },
        { name: 'Medium Duration', value: physicalScore * 0.85, max: 10 },
        { name: 'Longer Duration', value: physicalScore * 0.75, max: 10 },
        { name: 'Aerobic Endurance', value: physicalScore * 0.8, max: 10 }
      ]
    },
    {
      id: 'mental',
      name: 'Mental',
      icon: <FiUser className="w-6 h-6" />,
      score: mentalScore,
      color: 'from-purple-500 to-pink-500',
      details: [
        { name: 'Mood Score', value: skillData?.moodScore || 0, max: 10 },
        { name: 'Sleep Quality', value: skillData?.sleepScore || 0, max: 10 }
      ]
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: <FiHeart className="w-6 h-6" />,
      score: nutritionScore,
      color: 'from-green-500 to-teal-500',
      details: [
        { name: 'Calories', value: skillData?.totalCalories ? Math.min(10, skillData.totalCalories / 300) : 0, max: 10 },
        { name: 'Protein', value: skillData?.protein ? Math.min(10, skillData.protein / 15) : 0, max: 10 },
        { name: 'Carbs', value: skillData?.carbohydrates ? Math.min(10, skillData.carbohydrates / 40) : 0, max: 10 },
        { name: 'Fats', value: skillData?.fats ? Math.min(10, skillData.fats / 8) : 0, max: 10 },
        { name: 'Water', value: skillData?.waterIntake ? Math.min(10, skillData.waterIntake * 3.33) : 0, max: 10 }
      ]
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: <FiZap className="w-6 h-6" />,
      score: technicalScore,
      color: 'from-blue-500 to-indigo-500',
      details: [
        { name: 'Batting', value: technicalScore * 0.85, max: 10 },
        { name: 'Bowling', value: technicalScore * 0.9, max: 10 },
        { name: 'Fielding', value: technicalScore * 0.8, max: 10 }
      ]
    },
    {
      id: 'tactical',
      name: 'Tactical',
      icon: <FiTarget className="w-6 h-6" />,
      score: tacticalScore,
      color: 'from-yellow-500 to-orange-500',
      details: [
        { name: 'Game Reading', value: tacticalScore * 0.9, max: 10 },
        { name: 'Decision Making', value: tacticalScore * 0.85, max: 10 },
        { name: 'Strategy', value: tacticalScore * 0.8, max: 10 }
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
                  {peakScoreScaled}
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
                        domain={[0, 10]} 
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
                              {category.score.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">/10</span>
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
                        animate={{ width: `${(category.score / 10) * 100}%` }}
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
                                  {detail.value.toFixed(1)}
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
                  {peakScore >= 8 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">🎉 Excellent overall performance! You're in the top tier of athletes.</p>
                    </div>
                  )}
                  {peakScore >= 6 && peakScore < 8 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">👍 Good progress! Focus on your weaker areas to reach the next level.</p>
                    </div>
                  )}
                  {peakScore < 6 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">💪 Keep pushing! Every champion started somewhere. Consistency is key.</p>
                    </div>
                  )}
                  
                  {/* Specific recommendations */}
                  {physicalScore < 5 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm">🏋️‍♂️ Focus on physical training to build your foundation.</p>
                    </div>
                  )}
                  {mentalScore < 5 && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-purple-800 text-sm">🧘‍♂️ Consider meditation and sleep optimization for mental wellness.</p>
                    </div>
                  )}
                  {nutritionScore < 5 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm">🥗 Track your nutrition more consistently for better performance.</p>
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