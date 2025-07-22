import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const teamId = resolvedParams.id;
    
    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Get team with members and their roles
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
        coachId: coach.id
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
                user: {
                  select: {
                    image: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error fetching team roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const teamId = resolvedParams.id;
    const { studentId, roles } = await request.json();

    // Validate input
    if (!studentId || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Verify team ownership
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
        coachId: coach.id
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Validate roles
    const validRoles = ['CAPTAIN', 'VICE_CAPTAIN', 'BATSMAN', 'ALL_ROUNDER', 'BATTING_ALL_ROUNDER', 'BOWLING_ALL_ROUNDER', 'BOWLER', 'WICKET_KEEPER'];
    const invalidRoles = roles.filter((role: string) => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return NextResponse.json({ error: `Invalid roles: ${invalidRoles.join(', ')}` }, { status: 400 });
    }

    // Check if trying to assign multiple captains
    if (roles.includes('CAPTAIN')) {
      const existingCaptain = await prisma.teamMember.findFirst({
        where: {
          teamId: teamId,
          studentId: { not: studentId },
          roles: { has: 'CAPTAIN' }
        }
      });

      if (existingCaptain) {
        return NextResponse.json({ error: 'Team already has a captain' }, { status: 400 });
      }
    }

    // Check if trying to assign multiple vice captains
    if (roles.includes('VICE_CAPTAIN')) {
      const existingViceCaptain = await prisma.teamMember.findFirst({
        where: {
          teamId: teamId,
          studentId: { not: studentId },
          roles: { has: 'VICE_CAPTAIN' }
        }
      });

      if (existingViceCaptain) {
        return NextResponse.json({ error: 'Team already has a vice captain' }, { status: 400 });
      }
    }

    // Update team member roles
    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_studentId: {
          teamId: teamId,
          studentId: studentId
        }
      },
      data: {
        roles: roles
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            email: true,
            academy: true,
            sport: true,
            user: {
              select: {
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error('Error updating team member roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 