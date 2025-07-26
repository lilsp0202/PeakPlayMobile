import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

// Import the actual scoring functions from SkillSnap
// These are the same calculation functions used in the SkillSnap component
const calculatePhysicalAggregateScore = (skillData: any): number => {
  if (!skillData) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Strength Component (40 points max) - REALISTIC BENCHMARKS
  const strengthScores = [];
  if (skillData.pushupScore) {
    const age = skillData.age || 18;
    const pushupBenchmark = age < 16 ? 60 : age < 18 ? 70 : 80;
    strengthScores.push(Math.min(10, (skillData.pushupScore / pushupBenchmark) * 10));
  }
  if (skillData.pullupScore) {
    strengthScores.push(Math.min(10, (skillData.pullupScore / 20) * 10));
  }
  if (skillData.verticalJump) {
    strengthScores.push(Math.min(10, (skillData.verticalJump / 90) * 10));
  }
  if (skillData.gripStrength) {
    const age = skillData.age || 18;
    const gripBenchmark = age < 16 ? 50 : age < 18 ? 60 : 70;
    strengthScores.push(Math.min(10, (skillData.gripStrength / gripBenchmark) * 10));
  }
  
  if (strengthScores.length > 0) {
    const strengthAvg = strengthScores.reduce((a, b) => a + b, 0) / strengthScores.length;
    totalScore += (strengthAvg / 10) * 40;
    maxPossibleScore += 40;
  }
  
  // Speed & Agility Component (30 points max)
  const speedScores = [];
  if (skillData.sprint50m) {
    const benchmark = 6.5;
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprint50m) * 10)));
  }
  if (skillData.shuttleRun) {
    const benchmark = 12;
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.shuttleRun) * 10)));
  }
  if (skillData.sprintTime) {
    const benchmark = 10;
    speedScores.push(Math.max(0, Math.min(10, (benchmark / skillData.sprintTime) * 10)));
  }
  
  if (speedScores.length > 0) {
    const speedAvg = speedScores.reduce((a, b) => a + b, 0) / speedScores.length;
    totalScore += (speedAvg / 10) * 30;
    maxPossibleScore += 30;
  }
  
  // Endurance Component (30 points max)
  const enduranceScores = [];
  if (skillData.run5kTime) {
    const age = skillData.age || 18;
    const benchmark = age < 16 ? 18 : age < 18 ? 17 : 16;
    enduranceScores.push(Math.max(0, Math.min(10, (benchmark / skillData.run5kTime) * 10)));
  }
  if (skillData.yoyoTest) {
    enduranceScores.push(Math.min(10, (skillData.yoyoTest / 25) * 10));
  }
  
  if (enduranceScores.length > 0) {
    const enduranceAvg = enduranceScores.reduce((a, b) => a + b, 0) / enduranceScores.length;
    totalScore += (enduranceAvg / 10) * 30;
    maxPossibleScore += 30;
  }
  
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

