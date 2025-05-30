import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏏 Adding skills data for abc@gmail.com...');

  // Find the user with email abc@gmail.com
  const user = await prisma.user.findUnique({
    where: { email: 'abc@gmail.com' },
    include: {
      student: true
    }
  });

  if (!user || !user.student) {
    console.log('❌ User or student profile not found for abc@gmail.com');
    return;
  }

  console.log(`✅ Found student: ${user.student.studentName}`);

  // Check if skills already exist
  const existingSkills = await prisma.skills.findUnique({
    where: { studentId: user.student.id }
  });

  const skillsData = {
    studentId: user.student.id,
    // Physical Skills (Good cricket fitness levels)
    pushupScore: 45,        // Good upper body strength
    pullupScore: 12,        // Decent pull-up count
    sprintTime: 7.2,        // Good sprint time (seconds for 60m)
    run5kTime: 22.5,        // Good endurance (minutes)
    
    // Mental Skills (Good mental game)
    moodScore: 8,           // Good mood/motivation
    sleepScore: 7,          // Decent sleep quality
    
    // Nutrition (Based on BMI calculation from height/weight)
    totalCalories: 2800,    // Good caloric intake for athlete
    protein: 140,           // Good protein for muscle recovery
    carbohydrates: 350,     // Good carbs for energy
    fats: 85,              // Healthy fat intake
  };

  try {
    if (existingSkills) {
      // Update existing skills
      const updatedSkills = await prisma.skills.update({
        where: { studentId: user.student.id },
        data: skillsData
      });
      console.log('✅ Updated existing skills data');
    } else {
      // Create new skills record
      const newSkills = await prisma.skills.create({
        data: skillsData
      });
      console.log('✅ Created new skills data');
    }

    // Verify the data
    const skills = await prisma.skills.findUnique({
      where: { studentId: user.student.id },
      include: {
        student: {
          select: {
            studentName: true,
            height: true,
            weight: true,
            age: true
          }
        }
      }
    });

    if (skills) {
      console.log('\n📊 Skills Data Summary:');
      console.log(`👤 Student: ${skills.student?.studentName}`);
      console.log(`📏 Height: ${skills.student?.height || 'Not set'} cm`);
      console.log(`⚖️ Weight: ${skills.student?.weight || 'Not set'} kg`);
      console.log(`🎂 Age: ${skills.student?.age} years`);
      console.log('\n💪 Physical Skills:');
      console.log(`   Push-ups: ${skills.pushupScore}`);
      console.log(`   Pull-ups: ${skills.pullupScore}`);
      console.log(`   Sprint (60m): ${skills.sprintTime}s`);
      console.log(`   5K Run: ${skills.run5kTime} mins`);
      console.log('\n🧠 Mental Skills:');
      console.log(`   Mood Score: ${skills.moodScore}/10`);
      console.log(`   Sleep Score: ${skills.sleepScore}/10`);
      console.log('\n🍎 Nutrition:');
      console.log(`   Calories: ${skills.totalCalories}`);
      console.log(`   Protein: ${skills.protein}g`);
      console.log(`   Carbs: ${skills.carbohydrates}g`);
      console.log(`   Fats: ${skills.fats}g`);
    }

    console.log('\n🎯 Ready to test!');
    console.log('📱 Login with: abc@gmail.com / hello123');
    console.log('🌐 Visit: http://localhost:3000/dashboard');

  } catch (error) {
    console.error('❌ Error creating/updating skills:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 