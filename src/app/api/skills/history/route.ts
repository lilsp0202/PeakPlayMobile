import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Unauthorized - Only coaches can access progress data' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Verify the student belongs to this coach
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { coach: true }
    });

    if (!student || student.coach?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate date range
    let dateFrom = startDate ? new Date(startDate) : subDays(new Date(), days);
    let dateTo = endDate ? new Date(endDate) : new Date();

    // Fetch historical skill data
    const skillHistory = await prisma.skillHistory.findMany({
      where: {
        studentId,
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      orderBy: { date: 'asc' }
    });

    // Return empty data if no historical data exists (no fake data generation)
    if (skillHistory.length === 0) {
      return NextResponse.json({ 
        history: [],
        student: {
          id: student.id,
          name: student.studentName,
          sport: student.sport
        },
        message: 'No historical data available for this athlete in the selected time period.'
      });
    }

    // Transform the data to match the expected format
    const transformedData = skillHistory.map(record => ({
      date: format(record.date, 'yyyy-MM-dd'),
      physicalScore: record.physicalScore,
      nutritionScore: record.nutritionScore,
      mentalScore: record.mentalScore,
      wellnessScore: record.wellnessScore,
      techniqueScore: record.techniqueScore,
      tacticalScore: record.tacticalScore,
      isMatchDay: record.isMatchDay,
      matchId: record.matchId,
      coachFeedback: record.coachFeedback,
      notes: record.notes
    }));

    return NextResponse.json({ 
      history: transformedData,
      student: {
        id: student.id,
        name: student.studentName,
        sport: student.sport
      }
    });

  } catch (error) {
    console.error('Error fetching skill history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill history' },
      { status: 500 }
    );
  }
}

// POST endpoint to add/update skill history (for future use)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, date, scores, notes, isMatchDay, matchId } = body;

    // Calculate scores based on current skills
    const skills = await prisma.skills.findUnique({
      where: { studentId }
    });

    if (!skills) {
      return NextResponse.json(
        { error: 'Skills not found for student' },
        { status: 404 }
      );
    }

    // Calculate composite scores
    const physicalScore = calculatePhysicalScore(skills);
    const nutritionScore = calculateNutritionScore(skills);
    const mentalScore = calculateMentalScore(skills);
    const wellnessScore = calculateWellnessScore(skills);
    const techniqueScore = calculateTechniqueScore(skills);
    const tacticalScore = calculateTacticalScore(skills);

    // Create or update skill history
    const skillHistory = await prisma.skillHistory.upsert({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date)
        }
      },
      update: {
        physicalScore,
        nutritionScore,
        mentalScore,
        wellnessScore,
        techniqueScore,
        tacticalScore,
        notes,
        isMatchDay,
        matchId
      },
      create: {
        studentId,
        date: new Date(date),
        physicalScore,
        nutritionScore,
        mentalScore,
        wellnessScore,
        techniqueScore,
        tacticalScore,
        notes,
        isMatchDay,
        matchId
      }
    });

    return NextResponse.json({ success: true, data: skillHistory });

  } catch (error) {
    console.error('Error saving skill history:', error);
    return NextResponse.json(
      { error: 'Failed to save skill history' },
      { status: 500 }
    );
  }
}

// Helper functions to calculate composite scores
function calculatePhysicalScore(skills: any): number {
  const scores = [];
  
  // Strength metrics
  if (skills.pushupScore !== null) scores.push(skills.pushupScore);
  if (skills.pullupScore !== null) scores.push(skills.pullupScore);
  if (skills.verticalJump !== null) scores.push(normalizeVerticalJump(skills.verticalJump));
  if (skills.gripStrength !== null) scores.push(normalizeGripStrength(skills.gripStrength));
  
  // Speed & Agility
  if (skills.sprint50m !== null) scores.push(normalizeSprintTime(skills.sprint50m));
  if (skills.shuttleRun !== null) scores.push(normalizeShuttleRun(skills.shuttleRun));
  
  // Endurance
  if (skills.run5kTime !== null) scores.push(normalize5kTime(skills.run5kTime));
  if (skills.yoyoTest !== null) scores.push(normalizeYoyoTest(skills.yoyoTest));
  
  return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
}

function calculateNutritionScore(skills: any): number {
  const scores = [];
  
  if (skills.protein !== null) scores.push(normalizeProtein(skills.protein));
  if (skills.carbohydrates !== null) scores.push(normalizeCarbs(skills.carbohydrates));
  if (skills.fats !== null) scores.push(normalizeFats(skills.fats));
  if (skills.waterIntake !== null) scores.push(normalizeWaterIntake(skills.waterIntake));
  if (skills.totalCalories !== null) scores.push(normalizeCalories(skills.totalCalories));
  
  return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
}

