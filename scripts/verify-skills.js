const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  try {
    // Check Skills count
    const skillsCount = await prisma.skills.count();
    console.log(`📊 Total Skills records: ${skillsCount}`);
    
    // Check Students with Skills
    const studentsWithSkills = await prisma.student.findMany({
      include: { skills: true },
      take: 5
    });
    
    console.log(`👥 Students checked: ${studentsWithSkills.length}`);
    studentsWithSkills.forEach(student => {
      console.log(`  - ${student.studentName}: ${student.skills ? '✅ Has Skills' : '❌ No Skills'}`);
      if (student.skills) {
        console.log(`    Push-ups: ${student.skills.pushupScore}, Pull-ups: ${student.skills.pullupScore}`);
      }
    });
    
    // Check if Skills table exists
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    const skillsTableExists = tables.some(table => table.name === 'Skills');
    console.log(`🗄️ Skills table exists: ${skillsTableExists ? '✅ Yes' : '❌ No'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify(); 