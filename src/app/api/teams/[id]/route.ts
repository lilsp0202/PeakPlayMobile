import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    
    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Fetch team details with members, feedback, and actions
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: coach.id,
        isActive: true
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
        feedback: {
          include: {
            student: {
              select: {
                id: true,
                studentName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        actions: {
          include: {
            student: {
              select: {
                id: true,
                studentName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    const { name, description, memberIds } = await request.json();
    
    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Check if team exists and belongs to coach
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: coach.id
      }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Update team and members
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        description,
        members: {
          deleteMany: {}, // Remove all existing members
          create: memberIds?.map((studentId: string) => ({
            studentId,
            role: 'MEMBER'
          })) || []
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
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = params.id;
    
    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Check if team exists and belongs to coach
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: teamId,
        coachId: coach.id
      }
    });

    if (!existingTeam) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.team.update({
      where: { id: teamId },
      data: {
        isActive: false
      }
    });

    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 