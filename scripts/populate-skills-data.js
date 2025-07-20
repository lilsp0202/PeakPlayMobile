const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateSkillsData() {
  try {
    console.log('🎯 Populating Skills Data for Existing Students\n');
    
    // Get all students that don't have skills data
    const studentsWithoutSkills = await prisma.student.findMany({
      where: {
        skills: null
      },
      include: {
        user: true
      }
    });
    
    console.log(`📊 Found ${studentsWithoutSkills.length} students without skills data`);
    
    if (studentsWithoutSkills.length === 0) {
      console.log('✅ All students already have skills data!');
      return;
    }
    
    // Create skills for each student
    let createdCount = 0;
    
    for (const student of studentsWithoutSkills) {
      try {
        // Generate realistic cricket skills data
        const skillsData = {
          userId: student.userId,
          studentId: student.id,
          studentName: student.studentName,
          studentEmail: student.email,
          age: student.age,
          
          // Physical fitness metrics
          pushupScore: Math.floor(Math.random() * 40) + 20, // 20-60
          pullupScore: Math.floor(Math.random() * 15) + 5, // 5-20
          verticalJump: Math.random() * 20 + 40, // 40-60 cm
          gripStrength: Math.random() * 30 + 35, // 35-65 kg
          sprintTime: Math.random() * 2 + 6, // 6-8 seconds for 50m
          sprint50m: Math.random() * 2 + 6, // 6-8 seconds
          shuttleRun: Math.random() * 3 + 12, // 12-15 seconds
          run5kTime: Math.random() * 5 + 20, // 20-25 minutes
          yoyoTest: Math.floor(Math.random() * 10) + 15, // Level 15-25
          
          // Nutrition metrics
          carbohydrates: Math.random() * 100 + 200, // 200-300g
          fats: Math.random() * 30 + 50, // 50-80g
          waterIntake: Math.random() * 1 + 2, // 2-3L
          protein: Math.random() * 50 + 100, // 100-150g
          totalCalories: Math.floor(Math.random() * 500) + 2000, // 2000-2500
          moodScore: Math.floor(Math.random() * 30) + 70, // 70-100
          sleepScore: Math.floor(Math.random() * 30) + 70, // 70-100
          
          // Cricket-specific technical skills
          aim: Math.random() * 4 + 6, // 6-10
          backFootDrag: Math.random() * 3 + 7, // 7-10
          backFootLanding: Math.random() * 3 + 7, // 7-10
          backLift: Math.random() * 3 + 6, // 6-9
          battingBalance: Math.random() * 3 + 7, // 7-10
          battingGrip: Math.random() * 2 + 8, // 8-10
          battingStance: Math.random() * 3 + 7, // 7-10
          bowlingGrip: Math.random() * 3 + 7, // 7-10
          calling: Math.random() * 4 + 6, // 6-10
          cockingOfWrist: Math.random() * 3 + 7, // 7-10
          flatCatch: Math.random() * 3 + 7, // 7-10
          followThrough: Math.random() * 3 + 7, // 7-10
          frontFootLanding: Math.random() * 3 + 7, // 7-10
          highCatch: Math.random() * 4 + 6, // 6-10
          highElbow: Math.random() * 3 + 7, // 7-10
          hipDrive: Math.random() * 3 + 7, // 7-10
          nonBowlingArm: Math.random() * 3 + 7, // 7-10
          pickUp: Math.random() * 3 + 7, // 7-10
          positioningOfBall: Math.random() * 3 + 7, // 7-10
          receiving: Math.random() * 3 + 7, // 7-10
          release: Math.random() * 3 + 7, // 7-10
          runUp: Math.random() * 3 + 7, // 7-10
          runningBetweenWickets: Math.random() * 3 + 7, // 7-10
          softHands: Math.random() * 3 + 7, // 7-10
          throw: Math.random() * 3 + 7, // 7-10
          topHandDominance: Math.random() * 3 + 7 // 7-10
        };
        
        await prisma.skills.create({
          data: skillsData
        });
        
        console.log(`✅ Created skills for: ${student.studentName}`);
        createdCount++;
        
      } catch (error) {
        console.error(`❌ Failed to create skills for ${student.studentName}:`, error.message);
      }
    }
    
    console.log(`\n🎯 Successfully created skills data for ${createdCount}/${studentsWithoutSkills.length} students`);
    
    // Verify the data was created
    const totalSkills = await prisma.skills.count();
    console.log(`📊 Total skills records in database: ${totalSkills}`);
    
    console.log('\n✅ Skills data population complete!');
    
  } catch (error) {
    console.error('❌ Error populating skills data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateSkillsData().catch(console.error); 