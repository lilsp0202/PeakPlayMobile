const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users and coaches
  const coach1Password = await bcrypt.hash('password123', 10);
  const coach1 = await prisma.user.upsert({
    where: { email: 'coach1@transform.com' },
    update: {},
    create: {
      name: 'Coach John Smith',
      username: 'coach1',
      email: 'coach1@transform.com',
      password: coach1Password,
      role: 'COACH',
    },
  });

  const coach1Profile = await prisma.coach.upsert({
    where: { userId: coach1.id },
    update: {},
    create: {
      userId: coach1.id,
      name: 'Coach John Smith',
      username: 'coach1',
      email: 'coach1@transform.com',
      academy: 'Transform Cricket Academy',
    },
  });

  // Create test athletes/students with varying ages for age group testing
  const students = [
    {
      name: 'Raj Patel', username: 'raj_patel', email: 'raj@transform.com', 
      age: 16, height: 170, weight: 65, role: 'BATSMAN'
    },
    {
      name: 'Priya Sharma', username: 'priya_sharma', email: 'priya@transform.com',
      age: 17, height: 165, weight: 58, role: 'ALL_ROUNDER'
    },
    {
      name: 'Arjun Singh', username: 'arjun_singh', email: 'arjun@transform.com',
      age: 15, height: 168, weight: 62, role: 'BOWLER'
    },
    {
      name: 'Ananya Reddy', username: 'ananya_reddy', email: 'ananya@transform.com',
      age: 18, height: 162, weight: 55, role: 'KEEPER'
    },
    {
      name: 'Dev Kumar', username: 'dev_kumar', email: 'dev@transform.com',
      age: 16, height: 175, weight: 70, role: 'ALL_ROUNDER'
    },
    {
      name: 'Kavya Menon', username: 'kavya_menon', email: 'kavya@transform.com',
      age: 17, height: 160, weight: 52, role: 'BATSMAN'
    },
    {
      name: 'Rohit Verma', username: 'rohit_verma', email: 'rohit@transform.com',
      age: 15, height: 172, weight: 68, role: 'BOWLER'
    },
    {
      name: 'Ishita Jain', username: 'ishita_jain', email: 'ishita@transform.com',
      age: 18, height: 158, weight: 50, role: 'ALL_ROUNDER'
    }
  ];

  const createdStudents = [];

  for (const studentData of students) {
    const userPassword = await bcrypt.hash('student123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        name: studentData.name,
        username: studentData.username,
        email: studentData.email,
        password: userPassword,
        role: 'ATHLETE',
      },
    });

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentName: studentData.name,
        username: studentData.username,
        email: studentData.email,
        age: studentData.age,
        height: studentData.height,
        weight: studentData.weight,
        academy: 'Transform Cricket Academy',
        sport: 'CRICKET',
        role: studentData.role,
        coachId: coach1Profile.id,
      },
    });

    createdStudents.push({ ...student, user });
  }

  console.log(`✅ Created ${createdStudents.length} students`);

  // Create comprehensive skills data for each student
  for (const student of createdStudents) {
    // Generate realistic scores based on age and role
    const ageMultiplier = student.age / 20; // Older students tend to have better skills
    const baseSkill = Math.floor(Math.random() * 3) + 5; // Base skill 5-7
    
    // Role-specific skill bonuses
    let battingBonus = 0, bowlingBonus = 0, fieldingBonus = 0;
    switch (student.role) {
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

    const generateScore = (base, bonus = 0) => {
      const score = Math.floor((base + bonus) * ageMultiplier + Math.random() * 2);
      return Math.min(Math.max(score, 1), 10); // Ensure 1-10 range
    };

    await prisma.skills.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        userId: student.user.id,
        studentId: student.id,
        studentName: student.studentName,
        studentEmail: student.email,
        age: student.age,
        
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
        
        category: 'TECHNIQUE',
      },
    });
  }

  console.log(`✅ Created skills data for ${createdStudents.length} students`);

  // Create some match data for testing
  const matches = [
    {
      matchName: 'vs Mumbai Cricket Academy',
      opponent: 'Mumbai Cricket Academy',
      venue: 'Transform Ground',
      matchDate: new Date('2024-05-15'),
      sport: 'CRICKET',
      matchType: 'LEAGUE',
      result: 'WIN'
    },
    {
      matchName: 'vs Delhi Sports Club',
      opponent: 'Delhi Sports Club', 
      venue: 'Delhi Sports Complex',
      matchDate: new Date('2024-05-20'),
      sport: 'CRICKET',
      matchType: 'FRIENDLY',
      result: 'LOSS'
    },
    {
      matchName: 'vs Bangalore United',
      opponent: 'Bangalore United',
      venue: 'Transform Ground',
      matchDate: new Date('2024-05-25'),
      sport: 'CRICKET',
      matchType: 'TOURNAMENT',
      result: 'WIN'
    }
  ];

  for (const matchData of matches) {
    const match = await prisma.match.create({
      data: matchData
    });

    // Create match performances for some students
    const selectedStudents = createdStudents.slice(0, 6); // First 6 students
    
    for (const student of selectedStudents) {
      const performance = {
        runs: Math.floor(Math.random() * 80),
        balls: Math.floor(Math.random() * 60) + 20,
        fours: Math.floor(Math.random() * 8),
        sixes: Math.floor(Math.random() * 4),
        wickets: Math.floor(Math.random() * 4),
        overs: Math.floor(Math.random() * 8) + 2,
        catches: Math.floor(Math.random() * 3),
        runouts: Math.floor(Math.random() * 2)
      };

      await prisma.matchPerformance.create({
        data: {
          studentId: student.id,
          matchId: match.id,
          played: true,
          position: `Position ${Math.floor(Math.random() * 11) + 1}`,
          stats: JSON.stringify(performance),
          rating: 5 + Math.random() * 4, // 5-9 rating
          notes: `Good performance in ${matchData.matchName}. Player showed improvement in key areas.`
        }
      });
    }

    console.log(`✅ Created match: ${matchData.matchName} with performances`);
  }

  // Create sample feedback from coach to students
  console.log('\n📝 Creating sample coach feedback...');
  
  const feedbackData = [
    {
      title: "Great Batting Technique Improvement",
      content: "I've noticed significant improvement in your batting stance and timing during yesterday's practice. Your foot positioning has become much more consistent, and you're getting better at reading the ball early. Keep focusing on your follow-through and try to maintain this level of concentration during matches. Well done!",
      category: "TECHNICAL",
      priority: "MEDIUM"
    },
    {
      title: "Focus on Mental Preparation",
      content: "Your physical skills are developing well, but I think we need to work on your mental game. Try implementing the visualization techniques we discussed. Spend 10 minutes before each practice session visualizing successful shots and good fielding positions. This will help build your confidence.",
      category: "MENTAL",
      priority: "HIGH"
    },
    {
      title: "Nutrition Plan Recommendations",
      content: "Based on your recent performance data, I recommend adjusting your pre-training nutrition. Try having a banana and some nuts 30 minutes before practice instead of the energy drink. This will give you sustained energy without the crash. Also, make sure you're drinking enough water throughout the day.",
      category: "NUTRITIONAL",
      priority: "LOW"
    },
    {
      title: "Bowling Action Analysis",
      content: "Your bowling action has improved significantly over the past month. Your run-up is more consistent and your release point is getting better. However, I noticed you're telegraphing your slower ball - try to maintain the same action for all deliveries. We'll work on this in our next one-on-one session.",
      category: "TECHNICAL",
      priority: "MEDIUM"
    },
    {
      title: "Match Performance Review",
      content: "Excellent performance in yesterday's match! Your fielding was sharp and you took some crucial catches. Your batting showed great maturity - particularly the way you built your innings. For next match, focus on rotating the strike more in the middle overs.",
      category: "GENERAL",
      priority: "LOW"
    }
  ];

  // Create feedback for each student
  for (let i = 0; i < createdStudents.length; i++) {
    const student = createdStudents[i];
    // Give each student 2-3 random feedback items
    const studentFeedback = feedbackData.slice(i % 3, (i % 3) + 2);
    
    for (const feedback of studentFeedback) {
      await prisma.feedback.create({
        data: {
          studentId: student.id,
          coachId: coach1Profile.id,
          title: feedback.title,
          content: feedback.content,
          category: feedback.category,
          priority: feedback.priority,
          isRead: Math.random() > 0.5, // Random read status
        },
      });
    }
  }

  const totalFeedback = await prisma.feedback.count();
  console.log(`✅ Created ${totalFeedback} feedback items`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Test Data Summary:');
  console.log(`👨‍🏫 Coaches: 1 (coach1@transform.com / password123)`);
  console.log(`👨‍🎓 Students: ${createdStudents.length} (age range: 15-18)`);
  console.log(`📈 Skills records: ${createdStudents.length} (all technical skills included)`);
  console.log(`🏏 Matches: ${matches.length} with performance data`);
  console.log(`💬 Feedback: ${totalFeedback} coach feedback items`);
  console.log('\n🚀 You can now test:');
  console.log('   • Coach dashboard with student management');
  console.log('   • Technical skills editing and saving');
  console.log('   • Age group averages and comparisons');
  console.log('   • Match performance tracking');
  console.log('   • Complete SkillSnap functionality');
  console.log('   • Coach feedback system with preview and expansion');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 