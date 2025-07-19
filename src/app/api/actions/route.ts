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
    
    // PERFORMANCE OPTIMIZATION: Set reasonable limits for all queries
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 50); // Max 50 items
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // If coach is requesting specific student actions
    if (studentId && session.user.role === "COACH") {
      // PERFORMANCE: Verify coach access efficiently
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!coach) {
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Single optimized query with specific includes
      const actions = await prisma.action.findMany({
        where: { 
          studentId,
          coachId: coach.id // Ensure coach can only see their own assigned actions
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
        take: limit,
        skip: offset,
      });
      
      return NextResponse.json(actions, { status: 200 });
    }

    // If team actions are requested
    if (teamId && session.user.role === "COACH") {
      // PERFORMANCE: Verify team access efficiently
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!coach) {
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Optimized team actions query
      const actions = await prisma.action.findMany({
        where: { 
          teamId,
          coachId: coach.id
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
        take: limit,
        skip: offset,
      });
      
      return NextResponse.json(actions, { status: 200 });
    }

    // Handle different user roles efficiently
    if (session.user.role === "COACH") {
      // PERFORMANCE: Single query to get coach and their actions
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        include: {
          students: {
            select: { id: true } // Only get IDs for performance
          }
        }
      });

      if (!coach) {
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Get actions for all coach's students efficiently
      const studentIds = coach.students.map(s => s.id);
      
      const actions = await prisma.action.findMany({
        where: {
          OR: [
            { coachId: coach.id }, // Actions created by this coach
            { studentId: { in: studentIds } } // Actions for this coach's students
          ]
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
        take: limit,
        skip: offset,
      });

      return NextResponse.json(actions, { status: 200 });
    } 
    
    if (session.user.role === "ATHLETE") {
      // PERFORMANCE: Single query to get student and their actions
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true, coachId: true }
      });

      if (!student) {
        return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Optimized query for student's actions only
      const actions = await prisma.action.findMany({
        where: { 
          studentId: student.id,
          ...(student.coachId && { coachId: student.coachId })
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
        take: limit,
        skip: offset,
      });

      return NextResponse.json(actions, { status: 200 });
    }

    // If no specific role matched
    return NextResponse.json(
      { message: "Access denied" },
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

    const { 
      studentId, 
      teamId, 
      title, 
      description, 
      category, 
      priority, 
      dueDate,
      demoMediaUrl,
      demoMediaType,
      demoFileName,
      demoUploadedAt 
    } = await request.json();

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
        demoMediaUrl: demoMediaUrl || null,
        demoMediaType: demoMediaType || null,
        demoFileName: demoFileName || null,
        demoUploadedAt: demoUploadedAt ? new Date(demoUploadedAt) : null,
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
          demoMediaUrl: demoMediaUrl || null,
          demoMediaType: demoMediaType || null,
          demoFileName: demoFileName || null,
          demoUploadedAt: demoUploadedAt ? new Date(demoUploadedAt) : null,
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