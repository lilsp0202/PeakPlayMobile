import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateNotificationsForCoach, saveNotifications } from '@/lib/notificationAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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

    console.log(`🔔 Generating notifications for coach: ${coach.name} (${coach.id})`);

    // Generate notifications using the analyzer
    const notifications = await generateNotificationsForCoach(coach.id);
    
    console.log(`🔔 Generated ${notifications.length} notifications`);

    // Save notifications to database
    await saveNotifications(coach.id, notifications);

    // Return summary
    const summary = {
      totalGenerated: notifications.length,
      byType: {
        negative_trends: notifications.filter(n => n.type === 'NEGATIVE_TREND').length,
        positive_milestones: notifications.filter(n => n.type === 'POSITIVE_MILESTONE').length,
        missed_checkins: notifications.filter(n => n.type === 'MISSED_CHECKIN').length,
        overdue_feedback: notifications.filter(n => n.type === 'OVERDUE_FEEDBACK').length
      },
      byCategory: {
        physical: notifications.filter(n => n.category === 'PHYSICAL').length,
        mental: notifications.filter(n => n.category === 'MENTAL').length,
        nutrition: notifications.filter(n => n.category === 'NUTRITION').length,
        technique: notifications.filter(n => n.category === 'TECHNIQUE').length,
        general: notifications.filter(n => n.category === 'GENERAL').length
      },
      bySeverity: {
        low: notifications.filter(n => n.severity === 'LOW').length,
        medium: notifications.filter(n => n.severity === 'MEDIUM').length,
        high: notifications.filter(n => n.severity === 'HIGH').length
      }
    };

    return NextResponse.json({
      success: true,
      summary,
      notifications: notifications.slice(0, 10) // Return first 10 for preview
    });

  } catch (error) {
    console.error('Error generating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to generate notifications' },
      { status: 500 }
    );
  }
}

// For generating notifications for all coaches (could be used in a cron job)
export async function GET(request: NextRequest) {
  try {
    // This could be protected with an API key for security
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('api_key');
    
    // For demo purposes, we'll allow it without API key
    // In production, you'd want to secure this endpoint
    
    console.log('🔔 Running notification generation for all coaches...');

    // Get all coaches
    const coaches = await prisma.coach.findMany({
      include: {
        students: {
          select: {
            id: true,
            studentName: true
          }
        }
      }
    });

    let totalNotifications = 0;
    const results = [];

    for (const coach of coaches) {
      try {
        const notifications = await generateNotificationsForCoach(coach.id);
        await saveNotifications(coach.id, notifications);
        
        totalNotifications += notifications.length;
        results.push({
          coachId: coach.id,
          coachName: coach.name,
          studentsCount: coach.students.length,
          notificationsGenerated: notifications.length
        });

        console.log(`✅ Generated ${notifications.length} notifications for ${coach.name}`);
      } catch (error) {
        console.error(`❌ Error generating notifications for coach ${coach.name}:`, error);
        results.push({
          coachId: coach.id,
          coachName: coach.name,
          error: 'Failed to generate notifications'
        });
      }
    }

    console.log(`🔔 Completed notification generation. Total: ${totalNotifications} notifications for ${coaches.length} coaches`);

    return NextResponse.json({
      success: true,
      summary: {
        totalCoaches: coaches.length,
        totalNotifications,
        processed: results.length
      },
      results
    });

  } catch (error) {
    console.error('Error in batch notification generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate notifications for all coaches' },
      { status: 500 }
    );
  }
} 