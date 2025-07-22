import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from "next-auth";
import { prisma } from '@/lib/prisma';
import { BadgeEngine } from '@/lib/badgeEngine';
import { OptimizedBadgeEngine } from '@/lib/badgeEngineOptimized';

// GET /api/badges - Get badges for a student or all badges for management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const studentId = searchParams.get('studentId');
    
    // Get session
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine target student ID
    let targetStudentId = studentId;
    if (!targetStudentId && session.user.role === 'ATHLETE') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });
      targetStudentId = student?.id || null;
    }

    console.log('🏅 Badges API - Request details:', {
      type,
      requestedStudentId: studentId,
      targetStudentId,
      userRole: session.user.role,
      userId: session.user.id
    });

    switch (type) {
      case 'progress':
        if (!targetStudentId) {
          return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }
        
        try {
          console.log('🚀 Using OptimizedBadgeEngine for progress evaluation');
          const startTime = Date.now();
          
          // PERFORMANCE IMPROVEMENT: Use the optimized badge engine
          const progress = await OptimizedBadgeEngine.getBadgeProgressOptimized(targetStudentId);
          
          const responseTime = Date.now() - startTime;
          console.log(`⚡ Optimized badges API completed in ${responseTime}ms (Previous: 2780ms)`);
          
          // PERFORMANCE: Return response immediately
          return NextResponse.json(progress, { 
            status: 200,
            headers: {
              'Cache-Control': 'public, max-age=60', // Cache for 60 seconds
              'X-Response-Time': responseTime.toString()
            }
          });
        } catch (error) {
          console.error('❌ Optimized Badges API error:', error);
          
          // PERFORMANCE: Fallback to empty array to prevent app breaking
          return NextResponse.json([], { 
            status: 200,
            headers: {
              'X-Fallback': 'true'
            }
          });
        }

      case 'all':
        const badges = await prisma.badge.findMany({
          where: { isActive: true },
          include: {
            category: true,
            rules: true
          },
          orderBy: [
            { level: 'asc' },
            { name: 'asc' }
          ]
        });

        return NextResponse.json(badges, { status: 200 });

      case 'earned':
        if (!targetStudentId) {
          return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }

        const earnedBadges = await prisma.studentBadge.findMany({
          where: { 
            studentId: targetStudentId,
            isRevoked: false
          },
          include: {
            badge: {
              include: {
                category: true
              }
            }
          },
          orderBy: { awardedAt: 'desc' }
        });

        return NextResponse.json(earnedBadges, { status: 200 });

      case 'categories':
        const categories = await prisma.badgeCategory.findMany({
          include: {
            _count: {
              select: { badges: true }
            }
          },
          orderBy: { name: 'asc' }
        });

        return NextResponse.json(categories, { status: 200 });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

// POST /api/badges - Create a new badge or evaluate/award badges
export async function POST(request: NextRequest) {
  try {
    console.log('Badges API - POST request received');
    
    const session = await getServerSession(authOptions) as Session | null;
    console.log('Badges API - Session:', session?.user ? { id: session.user.id, role: session.user.role } : 'No session');
    
    if (!session?.user?.id) {
      console.log('Badges API - Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Badges API - Request body:', body);
    
    const { action, studentId, badgeId, name, description, motivationalText, level, icon, category, sport, rules } = body;

    // If action is provided, handle existing functionality
    if (action === 'evaluate') {
      // Trigger badge evaluation for a student
      if (session.user.role !== 'COACH') {
        return NextResponse.json({ error: 'Only coaches can trigger evaluations' }, { status: 403 });
      }

      const result = await BadgeEngine.evaluateStudentBadges({ studentId });
      return NextResponse.json(result);
    }

    if (action === 'award') {
      // Manually award a badge (coach only)
      if (session.user.role !== 'COACH') {
        return NextResponse.json({ error: 'Only coaches can manually award badges' }, { status: 403 });
      }

      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id }
      });

      if (!coach) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
      }

      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student || student.coachId !== coach.id) {
        return NextResponse.json({ error: 'Unauthorized to award badge to this student' }, { status: 403 });
      }

      // Check if badge already awarded
      const existingBadge = await prisma.studentBadge.findUnique({
        where: {
          studentId_badgeId: {
            studentId,
            badgeId
          }
        }
      });

      if (existingBadge && !existingBadge.isRevoked) {
        return NextResponse.json({ error: 'Badge already awarded' }, { status: 400 });
      }

      const newBadge = await prisma.studentBadge.upsert({
        where: {
          studentId_badgeId: {
            studentId,
            badgeId
          }
        },
        update: {
          isRevoked: false,
          revokedAt: null,
          revokedBy: null,
          revokeReason: null,
          awardedBy: coach.id,
          awardedAt: new Date()
        },
        create: {
          studentId,
          badgeId,
          awardedBy: coach.id,
          progress: 100
        },
        include: {
          badge: {
            include: {
              category: true
            }
          }
        }
      });

      return NextResponse.json(newBadge);
    }

    // Create new badge (coach only)
    console.log('Badges API - Creating new badge');
    
    if (session.user.role !== 'COACH') {
      console.log('Badges API - Forbidden: User is not a coach, role:', session.user.role);
      return NextResponse.json({ error: 'Only coaches can create badges' }, { status: 403 });
    }

    if (!name || !description || !level) {
      console.log('Badges API - Bad request: Missing required fields', { name: !!name, description: !!description, level: !!level });
      return NextResponse.json({ error: 'Name, description, and level are required' }, { status: 400 });
    }

    console.log('Badges API - Creating badge category...');
    
    // Get or create badge category
    let badgeCategory;
    try {
      badgeCategory = await prisma.badgeCategory.findFirst({
        where: { name: category || 'GENERAL' }
      });
      
      if (!badgeCategory) {
        console.log('Badges API - Creating new badge category:', category || 'GENERAL');
        badgeCategory = await prisma.badgeCategory.create({
          data: {
            name: category || 'GENERAL',
            description: `${category || 'GENERAL'} badges`,
            icon: icon || 'trophy',
            color: '#6366f1'
          }
        });
      }
      console.log('Badges API - Badge category found/created:', badgeCategory.id);
    } catch (error) {
      console.error('Badges API - Error with badge category:', error);
      return NextResponse.json({ error: 'Error creating badge category' }, { status: 500 });
    }

    console.log('Badges API - Creating badge...');
    
    // Get the coach ID for tracking who created this badge
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      console.log('Badges API - Coach not found');
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }
    
    // Create the badge
    const newBadge = await prisma.badge.create({
      data: {
        name,
        // Store coach ID in a way we can identify coach-created badges
        // We'll use the description to add a marker for coach-created badges
        description: `${description}|||COACH_CREATED:${coach.id}`,
        motivationalText: motivationalText || '',
        level,
        icon: icon || 'trophy',
        sport: sport || 'ALL',
        categoryId: badgeCategory.id
      },
      include: {
        category: true
      }
    });

    console.log('Badges API - Badge created:', newBadge.id);

    // Create badge rules if provided
    if (rules && Array.isArray(rules) && rules.length > 0) {
      console.log('Badges API - Creating badge rules:', rules.length);
      const badgeRules = rules.map(rule => ({
        badgeId: newBadge.id,
        ruleType: rule.ruleType || 'PERFORMANCE',
        fieldName: rule.skillField || rule.fieldName,
        operator: rule.operator || 'gte',
        value: String(rule.targetValue || 0),
        weight: parseFloat(rule.weight) || 1.0,
        isRequired: rule.isRequired !== false,
        description: rule.description || ''
      }));

      await prisma.badgeRule.createMany({
        data: badgeRules
      });
      console.log('Badges API - Badge rules created');
    }

    console.log('Badges API - Badge creation successful');
    return NextResponse.json(newBadge);
  } catch (error) {
    console.error('Badges POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/badges - Revoke a badge
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentBadgeId = searchParams.get('studentBadgeId');
    const reason = searchParams.get('reason') || 'Revoked by coach';

    if (!studentBadgeId) {
      return NextResponse.json({ error: 'Student badge ID required' }, { status: 400 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Verify the coach can revoke this badge
    const studentBadge = await prisma.studentBadge.findUnique({
      where: { id: studentBadgeId },
      include: { student: true }
    });

    if (!studentBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    if (studentBadge.student.coachId !== coach.id) {
      return NextResponse.json({ error: 'Unauthorized to revoke this badge' }, { status: 403 });
    }

    await BadgeEngine.revokeBadge(studentBadgeId, coach.id, reason);

    return NextResponse.json({ message: 'Badge revoked successfully' });
  } catch (error) {
    console.error('Badges DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 