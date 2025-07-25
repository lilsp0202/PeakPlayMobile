import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

// PERFORMANCE: Response caching headers for better performance
const setCacheHeaders = (response: NextResponse, maxAge: number = 60) => {
  response.headers.set('Cache-Control', `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  response.headers.set('Vary', 'Authorization');
  return response;
};

// PERFORMANCE: In-memory cache with TTL to prevent redundant DB calls
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<any>>();

const getCached = (key: string): any | null => {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

const setCache = (key: string, data: any, ttlMs: number) => {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  
  // Clean up old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > v.ttl) {
        cache.delete(k);
      }
    }
  }
};

// PERFORMANCE: Request deduplication to prevent duplicate DB calls
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
    console.log('🔍 Actions API - Starting optimized request');
    
    // PERFORMANCE: Fast session check with timing
    const sessionStartTime = Date.now();
    const session = await getServerSession(authOptions) as Session | null;
    const authTime = Date.now() - sessionStartTime;
    
    console.log(`⏱️ Actions API session check took: ${authTime}ms`);
    
    if (!session?.user?.id) {
      console.log('❌ No session found in Actions API');
      return NextResponse.json(
        { 
          message: "Authentication required", 
          debug: { authTime, hasSession: !!session }
        },
        { status: 401 }
      );
    }

    console.log('✅ Actions API session validated for user:', session.user.email);

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const teamId = searchParams.get('teamId');
    
    // PERFORMANCE: Improved pagination with reasonable defaults  
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 25); // PERFORMANCE: Smaller default/max for faster load
    const offset = (page - 1) * limit;
    
    // PERFORMANCE: Add filters for better query optimization
    const category = searchParams.get('category') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const status = searchParams.get('status') || 'all';
    
    // CRITICAL FIX: Include media URLs for functionality while optimizing other areas
    const optimizedSelect = {
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
      notes: true,
      createdAt: true,
      updatedAt: true,
      // PERFORMANCE OPTIMIZATION: Include metadata but lazy-load URLs for faster response
      proofMediaType: true,
      proofFileName: true,
      proofUploadedAt: true,
      proofFileSize: true,
      proofUploadMethod: true,
      demoMediaType: true,
      demoFileName: true,
      demoUploadedAt: true,
      demoFileSize: true,
      demoUploadMethod: true,
      // Include IDs for separate lookups
      studentId: true,
      coachId: true,
      teamId: true,
    };

    // PERFORMANCE: Build optimized where clause
    const buildWhereClause = (baseWhere: any) => {
      const where = { ...baseWhere };
      
      if (category !== 'all') {
        where.category = category.toUpperCase();
      }
      
      if (priority !== 'all') {
        where.priority = priority.toUpperCase();
      }
      
      if (status !== 'all') {
        if (status === 'completed') {
          where.isCompleted = true;
        } else if (status === 'acknowledged') {
          where.isAcknowledged = true;
          where.isCompleted = false;
        } else if (status === 'pending') {
          where.isAcknowledged = false;
          where.isCompleted = false;
        }
      }
      
      return where;
    };

    // PERFORMANCE: Optimized queries for different scenarios
    if (studentId && session.user.role === "COACH") {
      // Coach viewing specific student actions
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!coach) {
        console.log('❌ Coach profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Coach profile not found" }, { status: 404 });
      }

      const requestKey = `coach-student-actions:${coach.id}:${studentId}:${page}:${limit}:${category}:${priority}:${status}`;
      
      const result = await withCacheAndDeduplication(requestKey, async () => {
        const queryStartTime = Date.now();
        
        const whereClause = buildWhereClause({
          studentId,
          coachId: coach.id
        });
        
        // PERFORMANCE: Run count and data queries in parallel
        const [actions, totalCount] = await Promise.all([
          prisma.action.findMany({
            where: whereClause,
            select: optimizedSelect,
            orderBy: [
              { isCompleted: "asc" },
              { createdAt: "desc" },
            ],
            take: limit,
            skip: offset,
          }),
          prisma.action.count({
            where: whereClause,
          })
        ]);
        
        // PERFORMANCE: Efficient coach/team data lookup in batches
        const coachIds = [...new Set(actions.map(a => a.coachId).filter(Boolean))];
        const teamIds = [...new Set(actions.map(a => a.teamId).filter(Boolean))];
        
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
        
        const coachMap = new Map(coaches.map(c => [c.id, c] as const));
        const teamMap = new Map(teams.map(t => [t.id, t] as const));
        
        const enrichedActions = actions.map(action => ({
          ...action,
          coach: coachMap.get(action.coachId) || null,
          team: action.teamId ? teamMap.get(action.teamId) || null : null,
          // PERFORMANCE: Add media availability flags without URLs
          hasProofMedia: !!(action.proofMediaType && action.proofFileName),
          hasDemoMedia: !!(action.demoMediaType && action.demoFileName),
        }));
        
        const queryTime = Date.now() - queryStartTime;
        console.log(`⚡ Coach-student query completed in ${queryTime}ms - ${actions.length}/${totalCount} actions`);
        
        return {
          actions: enrichedActions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        };
      }, 60000); // 1 minute cache for coach queries
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ Coach student actions completed in ${totalTime}ms`);
      
      return setCacheHeaders(NextResponse.json(result, { status: 200 }), 60);
    }

    // PERFORMANCE: Optimized athlete queries
    if (session.user.role === "ATHLETE") {
      console.log('🏃‍♂️ Processing athlete actions request');
      
      // Step 1: Get student ID efficiently
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!student) {
        console.log('❌ Student profile not found for user:', session.user.id);
        return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
      }

      const requestKey = `athlete-actions:${student.id}:${page}:${limit}:${category}:${priority}:${status}`;
      
      const result = await withCacheAndDeduplication(requestKey, async () => {
        const queryStartTime = Date.now();
        
        const whereClause = buildWhereClause({
          studentId: student.id
        });
        
        // PERFORMANCE: Parallel queries for count and data
        const [actions, totalCount] = await Promise.all([
          prisma.action.findMany({
            where: whereClause,
            select: optimizedSelect,
            orderBy: [
              { isCompleted: "asc" },
              { createdAt: "desc" },
            ],
            take: limit,
            skip: offset,
          }),
          prisma.action.count({
            where: whereClause,
          })
        ]);
        
        // PERFORMANCE: Efficient coach/team lookups
        const coachIds = [...new Set(actions.map(a => a.coachId).filter(Boolean))];
        const teamIds = [...new Set(actions.map(a => a.teamId).filter(Boolean))];
        
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
        
        const coachMap = new Map(coaches.map(c => [c.id, c] as const));
        const teamMap = new Map(teams.map(t => [t.id, t] as const));
        
        const enrichedActions = actions.map(action => ({
          ...action,
          coach: coachMap.get(action.coachId) || null,
          team: action.teamId ? teamMap.get(action.teamId) || null : null,
          hasProofMedia: !!(action.proofMediaType && action.proofFileName),
          hasDemoMedia: !!(action.demoMediaType && action.demoFileName),
        }));
        
        const queryTime = Date.now() - queryStartTime;
        console.log(`⚡ Athlete query completed in ${queryTime}ms - ${actions.length}/${totalCount} actions`);
        
        return {
          actions: enrichedActions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        };
      }, 30000); // 30 second cache for athletes

      const totalTime = Date.now() - startTime;
      console.log(`✅ Athlete actions completed in ${totalTime}ms`);
      
      return setCacheHeaders(NextResponse.json(result, { status: 200 }), 30);
    }

    // PERFORMANCE: Optimized coach general queries  
    if (session.user.role === "COACH") {
      console.log('👨‍🏫 Processing coach general actions request');
      
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

      const requestKey = `coach-general-actions:${coach.id}:${page}:${limit}:${category}:${priority}:${status}`;
      
      const result = await withCacheAndDeduplication(requestKey, async () => {
        const queryStartTime = Date.now();
        
        const studentIds = coach.students.map(s => s.id);
        const whereClause = buildWhereClause({
          OR: [
            { coachId: coach.id },
            { studentId: { in: studentIds } }
          ]
        });
        
        const [actions, totalCount] = await Promise.all([
          prisma.action.findMany({
            where: whereClause,
            select: optimizedSelect,
            orderBy: [
              { isCompleted: "asc" },
              { createdAt: "desc" },
            ],
            take: limit,
            skip: offset,
          }),
          prisma.action.count({
            where: whereClause,
          })
        ]);
        
        // Enrich with coach/team data
        const coachIds = [...new Set(actions.map(a => a.coachId).filter(Boolean))];
        const teamIds = [...new Set(actions.map(a => a.teamId).filter(Boolean))];
        
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
        
        const coachMap = new Map(coaches.map(c => [c.id, c] as const));
        const teamMap = new Map(teams.map(t => [t.id, t] as const));
        
        const enrichedActions = actions.map(action => ({
          ...action,
          coach: coachMap.get(action.coachId) || null,
          team: action.teamId ? teamMap.get(action.teamId) || null : null,
          hasProofMedia: !!(action.proofMediaType && action.proofFileName),
          hasDemoMedia: !!(action.demoMediaType && action.demoFileName),
        }));
        
        const queryTime = Date.now() - queryStartTime;
        console.log(`⚡ Coach general query completed in ${queryTime}ms - ${actions.length}/${totalCount} actions`);
        
        return {
          actions: enrichedActions,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNext: page < Math.ceil(totalCount / limit),
            hasPrev: page > 1
          }
        };
      }, 60000); // 1 minute cache for coach queries

      const totalTime = Date.now() - startTime;
      console.log(`✅ Coach general actions completed in ${totalTime}ms`);
      
      return setCacheHeaders(NextResponse.json(result, { status: 200 }), 60);
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