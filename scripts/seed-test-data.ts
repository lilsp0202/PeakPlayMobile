import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Test students data with diverse profiles across different age groups
const testStudents = [
  // 10 and below age group
  { name: "Emma Johnson", username: "emma_j", email: "emma.johnson@example.com", age: 8, height: 130, weight: 30, academy: "Transform", role: "BATSMAN" },
  { name: "Liam Smith", username: "liam_s", email: "liam.smith@example.com", age: 10, height: 140, weight: 35, academy: "Transform", role: "BOWLER" },
  { name: "Ava Brown", username: "ava_b", email: "ava.brown@example.com", age: 9, height: 135, weight: 32, academy: "Elite Sports", role: "ALL_ROUNDER" },
  
  // 11-13 age group
  { name: "Noah Wilson", username: "noah_w", email: "noah.wilson@example.com", age: 11, height: 150, weight: 40, academy: "Transform", role: "KEEPER" },
  { name: "Sophia Davis", username: "sophia_d", email: "sophia.davis@example.com", age: 12, height: 155, weight: 45, academy: "Elite Sports", role: "BATSMAN" },
  { name: "Mason Miller", username: "mason_m", email: "mason.miller@example.com", age: 13, height: 160, weight: 50, academy: "Champion Academy", role: "BOWLER" },
  { name: "Isabella Garcia", username: "isabella_g", email: "isabella.garcia@example.com", age: 13, height: 158, weight: 48, academy: "Transform", role: "ALL_ROUNDER" },
  
  // 14-18 age group
  { name: "Olivia Martinez", username: "olivia_m", email: "olivia.martinez@example.com", age: 14, height: 165, weight: 55, academy: "Transform", role: "KEEPER" },
  { name: "James Anderson", username: "james_a", email: "james.anderson@example.com", age: 15, height: 170, weight: 60, academy: "Champion Academy", role: "BOWLER" },
  { name: "Amelia Taylor", username: "amelia_t", email: "amelia.taylor@example.com", age: 16, height: 162, weight: 52, academy: "Elite Sports", role: "ALL_ROUNDER" },
  { name: "Benjamin Thomas", username: "benjamin_t", email: "benjamin.thomas@example.com", age: 17, height: 175, weight: 65, academy: "Transform", role: "BATSMAN" },
  { name: "Charlotte Jackson", username: "charlotte_j", email: "charlotte.jackson@example.com", age: 18, height: 168, weight: 58, academy: "Champion Academy", role: "BOWLER" },
  
  // 18+ age group
  { name: "William Clark", username: "william_c", email: "william.clark@example.com", age: 19, height: 180, weight: 70, academy: "Champion Academy", role: "BATSMAN" },
  { name: "Harper Lewis", username: "harper_l", email: "harper.lewis@example.com", age: 20, height: 170, weight: 60, academy: "Elite Sports", role: "BOWLER" },
  { name: "Lucas Robinson", username: "lucas_r", email: "lucas.robinson@example.com", age: 22, height: 178, weight: 72, academy: "Transform", role: "ALL_ROUNDER" },
  { name: "Evelyn Walker", username: "evelyn_w", email: "evelyn.walker@example.com", age: 21, height: 165, weight: 55, academy: "Champion Academy", role: "KEEPER" }
];

// Test matches data
const testMatches = [
  {
    matchName: 'Summer League Match 1',
    opponent: 'Mumbai Cricket Academy',
    venue: 'Transform Ground',
    matchDate: new Date('2024-05-15'),
    sport: 'CRICKET',
    matchType: 'LEAGUE',
    result: 'WIN'
  },
  {
    matchName: 'Friendly Match',
    opponent: 'Delhi Sports Club',
    venue: 'Delhi Sports Complex',
    matchDate: new Date('2024-05-20'),
    sport: 'CRICKET',
    matchType: 'FRIENDLY',
    result: 'LOSS'
  },
  {
    matchName: 'Tournament Quarter Final',
    opponent: 'Bangalore United',
    venue: 'Transform Ground',
    matchDate: new Date('2024-05-25'),
    sport: 'CRICKET',
    matchType: 'TOURNAMENT',
    result: 'WIN'
  },
  {
    matchName: 'Summer League Match 2',
    opponent: 'Chennai Kings',
    venue: 'Chennai Cricket Ground',
    matchDate: new Date('2024-06-01'),
    sport: 'CRICKET',
    matchType: 'LEAGUE',
    result: 'WIN'
  },
  {
    matchName: 'Tournament Semi Final',
    opponent: 'Hyderabad Heroes',
    venue: 'Transform Ground',
    matchDate: new Date('2024-06-05'),
    sport: 'CRICKET',
    matchType: 'TOURNAMENT',
    result: 'LOSS'
  }
];

