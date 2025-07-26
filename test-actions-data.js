const { PrismaClient } = require('@prisma/client');

async function testActionsData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing actions data...');
    
    // Test that actions exist
    const actions = await prisma.action.findMany({
      select: {
        id: true,
        title: true,
        demoMediaUrl: true,
        demoMediaType: true,
        demoFileName: true,
        proofMediaUrl: true,
        proofMediaType: true,
        proofFileName: true,
        coach: {
          select: {
            name: true
          }
        },
        student: {
          select: {
            studentName: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${actions.length} actions in database`);
    
    if (actions.length > 0) {
      console.log('\n📋 Actions details:');
      actions.forEach((action, index) => {
        console.log(`${index + 1}. "${action.title}"`);
        console.log(`   Coach: ${action.coach.name}`);
        console.log(`   Student: ${action.student.studentName}`);
        console.log(`   Demo Media: ${action.demoMediaUrl ? '✅ Yes' : '❌ No'} ${action.demoMediaType || ''}`);
        console.log(`   Proof Media: ${action.proofMediaUrl ? '✅ Yes' : '❌ No'} ${action.proofMediaType || ''}`);
        console.log('');
      });
    }
    
    // Test coach data
    const coach = await prisma.coach.findFirst({
      where: {
        email: 'coach1@transform.com'
      }
    });
    
    console.log(`🎯 Coach login: ${coach ? '✅ Found' : '❌ Not found'}`);
    if (coach) {
      console.log(`   Name: ${coach.name}`);
      console.log(`   Email: ${coach.email}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing actions data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testActionsData(); 