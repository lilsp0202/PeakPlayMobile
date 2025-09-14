import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Get user with coach/student info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        coach: true,
        student: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    let teamsInfo = null;
    if (user.coach) {
      // Get teams for this coach
      const teams = await prisma.team.findMany({
        where: {
          coachId: user.coach.id
        },
        select: {
          id: true,
          name: true,
          description: true,
          _count: {
            select: {
              members: true,
              feedback: true,
              actions: true
            }
          }
        }
      });

      teamsInfo = {
        coachId: user.coach.id,
        coachName: user.coach.name,
        teamsCount: teams.length,
        teams: teams.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          memberCount: team._count.members,
          feedbackCount: team._count.feedback,
          actionsCount: team._count.actions
        }))
      };
    }

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role
      },
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCoach: !!user.coach,
        hasStudent: !!user.student,
        coachInfo: user.coach ? {
          id: user.coach.id,
          name: user.coach.name,
          email: user.coach.email,
          academy: user.coach.academy
        } : null,
        studentInfo: user.student ? {
          id: user.student.id,
          name: user.student.studentName,
          email: user.student.email,
          academy: user.student.academy
        } : null
      },
      teams: teamsInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
      }
    });

  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 