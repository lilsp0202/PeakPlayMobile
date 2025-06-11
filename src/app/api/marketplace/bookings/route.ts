import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a coach or student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        student: true,
        coach: {
          include: {
            students: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let bookings;

    if (user.role === 'COACH' && user.coach) {
      // If user is a coach, get bookings for all their assigned students
      const assignedStudentIds = user.coach.students.map(student => student.id);
      
      bookings = await prisma.coachingBooking.findMany({
        where: { 
          athleteId: { 
            in: assignedStudentIds 
          } 
        },
        include: {
          coach: {
            select: {
              id: true,
              name: true,
              avatar: true,
              specialties: true,
              rating: true
            }
          },
          athlete: {
            select: {
              id: true,
              studentName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // If user is a student/athlete, get their own bookings
      const student = user.student;

      if (!student) {
        return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
      }

      bookings = await prisma.coachingBooking.findMany({
        where: { athleteId: student.id },
        include: {
          coach: {
            select: {
              id: true,
              name: true,
              avatar: true,
              specialties: true,
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Parse JSON fields
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      coach: {
        ...booking.coach,
        specialties: JSON.parse(booking.coach.specialties)
      },
      performanceClips: booking.performanceClips ? JSON.parse(booking.performanceClips) : [],
      // Include athlete info for coach view
      ...(user.role === 'COACH' && booking.athlete && {
        athlete: booking.athlete
      })
    }));

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      coachId,
      sessionType,
      title,
      description,
      scheduledAt,
      duration,
      performanceClips
    } = body;

    // Find the student associated with this user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Find the coach
    const coach = await prisma.specializedCoach.findUnique({
      where: { id: coachId }
    });

    if (!coach) {
      console.error('Coach not found with ID:', coachId);
      // Check if it exists in database
      const allCoaches = await prisma.specializedCoach.findMany({
        select: { id: true, name: true }
      });
      console.log('Available coaches:', allCoaches);
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Calculate price based on session type
    let price = coach.pricePerHour;
    if (sessionType === 'VIDEO_CALL') {
      price = coach.videoCallRate || coach.pricePerHour;
    } else if (sessionType === 'IN_PERSON') {
      price = coach.inPersonRate || coach.pricePerHour;
    } else if (sessionType === 'ASYNC_FEEDBACK') {
      price = coach.asyncFeedbackRate || coach.pricePerHour;
    }

    // Adjust price for duration (if provided)
    if (duration && sessionType !== 'ASYNC_FEEDBACK') {
      price = (price / 60) * duration; // Convert hourly rate to per-minute rate
    }

    const booking = await prisma.coachingBooking.create({
      data: {
        athleteId: student.id,
        coachId,
        sessionType,
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        duration,
        price,
        performanceClips: performanceClips ? JSON.stringify(performanceClips) : null,
        status: 'PENDING'
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            specialties: true,
            rating: true
          }
        }
      }
    });

    // Parse JSON fields for response
    const formattedBooking = {
      ...booking,
      coach: {
        ...booking.coach,
        specialties: JSON.parse(booking.coach.specialties)
      },
      performanceClips: booking.performanceClips ? JSON.parse(booking.performanceClips) : []
    };

    return NextResponse.json(formattedBooking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 