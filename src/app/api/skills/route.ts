import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

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
    const { 
      // Physical skills
      pushupScore, 
      pullupScore, 
      sprintTime, 
      run5kTime,
      // Mental skills  
      moodScore,
      sleepScore,
      // Nutrition skills
      totalCalories,
      protein,
      carbohydrates,
      fats,
      // Metadata
      studentId,
      category 
    } = requestBody;
    
    let targetStudentId = studentId;
    let targetStudent;
    
    // If coach is updating student data
    if (session.user.role === "COACH" && studentId) {
      targetStudent = await prisma.student.findUnique({
        where: { id: studentId },
        include: { coach: true },
      });
      
      if (!targetStudent || targetStudent.coachId !== 
          (await prisma.coach.findUnique({ where: { userId: session.user.id } }))?.id) {
        return NextResponse.json(
          { message: "Not authorized to update this student's skills" },
          { status: 403 }
        );
      }
    } else if (session.user.role === "ATHLETE") {
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
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }
    
    // Prepare update data - only include fields that are actually provided
    const updateData: any = { lastUpdated: new Date() };
    const createData: any = {
      userId: targetStudent.userId,
      studentId: targetStudentId,
      studentName: targetStudent.studentName,
      studentEmail: targetStudent.email,
      age: targetStudent.age,
      category: category || "PHYSICAL",
    };

    // Physical skills
    if (pushupScore !== undefined) {
      updateData.pushupScore = pushupScore;
      createData.pushupScore = pushupScore;
    }
    if (pullupScore !== undefined) {
      updateData.pullupScore = pullupScore;
      createData.pullupScore = pullupScore;
    }
    if (sprintTime !== undefined) {
      updateData.sprintTime = sprintTime;
      createData.sprintTime = sprintTime;
    }
    if (run5kTime !== undefined) {
      updateData.run5kTime = run5kTime;
      createData.run5kTime = run5kTime;
    }

    // Mental skills
    if (moodScore !== undefined) {
      updateData.moodScore = moodScore;
      createData.moodScore = moodScore;
    }
    if (sleepScore !== undefined) {
      updateData.sleepScore = sleepScore;
      createData.sleepScore = sleepScore;
    }

    // Nutrition skills
    if (totalCalories !== undefined) {
      updateData.totalCalories = totalCalories;
      createData.totalCalories = totalCalories;
    }
    if (protein !== undefined) {
      updateData.protein = protein;
      createData.protein = protein;
    }
    if (carbohydrates !== undefined) {
      updateData.carbohydrates = carbohydrates;
      createData.carbohydrates = carbohydrates;
    }
    if (fats !== undefined) {
      updateData.fats = fats;
      createData.fats = fats;
    }
    
    // Upsert skills data
    const skills = await prisma.skills.upsert({
      where: { studentId: targetStudentId },
      update: updateData,
      create: createData,
    });

    return NextResponse.json(
      { message: "Skills updated successfully", skills },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating skills:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 