import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeEngine } from '@/lib/badgeEngine';

// POST /api/badges/evaluate - Evaluate badges for students
export async function POST(request: NextRequest) {
  try {
    console.log('Badge Evaluate API - POST request received');
    
    const session = await getServerSession(authOptions);
    console.log('Badge Evaluate API - Session:', session?.user ? { id: session.user.id, role: session.user.role } : 'No session');
    
    if (!session?.user?.id) {
      console.log('Badge Evaluate API - Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only coaches can trigger badge evaluations
    if (session.user.role !== 'COACH') {
      console.log('Badge Evaluate API - Forbidden: User is not a coach, role:', session.user.role);
      return NextResponse.json({ error: 'Only coaches can trigger badge evaluations' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    console.log('Badge Evaluate API - Student ID from params:', studentId);

    // Get the coach to verify permissions
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      console.log('Badge Evaluate API - Coach not found for user:', session.user.id);
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    console.log('Badge Evaluate API - Coach found:', coach.id);

    if (studentId) {
      // Evaluate badges for a specific student
      console.log('Badge Evaluate API - Evaluating badges for specific student:', studentId);
      
      // Verify the coach can evaluate this student
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student) {
        console.log('Badge Evaluate API - Student not found:', studentId);
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      if (student.coachId !== coach.id) {
        console.log('Badge Evaluate API - Unauthorized: Coach', coach.id, 'cannot evaluate student', studentId, 'who belongs to coach', student.coachId);
        return NextResponse.json({ error: 'Unauthorized to evaluate this student' }, { status: 403 });
      }

      console.log('Badge Evaluate API - Authorization successful, evaluating badges...');
      
      const result = await BadgeEngine.evaluateStudentBadges({ studentId });
      
      console.log('Badge Evaluate API - Evaluation result:', {
        newBadges: result.newBadges.length,
        updatedProgress: result.updatedProgress.length
      });
      
      return NextResponse.json(result);
    } else {
      // Evaluate badges for all students under this coach
      console.log('Badge Evaluate API - Evaluating badges for all students under coach:', coach.id);
      
      const students = await prisma.student.findMany({
        where: { coachId: coach.id },
        select: { id: true, studentName: true }
      });

      console.log('Badge Evaluate API - Found', students.length, 'students to evaluate');

      const studentIds = students.map(s => s.id);
      const results = await BadgeEngine.bulkEvaluate(studentIds);
      
      console.log('Badge Evaluate API - Bulk evaluation completed');
      
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('Badge Evaluate API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 