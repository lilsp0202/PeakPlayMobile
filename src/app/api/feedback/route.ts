import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

// Add response caching headers
const setCacheHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
  return response;
};

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Feedback API - Starting request');
    
    // Add timeout to session check
    const sessionPromise = getServerSession(authOptions) as Promise<Session | null>;
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 5000)
    );
    
    const session = await Promise.race([sessionPromise, timeoutPromise]);
    const authTime = Date.now() - startTime;
    
    console.log(`⏱️ Session check took: ${authTime}ms`);
    
    if (!session?.user?.id) {
      console.log('❌ No session found');
      return NextResponse.json(
        { 
          message: "Authentication required", 
          authTime,
          debug: "No session found" 
        },
        { status: 401 }
      );
    }

    console.log('✅ Session validated for user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teamId = searchParams.get('teamId');
    
    // PERFORMANCE: Add limit and pagination with better defaults
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 25); // Reduced max limit
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // If coach is requesting specific student feedback
    if (studentId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { studentId },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
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
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Coach feedback query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }
    
    // If coach is requesting team feedback
    if (teamId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { teamId },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
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
        take: limit,
        skip: offset,
      });
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Team feedback query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }
    
    // PERFORMANCE OPTIMIZATION: For athletes, use optimized two-step approach
    if (session.user.role === "ATHLETE") {
      console.log('🏃‍♂️ Processing athlete feedback request');
      
      // Step 1: Get student ID efficiently with minimal select
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!student) {
        console.log('❌ Student profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
      }

      console.log('✅ Student found:', student.id);

      // Step 2: Query feedback directly using studentId (much faster)
      const feedback = await prisma.feedback.findMany({
        where: { 
          studentId: student.id
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
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

      const totalTime = Date.now() - startTime;
      console.log(`✅ Athlete feedback query completed in ${totalTime}ms - found ${feedback.length} items`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }

    // Handle different user roles efficiently
    if (session.user.role === "COACH") {
      console.log('👨‍🏫 Processing coach feedback request');
      
      // PERFORMANCE: Get coach profile with minimal data
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { 
          id: true,
          students: {
            select: { id: true }
          }
        }
      });

      if (!coach) {
        console.log('❌ Coach profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Optimized query for coach's feedback
      const studentIds = coach.students.map(s => s.id);
      
      const feedback = await prisma.feedback.findMany({
        where: {
          OR: [
            { coachId: coach.id },
            { studentId: { in: studentIds } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          priority: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          createdAt: true,
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

      const totalTime = Date.now() - startTime;
      console.log(`✅ Coach general feedback query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }

    // If no specific role matched
    console.log('❌ Access denied for role:', session.user.role);
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Feedback API error after ${totalTime}ms:`, error);
    
    if (error instanceof Error && error.message === 'Session timeout') {
      return NextResponse.json(
        { message: "Authentication timeout - please refresh and try again" },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Internal server error",
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
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

    // Validate required fields
    if (!title || !content || !category || !priority) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!studentId && !teamId) {
      return NextResponse.json(
        { message: "Either studentId or teamId is required" },
        { status: 400 }
      );
    }

    // PERFORMANCE: Get coach ID efficiently
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!coach) {
      return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        teamId,
        coachId: coach.id,
        title,
        content,
        category,
        priority,
      },
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        priority: true,
        isAcknowledged: true,
        acknowledgedAt: true,
        createdAt: true,
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

    const { feedbackId, isAcknowledged } = await request.json();

    // PERFORMANCE: Update with minimal data
    const feedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        isAcknowledged,
        acknowledgedAt: isAcknowledged ? new Date() : null,
      },
      select: {
        id: true,
        isAcknowledged: true,
        acknowledgedAt: true,
      },
    });

    return NextResponse.json(feedback, { status: 200 });

  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 