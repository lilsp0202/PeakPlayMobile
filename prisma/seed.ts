import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a coach user
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach@transform.com' },
    update: {},
    create: {
      username: 'coachtransform',
      email: 'coach@transform.com',
      name: 'Coach Transform',
      role: 'COACH',
      password: 'password',
    },
  });
  // Create a coach
  const coach = await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {},
    create: {
      userId: coachUser.id,
      name: 'Coach Transform',
      username: 'coachtransform',
      email: 'coach@transform.com',
      academy: 'Transform',
    },
    include: { user: true },
  });

  // Create 5 students (assigned to original coach)
  for (let i = 1; i <= 5; i++) {
    const studentUser = await prisma.user.upsert({
      where: { email: `student${i}@transform.com` },
      update: {},
      create: {
        username: `student${i}`,
        email: `student${i}@transform.com`,
        name: `Student ${i}`,
        role: 'ATHLETE',
        password: 'password',
      },
    });
    await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {
        // Ensure these students remain assigned to the original coach
        coachId: coach.id,
      },
      create: {
        userId: studentUser.id,
        studentName: `Student ${i}`,
        username: `student${i}`,
        email: `student${i}@transform.com`,
        age: 18 + i,
        height: 160 + i * 2,
        weight: 60 + i * 2,
        academy: 'Transform',
        sport: 'CRICKET',
        role: 'ATHLETE',
        coachId: coach.id,
      },
    });
  }

  // Create 5 additional students with random data (UNASSIGNED - coachId: null)
  const additionalStudents = [
    { name: 'Alex Johnson', username: 'alexj', age: 19, height: 175, weight: 68 },
    { name: 'Maya Patel', username: 'mayap', age: 21, height: 162, weight: 55 },
    { name: 'Ryan Smith', username: 'ryans', age: 20, height: 180, weight: 75 },
    { name: 'Priya Singh', username: 'priyas', age: 18, height: 158, weight: 52 },
    { name: 'Jake Wilson', username: 'jakew', age: 22, height: 177, weight: 72 }
  ];

  for (let i = 0; i < additionalStudents.length; i++) {
    const student = additionalStudents[i];
    const studentNumber = i + 6;
    
    const studentUser = await prisma.user.upsert({
      where: { email: `student${studentNumber}@transform.com` },
      update: {},
      create: {
        username: student.username,
        email: `student${studentNumber}@transform.com`,
        name: student.name,
        role: 'ATHLETE',
        password: 'password',
      },
    });
    
    await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {
        // CRITICAL: Always ensure these students are UNASSIGNED
        coachId: null,
        studentName: student.name,
        username: student.username,
        age: student.age,
        height: student.height,
        weight: student.weight,
        academy: 'Transform',
        sport: 'CRICKET',
        role: 'ATHLETE',
      },
      create: {
        userId: studentUser.id,
        studentName: student.name,
        username: student.username,
        email: `student${studentNumber}@transform.com`,
        age: student.age,
        height: student.height,
        weight: student.weight,
        academy: 'Transform',
        sport: 'CRICKET',
        role: 'ATHLETE',
        coachId: null, // UNASSIGNED - will appear in Student Management for any coach in Transform academy
      },
    });
  }

  // GENERAL FIX: Ensure students 6-10 in Transform academy are unassigned
  // This can be adapted for any academy by changing the email pattern and academy name
  await prisma.student.updateMany({
    where: {
      email: {
        in: [
          'student6@transform.com',
          'student7@transform.com', 
          'student8@transform.com',
          'student9@transform.com',
          'student10@transform.com'
        ]
      },
      academy: 'Transform'
    },
    data: {
      coachId: null
    }
  });

  console.log('✅ Seed completed successfully');
  console.log('✅ Students 1-5: Assigned to original coach');
  console.log('✅ Students 6-10: Unassigned (available for any Transform coach)');
  console.log('💡 For other academies: Update email patterns and academy names in the seed script');

  // Create a badge category and a badge
  const category = await prisma.badgeCategory.upsert({
    where: { name: 'General' },
    update: {},
    create: {
      name: 'General',
      description: 'General Achievements',
      icon: 'star',
      color: '#FFD700',
    },
  });

  await prisma.badge.upsert({
    where: { name_level_sport: { name: 'Starter', level: 'BRONZE', sport: 'CRICKET' } },
    update: {},
    create: {
      name: 'Starter',
      description: 'Completed first session',
      motivationalText: 'Great start!',
      level: 'BRONZE',
      categoryId: category.id,
      icon: 'award',
      sport: 'CRICKET',
      isActive: true,
    },
  });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 