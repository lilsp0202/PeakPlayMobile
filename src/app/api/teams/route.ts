import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PERFORMANCE: Aggressive caching for Teams API to prevent connection pool exhaustion
const teamsCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const pendingTeamsRequests = new Map<string, Promise<any>>();

const getTeamsCache = (key: string): any | null => {
  const item = teamsCache.get(key);
  if (!item) return null;
  
  if (Date.now() - item.timestamp > item.ttl) {
    teamsCache.delete(key);
    return null;
  }
  
  return item.data;
};

const setTeamsCache = (key: string, data: any, ttlMs: number = 45000) => {
  teamsCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
};

const withTeamsCacheAndDeduplication = async <T>(key: string, fn: () => Promise<T>, ttlMs: number = 45000): Promise<T> => {
  // Check cache first
  const cached = getTeamsCache(key);
  if (cached !== null) {
    console.log(`⚡ Teams cache hit for key: ${key}`);
    return cached;
  }

  // Check if request is already pending
  if (pendingTeamsRequests.has(key)) {
    console.log(`🔒 Reusing pending teams request for key: ${key}`);
    return pendingTeamsRequests.get(key) as Promise<T>;
  }

  // Create new request
  const promise = fn()
    .then(result => {
      setTeamsCache(key, result, ttlMs);
      return result;
    })
    .finally(() => {
      pendingTeamsRequests.delete(key);
    });

  pendingTeamsRequests.set(key, promise);
  return promise;
};

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🏈 Teams API - Starting request');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    // Create cache key based on user and parameters
    const cacheKey = `teams:${session.user.id}:${coachId}:${includeMembers}:${includeStats}`;
    
    const result = await withTeamsCacheAndDeduplication(cacheKey, async () => {
      console.log(`🔍 Fetching teams data for user: ${session.user.email}`);
      
      // Check if user is a coach
      const coach = await prisma.coach.findUnique({
        where: { userId: session.user.id },
        select: { id: true, name: true }
      });

      // Check if user is a student
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true, studentName: true }
      });

      let teams;

    if (coach) {
      // User is a coach - return teams they manage
      teams = await prisma.team.findMany({
        where: {
          coachId: coachId || coach.id,
          isActive: true
        },
        include: {
          members: includeMembers ? {
            include: {
              student: {
                select: {
                  id: true,
                  studentName: true,
                  email: true,
                  academy: true,
                  sport: true,
                  role: true
                }
              }
            }
          } : false,
          _count: includeStats ? {
            select: {
              members: true,
              feedback: true,
              actions: true
            }
          } : false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (student) {
      // User is a student - return teams they are members of
      teams = await prisma.team.findMany({
        where: {
          isActive: true,
          members: {
            some: {
              studentId: student.id
            }
          }
        },
        include: {
          coach: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true
            }
          },
          members: includeMembers ? {
            include: {
              student: {
                select: {
                  id: true,
                  studentName: true,
                  email: true,
                  academy: true,
                  sport: true,
                  role: true
                }
              }
            }
          } : false,
          _count: includeStats ? {
            select: {
              members: true,
              feedback: true,
              actions: true
            }
          } : false
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      throw new Error('User not found as coach or student');
    }

    console.log(`✅ Teams data fetched successfully: ${teams.length} teams`);
    return { teams };
  }, 45000); // 45 second cache for teams data

  const totalTime = Date.now() - startTime;
  console.log(`🏈 Teams API completed in ${totalTime}ms`);
  
  return NextResponse.json(result);
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Teams API error after ${totalTime}ms:`, error);
    
    if (error instanceof Error && error.message.includes('User not found')) {
      return NextResponse.json({ error: 'User not found as coach or student' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, memberIds } = await request.json();

    if (!name || !Array.isArray(memberIds)) {
      return NextResponse.json({ error: 'Name and member IDs are required' }, { status: 400 });
    }

    // Get coach info
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id }
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Create team with members
    const team = await prisma.team.create({
      data: {
        name,
        description,
        coachId: coach.id,
        members: {
          create: memberIds.map((studentId: string) => ({
            studentId,
            roles: [] // Start with no roles - coaches must assign manually
          }))
        }
      },
      include: {
        members: {
          include: {
            student: {
              select: {
                id: true,
                studentName: true,
                email: true,
                academy: true,
                sport: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            feedback: true,
            actions: true
          }
        }
      }
    });

    return NextResponse.json({ team });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 