import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeEngine } from '@/lib/badgeEngine';

// POST /api/badges/evaluate - Trigger automatic badge evaluation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Allow both coaches and system calls (for periodic evaluation)
    if (!session?.user?.id) {
      // Check for system API key for automated calls
      const apiKey = request.headers.get('x-api-key');
      if (apiKey !== process.env.SYSTEM_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { studentId, evaluateAll = false } = body;

    console.log('Badge evaluation API called:', { studentId, evaluateAll, userId: session?.user?.id });

    if (evaluateAll) {
      // Evaluate all students
      const result = await BadgeEngine.evaluateAllStudents();
      
      return NextResponse.json({
        success: true,
        message: `Evaluated ${result.studentsEvaluated} students`,
        studentsEvaluated: result.studentsEvaluated,
        totalNewBadges: result.totalNewBadges,
        errors: result.errors
      });
    } else if (studentId) {
      // Evaluate specific student
      const result = await BadgeEngine.evaluateStudentBadges({
        studentId
      });
      
      return NextResponse.json({
        success: true,
        message: `Evaluated student ${studentId}`,
        newBadges: result.newBadges.length,
        updatedProgress: result.updatedProgress.length
      });
    } else {
      return NextResponse.json({ 
        error: 'Either studentId or evaluateAll=true must be provided' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Badge evaluation API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// GET /api/badges/evaluate - Get evaluation status or trigger evaluation for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If user is a student, evaluate their badges
    if (session.user.role === 'ATHLETE') {
      const { searchParams } = new URL(request.url);
      const autoEvaluate = searchParams.get('autoEvaluate') === 'true';
      
      if (autoEvaluate) {
        // Find student record
        const { prisma } = await import('@/lib/prisma');
        const student = await prisma.student.findUnique({
          where: { userId: session.user.id }
        });
        
        if (student) {
          const result = await BadgeEngine.evaluateStudentBadges({
            studentId: student.id
          });
          
          return NextResponse.json({
            success: true,
            studentId: student.id,
            newBadges: result.newBadges.length,
            updatedProgress: result.updatedProgress.length
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Badge evaluation endpoint',
      userRole: session.user.role,
      userId: session.user.id
    });
  } catch (error) {
    console.error('Badge evaluation GET API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 