// Helper function to generate skill scores based on age and role
function generateSkillScores(age: number, role: string) {
  const ageMultiplier = age / 20; // Older students tend to have better skills
  const baseSkill = Math.floor(Math.random() * 3) + 5; // Base skill 5-7
  
  // Role-specific skill bonuses
  let battingBonus = 0, bowlingBonus = 0, fieldingBonus = 0;
  switch (role) {
    case 'BATSMAN':
      battingBonus = 2;
      break;
    case 'BOWLER':
      bowlingBonus = 2;
      break;
    case 'ALL_ROUNDER':
      battingBonus = 1;
      bowlingBonus = 1;
      fieldingBonus = 1;
      break;
    case 'KEEPER':
      fieldingBonus = 2;
      break;
  }

  const generateScore = (base: number, bonus = 0) => {
    const score = Math.floor((base + bonus) * ageMultiplier + Math.random() * 2);
    return Math.min(Math.max(score, 1), 10); // Ensure 1-10 range
  };

  return {
    // Physical Skills
    pushupScore: Math.floor(Math.random() * 20) + 15,
    pullupScore: Math.floor(Math.random() * 10) + 5,
    sprintTime: 12.0 + Math.random() * 3, // 12-15 seconds for 100m
    run5kTime: 20.0 + Math.random() * 5, // 20-25 minutes for 5K
    
    // Mental Skills
    moodScore: Math.floor(Math.random() * 3) + 7, // 7-10
    sleepScore: Math.floor(Math.random() * 3) + 7, // 7-10
    
    // Nutrition Skills
    totalCalories: 2000 + Math.floor(Math.random() * 500),
    protein: 50 + Math.random() * 30,
    carbohydrates: 200 + Math.random() * 100,
    fats: 60 + Math.random() * 20,
    
    // Technical Skills - Batting
    battingGrip: generateScore(baseSkill, battingBonus),
    battingStance: generateScore(baseSkill, battingBonus),
    battingBalance: generateScore(baseSkill, battingBonus),
    cockingOfWrist: generateScore(baseSkill, battingBonus),
    backLift: generateScore(baseSkill, battingBonus),
    topHandDominance: generateScore(baseSkill, battingBonus),
    highElbow: generateScore(baseSkill, battingBonus),
    runningBetweenWickets: generateScore(baseSkill, battingBonus),
    calling: generateScore(baseSkill, battingBonus),
    
    // Technical Skills - Bowling
    bowlingGrip: generateScore(baseSkill, bowlingBonus),
    runUp: generateScore(baseSkill, bowlingBonus),
    backFootLanding: generateScore(baseSkill, bowlingBonus),
    frontFootLanding: generateScore(baseSkill, bowlingBonus),
    hipDrive: generateScore(baseSkill, bowlingBonus),
    backFootDrag: generateScore(baseSkill, bowlingBonus),
    nonBowlingArm: generateScore(baseSkill, bowlingBonus),
    release: generateScore(baseSkill, bowlingBonus),
    followThrough: generateScore(baseSkill, bowlingBonus),
    
    // Technical Skills - Fielding
    positioningOfBall: generateScore(baseSkill, fieldingBonus),
    pickUp: generateScore(baseSkill, fieldingBonus),
    aim: generateScore(baseSkill, fieldingBonus),
    throw: generateScore(baseSkill, fieldingBonus),
    softHands: generateScore(baseSkill, fieldingBonus),
    receiving: generateScore(baseSkill, fieldingBonus),
    highCatch: generateScore(baseSkill, fieldingBonus),
    flatCatch: generateScore(baseSkill, fieldingBonus),
  };
}

