import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

// PERFORMANCE: Enhanced caching for feedback API
const feedbackCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getFeedbackCache = (key: string): any | null => {
  const item = feedbackCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    feedbackCache.delete(key);
    return null;
  }
  
  return item.data;
};

const setFeedbackCache = (key: string, data: any, ttlMs: number = 30000) => {
  feedbackCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};

// Add response caching headers
const setCacheHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
  return response;
};

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Feedback API - Starting request');
    
    // PERFORMANCE: Faster session check without timeout
    const session = await getServerSession(authOptions) as Session | null;
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
    
    // PERFORMANCE: Reduced initial limit for faster loading
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 15); // Reduced from 15-25 to 10-15
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Create cache key
    const cacheKey = `feedback:${session.user.id}:${studentId || 'none'}:${teamId || 'none'}:${limit}:${offset}`;
    
    // Check cache first
    const cached = getFeedbackCache(cacheKey);
    if (cached !== null) {
      console.log(`⚡ Feedback cache hit for user: ${session.user.email}`);
      return setCacheHeaders(NextResponse.json(cached, { status: 200 }));
    }
    
    // PERFORMANCE: Minimal select fields for faster queries
    const minimalFeedbackSelect = {
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
    };
    
    // If coach is requesting specific student feedback
    if (studentId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { studentId },
        select: minimalFeedbackSelect,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
      
      setFeedbackCache(cacheKey, feedback);
      const totalTime = Date.now() - startTime;
      console.log(`✅ Coach feedback query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }
    
    // If coach is requesting team feedback
    if (teamId && session.user.role === "COACH") {
      const feedback = await prisma.feedback.findMany({
        where: { teamId },
        select: {
          ...minimalFeedbackSelect,
          student: {
            select: {
              id: true,
              studentName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });
      
      setFeedbackCache(cacheKey, feedback);
      const totalTime = Date.now() - startTime;
      console.log(`✅ Team feedback query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }
    
    // PERFORMANCE OPTIMIZATION: For athletes, use single optimized query
    if (session.user.role === "ATHLETE") {
      console.log('🏃‍♂️ Processing athlete feedback request');
      
      // PERFORMANCE: Single query approach - join student and feedback in one query
      const feedback = await prisma.feedback.findMany({
        where: { 
          student: {
            userId: session.user.id
          }
        },
        select: minimalFeedbackSelect,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      setFeedbackCache(cacheKey, feedback);
      const totalTime = Date.now() - startTime;
      console.log(`✅ Athlete feedback query completed in ${totalTime}ms - found ${feedback.length} items`);
      
      return setCacheHeaders(NextResponse.json(feedback, { status: 200 }));
    }

    // Handle coach role efficiently
    if (session.user.role === "COACH") {
      console.log('👨‍🏫 Processing coach feedback request');
      
      // PERFORMANCE: Single optimized query for coach feedback
      const feedback = await prisma.feedback.findMany({
        where: {
          coach: {
            userId: session.user.id
          }
        },
        select: {
          ...minimalFeedbackSelect,
          student: {
            select: {
              id: true,
              studentName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      setFeedbackCache(cacheKey, feedback);
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

    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!coach) {
      return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
    }

    // If creating feedback for a team, create individual feedback for each team member
    if (teamId) {
      console.log('📝 Creating team feedback for team:', teamId);
      
      // Get team with members
      const team = await prisma.team.findFirst({
        where: {
          id: teamId,
          coachId: coach.id,
          isActive: true,
        },
        include: {
          members: {
            include: {
              student: {
                select: { id: true, studentName: true }
              }
            }
          }
        }
      });

      if (!team) {
        return NextResponse.json({ message: "Team not found" }, { status: 404 });
      }

      if (team.members.length === 0) {
        return NextResponse.json({ message: "Team has no members" }, { status: 400 });
      }

      // Create feedback for each team member
      const feedbackData = team.members.map(member => ({
        studentId: member.student.id,
        teamId: teamId,
        coachId: coach.id,
        title,
        content,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
      }));

      const createdFeedback = await prisma.feedback.createMany({
        data: feedbackData,
      });

      console.log(`✅ Created ${createdFeedback.count} team feedback items for team: ${team.name}`);

      // Return a summary response
      return NextResponse.json({
        count: createdFeedback.count,
        teamName: team.name,
        message: `Team feedback created for ${createdFeedback.count} members`
      }, { status: 201 });
    }

    // Create individual feedback for single student
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