import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeEngine } from '@/lib/badgeEngine';

// GET /api/badges - Get badges for a student or all badges for management
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type') || 'earned'; // earned, progress, all, manage
    const manage = searchParams.get('manage'); // for coach management view

    // If coach wants to manage badges
    if (manage === 'true' || type === 'manage') {
      if (session.user.role !== 'COACH') {
        return NextResponse.json({ error: 'Only coaches can manage badges' }, { status: 403 });
      }

      // Get coach information
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id }
      });

      if (!coach) {
        return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
      }

      const allBadges = await prisma.badge.findMany({
        include: {
          category: true,
          rules: true,
          _count: {
            select: {
              studentBadges: {
                where: {
                  isRevoked: false
                }
              }
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { name: 'asc' }
        ]
      });

      // Separate coach-created badges from system badges
      const coachBadges = allBadges.filter(badge => 
        badge.description.includes(`|||COACH_CREATED:${coach.id}`)
      ).map(badge => ({
        ...badge,
        // Clean up the description by removing the coach marker
        description: badge.description.split('|||COACH_CREATED:')[0]
      }));

      const systemBadges = allBadges.filter(badge => 
        !badge.description.includes('|||COACH_CREATED:')
      );

      return NextResponse.json({ 
        coachBadges, 
        systemBadges,
        badges: allBadges // Keep for backward compatibility
      });
    }

    let targetStudentId = studentId;

    // If no studentId provided and user is a student, use their own ID
    if (!studentId && session.user.role === 'ATHLETE') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      });
      if (student) {
        targetStudentId = student.id;
      }
    }

    if (!targetStudentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Authorize access
    if (session.user.role === 'ATHLETE') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      });
      if (!student || student.id !== targetStudentId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (session.user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id }
      });
      const student = await prisma.student.findUnique({
        where: { id: targetStudentId }
      });
      if (!coach || !student || student.coachId !== coach.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    let response;
    
    // Automatically evaluate badges before returning any badge data
    try {
      await BadgeEngine.evaluateStudentBadges({ studentId: targetStudentId });
    } catch (evalError) {
      console.warn('Badge auto-evaluation failed:', evalError);
      // Continue with request even if evaluation fails
    }
    
    switch (type) {
      case 'earned':
        response = await BadgeEngine.getStudentBadges(targetStudentId);
        break;
      
      case 'progress':
        response = await BadgeEngine.getBadgeProgress(targetStudentId);
        break;
      
      case 'all':
        const [earned, progress] = await Promise.all([
          BadgeEngine.getStudentBadges(targetStudentId),
          BadgeEngine.getBadgeProgress(targetStudentId)
        ]);
        response = { earned, progress };
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/badges - Create a new badge or evaluate/award badges
export async function POST(request: NextRequest) {
  try {
    console.log('Badges API - POST request received');
    
    const session = await getServerSession(authOptions);
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
        description,
        motivationalText: motivationalText || '',
        level,
        icon: icon || 'trophy',
        sport: sport || 'ALL',
        categoryId: badgeCategory.id,
        // Store coach ID in a way we can identify coach-created badges
        // We'll use the description to add a marker for coach-created badges
        description: `${description}|||COACH_CREATED:${coach.id}`
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
    const session = await getServerSession(authOptions);
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