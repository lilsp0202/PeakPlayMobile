import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    // If no studentId provided and user is athlete, use their student record
    let targetStudentId = studentId;
    if (!targetStudentId) {
      const student = await prisma.student.findFirst({
        where: { userId: session.user.id }
      });
      
      if (!student) {
        return NextResponse.json({ error: 'No student record found' }, { status: 404 });
      }
      
      targetStudentId = student.id;
    }

    // Fetch all match performances for the student
    const performances = await prisma.matchPerformance.findMany({
      where: {
        studentId: targetStudentId
      },
      include: {
        match: true,
        student: true
      },
      orderBy: {
        match: {
          matchDate: 'desc'
        }
      }
    });

    if (performances.length === 0) {
      return NextResponse.json({
        totalMatches: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        winPercentage: 0,
        averageRating: 0,
        totalRuns: 0,
        totalWickets: 0,
        totalCatches: 0,
        highestScore: 0,
        bestBowling: "0/0",
        recentForm: [],
        battingAverage: 0,
        bowlingAverage: 0,
        strikeRate: 0,
        economyRate: 0,
        matchTypes: {}
      });
    }

    // Calculate basic match statistics
    const totalMatches = performances.length;
    const totalWins = performances.filter(p => p.match.result === 'WON' || p.match.result === 'WIN').length;
    const totalLosses = performances.filter(p => p.match.result === 'LOST' || p.match.result === 'LOSS').length;
    const totalDraws = performances.filter(p => p.match.result === 'DRAW').length;
    const winPercentage = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

    // Calculate ratings
    const ratingsWithValues = performances.filter(p => p.rating !== null).map(p => p.rating!);
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length 
      : 0;

    // Parse stats and calculate cricket-specific statistics
    let totalRuns = 0;
    let totalBalls = 0;
    let totalWickets = 0;
    let totalOvers = 0;
    let totalRunsConceded = 0;
    let totalCatches = 0;
    let highestScore = 0;
    let bestBowlingWickets = 0;
    let bestBowlingRuns = 999;
    let battingInnings = 0;
    let bowlingInnings = 0;

    performances.forEach(performance => {
      try {
        const stats = JSON.parse(performance.stats);
        
        // Batting statistics
        if (stats.runs !== undefined && stats.runs !== null) {
          totalRuns += Number(stats.runs);
          battingInnings++;
          if (Number(stats.runs) > highestScore) {
            highestScore = Number(stats.runs);
          }
        }
        
        if (stats.balls !== undefined && stats.balls !== null) {
          totalBalls += Number(stats.balls);
        }

        // Bowling statistics
        if (stats.wickets !== undefined && stats.wickets !== null) {
          totalWickets += Number(stats.wickets);
          bowlingInnings++;
          
          // Check for best bowling figures
          const runsGiven = Number(stats.runsConceded) || 0;
          if (Number(stats.wickets) > bestBowlingWickets || 
              (Number(stats.wickets) === bestBowlingWickets && runsGiven < bestBowlingRuns)) {
            bestBowlingWickets = Number(stats.wickets);
            bestBowlingRuns = runsGiven;
          }
        }

        if (stats.overs !== undefined && stats.overs !== null) {
          totalOvers += Number(stats.overs);
        }

        if (stats.runsConceded !== undefined && stats.runsConceded !== null) {
          totalRunsConceded += Number(stats.runsConceded);
        }

        // Fielding statistics
        if (stats.catches !== undefined && stats.catches !== null) {
          totalCatches += Number(stats.catches);
        }
      } catch (e) {
        console.error('Error parsing stats for performance:', performance.id, e);
      }
    });

    // Calculate derived statistics
    const battingAverage = battingInnings > 0 ? totalRuns / battingInnings : 0;
    const bowlingAverage = totalWickets > 0 ? totalRunsConceded / totalWickets : 0;
    const strikeRate = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;
    const economyRate = totalOvers > 0 ? totalRunsConceded / totalOvers : 0;

    // Recent form (last 5 matches)
    const recentMatches = performances.slice(0, 5);
    const recentForm = recentMatches.map(p => {
      switch (p.match.result?.toUpperCase()) {
        case 'WON':
        case 'WIN':
          return 'W';
        case 'LOST':
        case 'LOSS':
          return 'L';
        case 'DRAW':
          return 'D';
        default:
          return 'N';
      }
    });

    // Match type breakdown
    const matchTypes: { [key: string]: { played: number; won: number; lost: number; drawn: number } } = {};
    performances.forEach(performance => {
      const type = performance.match.matchType || 'Unknown';
      if (!matchTypes[type]) {
        matchTypes[type] = { played: 0, won: 0, lost: 0, drawn: 0 };
      }
      matchTypes[type].played++;
      
      switch (performance.match.result?.toUpperCase()) {
        case 'WON':
        case 'WIN':
          matchTypes[type].won++;
          break;
        case 'LOST':
        case 'LOSS':
          matchTypes[type].lost++;
          break;
        case 'DRAW':
          matchTypes[type].drawn++;
          break;
      }
    });

    const bestBowling = bestBowlingWickets > 0 ? `${bestBowlingWickets}/${bestBowlingRuns}` : "0/0";

    const stats = {
      totalMatches,
      totalWins,
      totalLosses,
      totalDraws,
      winPercentage,
      averageRating,
      totalRuns,
      totalWickets,
      totalCatches,
      highestScore,
      bestBowling,
      recentForm,
      battingAverage,
      bowlingAverage,
      strikeRate,
      economyRate,
      matchTypes
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 