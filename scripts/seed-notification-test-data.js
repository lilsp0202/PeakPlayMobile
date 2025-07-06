const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding notification test data...');

  try {
    // Get all students
    const students = await prisma.student.findMany({
      take: 5 // Limit to first 5 students for testing
    });

    if (students.length === 0) {
      console.log('No students found. Please run student seeding first.');
      return;
    }

    console.log(`Found ${students.length} students to seed data for`);

    // Generate 10 days of skill history data for each student
    const today = new Date();
    
    for (const student of students) {
      console.log(`\n📊 Generating data for ${student.studentName}...`);
      
      for (let i = 9; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        // Create patterns for different students to test different notification types
        let physicalScore, mentalScore, nutritionScore, techniqueScore;
        
        if (student.studentName.includes('Alice') || student.studentName.includes('John')) {
          // Create declining trend for negative trend notifications
          physicalScore = Math.max(20, 85 - (i * 3) + Math.random() * 5);
          mentalScore = Math.max(15, 80 - (i * 2.5) + Math.random() * 4);
          nutritionScore = Math.max(25, 75 - (i * 2) + Math.random() * 3);
        } else if (student.studentName.includes('Bob') || student.studentName.includes('Sarah')) {
          // Create improving trend for positive milestone notifications
          physicalScore = Math.min(95, 60 + (i * 3) + Math.random() * 5);
          mentalScore = Math.min(90, 55 + (i * 2.5) + Math.random() * 4);
          nutritionScore = Math.min(85, 50 + (i * 2) + Math.random() * 3);
        } else {
          // Create stable/random data for other students
          physicalScore = 70 + Math.random() * 20;
          mentalScore = 65 + Math.random() * 25;
          nutritionScore = 60 + Math.random() * 30;
        }

        techniqueScore = 70 + Math.random() * 20;

        // Only create data for the last 7 days for some students (to test missed check-ins)
        const shouldSkipEarlyDays = (student.studentName.includes('Charlie') || student.studentName.includes('Emma')) && i > 6;
        
        if (!shouldSkipEarlyDays) {
          await prisma.skillHistory.upsert({
            where: {
              studentId_date: {
                studentId: student.id,
                date: date
              }
            },
            update: {
              physicalScore: Math.round(physicalScore * 10) / 10,
              mentalScore: Math.round(mentalScore * 10) / 10,
              nutritionScore: Math.round(nutritionScore * 10) / 10,
              techniqueScore: Math.round(techniqueScore * 10) / 10,
              wellnessScore: Math.round(mentalScore * 10) / 10, // Use mental score as wellness
            },
            create: {
              studentId: student.id,
              date: date,
              physicalScore: Math.round(physicalScore * 10) / 10,
              mentalScore: Math.round(mentalScore * 10) / 10,
              nutritionScore: Math.round(nutritionScore * 10) / 10,
              techniqueScore: Math.round(techniqueScore * 10) / 10,
              wellnessScore: Math.round(mentalScore * 10) / 10,
            }
          });
          
          console.log(`  ✅ Day ${i + 1}: Physical: ${physicalScore.toFixed(1)}, Mental: ${mentalScore.toFixed(1)}, Nutrition: ${nutritionScore.toFixed(1)}`);
        } else {
          console.log(`  ⏭️  Day ${i + 1}: Skipped (to simulate missed check-in)`);
        }
      }

      // Also create some Hooper Index data with trends
      for (let i = 7; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        let hooperIndex;
        if (student.studentName.includes('Alice') || student.studentName.includes('David')) {
          // Increasing Hooper Index (worse wellness) - higher numbers are worse
          hooperIndex = Math.min(56, 15 + (i * 2) + Math.random() * 3);
        } else {
          // Normal/good Hooper Index
          hooperIndex = 12 + Math.random() * 8;
        }

        // Skip some days for certain students to test missed wellness check-ins
        const shouldSkip = (student.studentName.includes('Emma')) && i > 3;
        
        if (!shouldSkip) {
          await prisma.hooperIndex.upsert({
            where: {
              studentId_date: {
                studentId: student.id,
                date: date
              }
            },
            update: {
              fatigue: Math.ceil(hooperIndex / 8),
              stress: Math.ceil(hooperIndex / 8),
              muscleSoreness: Math.ceil(hooperIndex / 8),
              sleepQuality: Math.ceil(hooperIndex / 8),
              enjoyingTraining: Math.ceil(hooperIndex / 8),
              irritable: Math.ceil(hooperIndex / 8),
              healthyOverall: Math.ceil(hooperIndex / 8),
              wellRested: Math.ceil(hooperIndex / 8),
              hooperIndex: Math.round(hooperIndex)
            },
            create: {
              studentId: student.id,
              date: date,
              fatigue: Math.ceil(hooperIndex / 8),
              stress: Math.ceil(hooperIndex / 8),
              muscleSoreness: Math.ceil(hooperIndex / 8),
              sleepQuality: Math.ceil(hooperIndex / 8),
              enjoyingTraining: Math.ceil(hooperIndex / 8),
              irritable: Math.ceil(hooperIndex / 8),
              healthyOverall: Math.ceil(hooperIndex / 8),
              wellRested: Math.ceil(hooperIndex / 8),
              hooperIndex: Math.round(hooperIndex)
            }
          });
        }
      }
    }

    // Create some old feedback to test overdue feedback notifications
    const coaches = await prisma.coach.findMany();
    if (coaches.length > 0) {
      const coach = coaches[0];
      
      // Create old feedback for some students (to make others appear overdue)
      for (let i = 0; i < Math.min(2, students.length); i++) {
        const student = students[i];
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10); // 10 days ago
        
        await prisma.feedback.create({
          data: {
            studentId: student.id,
            coachId: coach.id,
            title: 'Training Progress Review',
            content: 'Keep up the good work! Focus on consistency in your training routine.',
            category: 'GENERAL',
            priority: 'MEDIUM',
            createdAt: oldDate
          }
        });
      }
    }

    console.log('\n✅ Successfully seeded notification test data!');
    console.log('\n📋 Test Data Summary:');
    console.log('- Students with declining trends: Alice, John (should trigger negative trend notifications)');
    console.log('- Students with improving trends: Bob, Sarah (should trigger positive milestone notifications)');  
    console.log('- Students with missed check-ins: Charlie, Emma (should trigger missed check-in notifications)');
    console.log('- Students with overdue feedback: Some students have no recent feedback (should trigger overdue feedback notifications)');
    console.log('- Students with poor wellness trends: Alice, David (should trigger mental wellness notifications)');
    console.log('\n🔔 You can now test the Smart Notifications feature in the coach dashboard!');

  } catch (error) {
    console.error('❌ Error seeding notification test data:', error);
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