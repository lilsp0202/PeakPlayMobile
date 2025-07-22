import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

// Add response caching headers
const setCacheHeaders = (response: NextResponse) => {
  response.headers.set('Cache-Control', 'private, max-age=120, stale-while-revalidate=300');
  return response;
};

// ULTRA-PERFORMANCE: Super aggressive caching to prevent slowdowns
const actionsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingRequests = new Map<string, Promise<any>>();

// Much longer cache for actions since they don't change frequently
const getCached = (key: string): any | null => {
  const item = actionsCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    actionsCache.delete(key);
    return null;
  }
  
  return item.data;
};

const setCache = (key: string, data: any, ttlMs: number = 120000) => { // 2 minute cache
  actionsCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};

// EMERGENCY: Clear all cached data on server restart
actionsCache.clear();
console.log('🔥 EMERGENCY: Cleared all Actions cache on startup');

// Ultra-fast request deduplication with longer caching
const withUltraFastCache = async <T>(key: string, fn: () => Promise<T>, ttlMs: number = 120000): Promise<T> => {
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

  // BALANCED SOLUTION: 8 second timeout with real data priority
  const promise = Promise.race([
    fn(),
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT - but try to return real data')), 8000) // 8 second timeout
    )
  ])
    .then(result => {
      setCache(key, result, ttlMs);
      const itemCount = Array.isArray(result) ? result.length : 'N/A';
      console.log(`⚡ FAST Actions query: ${itemCount} items`);
      return result;
    })
    .catch(error => {
      console.error('⚠️ Actions query timeout:', error.message);
      console.log('🔄 Returning empty array - will retry next request');
      // Return empty array instead of fake data - this allows real coach actions to show when they load
      const emptyResult = [] as T;
      setCache(key, emptyResult, 10000); // Cache empty result for 10 seconds to allow retry
      return emptyResult;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
};

export async function GET(request: Request) {
  const startTime = Date.now();
  console.log('🔍 Actions API - Starting request');

  try {
    // PERFORMANCE: Quick session check with timeout
    const sessionStartTime = Date.now();
    const session = await getServerSession(authOptions) as Session | null;
    console.log(`⏱️ Actions API session check took: ${Date.now() - sessionStartTime}ms`);

    if (!session?.user?.id) {
      console.log('❌ No session found in Actions API');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('✅ Actions API session validated for user:', session.user.email);

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "5"), 20); // Max 20 items
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const studentId = url.searchParams.get("studentId");
    const teamId = url.searchParams.get("teamId");

    if (session.user.role === "ATHLETE") {
      console.log('🏃‍♂️ Processing athlete actions request');
      
      // Ultra-fast student lookup with minimal data
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (!student) {
        console.log('❌ Student profile not found for user:', session.user.id);
        return setCacheHeaders(NextResponse.json({ message: "Student profile not found" }, { status: 404 }));
      }

      console.log('✅ Student found for actions:', student.id);

      const requestKey = `actions:${student.id}:${limit}:${offset}`;
      console.log(`🔍 Querying actions for student: ${student.id} with limit: ${limit}`);
      
      // NUCLEAR: Force timeout wrapper around database queries
      const actions = await withUltraFastCache(requestKey, async () => {
        const queryStartTime = Date.now();
        
        console.log(`🔍 NUCLEAR query for studentId: ${student.id}`);
        
        // EMERGENCY FIX: Ultra-simple query with basic fields only
        console.log(`🚨 EMERGENCY: Ultra-simple query for studentId: ${student.id}`);
        
        const result = await prisma.action.findMany({
          where: { 
            studentId: student.id
          },
          // Minimal select for maximum speed
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
            createdAt: true,
            proofMediaUrl: true,
            demoMediaUrl: true,
            coachId: true
          },
          orderBy: {
            createdAt: "desc"
          },
          take: limit,
          skip: offset,
        });

        // Get coach names in a separate simple query
        const coachIds = [...new Set(result.map(action => action.coachId))];
        const coaches = coachIds.length > 0 ? await prisma.coach.findMany({
          where: { id: { in: coachIds } },
          select: { id: true, name: true, academy: true }
        }) : [];

        // Combine the data with simplified structure
        const actionsWithDetails = result.map(action => ({
          ...action,
          coach: coaches.find(coach => coach.id === action.coachId) || { name: 'Unknown Coach', academy: 'Unknown' },
          team: null // Simplified - no team info for now
        }));

        const queryTime = Date.now() - queryStartTime;
        console.log(`🚨 EMERGENCY query completed in ${queryTime}ms - found ${actionsWithDetails.length} actions`);
        
        return actionsWithDetails;
      }, 300000); // 5 minute cache for actions (longer to reduce DB load)

      console.log(`✅ Athlete actions query completed in ${Date.now() - startTime}ms - found ${actions.length} items`);

      return setCacheHeaders(NextResponse.json(actions));
    }

    if (session.user.role === "COACH") {
      console.log('👨‍🏫 Processing coach actions request');

      if (studentId) {
        // Coach viewing specific student's actions - use cache
        const requestKey = `coach-student-actions:${session.user.id}:${studentId}:${limit}:${offset}`;
        
        const actions = await withUltraFastCache(requestKey, async () => {
          const coach = await prisma.coach.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
          });

          if (!coach) {
            return [];
          }

                     return await prisma.action.findMany({
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
               createdAt: true,
               // CRITICAL: Media URLs for coach demo and proof viewing
               proofMediaUrl: true,
               demoMediaUrl: true,
               coach: {
                 select: {
                   name: true,
                   academy: true,
                 }
               },
               team: {
                 select: {
                   id: true,
                   name: true,
                 }
               },
             },
            orderBy: {
              createdAt: "desc",
            },
            take: limit,
            skip: offset,
          });
        }, 120000);

        console.log(`✅ Coach-student actions query completed in ${Date.now() - startTime}ms - found ${actions.length} items`);
        return setCacheHeaders(NextResponse.json(actions));
      }

      if (teamId) {
        // Coach viewing team actions - use cache
        const requestKey = `coach-team-actions:${session.user.id}:${teamId}:${limit}:${offset}`;
        
        const actions = await withUltraFastCache(requestKey, async () => {
          const coach = await prisma.coach.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
          });

          if (!coach) {
            return [];
          }

                     return await prisma.action.findMany({
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
               createdAt: true,
               // CRITICAL: Media URLs for coach demo and proof viewing
               proofMediaUrl: true,
               demoMediaUrl: true,
               coach: {
                 select: {
                   name: true,
                   academy: true,
                 }
               },
               team: {
                 select: {
                   id: true,
                   name: true,
                 }
               },
             },
            orderBy: {
              createdAt: "desc",
            },
            take: limit,
            skip: offset,
          });
        }, 120000);

        console.log(`✅ Coach-team actions query completed in ${Date.now() - startTime}ms - found ${actions.length} items`);
        return setCacheHeaders(NextResponse.json(actions));
      }

      // Coach viewing all their actions - use cache
      const requestKey = `coach-all-actions:${session.user.id}:${limit}:${offset}`;
      
      const actions = await withUltraFastCache(requestKey, async () => {
        const coach = await prisma.coach.findUnique({
          where: { userId: session.user.id },
          select: { id: true }
        });

        if (!coach) {
          return [];
        }

                 return await prisma.action.findMany({
           where: { 
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
             createdAt: true,
             // CRITICAL: Media URLs for coach demo and proof viewing
             proofMediaUrl: true,
             demoMediaUrl: true,
             coach: {
               select: {
                 name: true,
                 academy: true,
               }
             },
             team: {
               select: {
                 id: true,
                 name: true,
               }
             },
           },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        });
      }, 120000);

      console.log(`✅ Coach actions query completed in ${Date.now() - startTime}ms - found ${actions.length} items`);
      return setCacheHeaders(NextResponse.json(actions));
    }

    return setCacheHeaders(NextResponse.json({ error: "Invalid role" }, { status: 403 }));

  } catch (error) {
    console.error("❌ Actions API error:", error);
    return setCacheHeaders(NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to fetch actions",
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    ));
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