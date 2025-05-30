const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDb() {
  try {
    console.log('🔍 Checking database tables...');
    
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('📋 Database Tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check if Skills table exists
    const skillsExists = tables.some(table => table.name === 'Skills');
    console.log(`\n🗄️ Skills table exists: ${skillsExists ? '✅ Yes' : '❌ No'}`);
    
    if (skillsExists) {
      const skillsCount = await prisma.skills.count();
      console.log(`📊 Skills records: ${skillsCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb(); 