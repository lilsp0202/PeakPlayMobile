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

    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true,
        students: {
          select: { 
            id: true, 
            studentName: true,
            academy: true,
            sport: true 
          }
        }
      }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const studentIds = coach.students.map(s => s.id);
    
    if (studentIds.length === 0) {
      return NextResponse.json({ data: [], totalTime: Date.now() - startTime });
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
    }

    // Apply category filter
    if (category !== 'all') {
      whereClause.category = category;
    }

    // Apply priority filter  
    if (priority !== 'all') {
      whereClause.priority = priority;
    }

    // Apply status filter
    if (status !== 'all') {
      if (type === 'feedback') {
        if (status === 'read') whereClause.isRead = true;
        if (status === 'unread') whereClause.isRead = false;
      } else {
        if (status === 'completed') whereClause.isCompleted = true;
        if (status === 'pending') whereClause.isCompleted = false;
        if (status === 'acknowledged') whereClause.isAcknowledged = true;
      }
    }

    let data = [];

    if (type === 'feedback') {
      data = await prisma.feedback.findMany({
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
        take: 50 // Limit results for performance
      });
    } else {
      // Optimized Actions query for better performance
      const optimizedWhereClause: any = {
        studentId: { in: studentIds },
        ...dateFilter
      };

      // Apply filters strategically for better index usage
      if (studentFilter !== 'all') {
        optimizedWhereClause.studentId = studentFilter;
      }
      if (category !== 'all') {
        optimizedWhereClause.category = category;
      }
      if (priority !== 'all') {
        optimizedWhereClause.priority = priority;
      }

      // Status filter with index-optimized queries
      if (status === 'completed') {
        optimizedWhereClause.isCompleted = true;
      } else if (status === 'pending') {
        optimizedWhereClause.isCompleted = false;
      } else if (status === 'acknowledged') {
        optimizedWhereClause.isAcknowledged = true;
      }

      data = await prisma.action.findMany({
        where: optimizedWhereClause,
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
          proofMediaUrl: true,
          proofMediaType: true,
          proofFileName: true,
          proofUploadedAt: true,
          demoMediaUrl: true,
          demoMediaType: true,
          demoFileName: true,
          demoUploadedAt: true,
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
          },
          team: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { isCompleted: 'asc' }, // Show pending actions first
          { createdAt: 'desc' }
        ],
        take: 25 // Reduced limit for faster loading
      });
    }

    // Enrich data with student names
    const enrichedData = data.map((item: any) => ({
      ...item,
      studentName: item.student?.studentName || 'Unknown Student',
      studentId: item.student?.id
    }));

    const totalTime = Date.now() - startTime;
    console.log(`✅ Track API completed in ${totalTime}ms - found ${data.length} items`);

    return NextResponse.json({ 
      data: enrichedData, 
      totalTime,
      count: data.length 
    });

  } catch (error) {
    console.error('❌ Track API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 