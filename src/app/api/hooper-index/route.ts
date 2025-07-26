import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import type { Session } from 'next-auth';

const prisma = new PrismaClient();

// GET - Fetch today's Hooper Index entry or recent entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const recent = searchParams.get('recent');

    if (recent === 'true') {
      // Get recent entries for analytics
      const entries = await prisma.hooperIndex.findMany({
        where: { studentId: student.id },
        orderBy: { date: 'desc' },
        take: 30 // Last 30 days
      });
      
      return NextResponse.json({ entries });
    }

    // Get today's entry or specific date
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const entry = await prisma.hooperIndex.findUnique({
      where: {
        studentId_date: {
          studentId: student.id,
          date: targetDate
        }
      }
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching Hooper Index:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Hooper Index data' },
      { status: 500 }
    );
  }
}

// POST - Create or update today's Hooper Index entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      fatigue,
      stress,
      muscleSoreness,
      sleepQuality,
      enjoyingTraining,
      irritable,
      healthyOverall,
      wellRested,
      hooperIndex
    } = body;

    // Validate the data
    const scores = [fatigue, stress, muscleSoreness, sleepQuality, enjoyingTraining, irritable, healthyOverall, wellRested];
    
    if (scores.some(score => score < 1 || score > 7 || !Number.isInteger(score))) {
      return NextResponse.json(
        { error: 'All scores must be integers between 1 and 7' },
        { status: 400 }
      );
    }

    if (hooperIndex !== scores.reduce((sum, score) => sum + score, 0)) {
      return NextResponse.json(
        { error: 'Hooper Index must equal the sum of all scores' },
        { status: 400 }
      );
    }

    // Use today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert the entry (create or update if exists)
    const entry = await prisma.hooperIndex.upsert({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today
        }
      },
      update: {
        fatigue,
        stress,
        muscleSoreness,
        sleepQuality,
        enjoyingTraining,
        irritable,
        healthyOverall,
        wellRested,
        hooperIndex,
        updatedAt: new Date()
      },
      create: {
        studentId: student.id,
        date: today,
        fatigue,
        stress,
        muscleSoreness,
        sleepQuality,
        enjoyingTraining,
        irritable,
        healthyOverall,
        wellRested,
        hooperIndex
      }
    });

    return NextResponse.json({ 
      entry,
      message: 'Hooper Index entry saved successfully'
    });
  } catch (error) {
    console.error('Error saving Hooper Index:', error);
    return NextResponse.json(
      { error: 'Failed to save Hooper Index data' },
      { status: 500 }
    );
  }
} 