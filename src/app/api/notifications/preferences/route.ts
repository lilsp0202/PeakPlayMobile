import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get coach profile
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Get or create preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { coachId: coach.id }
    });

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreference.create({
        data: {
          coachId: coach.id,
          negativeTrends: true,
          positiveMilestones: true,
          missedCheckIns: true,
          overdueFeedback: true,
          trendDays: 3,
          feedbackDays: 7,
          inApp: true,
          email: false,
          pushNotification: false
        }
      });
    }

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      negativeTrends,
      positiveMilestones,
      missedCheckIns,
      overdueFeedback,
      trendDays,
      feedbackDays,
      inApp,
      email,
      pushNotification
    } = body;

    // Validate input
    if (trendDays && (trendDays < 2 || trendDays > 14)) {
      return NextResponse.json(
        { error: 'Trend days must be between 2 and 14' },
        { status: 400 }
      );
    }

    if (feedbackDays && (feedbackDays < 1 || feedbackDays > 30)) {
      return NextResponse.json(
        { error: 'Feedback days must be between 1 and 30' },
        { status: 400 }
      );
    }

    // Update or create preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { coachId: coach.id },
      update: {
        negativeTrends: negativeTrends ?? true,
        positiveMilestones: positiveMilestones ?? true,
        missedCheckIns: missedCheckIns ?? true,
        overdueFeedback: overdueFeedback ?? true,
        trendDays: trendDays ?? 3,
        feedbackDays: feedbackDays ?? 7,
        inApp: inApp ?? true,
        email: email ?? false,
        pushNotification: pushNotification ?? false
      },
      create: {
        coachId: coach.id,
        negativeTrends: negativeTrends ?? true,
        positiveMilestones: positiveMilestones ?? true,
        missedCheckIns: missedCheckIns ?? true,
        overdueFeedback: overdueFeedback ?? true,
        trendDays: trendDays ?? 3,
        feedbackDays: feedbackDays ?? 7,
        inApp: inApp ?? true,
        email: email ?? false,
        pushNotification: pushNotification ?? false
      }
    });

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 