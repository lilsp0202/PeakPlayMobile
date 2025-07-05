import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'COACH') {
      return NextResponse.json(
        { error: 'Unauthorized - Only coaches can add notes' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, date, note } = body;

    if (!studentId || !date || !note) {
      return NextResponse.json(
        { error: 'Student ID, date, and note are required' },
        { status: 400 }
      );
    }

    // Verify the student belongs to this coach
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { coach: true }
    });

    if (!student || student.coach?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update or create skill history with the note
    const skillHistory = await prisma.skillHistory.upsert({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date)
        }
      },
      update: {
        notes: note
      },
      create: {
        studentId,
        date: new Date(date),
        notes: note
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: skillHistory 
    });

  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { error: 'Failed to add note' },
      { status: 500 }
    );
  }
} 