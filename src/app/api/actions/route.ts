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

// PERFORMANCE: Aggressive caching to prevent database connection pool exhaustion
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<any>>();

// Cache with very short TTL to prevent connection pool exhaustion
const getCached = (key: string): any | null => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

const setCache = (key: string, data: any, ttlMs: number = 30000) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};

// Request deduplication with caching
const withCacheAndDeduplication = async <T>(key: string, fn: () => Promise<T>, ttlMs: number = 30000): Promise<T> => {
  // Check cache first
  const cached = getCached(key);
  if (cached !== null) {
    console.log(`⚡ Cache hit for key: ${key}`);
    return cached;
  }

  // Check if request is already pending
  if (pendingRequests.has(key)) {
    console.log(`🔒 Reusing pending request for key: ${key}`);
    return pendingRequests.get(key) as Promise<T>;
  }

  // Create new request
  const promise = fn()
    .then(result => {
      setCache(key, result, ttlMs);
      return result;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
};

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Actions API - Starting request');
    
    // PERFORMANCE: Faster session check without timeout for better performance
    const session = await getServerSession(authOptions) as Session | null;
    const authTime = Date.now() - startTime;
    
    console.log(`⏱️ Actions API session check took: ${authTime}ms`);
    
    if (!session?.user?.id) {
      console.log('❌ No session found in Actions API');
      return NextResponse.json(
        { 
          message: "Authentication required", 
          authTime,
          debug: "No session found" 
        },
        { status: 401 }
      );
    }

    console.log('✅ Actions API session validated for user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teamId = searchParams.get('teamId');
    
    // PERFORMANCE OPTIMIZATION: Reduced limits and better defaults
    const limit = Math.min(parseInt(searchParams.get('limit') || '15'), 25); // Reduced max limit
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // If coach is requesting specific student actions
    if (studentId && session.user.role === "COACH") {
      // PERFORMANCE: Verify coach access efficiently
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!coach) {
        console.log('❌ Coach profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Optimized student actions query with indexes
      const actions = await prisma.action.findMany({
        where: { 
          studentId,
          coachId: coach.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          dueDate: true,
          isCompleted: true,
          completedAt: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
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
      console.log(`✅ Coach actions query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(actions, { status: 200 }));
    }

    // If team actions are requested
    if (teamId && session.user.role === "COACH") {
      // PERFORMANCE: Verify team access efficiently
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!coach) {
        console.log('❌ Coach profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      // PERFORMANCE: Optimized team actions query
      const actions = await prisma.action.findMany({
        where: { 
          teamId,
          coachId: coach.id
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          dueDate: true,
          isCompleted: true,
          completedAt: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
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
      console.log(`✅ Team actions query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(actions, { status: 200 }));
    }
    
    // PERFORMANCE OPTIMIZATION: For athletes, use optimized two-step approach
    if (session.user.role === "ATHLETE") {
      console.log('🏃‍♂️ Processing athlete actions request');
      
      // Step 1: Get student ID efficiently with minimal select
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!student) {
        console.log('❌ Student profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
      }

      console.log('✅ Student found for actions:', student.id);

      // Step 2: OPTIMIZED Query with request deduplication and timeout
      const requestKey = `actions:${student.id}:${limit}:${offset}`;
      console.log(`🔍 Querying actions for student: ${student.id} with limit: ${limit}`);
      
      // ULTRA-FAST: Use aggressive caching with 30 second TTL
      const actions = await withCacheAndDeduplication(requestKey, async () => {
        const queryStartTime = Date.now();
        
        // Simplified query for speed - remove expensive joins if not needed
        const result = await prisma.action.findMany({
          where: { 
            studentId: student.id
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            priority: true,
            dueDate: true,
            isCompleted: true,
            completedAt: true,
            isAcknowledged: true,
            acknowledgedAt: true,
            proofMediaUrl: true,
            proofMediaType: true,
            proofFileName: true,
            proofUploadedAt: true,
            demoMediaUrl: true,
            demoMediaType: true,
            demoFileName: true,
            demoUploadedAt: true,
            createdAt: true,
            coachId: true, // Get ID to fetch coach data separately if needed
            teamId: true,  // Get ID to fetch team data separately if needed
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        });
        
        // If we need coach/team data, fetch it separately and efficiently
        const coachIds = [...new Set(result.map(r => r.coachId).filter(Boolean))];
        const teamIds = [...new Set(result.map(r => r.teamId).filter(Boolean))];
        
        const [coaches, teams] = await Promise.all([
          coachIds.length > 0 ? prisma.coach.findMany({
            where: { id: { in: coachIds } },
            select: { id: true, name: true, academy: true }
          }) : [],
          teamIds.length > 0 ? prisma.team.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, name: true }
          }) : []
        ]);
        
        // Map the data efficiently
        const coachMap = new Map(coaches.map(c => [c.id, c] as const));
        const teamMap = new Map(teams.map(t => [t.id, t] as const));
        
        const mappedResult = result.map(action => ({
          ...action,
          coach: action.coachId ? coachMap.get(action.coachId) || null : null,
          team: action.teamId ? teamMap.get(action.teamId) || null : null,
        }));
        
        const queryTime = Date.now() - queryStartTime;
        console.log(`⚡ Optimized query completed in ${queryTime}ms`);
        return mappedResult;
      }, 30000); // 30 second cache

      const totalTime = Date.now() - startTime;
      console.log(`✅ Athlete actions query completed in ${totalTime}ms - found ${actions.length} items`);
      return setCacheHeaders(NextResponse.json(actions, { status: 200 }));
    }

    // Handle different user roles efficiently
    if (session.user.role === "COACH") {
      console.log('👨‍🏫 Processing coach actions request');
      
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

      // PERFORMANCE: Optimized query for coach's actions
      const studentIds = coach.students.map(s => s.id);
      
      const actions = await prisma.action.findMany({
        where: {
          OR: [
            { coachId: coach.id },
            { studentId: { in: studentIds } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          priority: true,
          dueDate: true,
          isCompleted: true,
          completedAt: true,
          isAcknowledged: true,
          acknowledgedAt: true,
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
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
      console.log(`✅ Coach general actions query completed in ${totalTime}ms`);
      return setCacheHeaders(NextResponse.json(actions, { status: 200 }));
    }

    // If no specific role matched
    console.log('❌ Access denied for role in Actions API:', session.user.role);
    return NextResponse.json(
      { message: "Access denied" },
      { status: 403 }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Actions API error after ${totalTime}ms:`, error);
    
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