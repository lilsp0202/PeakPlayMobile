import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test students data with diverse profiles and ages
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
  { name: "Ethan Rodriguez", username: "ethan_r", email: "ethan.rodriguez@example.com", age: 12, height: 152, weight: 42, academy: "Elite Sports", role: "BATSMAN" },
  
  // 14-18 age group
  { name: "Olivia Martinez", username: "olivia_m", email: "olivia.martinez@example.com", age: 14, height: 165, weight: 55, academy: "Transform", role: "KEEPER" },
  { name: "James Anderson", username: "james_a", email: "james.anderson@example.com", age: 15, height: 170, weight: 60, academy: "Champion Academy", role: "BOWLER" },
  { name: "Amelia Taylor", username: "amelia_t", email: "amelia.taylor@example.com", age: 16, height: 162, weight: 52, academy: "Elite Sports", role: "ALL_ROUNDER" },
  { name: "Benjamin Thomas", username: "benjamin_t", email: "benjamin.thomas@example.com", age: 17, height: 175, weight: 65, academy: "Transform", role: "BATSMAN" },
  { name: "Charlotte Jackson", username: "charlotte_j", email: "charlotte.jackson@example.com", age: 18, height: 168, weight: 58, academy: "Champion Academy", role: "BOWLER" },
  { name: "Alexander White", username: "alexander_w", email: "alexander.white@example.com", age: 16, height: 172, weight: 62, academy: "Elite Sports", role: "ALL_ROUNDER" },
  { name: "Mia Harris", username: "mia_h", email: "mia.harris@example.com", age: 15, height: 160, weight: 50, academy: "Transform", role: "KEEPER" },
  
  // 18+ age group
  { name: "William Clark", username: "william_c", email: "william.clark@example.com", age: 19, height: 180, weight: 70, academy: "Champion Academy", role: "BATSMAN" },
  { name: "Harper Lewis", username: "harper_l", email: "harper.lewis@example.com", age: 20, height: 170, weight: 60, academy: "Elite Sports", role: "BOWLER" },
  { name: "Lucas Robinson", username: "lucas_r", email: "lucas.robinson@example.com", age: 22, height: 178, weight: 72, academy: "Transform", role: "ALL_ROUNDER" },
  { name: "Evelyn Walker", username: "evelyn_w", email: "evelyn.walker@example.com", age: 21, height: 165, weight: 55, academy: "Champion Academy", role: "KEEPER" },
  { name: "Henry Hall", username: "henry_h", email: "henry.hall@example.com", age: 23, height: 182, weight: 75, academy: "Elite Sports", role: "BATSMAN" },
];

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
  console.log('🌱 Starting SkillSnap data seeding...');

  try {
    // Create users and students
    for (const studentData of testStudents) {
      console.log(`Creating student: ${studentData.name}...`);

      // Hash password
      const hashedPassword = await bcrypt.hash('testpassword123', 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: studentData.name,
          username: studentData.username,
          email: studentData.email,
          password: hashedPassword,
          role: 'ATHLETE',
        },
      });

      // Create student profile
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
          role: studentData.role as any,
        },
      });

      // Generate and create skill scores
      const skillScores = generateSkillScores(studentData.age);
      
      await prisma.skills.create({
        data: {
          userId: user.id,
          studentId: student.id,
          studentName: studentData.name,
          studentEmail: studentData.email,
          age: studentData.age,
          ...skillScores,
          category: 'PHYSICAL',
        },
      });

      console.log(`✅ Created student ${studentData.name} with skills:`, skillScores);
    }

    console.log('\n🎉 SkillSnap data seeding completed successfully!');
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

        console.log(`${group.name} (${skills.length} students): Push-ups: ${avgPushups}, Pull-ups: ${avgPullups}, Sprint: ${avgSprint}s, 5K: ${avg5k}min`);
      }
    }

    // Display login credentials
    console.log('\n🔑 Test Login Credentials (password: testpassword123):');
    testStudents.slice(0, 5).forEach(student => {
      console.log(`- ${student.name}: ${student.email}`);
    });

  } catch (error) {
    console.error('Error seeding data:', error);
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