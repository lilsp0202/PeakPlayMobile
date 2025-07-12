import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Fetch teams
    const teams = await prisma.team.findMany({
      where: {
        coachId: coachId || coach.id,
        isActive: true
      },
      include: {
        members: includeMembers ? {
          include: {
            student: {
              select: {
                id: true,
                studentName: true,
                email: true,
                academy: true,
                sport: true,
                role: true
              }
            }
          }
        } : false,
        _count: includeStats ? {
          select: {
            members: true,
            feedback: true,
            actions: true
          }
        } : false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, memberIds } = await request.json();

    if (!name || !Array.isArray(memberIds)) {
      return NextResponse.json({ error: 'Name and member IDs are required' }, { status: 400 });
    }

    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Create team with members
    const team = await prisma.team.create({
      data: {
        name,
        description,
        coachId: coach.id,
        members: {
          create: memberIds.map((studentId: string) => ({
            studentId,
            role: 'MEMBER'
          }))
        }
      },
      include: {
        members: {
          include: {
            student: {
              select: {
                id: true,
                studentName: true,
                email: true,
                academy: true,
                sport: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            feedback: true,
            actions: true
          }
        }
      }
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 