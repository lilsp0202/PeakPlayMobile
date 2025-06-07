import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT /api/badges/[id] - Update a badge
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badgeId = params.id;
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
        skillField: rule.skillField,
        operator: rule.operator || 'gte',
        targetValue: parseFloat(rule.targetValue) || 0,
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badgeId = params.id;

    // Check if badge exists
    const existingBadge = await prisma.badge.findUnique({
      where: { id: badgeId }
    });

    if (!existingBadge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
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
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badgeId = params.id;

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