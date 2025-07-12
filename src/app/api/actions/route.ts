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
    
    // If coach is requesting specific student actions
    if (studentId && session.user.role === "COACH") {
      const actions = await prisma.action.findMany({
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
      
      return NextResponse.json(actions, { status: 200 });
    }
    
    // If coach is requesting team actions
    if (teamId && session.user.role === "COACH") {
      const actions = await prisma.action.findMany({
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
      
      return NextResponse.json(actions, { status: 200 });
    }
    
    // For athletes, get their own actions from assigned coach only
    if (session.user.role === "ATHLETE") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
          coach: true,
        },
      });
      
      if (!student) {
        return NextResponse.json(
          { message: "Student profile not found" },
          { status: 404 }
        );
      }

      // Only get actions from assigned coach
      // If student has no coach, return empty array immediately
      if (!student.coachId) {
        return NextResponse.json([], { status: 200 });
      }

      const actions = await prisma.action.findMany({
        where: { 
          studentId: student.id,
          coachId: student.coachId,
        },
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
      
      return NextResponse.json(actions, { status: 200 });
    }
    
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error fetching actions:", error);
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

    const { studentId, teamId, title, description, category, priority, dueDate } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
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

    // If creating action for a team
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

      // Create action for all team members
      const actionData = team.members.map(member => ({
        studentId: member.studentId,
        coachId: coach.id,
        teamId: teamId,
        title,
        description,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      }));

      const action = await prisma.action.createMany({
        data: actionData,
      });

      return NextResponse.json({ count: action.count, message: "Team action created" }, { status: 201 });
    }

    // If creating action for individual student
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

      const action = await prisma.action.create({
        data: {
          studentId,
          coachId: coach.id,
          title,
          description,
          category: category || "GENERAL",
          priority: priority || "MEDIUM",
          dueDate: dueDate ? new Date(dueDate) : null,
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

      return NextResponse.json(action, { status: 201 });
    }

    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error creating action:", error);
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

    const { actionId, isCompleted, isAcknowledged, notes } = await request.json();

    if (!actionId) {
      return NextResponse.json(
        { message: "Action ID is required" },
        { status: 400 }
      );
    }

    // For athletes acknowledging/completing actions
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
      
      if (isCompleted !== undefined) {
        updateData.isCompleted = isCompleted;
        updateData.completedAt = isCompleted ? new Date() : null;
      }
      
      if (isAcknowledged !== undefined) {
        updateData.isAcknowledged = isAcknowledged;
        updateData.acknowledgedAt = isAcknowledged ? new Date() : null;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const action = await prisma.action.updateMany({
        where: {
          id: actionId,
          studentId: student.id,
        },
        data: updateData,
      });

      if (action.count === 0) {
        return NextResponse.json(
          { message: "Action not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Action updated" }, { status: 200 });
    }

    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error updating action:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 