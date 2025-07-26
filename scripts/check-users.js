const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking test users...');
    
    // Check if Emma Johnson exists
    const emmaUser = await prisma.user.findUnique({
      where: { email: 'emma.johnson@example.com' }
    });
    
    console.log(`👤 Emma Johnson user: ${emmaUser ? '✅ Exists' : '❌ Not found'}`);
    if (emmaUser) {
      console.log(`   - ID: ${emmaUser.id}`);
      console.log(`   - Username: ${emmaUser.username}`);
      console.log(`   - Role: ${emmaUser.role}`);
      console.log(`   - Has password: ${emmaUser.password ? '✅ Yes' : '❌ No'}`);
    }
    
    // Check total users
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in database: ${totalUsers}`);
    
    // List first 5 users
    const users = await prisma.user.findMany({ take: 5 });
    console.log('\n👥 First 5 users:');
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.username})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 