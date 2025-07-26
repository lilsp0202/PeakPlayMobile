import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import type { Session } from "next-auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is a coach
    if (session.user.role !== "COACH") {
      return NextResponse.json(
        { message: "Only coaches can assign students" },
        { status: 403 }
      );
    }

    const { studentIds } = await request.json();

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { message: "Student IDs array is required" },
        { status: 400 }
      );
    }

    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { message: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Update students to assign them to this coach
    const updatedStudents = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        academy: coach.academy, // Ensure students are from the same academy
        coachId: null, // Only assign unassigned students
      },
      data: {
        coachId: coach.id,
      },
    });

    return NextResponse.json(
      { 
        message: `Successfully assigned ${updatedStudents.count} students`,
        assignedCount: updatedStudents.count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning students:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 