// Helper function to generate match performance data
function generateMatchPerformance(role: string) {
  interface BattingStats {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
  }
  interface BowlingStats {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  }
  interface AllRounderStats {
    runs: number;
    balls: number;
    overs: number;
    wickets: number;
    catches: number;
  }
  interface KeeperStats {
    catches: number;
    stumpings: number;
    runs: number;
    byes: number;
  }
  type Stats = BattingStats | BowlingStats | AllRounderStats | KeeperStats;
  let stats: Stats | undefined = undefined;
  let rating = 0;

  switch (role) {
    case 'BATSMAN':
      stats = {
        runs: Math.floor(Math.random() * 50),
        balls: Math.floor(Math.random() * 30) + 20,
        fours: Math.floor(Math.random() * 5),
        sixes: Math.floor(Math.random() * 3),
        strikeRate: Math.floor(Math.random() * 50) + 100
      };
      rating = (stats.runs / 50) * 10; // Rating based on runs
      break;
    case 'BOWLER':
      stats = {
        overs: Math.floor(Math.random() * 4) + 1,
        maidens: Math.floor(Math.random() * 2),
        runs: Math.floor(Math.random() * 30),
        wickets: Math.floor(Math.random() * 4),
        economy: Number((Math.random() * 3 + 5).toFixed(2))
      };
      rating = (stats.wickets * 2.5) + (10 - stats.economy); // Rating based on wickets and economy
      break;
    case 'ALL_ROUNDER':
      stats = {
        runs: Math.floor(Math.random() * 30),
        balls: Math.floor(Math.random() * 20) + 10,
        overs: Math.floor(Math.random() * 2) + 1,
        wickets: Math.floor(Math.random() * 2),
        catches: Math.floor(Math.random() * 2)
      };
      rating = (stats.runs / 30) * 5 + (stats.wickets * 2.5); // Combined rating
      break;
    case 'KEEPER':
      stats = {
        catches: Math.floor(Math.random() * 3),
        stumpings: Math.floor(Math.random() * 2),
        runs: Math.floor(Math.random() * 20),
        byes: Math.floor(Math.random() * 5)
      };
      rating = (stats.catches * 2) + (stats.stumpings * 3) + (stats.runs / 20) * 5; // Combined rating
      break;
    default:
      // Fallback for unknown roles
      stats = {
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0
      };
      rating = 1;
  }

  return {
    stats: JSON.stringify(stats),
    rating: Math.min(Math.max(rating, 1), 10), // Ensure rating is between 1-10
    notes: Math.random() > 0.7 ? "Good performance" : undefined
  };
}

async function addRandomTransformAthletes(count = 5) {
  let added = 0;
  for (let i = 0; i < count; i++) {
    const name = faker.person.fullName();
    const username = faker.internet.userName().toLowerCase() + Math.floor(Math.random() * 10000);
    const email = `transform_test_${Date.now()}_${i}@example.com`;
    const age = faker.number.int({ min: 10, max: 18 });
    const height = faker.number.int({ min: 140, max: 190 });
    const weight = faker.number.int({ min: 40, max: 90 });
    const roles = ['BATSMAN', 'BOWLER', 'ALL_ROUNDER', 'KEEPER'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        password: hashedPassword,
        role: 'ATHLETE',
      },
    });
    await prisma.student.create({
      data: {
        userId: user.id,
        studentName: name,
        username,
        email,
        age,
        height,
        weight,
        academy: 'Transform',
        role,
      },
    });
    console.log(`Added random test athlete: ${name} (${email})`);
    added++;
  }
  console.log(`✅ Added ${added} random test athletes with academy 'Transform'.`);
}