function calculateMentalScore(skills: any): number {
  const scores = [];
  
  if (skills.moodScore !== null && skills.moodScore !== undefined) scores.push(skills.moodScore * 10); // Convert 1-10 to 0-100 scale
  if (skills.sleepScore !== null && skills.sleepScore !== undefined) scores.push(skills.sleepScore * 10); // Convert 1-10 to 0-100 scale
  
  return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
}

function calculateWellnessScore(skills: any): number {
  // Combine physical, nutrition, and mental for overall wellness
  const physical = calculatePhysicalScore(skills);
  const nutrition = calculateNutritionScore(skills);
  const mental = calculateMentalScore(skills);
  
  const validScores = [physical, nutrition, mental].filter(score => score > 0);
  return validScores.length > 0 ? validScores.reduce((a, b) => a + b) / validScores.length : 0;
}

function calculateTechniqueScore(skills: any): number {
  const technicalFields = [
    // Batting skills (9)
    'battingGrip', 'battingStance', 'battingBalance', 'cockingOfWrist', 'backLift',
    'topHandDominance', 'highElbow', 'runningBetweenWickets', 'calling',
    // Bowling skills (9)
    'bowlingGrip', 'runUp', 'backFootLanding', 'frontFootLanding', 'hipDrive',
    'backFootDrag', 'nonBowlingArm', 'release', 'followThrough',
    // Fielding skills (8)
    'positioningOfBall', 'pickUp', 'aim', 'throw', 'softHands', 'receiving', 'highCatch', 'flatCatch'
  ];
  
  let totalScore = 0;
  let validFields = 0;
  
  technicalFields.forEach(field => {
    if (skills[field] !== null && skills[field] !== undefined && skills[field] > 0) {
      const normalizedScore = (skills[field] / 10) * 100; // Convert 0-10 to 0-100 scale
      totalScore += normalizedScore;
      validFields++;
    }
  });
  
  return validFields > 0 ? Math.round(totalScore / validFields) : 0;
}

function calculateTacticalScore(skills: any): number {
  const tacticalFields = [
    'aim', 'calling', 'runningBetweenWickets', 'softHands',
    'topHandDominance', 'pickUp', 'throw', 'receiving',
    'flatCatch', 'highCatch'
  ];
  
  const scores = tacticalFields
    .filter(field => skills[field] !== null && skills[field] !== undefined)
    .map(field => skills[field] * 10); // Convert 0-10 to 0-100 scale
  
  return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
}

// Normalization functions to convert raw values to 0-100 scale
function normalizeVerticalJump(cm: number): number {
  // Assuming 30-80cm range
  return Math.min(100, Math.max(0, ((cm - 30) / 50) * 100));
}

function normalizeGripStrength(kg: number): number {
  // Assuming 20-60kg range
  return Math.min(100, Math.max(0, ((kg - 20) / 40) * 100));
}

function normalizeSprintTime(seconds: number): number {
  // Assuming 6-10 seconds range (lower is better)
  return Math.min(100, Math.max(0, ((10 - seconds) / 4) * 100));
}

function normalizeShuttleRun(seconds: number): number {
  // Assuming 15-25 seconds range (lower is better)
  return Math.min(100, Math.max(0, ((25 - seconds) / 10) * 100));
}

function normalize5kTime(minutes: number): number {
  // Assuming 18-30 minutes range (lower is better)
  return Math.min(100, Math.max(0, ((30 - minutes) / 12) * 100));
}

function normalizeYoyoTest(level: number): number {
  // Level 0-21, direct conversion
  return Math.min(100, (level / 21) * 100);
}

function normalizeProtein(grams: number): number {
  // Assuming 50-150g range, optimal around 100g
  const optimal = 100;
  if (grams < optimal) {
    return (grams / optimal) * 100;
  } else {
    return Math.max(0, 100 - ((grams - optimal) / 50) * 20);
  }
}

function normalizeCarbs(grams: number): number {
  // Assuming 200-400g range, optimal around 300g
  const optimal = 300;
  if (grams < optimal) {
    return (grams / optimal) * 100;
  } else {
    return Math.max(0, 100 - ((grams - optimal) / 100) * 20);
  }
}

function normalizeFats(grams: number): number {
  // Assuming 50-100g range, optimal around 75g
  const optimal = 75;
  if (grams < optimal) {
    return (grams / optimal) * 100;
  } else {
    return Math.max(0, 100 - ((grams - optimal) / 25) * 20);
  }
}

function normalizeWaterIntake(liters: number): number {
  // Assuming 2-4 liters range, optimal around 3 liters
  const optimal = 3;
  if (liters < optimal) {
    return (liters / optimal) * 100;
  } else {
    return Math.min(100, 100 - ((liters - optimal) / 1) * 10);
  }
}

function normalizeCalories(calories: number): number {
  // Assuming 2000-3000 range, optimal around 2500
  const optimal = 2500;
  if (calories < optimal) {
    return (calories / optimal) * 100;
  } else {
    return Math.max(0, 100 - ((calories - optimal) / 500) * 20);
  }
} 