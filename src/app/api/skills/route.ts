import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { BadgeEngine } from "@/lib/badgeEngine";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    
    // If coach is requesting specific student data
    if (studentId && session.user.role === "COACH") {
      // Verify coach has access to this student
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        include: { students: true }
      });
      
      if (!coach) {
        return NextResponse.json(
          { message: "Coach profile not found" },
          { status: 404 }
        );
      }
      
      const hasAccess = coach.students.some(student => student.id === studentId);
      if (!hasAccess) {
        return NextResponse.json(
          { message: "Not authorized to access this student's skills" },
          { status: 403 }
        );
      }
      
      const skills = await prisma.skills.findUnique({
        where: { studentId },
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
      
      return NextResponse.json(skills || null, { status: 200 });
    }
    
    // If coach is requesting without specific student (general access)
    if (session.user.role === "COACH") {
      // Return empty array or success response for coaches
      // This allows the dashboard to load without 403 errors
      return NextResponse.json([], { status: 200 });
    }
    
    // For athletes, get their own skills
    if (session.user.role === "ATHLETE") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!student) {
        return NextResponse.json(
          { message: "Student profile not found" },
          { status: 404 }
        );
      }
      
      const skills = await prisma.skills.findUnique({
        where: { studentId: student.id },
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
      
      return NextResponse.json(skills || null, { status: 200 });
    }
    
    return NextResponse.json(
      { message: "Forbidden" },
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
    const session = await getServerSession(authOptions);
    
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

      // Trigger badge evaluation after successful skills update
      try {
        console.log("Skills API - Triggering badge evaluation for student:", targetStudentId);
        const badgeResult = await BadgeEngine.evaluateStudentBadges({ studentId: targetStudentId });
        
        if (badgeResult.newBadges.length > 0) {
          console.log("Skills API - New badges awarded:", badgeResult.newBadges);
        }
      } catch (badgeError) {
        console.error("Skills API - Badge evaluation error:", badgeError);
        // Don't fail the skills update if badge evaluation fails
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