async function main() {
  console.log('🌱 Starting test data seeding...');

  // Only add new, unique test athletes with academy 'Transform'
  const transformStudents = testStudents.filter(s => s.academy === 'Transform');
  let added = 0;
  for (const student of transformStudents) {
    const existing = await prisma.user.findUnique({ where: { email: student.email } });
    if (existing) {
      console.log(`Skipping existing user: ${student.email}`);
      continue;
    }
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: student.email,
        username: student.username,
        name: student.name,
        password: hashedPassword,
        role: 'ATHLETE',
      },
    });
    await prisma.student.create({
      data: {
        userId: user.id,
        studentName: student.name,
        username: student.username,
        email: student.email,
        age: student.age,
        height: student.height,
        weight: student.weight,
        academy: student.academy,
        role: student.role,
      },
    });
    console.log(`Added test athlete: ${student.name} (${student.email})`);
    added++;
    if (added >= 5) break;
  }
  console.log(`✅ Added ${added} new test athletes with academy 'Transform'.`);

  try {
    // Create test coach
    const coachPassword = await bcrypt.hash('coach123', 12);
    const coach = await prisma.user.create({
      data: {
        name: "Coach John",
        username: "coach_john",
        email: "coach@transform.com",
        password: coachPassword,
        role: "COACH",
      },
    });

    const coachProfile = await prisma.coach.create({
      data: {
        userId: coach.id,
        name: "Coach John",
        username: "coach_john",
        email: "coach@transform.com",
        academy: "Transform",
      },
    });

    console.log('✅ Created test coach');

    // Create students
    const createdStudents = [];
    for (const studentData of testStudents) {
      console.log(`Creating student: ${studentData.name}...`);

      const hashedPassword = await bcrypt.hash('student123', 12);

      const user = await prisma.user.create({
        data: {
          name: studentData.name,
          username: studentData.username,
          email: studentData.email,
          password: hashedPassword,
          role: 'ATHLETE',
        },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          studentName: studentData.name,
          username: studentData.username,
          email: studentData.email,
          age: studentData.age,
          height: studentData.height,
          weight: studentData.weight,
          academy: studentData.academy,
          role: studentData.role,
          coachId: coachProfile.id,
        },
      });

      // Generate and create skill scores
      const skillScores = generateSkillScores(studentData.age, studentData.role);
      
      await prisma.skills.create({
        data: {
          userId: user.id,
          studentId: student.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          age: studentData.age,
          ...skillScores,
          category: 'TECHNIQUE',
        },
      });

      createdStudents.push(student);
      console.log(`✅ Created student ${studentData.name} with skills`);
    }

    // Create matches and performances
    for (const matchData of testMatches) {
      const match = await prisma.match.create({
        data: matchData,
      });

      // Create performances for each student
      for (const student of createdStudents) {
        const performance = generateMatchPerformance(student.role);
        await prisma.matchPerformance.create({
          data: {
            studentId: student.id,
            matchId: match.id,
            ...performance,
          },
        });
      }
    }

    console.log('\n🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    
    // Display analytics summary
    const ageGroups = [
      { name: '10 and below', filter: { lte: 10 } },
      { name: '11-13', filter: { gte: 11, lte: 13 } },
      { name: '14-18', filter: { gte: 14, lte: 18 } },
      { name: '18+', filter: { gte: 18 } },
    ];

    for (const group of ageGroups) {
      const skills = await prisma.skills.findMany({
        where: { age: group.filter },
      });

      if (skills.length > 0) {
        const avgPushups = Math.round(skills.reduce((sum, s) => sum + (s.pushupScore || 0), 0) / skills.length);
        const avgPullups = Math.round(skills.reduce((sum, s) => sum + (s.pullupScore || 0), 0) / skills.length);
        const avgSprint = (skills.reduce((sum, s) => sum + (s.sprintTime || 0), 0) / skills.length).toFixed(2);
        const avg5k = (skills.reduce((sum, s) => sum + (s.run5kTime || 0), 0) / skills.length).toFixed(2);

        console.log(`${group.name} (${skills.length} students):`);
        console.log(`  Physical: Push-ups: ${avgPushups}, Pull-ups: ${avgPullups}, Sprint: ${avgSprint}s, 5K: ${avg5k}min`);
        
        // Calculate average technical skills
        const technicalSkills = [
          'battingGrip', 'battingStance', 'battingBalance', 'bowlingGrip', 'runUp',
          'positioningOfBall', 'pickUp', 'aim', 'throw'
        ] as const;
        
        const avgTechnical = technicalSkills.map(skill => {
          const avg = skills.reduce((sum, s) => sum + ((s as any)[skill] || 0), 0) / skills.length;
          return `${skill}: ${avg.toFixed(1)}`;
        }).join(', ');
        
        console.log(`  Technical: ${avgTechnical}`);
      }
    }

    // Display login credentials
    console.log('\n🔑 Test Login Credentials:');
    console.log('Coach: coach@transform.com (password: coach123)');
    console.log('Students (password: student123):');
    testStudents.slice(0, 5).forEach(student => {
      console.log(`- ${student.name}: ${student.email}`);
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addRandomTransformAthletes(5).then(() => main()).catch(e => {
  console.error('Error adding random test athletes:', e);
  process.exit(1);
}); 