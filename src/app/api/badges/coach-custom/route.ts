import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only coaches can create custom badges
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Only coaches can create custom badges' }, { status: 403 });
    }

    const { badge, rules, targetStudents } = await request.json();

    // Validate required fields
    if (!badge.name || !badge.description || !rules || rules.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If target students are specified, verify they belong to this coach
    if (targetStudents && targetStudents.length > 0) {
      const students = await prisma.student.findMany({
        where: {
          id: { in: targetStudents },
          coachId: coach.id
        }
      });

      if (students.length !== targetStudents.length) {
        return NextResponse.json({ 
          error: 'Some selected students are not assigned to you' 
        }, { status: 403 });
      }
    }

    // Get or create category for custom badges
    let customCategory = await prisma.badgeCategory.findUnique({
      where: { name: 'Custom' }
    });

    if (!customCategory) {
      customCategory = await prisma.badgeCategory.create({
        data: {
          name: 'Custom',
          description: 'Custom badges created by coaches',
          icon: '⭐',
          color: '#6B7280'
        }
      });
    }

    // Create the badge with rules and target students in a transaction
    const newBadge = await prisma.$transaction(async (tx) => {
      // Create the badge with clean description
      const createdBadge = await tx.badge.create({
        data: {
          name: badge.name,
          description: badge.description,
          motivationalText: badge.motivationalText || 'Keep up the great work!',
          level: badge.level || 'BRONZE',
          categoryId: customCategory.id,
          icon: badge.icon || '🏆',
          sport: badge.sport || 'CRICKET',
          isActive: true
        }
      });

      // Create badge rules
      if (rules.length > 0) {
        await tx.badgeRule.createMany({
          data: rules.map((rule: any) => ({
            badgeId: createdBadge.id,
            ruleType: rule.ruleType || 'SKILL',
            fieldName: rule.fieldName,
            operator: rule.operator,
            value: rule.value.toString(),
            description: rule.description || '',
            isRequired: rule.isRequired !== false,
            weight: rule.weight || 1
          }))
        });
      }

      // Create target student associations if specified
      if (targetStudents && targetStudents.length > 0) {
        await tx.badgeTargetStudent.createMany({
          data: targetStudents.map((studentId: string) => ({
            badgeId: createdBadge.id,
            studentId
          }))
        });
      }

      return createdBadge;
    });

    return NextResponse.json({
      success: true,
      badge: newBadge
    });

  } catch (error) {
    console.error('Error creating custom badge:', error);
    return NextResponse.json(
      { error: 'Failed to create custom badge' },
      { status: 500 }
    );
  }
} 