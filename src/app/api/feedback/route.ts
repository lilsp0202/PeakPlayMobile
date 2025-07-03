import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
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
    
    // If coach is requesting specific student feedback
    if (studentId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { studentId },
        include: {
          coach: {
            select: {
              name: true,
              academy: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      
      return NextResponse.json(feedback, { status: 200 });
    }
    
    // For athletes, get their own feedback
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
      
      const feedback = await prisma.feedback.findMany({
        where: { studentId: student.id },
        include: {
          coach: {
            select: {
              name: true,
              academy: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      
      return NextResponse.json(feedback, { status: 200 });
    }
    
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id || session.user.role !== "COACH") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studentId, title, content, category, priority } = await request.json();

    if (!studentId || !title || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    // Verify the student exists and is assigned to this coach
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        coachId: coach.id,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found or not assigned to you" },
        { status: 404 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        coachId: coach.id,
        title,
        content,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
      },
      include: {
        coach: {
          select: {
            name: true,
            academy: true,
          },
        },
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { feedbackId, isRead } = await request.json();

    if (!feedbackId) {
      return NextResponse.json(
        { message: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // For athletes marking feedback as read
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

      const feedback = await prisma.feedback.updateMany({
        where: {
          id: feedbackId,
          studentId: student.id,
        },
        data: {
          isRead: isRead !== undefined ? isRead : true,
        },
      });

      if (feedback.count === 0) {
        return NextResponse.json(
          { message: "Feedback not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Feedback updated" }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 