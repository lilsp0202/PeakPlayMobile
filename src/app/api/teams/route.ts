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

// Clear all caches - useful for when data is updated
const clearTeamsCache = () => {
  console.log('🧹 Clearing all teams cache');
  teamsCache.clear();
  pendingTeamsRequests.clear();
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeStats = searchParams.get('includeStats') === 'true';
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const teamId = searchParams.get('teamId');
    const coachId = searchParams.get('coachId');
    const skipCache = searchParams.get('skipCache') === 'true';

    // Skip cache if requested
    if (skipCache) {
      console.log('🔄 Force refreshing teams data (skipCache=true)');
      clearTeamsCache();
    }

    const cacheKey = `teams:${session.user.id}:${includeStats}:${includeMembers}:${teamId || 'all'}:${coachId || 'self'}`;

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
                where: {
                  studentId: student.id
                },
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
      } else {
        console.log('❌ User is neither coach nor student');
        teams = [];
      }

      console.log(`📊 Returning ${teams.length} teams`);
      return teams;
    }, skipCache ? 1 : 30000); // Use short TTL if cache is skipped

    // Add Cache-Control header to prevent browser caching when skipCache is true
    const headers = skipCache 
      ? { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      : {};

    return NextResponse.json({ teams: result }, { headers });
  } catch (error) {
    console.error('Error fetching teams:', error);
    clearTeamsCache(); // Clear cache on error
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, memberIds = [] } = await request.json();

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

    // Use transaction to ensure data consistency
    const team = await prisma.$transaction(async (tx) => {
      // Create team first
      const newTeam = await tx.team.create({
        data: {
          name,
          description,
          coachId: coach.id
        }
      });

      // Add members if any
      if (memberIds.length > 0) {
        await tx.teamMember.createMany({
          data: memberIds.map((studentId: string) => ({
            teamId: newTeam.id,
            studentId,
            roles: [] // Start with no roles - coaches must assign manually
          }))
        });
      }

      // Return the fully hydrated team with counts
      return await tx.team.findUnique({
        where: { id: newTeam.id },
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
    });

    // Clear cache after creating team
    clearTeamsCache();

    console.log(`✅ Team created: ${team.name} with ${team._count.members} members`);

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(
      { team }, 
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        } 
      }
    );
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 