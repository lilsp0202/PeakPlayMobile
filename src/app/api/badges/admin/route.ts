import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/badges/admin - Get all badge definitions, categories, etc.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'badges';

    let response;

    switch (type) {
      case 'categories':
        response = await prisma.badgeCategory.findMany({
          include: {
            badges: {
              select: {
                id: true,
                name: true,
                level: true,
                sport: true
              }
            }
          }
        });
        break;
      
      case 'badges':
        response = await prisma.badge.findMany({
          include: {
            category: true,
            rules: true,
            _count: {
              select: {
                studentBadges: {
                  where: { isRevoked: false }
                }
              }
            }
          },
          orderBy: [
            { category: { name: 'asc' } },
            { level: 'asc' },
            { name: 'asc' }
          ]
        });
        break;

      case 'rules':
        const badgeId = searchParams.get('badgeId');
        if (!badgeId) {
          return NextResponse.json({ error: 'Badge ID required for rules' }, { status: 400 });
        }
        response = await prisma.badgeRule.findMany({
          where: { badgeId },
          orderBy: { createdAt: 'asc' }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Badge admin GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/badges/admin - Create badge definitions, categories, etc.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    let response;

    switch (type) {
      case 'category':
        const { name, description, icon, color } = body;
        response = await prisma.badgeCategory.create({
          data: { name, description, icon, color }
        });
        break;
      
      case 'badge':
        const {
          badgeName,
          badgeDescription,
          motivationalText,
          level,
          categoryId,
          badgeIcon,
          sport,
          rules
        } = body;
        
        response = await prisma.badge.create({
          data: {
            name: badgeName,
            description: badgeDescription,
            motivationalText,
            level: level.toUpperCase(),
            categoryId,
            icon: badgeIcon,
            sport: sport.toUpperCase(),
            rules: {
              create: rules.map((rule: any) => ({
                ruleType: rule.ruleType,
                fieldName: rule.fieldName,
                operator: rule.operator,
                value: rule.value,
                weight: rule.weight || 1.0,
                isRequired: rule.isRequired || true,
                description: rule.description
              }))
            }
          },
          include: {
            category: true,
            rules: true
          }
        });
        break;

      case 'rule':
        const { badgeId, ruleType, fieldName, operator, value, weight, isRequired, ruleDescription } = body;
        response = await prisma.badgeRule.create({
          data: {
            badgeId,
            ruleType,
            fieldName,
            operator,
            value,
            weight: weight || 1.0,
            isRequired: isRequired !== false,
            description: ruleDescription
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Badge admin POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/badges/admin - Update badge definitions
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, id } = body;

    let response;

    switch (type) {
      case 'badge':
        const {
          name,
          description,
          motivationalText,
          level,
          categoryId,
          icon,
          sport,
          isActive
        } = body;
        
        response = await prisma.badge.update({
          where: { id },
          data: {
            name,
            description,
            motivationalText,
            level: level?.toUpperCase(),
            categoryId,
            icon,
            sport: sport?.toUpperCase(),
            isActive
          },
          include: {
            category: true,
            rules: true
          }
        });
        break;

      case 'rule':
        const { ruleType, fieldName, operator, value, weight, isRequired, ruleDescription } = body;
        response = await prisma.badgeRule.update({
          where: { id },
          data: {
            ruleType,
            fieldName,
            operator,
            value,
            weight,
            isRequired,
            description: ruleDescription
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Badge admin PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/badges/admin - Delete badge definitions
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'COACH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID required' }, { status: 400 });
    }

    let response;

    switch (type) {
      case 'badge':
        // Soft delete by setting inactive
        response = await prisma.badge.update({
          where: { id },
          data: { isActive: false }
        });
        break;

      case 'rule':
        response = await prisma.badgeRule.delete({
          where: { id }
        });
        break;

      case 'category':
        // Check if category has badges
        const categoryBadges = await prisma.badge.count({
          where: { categoryId: id }
        });
        
        if (categoryBadges > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete category with existing badges' 
          }, { status: 400 });
        }
        
        response = await prisma.badgeCategory.delete({
          where: { id }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Badge admin DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 