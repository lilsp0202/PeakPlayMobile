import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma, cachedQueries } from "../../../lib/prisma";
import { BadgeEngine } from "@/lib/badgeEngine";
import type { Session } from "next-auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    // PERFORMANCE OPTIMIZATION: If coach is requesting specific student data
    if (studentId && session.user.role === "COACH") {
      // PERFORMANCE: Use cached coach lookup
      const coach = await cachedQueries.getCoachByUserId(session.user.id);
      if (!coach) {
        return NextResponse.json(
          { message: "Coach profile not found" },
          { status: 404 }
        );
      }
      
      // PERFORMANCE: Efficient access verification
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { coachId: true, studentName: true, academy: true, sport: true }
      });
      
      if (!student || student.coachId !== coach.id) {
        return NextResponse.json(
          { message: "Not authorized to access this student's skills" },
          { status: 403 }
        );
      }
      
      // PERFORMANCE: Optimized skills query
      const skills = await prisma.skills.findUnique({
        where: { studentId },
        select: {
          // Only select necessary fields for performance
          id: true,
          studentId: true,
          studentName: true,
          age: true,
          
          // Physical skills
          pushupScore: true,
          pullupScore: true,
          verticalJump: true,
          gripStrength: true,
          sprintTime: true,
          sprint50m: true,
          shuttleRun: true,
          run5kTime: true,
          yoyoTest: true,
          
          // Nutrition
          totalCalories: true,
          protein: true,
          carbohydrates: true,
          fats: true,
          waterIntake: true,
          
          // Mental/Wellness
          moodScore: true,
          sleepScore: true,
          
          // Technical skills (top 10 most used)
          battingStance: true,
          battingGrip: true,
          battingBalance: true,
          bowlingGrip: true,
          throw: true,
          flatCatch: true,
          highCatch: true,
          receiving: true,
          runUp: true,
          release: true,
          
          lastUpdated: true,
          updatedAt: true
        }
      });
      
      if (!skills) {
        // PERFORMANCE: Return empty skills object instead of null for faster client handling
        return NextResponse.json({
          id: null,
          studentId,
          studentName: student.studentName,
          message: "No skills data found for this student"
        });
      }

      return NextResponse.json(skills);
    }

    // PERFORMANCE OPTIMIZATION: Handle different user roles efficiently
    if (session.user.role === "COACH") {
      // PERFORMANCE: Use cached coach lookup
      const coach = await cachedQueries.getCoachByUserId(session.user.id);
      if (!coach) {
        return NextResponse.json(
          { message: "Coach profile not found" },
          { status: 404 }
        );
      }

      // PERFORMANCE: Get coach's students efficiently
      const students = await prisma.student.findMany({
        where: { coachId: coach.id },
        select: { 
          id: true, 
          studentName: true, 
          academy: true,
          sport: true
        },
        take: 50 // PERFORMANCE: Limit students for performance
      });

      if (students.length === 0) {
        return NextResponse.json([], { status: 200 });
      }

      // PERFORMANCE: Batch fetch skills for all students
      const allSkills = await prisma.skills.findMany({
        where: {
          studentId: { in: students.map(s => s.id) }
        },
        select: {
          id: true,
          studentId: true,
          studentName: true,
          age: true,
          
          // Essential fields only for performance
          pushupScore: true,
          pullupScore: true,
          battingStance: true,
          battingGrip: true,
          totalCalories: true,
          protein: true,
          moodScore: true,
          sleepScore: true,
          
          lastUpdated: true,
          updatedAt: true
        }
      });

      // PERFORMANCE: Create efficient lookup map
      const skillsMap = new Map(allSkills.map(skill => [skill.studentId, skill]));
      
      const response = students.map(student => ({
        student,
        skills: skillsMap.get(student.id) || null
      }));

      return NextResponse.json(response);
    } 
    
    if (session.user.role === "ATHLETE") {
      // PERFORMANCE: Use cached student lookup
      const student = await cachedQueries.getStudentByUserId(session.user.id);
      if (!student) {
        return NextResponse.json(
          { message: "Student profile not found" },
          { status: 404 }
        );
      }

      // PERFORMANCE: Get student's own skills efficiently
      const skills = await prisma.skills.findUnique({
        where: { studentId: student.id },
        select: {
          // Full skills data for student's own profile
          id: true,
          studentId: true,
          studentName: true,
          studentEmail: true,
          age: true,
          
          // Physical
          pushupScore: true,
          pullupScore: true,
          verticalJump: true,
          gripStrength: true,
          sprintTime: true,
          sprint50m: true,
          shuttleRun: true,
          run5kTime: true,
          yoyoTest: true,
          
          // Nutrition
          totalCalories: true,
          protein: true,
          carbohydrates: true,
          fats: true,
          waterIntake: true,
          
          // Mental/Wellness
          moodScore: true,
          sleepScore: true,
          
          // All technical skills for student
          aim: true,
          backFootDrag: true,
          backFootLanding: true,
          backLift: true,
          battingBalance: true,
          battingGrip: true,
          battingStance: true,
          bowlingGrip: true,
          calling: true,
          cockingOfWrist: true,
          flatCatch: true,
          followThrough: true,
          frontFootLanding: true,
          highCatch: true,
          highElbow: true,
          hipDrive: true,
          nonBowlingArm: true,
          pickUp: true,
          positioningOfBall: true,
          receiving: true,
          release: true,
          runUp: true,
          runningBetweenWickets: true,
          softHands: true,
          throw: true,
          topHandDominance: true,
          
          category: true,
          lastUpdated: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!skills) {
        return NextResponse.json({
          id: null,
          studentId: student.id,
          studentName: student.studentName,
          message: "No skills data found"
        });
      }

      return NextResponse.json(skills);
    }

    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );

  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    console.log("Skills API - Received request body:", JSON.stringify(requestBody, null, 2));
    
    const {
      // Physical skills - Strength
      pushupScore,
      pullupScore,
      verticalJump,
      gripStrength,
      // Physical skills - Speed & Agility
      sprintTime,
      sprint50m,
      shuttleRun,
      // Physical skills - Endurance
      run5kTime,
      yoyoTest,
      // Mental skills
      moodScore,
      sleepScore,
      // Nutrition skills
      totalCalories,
      protein,
      carbohydrates,
      fats,
      waterIntake,
      // Technical skills - Batting
      battingGrip,
      battingStance,
      battingBalance,
      cockingOfWrist,
      backLift,
      topHandDominance,
      highElbow,
      runningBetweenWickets,
      calling,
      // Technical skills - Bowling
      bowlingGrip,
      runUp,
      backFootLanding,
      frontFootLanding,
      hipDrive,
      backFootDrag,
      nonBowlingArm,
      release,
      followThrough,
      // Technical skills - Fielding
      positioningOfBall,
      pickUp,
      aim,
      throw: throwSkill,
      softHands,
      receiving,
      highCatch,
      flatCatch,
      // Metadata
      studentId,
      category 
    } = requestBody;
    
    let targetStudentId = studentId;
    let targetStudent;
    
    console.log("Skills API - Session user:", session.user);
    console.log("Skills API - Student ID from request:", studentId);
    
    // Validate required parameters
    if (session.user.role === "COACH" && !studentId) {
      console.log("Skills API - Coach request missing studentId");
      return NextResponse.json(
        { message: "Student ID is required for coach requests" },
        { status: 400 }
      );
    }
    
    // If coach is updating student data
    if (session.user.role === "COACH" && studentId) {
      console.log("Skills API - Coach updating student data");
      
      try {
        targetStudent = await prisma.student.findUnique({
          where: { id: studentId },
          include: { coach: true },
        });
        
        console.log("Skills API - Target student found:", targetStudent);
        
        if (!targetStudent) {
          console.log("Skills API - Student not found");
          return NextResponse.json(
            { message: "Student not found" },
            { status: 404 }
          );
        }

        targetStudentId = targetStudent.id;
        
        const coach = await prisma.coach.findUnique({ 
          where: { userId: session.user.id } 
        });
        
        console.log("Skills API - Coach found:", coach);
        
        if (!coach) {
          console.log("Skills API - Coach profile not found");
          return NextResponse.json(
            { message: "Coach profile not found" },
            { status: 404 }
          );
        }
        
        if (targetStudent.coachId !== coach.id) {
          console.log("Skills API - Coach not authorized for this student. Student coachId:", targetStudent.coachId, "Coach ID:", coach.id);
          return NextResponse.json(
            { message: "Not authorized to update this student's skills" },
            { status: 403 }
          );
        }
        
        console.log("Skills API - Coach authorization successful");
        
      } catch (authError) {
        console.error("Skills API - Error during coach authorization:", authError);
        return NextResponse.json(
          { message: "Error during authorization" },
          { status: 500 }
        );
      }
    } else if (session.user.role === "ATHLETE") {
      console.log("Skills API - Athlete updating own data");
      // For athletes, update their own skills
      targetStudent = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!targetStudent) {
        return NextResponse.json(
          { message: "Student profile not found" },
          { status: 404 }
        );
      }
      
      targetStudentId = targetStudent.id;
    } else {
      console.log("Skills API - Forbidden access. User role:", session.user.role, "Student ID:", studentId);
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Ensure we have a target student and ID before proceeding
    if (!targetStudent || !targetStudentId) {
      console.log("Skills API - Missing target student or ID");
      return NextResponse.json(
        { message: "Unable to determine target student" },
        { status: 400 }
      );
    }
    
    // Prepare update data - only include fields that are actually provided
    const updateData: any = {};
    
    // Physical skills - Strength
    if (pushupScore !== undefined) updateData.pushupScore = pushupScore;
    if (pullupScore !== undefined) updateData.pullupScore = pullupScore;
    if (verticalJump !== undefined) updateData.verticalJump = verticalJump;
    if (gripStrength !== undefined) updateData.gripStrength = gripStrength;
    
    // Physical skills - Speed & Agility
    if (sprintTime !== undefined) updateData.sprintTime = sprintTime;
    if (sprint50m !== undefined) updateData.sprint50m = sprint50m;
    if (shuttleRun !== undefined) updateData.shuttleRun = shuttleRun;
    
    // Physical skills - Endurance
    if (run5kTime !== undefined) updateData.run5kTime = run5kTime;
    if (yoyoTest !== undefined) updateData.yoyoTest = yoyoTest;

    // Mental skills
    if (moodScore !== undefined) updateData.moodScore = moodScore;
    if (sleepScore !== undefined) updateData.sleepScore = sleepScore;

    // Nutrition skills
    if (totalCalories !== undefined) updateData.totalCalories = totalCalories;
    if (protein !== undefined) updateData.protein = protein;
    if (carbohydrates !== undefined) updateData.carbohydrates = carbohydrates;
    if (fats !== undefined) updateData.fats = fats;
    if (waterIntake !== undefined) updateData.waterIntake = waterIntake;

    // Technical skills - Batting
    if (battingGrip !== undefined) updateData.battingGrip = battingGrip;
    if (battingStance !== undefined) updateData.battingStance = battingStance;
    if (battingBalance !== undefined) updateData.battingBalance = battingBalance;
    if (cockingOfWrist !== undefined) updateData.cockingOfWrist = cockingOfWrist;
    if (backLift !== undefined) updateData.backLift = backLift;
    if (topHandDominance !== undefined) updateData.topHandDominance = topHandDominance;
    if (highElbow !== undefined) updateData.highElbow = highElbow;
    if (runningBetweenWickets !== undefined) updateData.runningBetweenWickets = runningBetweenWickets;
    if (calling !== undefined) updateData.calling = calling;

    // Technical skills - Bowling
    if (bowlingGrip !== undefined) updateData.bowlingGrip = bowlingGrip;
    if (runUp !== undefined) updateData.runUp = runUp;
    if (backFootLanding !== undefined) updateData.backFootLanding = backFootLanding;
    if (frontFootLanding !== undefined) updateData.frontFootLanding = frontFootLanding;
    if (hipDrive !== undefined) updateData.hipDrive = hipDrive;
    if (backFootDrag !== undefined) updateData.backFootDrag = backFootDrag;
    if (nonBowlingArm !== undefined) updateData.nonBowlingArm = nonBowlingArm;
    if (release !== undefined) updateData.release = release;
    if (followThrough !== undefined) updateData.followThrough = followThrough;

    // Technical skills - Fielding
    if (positioningOfBall !== undefined) updateData.positioningOfBall = positioningOfBall;
    if (pickUp !== undefined) updateData.pickUp = pickUp;
    if (aim !== undefined) updateData.aim = aim;
    if (throwSkill !== undefined) updateData['throw'] = throwSkill;
    if (softHands !== undefined) updateData.softHands = softHands;
    if (receiving !== undefined) updateData.receiving = receiving;
    if (highCatch !== undefined) updateData.highCatch = highCatch;
    if (flatCatch !== undefined) updateData.flatCatch = flatCatch;
    
    console.log("Skills API - Update data prepared:", JSON.stringify(updateData, null, 2));
    console.log("Skills API - Target student ID:", targetStudentId);
    
    // Upsert skills data
    try {
      const skills = await prisma.skills.upsert({
        where: { studentId: targetStudentId },
        update: updateData,
        create: {
          studentId: targetStudentId,
          userId: targetStudent.userId,
          studentName: targetStudent.studentName,
          studentEmail: targetStudent.email,
          age: targetStudent.age,
          ...updateData
        },
        include: {
          student: {
            select: {
              studentName: true,
              age: true,
              academy: true,
              height: true,
              weight: true,
            },
          },
        },
      });

      console.log("Skills API - Skills updated successfully:", JSON.stringify(skills, null, 2));

      // Create SkillHistory record for progress tracking
      try {
        console.log("Skills API - Creating SkillHistory record for progress tracking");
        
        // Calculate composite scores from the updated skills
        const physicalScore = calculatePhysicalScore(skills);
        const nutritionScore = calculateNutritionScore(skills);
        const mentalScore = calculateMentalScore(skills);
        const wellnessScore = calculateWellnessScore(skills);
        const techniqueScore = calculateTechniqueScore(skills);
        const tacticalScore = calculateTacticalScore(skills);
        
        console.log("Skills API - Calculated scores:", {
          physicalScore,
          nutritionScore,
          mentalScore,
          wellnessScore,
          techniqueScore,
          tacticalScore
        });
        
        // Create or update today's SkillHistory record
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of day
        
        const skillHistory = await prisma.skillHistory.upsert({
          where: {
            studentId_date: {
              studentId: targetStudentId,
              date: today
            }
          },
          update: {
            physicalScore,
            nutritionScore,
            mentalScore,
            wellnessScore,
            techniqueScore,
            tacticalScore,
            updatedAt: new Date()
          },
          create: {
            studentId: targetStudentId,
            date: today,
            physicalScore,
            nutritionScore,
            mentalScore,
            wellnessScore,
            techniqueScore,
            tacticalScore
          }
        });
        
        console.log("Skills API - SkillHistory record successfully created/updated:", {
          id: skillHistory.id,
          date: skillHistory.date,
          techniqueScore: skillHistory.techniqueScore,
          physicalScore: skillHistory.physicalScore
        });
        
      } catch (historyError) {
        console.error("Skills API - CRITICAL: SkillHistory creation failed for student:", targetStudentId);
        console.error("Skills API - SkillHistory error details:", historyError);
        console.error("Skills API - Skills data that failed to create history:", JSON.stringify(skills, null, 2));
        
        // Log this as a critical issue but don't fail the skills update
        // This allows the skills to be saved while alerting us to the progress tracking issue
      }

      // Trigger badge evaluation asynchronously (non-blocking for performance)
      if (process.env.NODE_ENV === 'production') {
        // In production, trigger badge evaluation asynchronously
        setImmediate(async () => {
          try {
            console.log("Skills API - Triggering async badge evaluation for student:", targetStudentId);
            const badgeResult = await BadgeEngine.evaluateStudentBadges({ studentId: targetStudentId });
            
            if (badgeResult.newBadges.length > 0) {
              console.log("Skills API - New badges awarded:", badgeResult.newBadges);
            }
          } catch (badgeError) {
            console.error("Skills API - Async badge evaluation error:", badgeError);
          }
        });
      } else {
        // In development, run synchronously for debugging
        try {
          console.log("Skills API - Triggering badge evaluation for student:", targetStudentId);
          const badgeResult = await BadgeEngine.evaluateStudentBadges({ studentId: targetStudentId });
          
          if (badgeResult.newBadges.length > 0) {
            console.log("Skills API - New badges awarded:", badgeResult.newBadges);
          }
        } catch (badgeError) {
          console.error("Skills API - Badge evaluation error:", badgeError);
        }
      }

      return NextResponse.json(
        { message: "Skills updated successfully", skills },
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Skills API - Database error during upsert:", dbError);
      return NextResponse.json(
        { 
          message: "Database error while updating skills", 
          error: dbError instanceof Error ? dbError.message : String(dbError) 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions to calculate composite scores for SkillHistory
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
  
  if (skills.moodScore !== null) scores.push(skills.moodScore * 10); // Convert 1-10 to 0-100 scale
  if (skills.sleepScore !== null) scores.push(skills.sleepScore * 10); // Convert 1-10 to 0-100 scale
  
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