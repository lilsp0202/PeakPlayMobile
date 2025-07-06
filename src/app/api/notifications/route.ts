import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      coachId: coach.id
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Fetch notifications
    const notifications = await prisma.smartNotification.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            academy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Get counts
    const totalCount = await prisma.smartNotification.count({
      where: { coachId: coach.id }
    });

    const unreadCount = await prisma.smartNotification.count({
      where: { 
        coachId: coach.id,
        isRead: false
      }
    });

    return NextResponse.json({
      notifications,
      metadata: {
        total: totalCount,
        unread: unreadCount,
        showing: notifications.length
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
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
    const { notificationIds, action } = body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'mark_read':
        updateData.isRead = true;
        break;
      case 'mark_unread':
        updateData.isRead = false;
        break;
      case 'archive':
        updateData.isArchived = true;
        break;
      case 'unarchive':
        updateData.isArchived = false;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update notifications
    const result = await prisma.smartNotification.updateMany({
      where: {
        id: { in: notificationIds },
        coachId: coach.id // Ensure coach owns these notifications
      },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      updated: result.count
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    // Delete notification (ensure coach owns it)
    const result = await prisma.smartNotification.deleteMany({
      where: {
        id: notificationId,
        coachId: coach.id
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
} 