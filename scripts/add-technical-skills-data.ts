import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏏 Adding technical skills data for abc@gmail.com...');

  const user = await prisma.user.findUnique({
    where: { email: 'abc@gmail.com' },
    include: { student: true }
  });

  if (!user || !user.student) {
    console.log('❌ User with email abc@gmail.com or their student profile not found.');
    return;
  }

  console.log(`✅ Found student: ${user.student.studentName} (${user.student.id})`);

  // Sample technical skills data based on the cricket academy report
  const technicalSkillsData = {
    // Batting skills (based on max points from the image)
    battingGrip: 2,              // 2/2 points
    battingStance: 1,            // 1/1 points  
    battingBalance: 1,           // 1/1 points
    cockingOfWrist: 2,           // 2/3 points
    backLift: 3,                 // 3/3 points
    topHandDominance: 2,         // 2/2 points
    highElbow: 1,                // 1/2 points
    runningBetweenWickets: 1,    // 1/1 points
    calling: 1,                  // 1/1 points
    
    // Bowling skills
    bowlingGrip: 1,              // 1/1 points
    runUp: 1,                    // 1/1 points
    backFootLanding: 2,          // 2/2 points
    frontFootLanding: 1,         // 1/1 points
    hipDrive: 2,                 // 2/3 points
    backFootDrag: 2,             // 2/2 points
    nonBowlingArm: 3,            // 3/3 points
    release: 1,                  // 1/1 points
    followThrough: 1,            // 1/1 points
    
    // Fielding skills
    positioningOfBall: 1,        // 1/1 points
    pickUp: 1,                   // 1/1 points
    aim: 2,                      // 2/2 points
    throw: 2,                    // 2/2 points
    softHands: 1,                // 1/1 points
    receiving: 1,                // 1/1 points
    highCatch: 1,                // 1/1 points
    flatCatch: 1,                // 1/1 points
  };

  try {
    console.log('📊 Creating/updating technical skills data...');
    
    const skills = await prisma.skills.upsert({
      where: { studentId: user.student.id },
      update: technicalSkillsData,
      create: {
        studentId: user.student.id,
        userId: user.id,
        studentName: user.student.studentName,
        studentEmail: user.student.email,
        age: user.student.age,
        category: 'TECHNIQUE',
        ...technicalSkillsData
      },
      include: {
        student: {
          select: {
            studentName: true,
            age: true,
            academy: true,
          },
        },
      },
    });

    console.log('✅ Technical skills data successfully added/updated!');
    console.log('\n📊 Technical Skills Summary:');
    
    console.log('\n🏏 BATTING SKILLS:');
    console.log(`   • Grip: ${skills.battingGrip}/2`);
    console.log(`   • Stance: ${skills.battingStance}/1`);
    console.log(`   • Balance: ${skills.battingBalance}/1`);
    console.log(`   • Cocking of Wrist: ${skills.cockingOfWrist}/3`);
    console.log(`   • Back Lift: ${skills.backLift}/3`);
    console.log(`   • Top Hand Dominance: ${skills.topHandDominance}/2`);
    console.log(`   • High Elbow: ${skills.highElbow}/2`);
    console.log(`   • Running Between Wickets: ${skills.runningBetweenWickets}/1`);
    console.log(`   • Calling: ${skills.calling}/1`);
    
    console.log('\n🎳 BOWLING SKILLS:');
    console.log(`   • Grip: ${skills.bowlingGrip}/1`);
    console.log(`   • Run Up: ${skills.runUp}/1`);
    console.log(`   • Back-foot Landing: ${skills.backFootLanding}/2`);
    console.log(`   • Front-foot Landing: ${skills.frontFootLanding}/1`);
    console.log(`   • Hip Drive: ${skills.hipDrive}/3`);
    console.log(`   • Back-foot Drag: ${skills.backFootDrag}/2`);
    console.log(`   • Non-bowling Arm: ${skills.nonBowlingArm}/3`);
    console.log(`   • Release: ${skills.release}/1`);
    console.log(`   • Follow Through: ${skills.followThrough}/1`);
    
    console.log('\n🥎 FIELDING SKILLS:');
    console.log(`   • Positioning of Ball: ${skills.positioningOfBall}/1`);
    console.log(`   • Pick Up: ${skills.pickUp}/1`);
    console.log(`   • Aim: ${skills.aim}/2`);
    console.log(`   • Throw: ${skills.throw}/2`);
    console.log(`   • Soft Hands: ${skills.softHands}/1`);
    console.log(`   • Receiving: ${skills.receiving}/1`);
    console.log(`   • High Catch: ${skills.highCatch}/1`);
    console.log(`   • Flat Catch: ${skills.flatCatch}/1`);

    // Calculate category averages
    const battingAvg = (
      (skills.battingGrip!/2 + skills.battingStance!/1 + skills.battingBalance!/1 + 
       skills.cockingOfWrist!/3 + skills.backLift!/3 + skills.topHandDominance!/2 + 
       skills.highElbow!/2 + skills.runningBetweenWickets!/1 + skills.calling!/1) / 9 * 10
    ).toFixed(1);
    
    const bowlingAvg = (
      (skills.bowlingGrip!/1 + skills.runUp!/1 + skills.backFootLanding!/2 + 
       skills.frontFootLanding!/1 + skills.hipDrive!/3 + skills.backFootDrag!/2 + 
       skills.nonBowlingArm!/3 + skills.release!/1 + skills.followThrough!/1) / 9 * 10
    ).toFixed(1);
    
    const fieldingAvg = (
      (skills.positioningOfBall!/1 + skills.pickUp!/1 + skills.aim!/2 + skills.throw!/2 + 
       skills.softHands!/1 + skills.receiving!/1 + skills.highCatch!/1 + skills.flatCatch!/1) / 8 * 10
    ).toFixed(1);

    console.log('\n📈 PERFORMANCE AVERAGES:');
    console.log(`   • Batting Average: ${battingAvg}/10`);
    console.log(`   • Bowling Average: ${bowlingAvg}/10`);
    console.log(`   • Fielding Average: ${fieldingAvg}/10`);
    console.log(`   • Overall Technical Average: ${((parseFloat(battingAvg) + parseFloat(bowlingAvg) + parseFloat(fieldingAvg)) / 3).toFixed(1)}/10`);

    console.log('\n🔍 Data Storage:');
    console.log('   • Technical skills stored in Skills table');
    console.log('   • Each skill has max points based on academy assessment rubric');
    console.log('   • Scores normalized to 0-10 scale for aggregate calculations');
    
    console.log('\n💻 Next Steps:');
    console.log('   • Visit http://localhost:3000/dashboard');
    console.log('   • Sign in with abc@gmail.com');
    console.log('   • Navigate to SkillSnap');
    console.log('   • Expand the "Technique" category');
    console.log('   • Explore the three cricket skill sections!');

  } catch (error) {
    console.error('❌ Error adding technical skills data:', error);
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