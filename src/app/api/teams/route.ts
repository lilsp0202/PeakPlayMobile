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

const setTeamsCache = (key: string, data: any, ttlMs: number = 30000) => {
  teamsCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
};

const withTeamsCacheAndDeduplication = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 30000
): Promise<T> => {
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
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get('coachId');
    // PERFORMANCE: Default to lightweight data, let frontend request details separately
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';
    const skipCache = searchParams.get('skipCache') === 'true';

    // Create cache key based on user and parameters - always include stats now
    const cacheKey = `teams:${session.user.id}:${coachId}:${includeMembers}:true`;
    
    // PRODUCTION FIX: Clear cache if skipCache is requested or clear old cache entries that might not have _count data
    if (skipCache) {
      console.log('🧹 Clearing all teams cache due to skipCache=true');
      teamsCache.clear();
    } else {
      for (const key of Array.from(teamsCache.keys())) {
        if (key.includes(`teams:${session.user.id}`) && !key.endsWith(':true')) {
          teamsCache.delete(key);
          console.log('🧹 Cleared old cache entry:', key);
        }
      }
    }
    
    const result = await withTeamsCacheAndDeduplication(cacheKey, async () => {
      console.log(`🔍 Fetching teams data for user: ${session.user.email} (ID: ${session.user.id}) (always including stats)`);

      // PERFORMANCE: Check user role first with minimal query
      const [coach, student] = await Promise.all([
        prisma.coach.findUnique({
          where: { userId: session.user.id },
          select: { id: true, name: true }
        }),
        prisma.student.findUnique({
          where: { userId: session.user.id },
          select: { id: true, studentName: true }
        })
      ]);

      console.log(`👨‍🏫 Coach found: ${coach ? `${coach.name} (ID: ${coach.id})` : 'None'}`);
      console.log(`👨‍🎓 Student found: ${student ? `${student.studentName} (ID: ${student.id})` : 'None'}`);

      let teams;

      if (coach) {
        console.log('👨‍🏫 Fetching teams for coach:', coach.id);
        // PRODUCTION FIX: Enhanced query to ensure _count is always calculated correctly
        teams = await prisma.team.findMany({
          where: {
            coachId: coachId || coach.id
            // Removed isActive filter - teams should always be shown
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            coachId: true,
            // PERFORMANCE: Only include heavy data if specifically requested
            ...(includeMembers && {
              members: {
                select: {
                  id: true,
                  studentId: true,
                  roles: true,
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
              }
            }),
            // PRODUCTION FIX: Always include counts with explicit calculation
            _count: {
              select: {
                members: true,
                feedback: true,
                actions: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // PERFORMANCE: Limit initial results
        });

        // PRODUCTION FIX: Validate that _count data is present and log any issues
        for (const team of teams) {
          if (team._count === undefined || team._count === null) {
            console.error(`❌ Missing _count data for team ${team.name} (${team.id})`);
          } else {
            console.log(`✅ Team ${team.name}: ${team._count.members} members, ${team._count.feedback} feedback, ${team._count.actions} actions`);
          }
        }
      } else if (student) {
        console.log('👨‍🎓 Fetching teams for student:', student.id);
        // PERFORMANCE: Optimized student query - much faster approach
        teams = await prisma.team.findMany({
          where: {
            // Removed isActive filter - teams should always be shown
            members: {
              some: {
                studentId: student.id
              }
            }
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            coachId: true,
            coach: {
              select: {
                id: true,
                userId: true,
                name: true,
                email: true
              }
            },
            // PERFORMANCE: Only include heavy data if specifically requested
            ...(includeMembers && {
              members: {
                select: {
                  id: true,
                  studentId: true,
                  roles: true,
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
              }
            }),
            // Always include counts - they're lightweight and needed for UI
            _count: {
              select: {
                members: true,
                feedback: true,
                actions: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // PERFORMANCE: Limit initial results
        });
      } else {
        console.error('❌ User not found as coach or student');
        throw new Error('User not found as coach or student');
      }

      console.log(`✅ Teams data fetched successfully: ${teams.length} teams with counts:`, teams.map(t => ({ 
        id: t.id, 
        name: t.name, 
        memberCount: t._count?.members,
        feedbackCount: t._count?.feedback,
        actionsCount: t._count?.actions
      })));
      
      // PRODUCTION FIX: Additional validation to ensure no team has undefined _count
      const teamsWithValidCounts = teams.map(team => {
        if (!team._count) {
          console.error(`❌ Team ${team.name} missing _count, setting defaults`);
          return {
            ...team,
            _count: {
              members: 0,
              feedback: 0,
              actions: 0
            }
          };
        }
        return team;
      });
      
      return { teams: teamsWithValidCounts };
    }, skipCache ? 0 : 30000); // PERFORMANCE: Reduced cache time for faster updates, or no cache if skipCache=true

    const totalTime = Date.now() - startTime;
    console.log(`🏈 Teams API completed in ${totalTime}ms`);
    
    // PERFORMANCE: Aggressive caching headers for faster subsequent loads
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return response;
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