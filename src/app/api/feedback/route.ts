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
    const teamId = searchParams.get('teamId');
    
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
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      
      return NextResponse.json(feedback, { status: 200 });
    }
    
    // If coach is requesting team feedback
    if (teamId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { teamId },
        include: {
          coach: {
            select: {
              name: true,
              academy: true,
            },
          },
          student: {
            select: {
              id: true,
              studentName: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
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
          team: {
            select: {
              id: true,
              name: true,
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

    const { studentId, teamId, title, content, category, priority } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "Title and content are required" },
        { status: 400 }
      );
    }

    if (!studentId && !teamId) {
      return NextResponse.json(
        { message: "Either studentId or teamId is required" },
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

    // If creating feedback for a team
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          coachId: coach.id,
          isActive: true,
        },
        include: {
          members: {
            include: {
              student: true,
            },
          },
        },
      });

      if (!team) {
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 }
        );
      }

      // Create feedback for all team members
      const feedbackData = team.members.map(member => ({
        studentId: member.studentId,
        coachId: coach.id,
        teamId: teamId,
        title,
        content,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
      }));

      const feedback = await prisma.feedback.createMany({
        data: feedbackData,
      });

      return NextResponse.json({ count: feedback.count, message: "Team feedback created" }, { status: 201 });
    }

    // If creating feedback for individual student
    if (studentId) {
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
    }

    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
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

    const { feedbackId, isRead, isAcknowledged } = await request.json();

    if (!feedbackId) {
      return NextResponse.json(
        { message: "Feedback ID is required" },
        { status: 400 }
      );
    }

    // For athletes marking feedback as read or acknowledged
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

      const updateData: any = {};
      
      if (isRead !== undefined) {
        updateData.isRead = isRead;
      }
      
      if (isAcknowledged !== undefined) {
        updateData.isAcknowledged = isAcknowledged;
        if (isAcknowledged) {
          updateData.acknowledgedAt = new Date();
        } else {
          updateData.acknowledgedAt = null;
        }
      }

      const feedback = await prisma.feedback.updateMany({
        where: {
          id: feedbackId,
          studentId: student.id,
        },
        data: updateData,
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