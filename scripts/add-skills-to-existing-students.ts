import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Skill score generators based on age groups
const generateSkillScores = (age: number) => {
  if (age <= 10) {
    return {
      pushupScore: Math.floor(Math.random() * 15) + 5, // 5-20 pushups
      pullupScore: Math.floor(Math.random() * 5) + 1, // 1-6 pullups
      sprintTime: parseFloat((Math.random() * 3 + 15).toFixed(2)), // 15-18 seconds
      run5kTime: parseFloat((Math.random() * 5 + 30).toFixed(2)), // 30-35 minutes
    };
  } else if (age >= 11 && age <= 13) {
    return {
      pushupScore: Math.floor(Math.random() * 20) + 15, // 15-35 pushups
      pullupScore: Math.floor(Math.random() * 8) + 3, // 3-11 pullups
      sprintTime: parseFloat((Math.random() * 2.5 + 13).toFixed(2)), // 13-15.5 seconds
      run5kTime: parseFloat((Math.random() * 4 + 25).toFixed(2)), // 25-29 minutes
    };
  } else if (age >= 14 && age <= 18) {
    return {
      pushupScore: Math.floor(Math.random() * 25) + 25, // 25-50 pushups
      pullupScore: Math.floor(Math.random() * 12) + 5, // 5-17 pullups
      sprintTime: parseFloat((Math.random() * 2 + 11).toFixed(2)), // 11-13 seconds
      run5kTime: parseFloat((Math.random() * 3 + 20).toFixed(2)), // 20-23 minutes
    };
  } else {
    return {
      pushupScore: Math.floor(Math.random() * 30) + 30, // 30-60 pushups
      pullupScore: Math.floor(Math.random() * 15) + 8, // 8-23 pullups
      sprintTime: parseFloat((Math.random() * 1.5 + 10).toFixed(2)), // 10-11.5 seconds
      run5kTime: parseFloat((Math.random() * 2.5 + 18).toFixed(2)), // 18-20.5 minutes
    };
  }
};

async function main() {
  console.log('🌱 Adding Skills data to existing students...');

  try {
    // Get all existing students who don't have skills yet
    const students = await prisma.student.findMany({
      where: {
        skills: null
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${students.length} students without skills data.`);

    for (const student of students) {
      console.log(`Adding skills for: ${student.studentName}...`);

      // Generate skill scores based on age
      const skillScores = generateSkillScores(student.age);
      
      // Create skills record
      await prisma.skills.create({
        data: {
          userId: student.userId,
          studentId: student.id,
          studentName: student.studentName,
          studentEmail: student.email,
          age: student.age,
          ...skillScores,
          category: 'PHYSICAL',
        },
      });

      console.log(`✅ Added skills for ${student.studentName}:`, skillScores);
    }

    console.log('\n🎉 Skills data added successfully!');
    
    // Display analytics summary
    const ageGroups = [
      { name: '10 and below', filter: { lte: 10 } },
      { name: '11-13', filter: { gte: 11, lte: 13 } },
      { name: '14-18', filter: { gte: 14, lte: 18 } },
      { name: '18+', filter: { gte: 18 } },
    ];

    console.log('\n📊 Age Group Analytics:');
    for (const group of ageGroups) {
      const skills = await prisma.skills.findMany({
        where: { age: group.filter },
      });

      if (skills.length > 0) {
        const avgPushups = Math.round(skills.reduce((sum: number, s) => sum + (s.pushupScore || 0), 0) / skills.length);
        const avgPullups = Math.round(skills.reduce((sum: number, s) => sum + (s.pullupScore || 0), 0) / skills.length);
        const avgSprint = (skills.reduce((sum: number, s) => sum + (s.sprintTime || 0), 0) / skills.length).toFixed(2);
        const avg5k = (skills.reduce((sum: number, s) => sum + (s.run5kTime || 0), 0) / skills.length).toFixed(2);

        console.log(`${group.name} (${skills.length} students): Push-ups: ${avgPushups}, Pull-ups: ${avgPullups}, Sprint: ${avgSprint}s, 5K: ${avg5k}min`);
      }
    }

  } catch (error) {
    console.error('Error adding skills data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 