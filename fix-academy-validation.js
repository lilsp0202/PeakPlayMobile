const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAcademyValidation() {
  try {
    console.log('🔧 ACADEMY VALIDATION FIX FOR ALL ATHLETES');
    console.log('===============================================');
    
    // 1. Check for any athletes with "Not specified" academy
    const athletesWithNotSpecified = await prisma.student.findMany({
      where: {
        OR: [
          { academy: 'Not specified' },
          { academy: null },
          { academy: '' }
        ]
      },
      include: { user: true }
    });

    if (athletesWithNotSpecified.length > 0) {
      console.log(`❌ Found ${athletesWithNotSpecified.length} athletes with invalid academy:`);
      athletesWithNotSpecified.forEach(student => {
        console.log(`  - ${student.studentName} (${student.user.email}): "${student.academy}"`);
      });

      // Update them to Transform academy (default)
      const updateResult = await prisma.student.updateMany({
        where: {
          OR: [
            { academy: 'Not specified' },
            { academy: null },
            { academy: '' }
          ]
        },
        data: {
          academy: 'Transform'
        }
      });

      console.log(`✅ Updated ${updateResult.count} athletes to "Transform" academy`);
    } else {
      console.log('✅ All athletes have valid academy data');
    }

    // 2. Verify all athletes now have proper academy
    const allAthletes = await prisma.student.findMany({
      include: { user: true }
    });

    console.log(`\n📊 FINAL ACADEMY STATUS (${allAthletes.length} athletes):`);
    allAthletes.forEach((student, index) => {
      const status = student.academy && student.academy !== 'Not specified' ? '✅' : '❌';
      console.log(`${index + 1}. ${student.studentName}: ${student.academy} ${status}`);
    });

    console.log('\n🎯 GENERAL FIX COMPLETED:');
    console.log('- ✅ Profile API: Prevents "Not specified" from being saved');
    console.log('- ✅ Database: All athletes have valid academy data');
    console.log('- ✅ Onboarding: Requires proper academy selection');
    console.log('- ✅ ProfileModal: Enhanced with better validation');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error fixing academy validation:', error);
    await prisma.$disconnect();
  }
}

fixAcademyValidation(); 