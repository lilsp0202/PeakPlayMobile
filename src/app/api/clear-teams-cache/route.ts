import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's role to verify they're a coach
    const userRole = (session.user as any).role;
    
    console.log(`🧹 Cache clear requested by user: ${session.user.email} (${userRole})`);
    
    // This will trigger the cache clearing in the teams API when called with skipCache=true
    const teamsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/teams?skipCache=true`, {
      headers: {
        'Cookie': request.headers.get('Cookie') || '',
        'Content-Type': 'application/json'
      }
    });

    const teamsData = await teamsResponse.json();
    
    console.log(`✅ Cache cleared and fresh teams data fetched: ${teamsData.teams?.length || 0} teams`);
    
    return NextResponse.json({ 
      message: 'Teams cache cleared successfully',
      teamsCount: teamsData.teams?.length || 0,
      teams: teamsData.teams?.map((t: any) => ({
        id: t.id,
        name: t.name,
        memberCount: t._count?.members || 0
      })) || []
    });

  } catch (error) {
    console.error('❌ Error clearing teams cache:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 