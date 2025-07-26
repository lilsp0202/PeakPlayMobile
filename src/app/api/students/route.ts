import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let students;

    if (session.user.role === 'COACH') {
      // Coach can see their students
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id }
      });

      if (!coach) {
        return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
      }

      students = await prisma.student.findMany({
        where: { coachId: coach.id },
        select: {
          id: true,
          studentName: true,
          username: true,
          email: true,
          sport: true,
          role: true,
          createdAt: true
        },
        orderBy: { studentName: 'asc' }
      });
    } else if (session.user.role === 'ATHLETE') {
      // Athletes can only see themselves
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: {
          id: true,
          studentName: true,
          username: true,
          email: true,
          sport: true,
          role: true,
          createdAt: true
        }
      });

      students = student ? [student] : [];
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json(students);
  } catch (error) {
    console.error('Students API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 