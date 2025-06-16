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

    // Extract id from URL
    const url = new URL(request.url);
    const idMatch = url.pathname.match(/\/api\/marketplace\/coaches\/(.+)$/);
    const coachId = idMatch ? idMatch[1] : undefined;
    if (!coachId) {
      return NextResponse.json({ error: 'Coach ID not found in URL' }, { status: 400 });
    }

    const coach = await prisma.specializedCoach.findUnique({
      where: { 
        id: coachId,
        isAvailable: true
      },
      include: {
        reviews: {
          take: 5,
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

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Parse JSON fields for response
    const formattedCoach = {
      ...coach,
      specialties: JSON.parse(coach.specialties),
      certifications: coach.certifications ? JSON.parse(coach.certifications) : [],
      socialLinks: coach.socialLinks ? JSON.parse(coach.socialLinks) : {},
      availability: coach.availability ? JSON.parse(coach.availability) : {}
    };

    return NextResponse.json(formattedCoach);
  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coach' },
      { status: 500 }
    );
  }
} 