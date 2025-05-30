import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏏 Populating sample match data...');

  // Find a student to add match data for
  const student = await prisma.student.findFirst();
  
  if (!student) {
    console.log('❌ No students found. Please create a student first.');
    return;
  }

  console.log(`📊 Adding match data for student: ${student.studentName}`);

  // Sample cricket matches for a batsman
  const cricketMatches = [
    {
      matchName: "League Cup Final",
      opponent: "Mumbai Academy",
      venue: "Wankhede Stadium",
      matchDate: new Date('2024-05-20'),
      sport: 'CRICKET',
      matchType: 'TOURNAMENT',
      result: 'WIN',
      position: "Opening Batsman",
      stats: {
        runs: 78,
        balls: 52,
        fours: 8,
        sixes: 3,
        strikeRate: 150.0,
        catches: 1
      },
      rating: 8.5,
      notes: "Excellent knock under pressure. Great shot selection and timing."
    },
    {
      matchName: "Practice Match",
      opponent: "Delhi Sports Club",
      venue: "Academy Ground",
      matchDate: new Date('2024-05-15'),
      sport: 'CRICKET',
      matchType: 'PRACTICE',
      result: 'LOSS',
      position: "Middle Order",
      stats: {
        runs: 23,
        balls: 28,
        fours: 2,
        sixes: 0,
        strikeRate: 82.1,
        catches: 0
      },
      rating: 6.0,
      notes: "Struggled against spin bowling. Need to work on footwork."
    },
    {
      matchName: "Inter-Academy Championship",
      opponent: "Bangalore Cricket Academy",
      venue: "M. Chinnaswamy Stadium",
      matchDate: new Date('2024-05-10'),
      sport: 'CRICKET',
      matchType: 'CHAMPIONSHIP',
      result: 'WIN',
      position: "Opening Batsman",
      stats: {
        runs: 105,
        balls: 89,
        fours: 12,
        sixes: 2,
        strikeRate: 117.9,
        catches: 2
      },
      rating: 9.5,
      notes: "Outstanding century! Controlled aggression and perfect timing. Man of the Match performance."
    },
    {
      matchName: "Friendly Match",
      opponent: "Local Club XI",
      venue: "Community Ground",
      matchDate: new Date('2024-05-05'),
      sport: 'CRICKET',
      matchType: 'FRIENDLY',
      result: 'DRAW',
      position: "All-rounder",
      stats: {
        runs: 34,
        balls: 41,
        fours: 4,
        sixes: 1,
        strikeRate: 82.9,
        wickets: 2,
        overs: 6.0,
        economyRate: 4.5,
        catches: 0
      },
      rating: 7.5,
      notes: "Good all-round performance. Bowling was particularly effective in the middle overs."
    },
    {
      matchName: "Selection Trial",
      opponent: "State Team Trials",
      venue: "State Cricket Association",
      matchDate: new Date('2024-04-30'),
      sport: 'CRICKET',
      matchType: 'TOURNAMENT',
      result: 'WIN',
      position: "Opening Batsman",
      stats: {
        runs: 67,
        balls: 54,
        fours: 9,
        sixes: 1,
        strikeRate: 124.1,
        catches: 1
      },
      rating: 8.0,
      notes: "Impressive performance in trials. Showcased good technique and temperament."
    }
  ];

  // Create matches and performances
  for (const matchData of cricketMatches) {
    try {
      // Create match
      const match = await prisma.match.create({
        data: {
          matchName: matchData.matchName,
          opponent: matchData.opponent,
          venue: matchData.venue,
          matchDate: matchData.matchDate,
          sport: matchData.sport as any,
          matchType: matchData.matchType as any,
          result: matchData.result as any,
        },
      });

      // Create performance
      await prisma.matchPerformance.create({
        data: {
          studentId: student.id,
          matchId: match.id,
          position: matchData.position,
          stats: JSON.stringify(matchData.stats),
          rating: matchData.rating,
          notes: matchData.notes,
        },
      });

      console.log(`✅ Created match: ${matchData.matchName}`);
    } catch (error) {
      console.error(`❌ Error creating match ${matchData.matchName}:`, error);
    }
  }

  console.log('🎉 Sample match data populated successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 