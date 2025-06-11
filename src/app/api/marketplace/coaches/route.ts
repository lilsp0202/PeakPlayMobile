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

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const sessionType = searchParams.get('sessionType');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter conditions
    const where: any = {
      isAvailable: true,
      sport: 'CRICKET' // Currently focused on cricket
    };

    if (specialty) {
      where.specialties = {
        contains: specialty
      };
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating)
      };
    }

    if (maxPrice) {
      const priceField = sessionType === 'VIDEO_CALL' ? 'videoCallRate' : 
                        sessionType === 'IN_PERSON' ? 'inPersonRate' : 
                        sessionType === 'ASYNC_FEEDBACK' ? 'asyncFeedbackRate' : 
                        'pricePerHour';
      
      where[priceField] = {
        lte: parseFloat(maxPrice)
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specialties: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build sort options
    const orderBy: any = {};
    if (sortBy === 'price') {
      const priceField = sessionType === 'VIDEO_CALL' ? 'videoCallRate' : 
                        sessionType === 'IN_PERSON' ? 'inPersonRate' : 
                        sessionType === 'ASYNC_FEEDBACK' ? 'asyncFeedbackRate' : 
                        'pricePerHour';
      orderBy[priceField] = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const coaches = await prisma.specializedCoach.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            athlete: {
              select: {
                studentName: true
              }
            }
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      }
    });

    // Parse JSON fields for response
    const formattedCoaches = coaches.map(coach => ({
      ...coach,
      specialties: JSON.parse(coach.specialties),
      certifications: coach.certifications ? JSON.parse(coach.certifications) : [],
      socialLinks: coach.socialLinks ? JSON.parse(coach.socialLinks) : {},
      availability: coach.availability ? JSON.parse(coach.availability) : {}
    }));

    return NextResponse.json(formattedCoaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaches' },
      { status: 500 }
    );
  }
} 