import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // OPTIMIZED: Fetch team details with efficient queries to avoid 36s delays
    console.log('🔍 Fetching team details for team:', teamId);
    const startTime = Date.now();
    
    // First, fetch basic team info efficiently
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      },
      select: {
        id: true,
        name: true,
        description: true,
        coachId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!team || team.coachId !== coach.id || !team.isActive) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // PERFORMANCE: Fetch related data in parallel to avoid sequential delays
    const [members, feedback, actions, counts] = await Promise.all([
      // Members
      prisma.teamMember.findMany({
        where: { teamId },
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
      }),
      
      // Feedback (limit to recent items for performance)
      prisma.feedback.findMany({
        where: { teamId },
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
        },
        take: 50 // Limit for performance
      }),
      
      // Actions (limit to recent items for performance)
      prisma.action.findMany({
        where: { teamId },
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
        },
        take: 50 // Limit for performance
      }),
      
      // Counts
      Promise.all([
        prisma.teamMember.count({ where: { teamId } }),
        prisma.feedback.count({ where: { teamId } }),
        prisma.action.count({ where: { teamId } })
      ])
    ]);

    // Reconstruct team object with optimized data
    const optimizedTeam = {
      ...team,
      members,
      feedback,
      actions,
        _count: {
        members: counts[0],
        feedback: counts[1],
        actions: counts[2]
          }
    };

    const totalTime = Date.now() - startTime;
    console.log(`✅ Team details fetched in ${totalTime}ms`);

    if (totalTime > 1000) {
      console.log('⚠️ Slow team query detected:', totalTime + 'ms');
    }

    return NextResponse.json({ team: optimizedTeam });
  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const teamId = resolvedParams.id;
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
            roles: [] // Start with no roles - coaches must assign manually
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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