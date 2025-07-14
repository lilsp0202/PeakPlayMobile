import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from "next-auth";
import { prisma } from '@/lib/prisma';

// PUT /api/badges/[id] - Update a badge
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract id from params
    const { id: badgeId } = await params;
    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID not found in params' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, motivationalText, level, icon, category, sport, rules } = body;

    if (!name || !description || !level) {
      return NextResponse.json({ error: 'Name, description, and level are required' }, { status: 400 });
    }

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: { rules: true }
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Get or create badge category
    let badgeCategory;
    try {
      badgeCategory = await prisma.badgeCategory.findFirst({
        where: { name: category || 'GENERAL' }
      });
      
      if (!badgeCategory) {
        badgeCategory = await prisma.badgeCategory.create({
          data: {
            name: category || 'GENERAL',
            description: `${category || 'GENERAL'} badges`,
            icon: icon || 'trophy',
            color: '#6366f1'
          }
        });
      }
    } catch (error) {
      console.error('Error with badge category:', error);
      return NextResponse.json({ error: 'Error creating badge category' }, { status: 500 });
    }

    // Update the badge
    const updatedBadge = await prisma.badge.update({
      where: { id: badgeId },
      data: {
        name,
        description,
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

    // Delete existing rules
    await prisma.badgeRule.deleteMany({
      where: { badgeId }
    });

    // Create new badge rules if provided
    if (rules && Array.isArray(rules) && rules.length > 0) {
      const badgeRules = rules.map(rule => ({
        badgeId: updatedBadge.id,
        ruleType: rule.ruleType || 'skill_threshold',
        fieldName: rule.skillField,
        operator: rule.operator || 'gte',
        value: String(rule.targetValue ?? ''),
        weight: rule.weight || 1.0
      }));

      await prisma.badgeRule.createMany({
        data: badgeRules
      });
    }

    return NextResponse.json(updatedBadge);
  } catch (error) {
    console.error('Badge PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/badges/[id] - Delete a badge
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get coach information
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    // Extract id from URL
    const url = new URL(request.url);
    const idMatch = url.pathname.match(/\/api\/badges\/(.+)$/);
    const badgeId = idMatch ? idMatch[1] : undefined;
    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID not found in URL' }, { status: 400 });
    }

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    // Check if this badge was created by the current coach
    if (!existingBadge.description.includes(`|||COACH_CREATED:${coach.id}`)) {
      return NextResponse.json({ 
        error: 'You can only delete badges that you created. System badges cannot be deleted.' 
      }, { status: 403 });
    }

    // Check if badge has been awarded to any students
    const awardedCount = await prisma.studentBadge.count({
      where: {
        badgeId,
        isRevoked: false
      }
    });

    if (awardedCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete badge: it has been awarded to ${awardedCount} student(s). Please revoke all awards first.` 
      }, { status: 400 });
    }

    // Delete badge rules first (due to foreign key constraint)
    await prisma.badgeRule.deleteMany({
      where: { badgeId }
    });

    // Delete any revoked student badges
    await prisma.studentBadge.deleteMany({
      where: { badgeId }
    });

    // Delete the badge
    await prisma.badge.delete({
      where: { id: badgeId }
    });

    return NextResponse.json({ message: 'Badge deleted successfully' });
  } catch (error) {
    console.error('Badge DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/badges/[id] - Get a specific badge
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract id from URL
    const url = new URL(request.url);
    const idMatch = url.pathname.match(/\/api\/badges\/(.+)$/);
    const badgeId = idMatch ? idMatch[1] : undefined;
    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID not found in URL' }, { status: 400 });
    }

    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
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
      }
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Badge GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 