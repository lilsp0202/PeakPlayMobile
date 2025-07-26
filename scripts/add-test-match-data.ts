import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏏 Adding test match data for abc@gmail.com...');

  // Find the user with email abc@gmail.com
  const user = await prisma.user.findUnique({
    where: { email: 'abc@gmail.com' },
    include: {
      student: true
    }
  });

  if (!user) {
    console.log('❌ User abc@gmail.com not found. Please create this user first by signing up.');
    console.log('📝 You can sign up at: http://localhost:3000/auth/signup');
    return;
  }

  if (!user.student) {
    console.log('❌ Student profile not found for abc@gmail.com. Please complete onboarding first.');
    console.log('📝 Complete onboarding at: http://localhost:3000/onboarding/athlete');
    return;
  }

  console.log(`✅ Found student: ${user.student.studentName} (${user.student.id})`);

  // Create test matches and performances
  const matches = [
    {
      matchName: "Inter-Academy Championship Final",
      opponent: "Delhi Cricket Academy",
      venue: "M.A. Chidambaram Stadium",
      matchDate: new Date('2024-12-10'),
      sport: 'CRICKET',
      matchType: 'CHAMPIONSHIP',
      result: 'WIN',
      performance: {
        position: "Opening Batsman",
        rating: 9.2,
        notes: "Outstanding innings under pressure. Excellent shot selection and timing.",
        stats: {
          runs: 87,
          balls: 76,
          fours: 9,
          sixes: 2,
          strikeRate: 114.47,
          catches: 1,
          runOuts: 0
        }
      }
    },
    {
      matchName: "State League - Semi Final",
      opponent: "Mumbai Sports Club",
      venue: "Wankhede Stadium",
      matchDate: new Date('2024-12-01'),
      sport: 'CRICKET',
      matchType: 'LEAGUE',
      result: 'WIN',
      performance: {
        position: "Opening Batsman",
        rating: 8.5,
        notes: "Solid performance. Good partnership building and consistent scoring.",
        stats: {
          runs: 62,
          balls: 58,
          fours: 7,
          sixes: 1,
          strikeRate: 106.90,
          catches: 2,
          runOuts: 1
        }
      }
    },
    {
      matchName: "Training Tournament",
      opponent: "Bangalore Academy",
      venue: "Chinnaswamy Stadium",
      matchDate: new Date('2024-11-20'),
      sport: 'CRICKET',
      matchType: 'TOURNAMENT',
      result: 'LOSS',
      performance: {
        position: "Opening Batsman",
        rating: 6.8,
        notes: "Struggled against swing bowling early. Need to work on technique against moving ball.",
        stats: {
          runs: 23,
          balls: 31,
          fours: 2,
          sixes: 0,
          strikeRate: 74.19,
          catches: 1,
          runOuts: 0
        }
      }
    },
    {
      matchName: "Academy Practice Match",
      opponent: "Chennai Super Academy",
      venue: "Academy Ground",
      matchDate: new Date('2024-11-15'),
      sport: 'CRICKET',
      matchType: 'PRACTICE',
      result: 'WIN',
      performance: {
        position: "Opening Batsman",
        rating: 8.8,
        notes: "Excellent form. Dominated the bowling attack with aggressive yet controlled batting.",
        stats: {
          runs: 103,
          balls: 89,
          fours: 12,
          sixes: 3,
          strikeRate: 115.73,
          catches: 0,
          runOuts: 0
        }
      }
    },
    {
      matchName: "Regional Cup Quarter Final",
      opponent: "Hyderabad Hawks",
      venue: "Rajiv Gandhi Stadium",
      matchDate: new Date('2024-11-05'),
      sport: 'CRICKET',
      matchType: 'TOURNAMENT',
      result: 'WIN',
      performance: {
        position: "Opening Batsman",
        rating: 9.5,
        notes: "Match-winning performance! Stayed calm under pressure and finished the game brilliantly.",
        stats: {
          runs: 78,
          balls: 65,
          fours: 8,
          sixes: 2,
          strikeRate: 120.00,
          catches: 3,
          runOuts: 1
        }
      }
    },
    {
      matchName: "Friendly vs Local Club",
      opponent: "City Sports Club",
      venue: "Local Ground",
      matchDate: new Date('2024-10-28'),
      sport: 'CRICKET',
      matchType: 'FRIENDLY',
      result: 'DRAW',
      performance: {
        position: "Opening Batsman",
        rating: 7.2,
        notes: "Decent batting display. Focused on building partnerships rather than aggressive scoring.",
        stats: {
          runs: 45,
          balls: 67,
          fours: 4,
          sixes: 0,
          strikeRate: 67.16,
          catches: 1,
          runOuts: 0
        }
      }
    }
  ];

  // Create matches and performances
  for (const matchData of matches) {
    console.log(`📊 Creating match: ${matchData.matchName}`);
    
    try {
      // Create the match
      const match = await prisma.match.create({
        data: {
          matchName: matchData.matchName,
          opponent: matchData.opponent,
          venue: matchData.venue,
          matchDate: matchData.matchDate,
          sport: matchData.sport as any,
          matchType: matchData.matchType as any,
          result: matchData.result as any,
        }
      });

      // Create the performance
      const performance = await prisma.matchPerformance.create({
        data: {
          matchId: match.id,
          studentId: user.student!.id,
          position: matchData.performance.position,
          stats: JSON.stringify(matchData.performance.stats),
          rating: matchData.performance.rating,
          notes: matchData.performance.notes,
        }
      });

      console.log(`   ✅ Created performance for ${matchData.matchName} - Rating: ${matchData.performance.rating}/10`);
    } catch (error) {
      console.error(`   ❌ Error creating match ${matchData.matchName}:`, error);
    }
  }

  // Verify data was created
  const createdMatches = await prisma.matchPerformance.findMany({
    where: { studentId: user.student!.id },
    include: {
      match: true,
      student: {
        select: {
          studentName: true,
          sport: true,
          role: true
        }
      }
    },
    orderBy: {
      match: {
        matchDate: 'desc'
      }
    }
  });

  console.log(`\n🎉 Successfully created ${createdMatches.length} match performances!`);
  console.log('\n📊 Summary of created data:');
  
  createdMatches.forEach((performance, index) => {
    const stats = JSON.parse(performance.stats);
    console.log(`${index + 1}. ${performance.match.matchName}`);
    console.log(`   📅 Date: ${performance.match.matchDate.toDateString()}`);
    console.log(`   🏏 vs ${performance.match.opponent}`);
    console.log(`   📊 Stats: ${stats.runs} runs (${stats.balls} balls) - SR: ${stats.strikeRate.toFixed(2)}`);
    console.log(`   ⭐ Rating: ${performance.rating}/10`);
    console.log(`   🏆 Result: ${performance.match.result}`);
    console.log('');
  });

  console.log('\n🔍 Data Storage Locations:');
  console.log('1. Match Details → "Match" table');
  console.log('2. Performance Stats → "MatchPerformance" table');
  console.log('3. Student Info → "Student" table');
  console.log('4. User Auth → "User" table');
  console.log('\n💻 Access Prisma Studio at: http://localhost:5555');
  console.log('🌐 View in Dashboard at: http://localhost:3000/dashboard (after signing in)');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 