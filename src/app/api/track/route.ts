import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import type { Session } from "next-auth";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📊 Track API - Starting bulk request');
    
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'feedback'; // 'feedback' or 'actions'
    const studentFilter = searchParams.get('student') || 'all';
    const category = searchParams.get('category') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'week';
    // PERFORMANCE: Reduce default page size for faster initial load
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 25); // Max 25, default 10
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    console.log(`📊 Track API - Request: type=${type}, student=${studentFilter}, dateRange=${dateRange}, limit=${limit}, page=${page}`);

    // Get coach profile with improved error handling
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true,
        name: true,
        students: {
          select: { 
            id: true, 
            studentName: true,
            academy: true,
            sport: true,
            coachId: true  // Added to verify relationship
          }
        }
      }
    });

    if (!coach) {
      console.log('❌ Coach profile not found for user:', session.user.id);
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    console.log(`✅ Coach found: ${coach.name} with ${coach.students.length} students`);

    // ENHANCED: More robust student ID collection with relationship verification
    const studentIds = coach.students
      .filter(student => student.coachId === coach.id) // Verify coach relationship
      .map(s => s.id);
    
    console.log(`🎯 Valid student IDs for coach: ${studentIds.length}`);
    
    if (studentIds.length === 0) {
      console.log('ℹ️ No students found for coach, returning empty result');
      return NextResponse.json({ 
        data: [], 
        totalTime: Date.now() - startTime,
        pagination: { page, limit, total: 0, totalPages: 0 }
      });
    }

    // Apply date range filter
    const now = new Date();
    let dateFilter = {};
    
    if (dateRange !== 'all') {
      const dateFilterMap: Record<string, number> = {
        'today': 1,
        'week': 7,
        'month': 30,
        'quarter': 90
      };
      
      const daysBack = dateFilterMap[dateRange];
      if (daysBack) {
        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        dateFilter = {
          createdAt: {
            gte: cutoffDate
          }
        };
        console.log(`📅 Date filter: ${dateRange} (${daysBack} days) - cutoff: ${cutoffDate.toISOString()}`);
      }
    }

    // Build WHERE clause
    let whereClause: any = {
      studentId: { in: studentIds },
      ...dateFilter
    };

    // Apply student filter
    if (studentFilter !== 'all') {
      whereClause.studentId = studentFilter;
      console.log(`🎯 Filtering for specific student: ${studentFilter}`);
    }

    // Apply category filter
    if (category !== 'all') {
      whereClause.category = category;
      console.log(`📂 Filtering for category: ${category}`);
    }

    // Apply priority filter  
    if (priority !== 'all') {
      whereClause.priority = priority;
      console.log(`⚡ Filtering for priority: ${priority}`);
    }

    let data = [];
    let totalCount = 0;

    // CRITICAL FIX: Proper if/else structure to prevent running both queries
    if (type === 'feedback') {
      // Apply status filter for feedback
      if (status !== 'all') {
        if (status === 'read') whereClause.isRead = true;
        if (status === 'unread') whereClause.isRead = false;
        if (status === 'acknowledged') whereClause.isAcknowledged = true;
        if (status === 'pending') whereClause.isAcknowledged = false;
      }

      // PERFORMANCE: Get total count and data in parallel
      const [feedbackData, count] = await Promise.all([
        prisma.feedback.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            priority: true,
            isRead: true,
            isAcknowledged: true,
            acknowledgedAt: true,
            createdAt: true,
            updatedAt: true,
            student: {
              select: {
                id: true,
                studentName: true,
                academy: true,
                sport: true
              }
            },
            coach: {
              select: {
                name: true,
                academy: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        prisma.feedback.count({ where: whereClause })
      ]);
      
      data = feedbackData;
      totalCount = count;
      
    } else { // type === 'actions'
      // Apply status filter for actions
      if (status !== 'all') {
        if (status === 'completed') whereClause.isCompleted = true;
        if (status === 'pending') whereClause.isCompleted = false;
        if (status === 'acknowledged') whereClause.isAcknowledged = true;
      }

      console.log('🔍 Actions query where clause:', JSON.stringify(whereClause, null, 2));

      // PERFORMANCE: Optimized actions query - only essential fields for list view
      const [actionsData, count] = await Promise.all([
        prisma.action.findMany({
          where: whereClause,
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
            notes: true,
            // PERFORMANCE OPTIMIZATION: Include metadata but exclude URLs for faster initial load
            proofMediaType: true,
            proofFileName: true,
            proofUploadedAt: true,
            proofFileSize: true,
            proofUploadMethod: true,
            // Demo media metadata only
            demoMediaType: true,
            demoFileName: true,
            demoUploadedAt: true,
            demoFileSize: true,
            demoUploadMethod: true,
            createdAt: true,
            updatedAt: true,
            // Include IDs for efficient lookups
            studentId: true,
            coachId: true,
            teamId: true,
            // PERFORMANCE: Streamlined nested selects
            student: {
              select: {
                id: true,
                studentName: true,
                academy: true,
                sport: true
              }
            },
            coach: {
              select: {
                name: true,
                academy: true
              }
            },
            // PERFORMANCE: Only include team if teamId exists
            team: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: [
            { createdAt: 'desc' }, // Most recent first as requested
            { isCompleted: 'asc' } // Secondary sort by completion status
          ],
          take: limit,
          skip: offset
        }),
        prisma.action.count({ where: whereClause })
      ]);
      
      data = actionsData;
      totalCount = count;

      // ENHANCED: Log proof media stats for debugging
      const actionsWithProof = actionsData.filter(action => action.proofMediaType);
      const actionsWithDemo = actionsData.filter(action => action.demoMediaType);
      
      console.log(`📊 Actions query results:`);
      console.log(`   Total actions: ${actionsData.length}`);
      console.log(`   Actions with proof media: ${actionsWithProof.length}`);
      console.log(`   Actions with demo media: ${actionsWithDemo.length}`);
      
      if (actionsWithProof.length > 0) {
        console.log(`🎯 Proof media actions:`);
        actionsWithProof.slice(0, 3).forEach((action, idx) => {
          console.log(`   ${idx + 1}. "${action.title}" - ${action.proofMediaType} (${action.proofFileName})`);
        });
      }
    }

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const totalTime = Date.now() - startTime;

    console.log(`✅ Track API (${type}) completed in ${totalTime}ms - found ${data.length}/${totalCount} items (page ${page}/${totalPages})`);

    return NextResponse.json({
      data,
      totalTime,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Track API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        totalTime,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
} 