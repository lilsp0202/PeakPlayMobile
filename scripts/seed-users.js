const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample users...');

  // Hash password for demo accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create sample users
  const coachUser = await prisma.user.upsert({
    where: { email: 'coach1@transform.com' },
    update: {},
    create: {
      name: 'Coach John Smith',
      username: 'coach1',
      email: 'coach1@transform.com',
      password: hashedPassword,
      role: 'COACH',
    }
  });

  const athleteUser = await prisma.user.upsert({
    where: { email: 'athlete1@transform.com' },
    update: {},
    create: {
      name: 'Alex Thompson',
      username: 'alex_thompson',
      email: 'athlete1@transform.com',
      password: hashedPassword,
      role: 'ATHLETE',
    }
  });

  // Create coach profile
  const coach = await prisma.coach.upsert({
    where: { userId: coachUser.id },
    update: {},
    create: {
      userId: coachUser.id,
      name: 'Coach John Smith',
      username: 'coach1',
      email: 'coach1@transform.com',
      academy: 'Transform Cricket Academy',
    }
  });

  // Create student profile
  const student = await prisma.student.upsert({
    where: { userId: athleteUser.id },
    update: {},
    create: {
      userId: athleteUser.id,
      studentName: 'Alex Thompson',
      username: 'alex_thompson',
      email: 'athlete1@transform.com',
      age: 16,
      height: 175,
      weight: 70,
      academy: 'Transform Cricket Academy',
      sport: 'CRICKET',
      role: 'BATSMAN',
      coachId: coach.id,
    }
  });

  console.log('Sample users created:');
  console.log('Coach:', coachUser.email, '(password: password123)');
  console.log('Athlete:', athleteUser.email, '(password: password123)');
  console.log('Sample data seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 