const calculateMentalAggregateScore = (skillData: any): number => {
  if (!skillData) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Mood Score (50 points max)
  if (skillData.moodScore !== undefined && skillData.moodScore !== null) {
    totalScore += (skillData.moodScore / 10) * 50;
    maxPossibleScore += 50;
  }

  // Sleep Score (50 points max)
  if (skillData.sleepScore !== undefined && skillData.sleepScore !== null) {
    totalScore += (skillData.sleepScore / 10) * 50;
    maxPossibleScore += 50;
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

const calculateGoalBasedNutritionScore = (skillData: any): number => {
  if (!skillData) return 0;

  // Use default values if student data not available
  const weight = skillData.weight || 70;
  const height = skillData.height || 175;
  const age = skillData.age || 20;
  
  // Activity multipliers for TDEE calculation
  const activityMultipliers = {
    moderate: 1.55
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (weight: number, height: number, age: number): number => {
    return 10 * weight + 6.25 * height - 5 * age + 5; // Assuming male
  };

  // Calculate targets for maintaining goal with moderate activity
  const bmr = calculateBMR(weight, height, age);
  const tdee = bmr * activityMultipliers.moderate;
  
  const targets = {
    calories: Math.round(tdee),
    protein: Math.round(weight * 1.6),
    carbs: Math.round(weight * 4.0),
    fats: Math.round((tdee * 0.25) / 9),
    water: Math.round(weight * 0.035 * 1.2) // Base + activity adjustment
  };

  // Calculate individual scores using exponential decay
  const calculateNutrientScore = (userInput: number, target: number): number => {
    if (!userInput || !target) return 0;
    const deviation = Math.abs(userInput - target) / target;
    return Math.round(100 * Math.exp(-1.5 * deviation));
  };

  let totalScore = 0;
  let maxPossibleScore = 100;

  if (skillData.totalCalories) {
    const calorieScore = calculateNutrientScore(skillData.totalCalories, targets.calories);
    totalScore += calorieScore * 0.25; // 25% weight
  } else {
    maxPossibleScore -= 25;
  }

  if (skillData.protein) {
    const proteinScore = calculateNutrientScore(skillData.protein, targets.protein);
    totalScore += proteinScore * 0.25; // 25% weight
  } else {
    maxPossibleScore -= 25;
  }

  if (skillData.carbohydrates) {
    const carbScore = calculateNutrientScore(skillData.carbohydrates, targets.carbs);
    totalScore += carbScore * 0.25; // 25% weight
  } else {
    maxPossibleScore -= 25;
  }

  if (skillData.fats) {
    const fatScore = calculateNutrientScore(skillData.fats, targets.fats);
    totalScore += fatScore * 0.125; // 12.5% weight
  } else {
    maxPossibleScore -= 12.5;
  }

  if (skillData.waterIntake) {
    const waterScore = calculateNutrientScore(skillData.waterIntake, targets.water);
    totalScore += waterScore * 0.125; // 12.5% weight
  } else {
    maxPossibleScore -= 12.5;
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

const calculateTechnicalAggregateScore = (skillData: any): number => {
  if (!skillData) return 0;

  let totalScore = 0;
  let maxPossibleScore = 0;

  // Batting skills (35 points max)
  const battingSkills = ['battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift', 
    'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling'];
  
  let battingScore = 0;
  let battingCount = 0;
  
  battingSkills.forEach(skillId => {
    const value = skillData[skillId];
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
    const value = skillData[skillId];
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
    const value = skillData[skillId];
    if (value !== undefined && value !== null) {
      fieldingScore += Math.min(10, Math.max(0, value));
      fieldingCount++;
    }
  });
  
  if (fieldingCount > 0) {
    totalScore += (fieldingScore / fieldingCount) * 3.0; // Scale to 30 points
    maxPossibleScore += 30;
  }

  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
};

const calculateTacticalAggregateScore = (skillData: any): number => {
  if (!skillData) return 0;
  // Tactical skills are not currently implemented in the Skills model
  // Return 0 for now
  return 0;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // PERFORMANCE OPTIMIZATION: Single optimized query with all includes
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            academy: true
          }
        },
        skills: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    // Verify access permissions quickly
    if (session.user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });
      
      if (!coach || student.coachId !== coach.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (session.user.role === 'ATHLETE') {
      const athleteProfile = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });
      
      if (!athleteProfile || athleteProfile.id !== studentId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // PERFORMANCE OPTIMIZATION: Fetch all data in parallel with limits for speed
    const [skillHistory, matchPerformances, feedback, actions, badges] = await Promise.all([
      // Skill history - limit to 30 entries for performance
      prisma.skillHistory.findMany({
        where: {
          studentId: studentId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'desc' },
        take: 30 // Limit for performance
      }),
      
      // Recent matches - limit to 10 for performance
      prisma.matchPerformance.findMany({
        where: {
          studentId: studentId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          match: {
            select: {
              id: true,
              matchDate: true,
              opponent: true,
              result: true,
              venue: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for performance
      }),
      
      // Feedback - limit to 10 for performance
      prisma.feedback.findMany({
        where: {
          studentId: studentId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          coach: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for performance
      }),
      
      // Actions - limit to 15 for performance
      prisma.action.findMany({
        where: {
          studentId: studentId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          coach: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 15 // Limit for performance
      }),
      
      // Badges - limit to 10 for performance
      prisma.studentBadge.findMany({
        where: {
          studentId: studentId,
          awardedAt: {
            gte: startDate,
            lte: endDate
          },
          isRevoked: false
        },
        include: {
          badge: {
            select: {
              id: true,
              name: true,
              description: true,
              level: true,
              icon: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { awardedAt: 'desc' },
        take: 10 // Limit for performance
      })
    ]);

    // PERFORMANCE OPTIMIZATION: Use latest skills data directly (already fetched)
    const skills = student.skills;
    const skillDataWithStudent = skills ? {
      ...skills,
      age: student.age,
      weight: student.weight,
      height: student.height
    } : null;

    // Calculate current metrics efficiently
    const currentMetrics = skillDataWithStudent ? {
      physical: calculatePhysicalAggregateScore(skillDataWithStudent),
      nutrition: calculateGoalBasedNutritionScore(skillDataWithStudent),
      mental: calculateMentalAggregateScore(skillDataWithStudent),
      wellness: 0, // Simplified for performance
      technique: calculateTechnicalAggregateScore(skillDataWithStudent),
      tactical: calculateTacticalAggregateScore(skillDataWithStudent)
    } : {
      physical: 0,
      nutrition: 0,
      mental: 0,
      wellness: 0,
      technique: 0,
      tactical: 0
    };

    // PERFORMANCE OPTIMIZATION: Simplified trends calculation
    const trends: any = {};
    if (skillHistory.length > 1) {
      const latest = skillHistory[0];
      const previous = skillHistory[1];
      
      Object.keys(currentMetrics).forEach(key => {
        const currentValue = currentMetrics[key as keyof typeof currentMetrics];
        const previousValue = previous[`${key}Score` as keyof typeof previous] as number || 0;
        trends[key] = currentValue - previousValue;
      });
    } else {
      Object.keys(currentMetrics).forEach(key => {
        trends[key] = 0;
      });
    }

    // PERFORMANCE OPTIMIZATION: Simplified match statistics
    const matchStats = {
      totalMatches: matchPerformances.length,
      averageRating: matchPerformances.length > 0 ? 
        matchPerformances.reduce((sum, match) => sum + (match.rating || 0), 0) / matchPerformances.length : 0,
      recentForm: matchPerformances.slice(0, 5).map(match => ({
        date: match.match?.matchDate || match.createdAt,
        opponent: match.match?.opponent || 'Unknown',
        rating: match.rating,
        result: match.match?.result || 'Unknown'
      }))
    };

    // Prepare comprehensive report data with optimized structure
    const reportData = {
      student: {
        id: student.id,
        name: student.studentName,
        username: student.username,
        email: student.email,
        age: student.age,
        height: student.height,
        weight: student.weight,
        academy: student.academy,
        sport: student.sport,
        role: student.role,
        createdAt: student.createdAt
      },
      coach: student.coach,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days
      },
      currentMetrics,
      peakScore: Object.values(currentMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(currentMetrics).length,
      trends,
      skillHistory: skillHistory.slice(0, 20), // Limit for performance
      recentFeedback: feedback.map(f => ({
        date: f.createdAt.toISOString().split('T')[0],
        coach: f.coach?.name || 'Unknown Coach',
        title: f.title,
        content: f.content
      })),
      actionItems: actions.map(a => ({
        date: a.createdAt.toISOString().split('T')[0],
        task: a.title,
        completed: a.isCompleted
      })),
      matchCount: matchPerformances.length,
      totalFeedback: feedback.length,
      matches: matchPerformances.map(mp => ({
        ...mp.match,
        performance: {
          played: mp.played,
          position: mp.position,
          rating: mp.rating,
          notes: mp.notes,
          stats: mp.stats
        }
      })),
      matchStats,
      feedback: feedback.map(f => ({
        id: f.id,
        title: f.title,
        content: f.content,
        category: f.category,
        priority: f.priority,
        coachName: f.coach?.name || 'Unknown Coach',
        createdAt: f.createdAt,
        isAcknowledged: f.isAcknowledged
      })),
      actions: actions.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        priority: a.priority,
        dueDate: a.dueDate,
        isCompleted: a.isCompleted,
        coachName: a.coach?.name || 'Unknown Coach',
        createdAt: a.createdAt
      })),
      badges: badges.map(sb => ({
        id: sb.badge.id,
        name: sb.badge.name,
        description: sb.badge.description,
        category: sb.badge.category?.name || 'General',
        level: sb.badge.level,
        earnedAt: sb.awardedAt
      })),
      summary: {
        totalSkillEntries: skillHistory.length,
        totalMatches: matchPerformances.length,
        totalFeedback: feedback.length,
        totalActions: actions.length,
        totalBadges: badges.length,
        averageScore: Object.values(currentMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(currentMetrics).length,
        completedActions: actions.filter(a => a.isCompleted).length,
        pendingActions: actions.filter(a => !a.isCompleted).length
      }
    };

    return NextResponse.json(reportData);

  } catch (error) {
    console.error('Error fetching comprehensive student data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student data' },
      { status: 500 }
    );
  }
} 