import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');

    if (!coachId) {
      return NextResponse.json({ error: 'Coach ID is required' }, { status: 400 });
    }

    const reviews = await prisma.coachReview.findMany({
      where: { coachId },
      include: {
        athlete: {
          select: {
            studentName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
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
      bookingId,
      rating,
      title,
      comment,
      isAnonymous = false
    } = body;

    // Find the student associated with this user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify the coach exists
    const coach = await prisma.specializedCoach.findUnique({
      where: { id: coachId }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // If bookingId is provided, verify the booking exists and belongs to the student
    if (bookingId) {
      const booking = await prisma.coachingBooking.findFirst({
        where: {
          id: bookingId,
          athleteId: student.id,
          coachId: coachId
        }
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
      }
    }

    // Check if the student has already reviewed this coach
    const existingReview = await prisma.coachReview.findFirst({
      where: {
        athleteId: student.id,
        coachId: coachId,
        ...(bookingId && { bookingId })
      }
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this coach' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.coachReview.create({
      data: {
        athleteId: student.id,
        coachId,
        bookingId,
        rating,
        title,
        comment,
        isAnonymous
      },
      include: {
        athlete: {
          select: {
            studentName: true
          }
        }
      }
    });

    // Update coach's average rating and review count
    const allReviews = await prisma.coachReview.findMany({
      where: { coachId },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    
    await prisma.specializedCoach.update({
      where: { id: coachId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: allReviews.length
      }
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 