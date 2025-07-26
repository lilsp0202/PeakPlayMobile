const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('🔐 Testing password verification...');
    
    // Get Emma's user data
    const user = await prisma.user.findUnique({
      where: { email: 'emma.johnson@example.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 Found user: ${user.email}`);
    console.log(`🆔 User ID: ${user.id}`);
    
    // Test password verification
    const testPassword = 'testpassword123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log(`🔑 Password "${testPassword}" is: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!isValid) {
      console.log('\n🛠️ Let\'s reset the password...');
      const newHashedPassword = await bcrypt.hash(testPassword, 12);
      
      await prisma.user.update({
        where: { email: 'emma.johnson@example.com' },
        data: { password: newHashedPassword }
      });
      
      console.log('✅ Password reset successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword(); 