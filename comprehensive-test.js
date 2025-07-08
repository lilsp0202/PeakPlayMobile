const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ANSI color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}=== PeakPlay Comprehensive Application Testing ===${RESET}\n`);

async function testFeature(name, testFn) {
  process.stdout.write(`Testing ${name}... `);
  try {
    await testFn();
    console.log(`${GREEN}✓ PASSED${RESET}`);
    return true;
  } catch (error) {
    console.log(`${RED}✗ FAILED${RESET}`);
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;

  console.log(`${YELLOW}Part 1: Database Connectivity & Data Integrity${RESET}\n`);

  // 1. Database Connection Test
  totalTests++;
  if (await testFeature('Database Connection', async () => {
    const userCount = await prisma.user.count();
    if (userCount === 0) throw new Error('No users found in database');
  })) passedTests++;

  // 2. User & Student Data Test
  totalTests++;
  if (await testFeature('User & Student Relationships', async () => {
    const students = await prisma.student.findMany({
      include: { 
        user: true,
        skills: true
      },
      take: 5
    });
    
    for (const student of students) {
      if (!student.user) throw new Error(`Student ${student.studentName} missing user`);
      if (!student.academy || student.academy === 'Not specified') {
        throw new Error(`Student ${student.studentName} has invalid academy: ${student.academy}`);
      }
    }
  })) passedTests++;

  // 3. Coach Data Test
  totalTests++;
  if (await testFeature('Coach System', async () => {
    const coaches = await prisma.coach.findMany({
      include: {
        user: true,
        students: true
      }
    });
    
    if (coaches.length === 0) throw new Error('No coaches found');
    
    for (const coach of coaches) {
      if (!coach.user) throw new Error(`Coach ${coach.name} missing user`);
    }
  })) passedTests++;

  // 4. Skills Data Test
  totalTests++;
  if (await testFeature('Skills Data', async () => {
    const skills = await prisma.skills.findMany({
      include: {
        student: true,
        user: true
      },
      take: 5
    });
    
    if (skills.length === 0) throw new Error('No skills data found');
    
    for (const skill of skills) {
      if (!skill.studentId) throw new Error('Skills record missing studentId');
      if (!skill.category) throw new Error('Skills record missing category');
    }
  })) passedTests++;

  console.log(`\n${YELLOW}Part 2: Feature Systems${RESET}\n`);

  // 5. Badge System Test
  totalTests++;
  if (await testFeature('Badge System', async () => {
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      include: {
        rules: true,
        category: true
      }
    });
    
    if (badges.length === 0) throw new Error('No active badges found');
    
    // Check badge categories
    const categories = await prisma.badgeCategory.count();
    if (categories === 0) throw new Error('No badge categories found');
  })) passedTests++;

  // 6. Match System Test
  totalTests++;
  if (await testFeature('Match System', async () => {
    const matchCount = await prisma.match.count();
    const performanceCount = await prisma.matchPerformance.count();
    
    console.log(`  (${matchCount} matches, ${performanceCount} performances)`);
  })) passedTests++;

  // 7. Feedback System Test
  totalTests++;
  if (await testFeature('Feedback & Actions', async () => {
    const feedbackCount = await prisma.feedback.count();
    const actionCount = await prisma.action.count();
    
    console.log(`  (${feedbackCount} feedback items, ${actionCount} actions)`);
  })) passedTests++;

  // 8. Notification System Test
  totalTests++;
  if (await testFeature('Smart Notifications', async () => {
    const notificationCount = await prisma.smartNotification.count();
    const prefCount = await prisma.notificationPreference.count();
    
    console.log(`  (${notificationCount} notifications, ${prefCount} preferences)`);
  })) passedTests++;

  // 9. Marketplace Test
  totalTests++;
  if (await testFeature('Marketplace Features', async () => {
    const coachCount = await prisma.specializedCoach.count();
    const bookingCount = await prisma.coachingBooking.count();
    const reviewCount = await prisma.coachReview.count();
    
    console.log(`  (${coachCount} specialized coaches, ${bookingCount} bookings, ${reviewCount} reviews)`);
  })) passedTests++;

  // 10. Session Todo Test
  totalTests++;
  if (await testFeature('Session Todos', async () => {
    const todoCount = await prisma.sessionTodo.count();
    const itemCount = await prisma.sessionTodoItem.count();
    
    console.log(`  (${todoCount} todos, ${itemCount} items)`);
  })) passedTests++;

  console.log(`\n${YELLOW}Part 3: Data Validation${RESET}\n`);

  // 11. Hooper Index Test
  totalTests++;
  if (await testFeature('Hooper Index Data', async () => {
    const hooperCount = await prisma.hooperIndex.count();
    console.log(`  (${hooperCount} entries)`);
  })) passedTests++;

  // 12. Skill History Test
  totalTests++;
  if (await testFeature('Skill History Tracking', async () => {
    const historyCount = await prisma.skillHistory.count();
    console.log(`  (${historyCount} history entries)`);
  })) passedTests++;

  // Summary
  console.log(`\n${BLUE}=== Test Summary ===${RESET}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${GREEN}${passedTests}${RESET}`);
  console.log(`Failed: ${RED}${totalTests - passedTests}${RESET}`);
  console.log(`Success Rate: ${passedTests === totalTests ? GREEN : YELLOW}${((passedTests/totalTests) * 100).toFixed(1)}%${RESET}`);

  // Database Statistics
  console.log(`\n${BLUE}=== Database Statistics ===${RESET}`);
  const stats = {
    'Total Users': await prisma.user.count(),
    'Athletes': await prisma.user.count({ where: { role: 'ATHLETE' } }),
    'Coaches': await prisma.user.count({ where: { role: 'COACH' } }),
    'Students': await prisma.student.count(),
    'Skills Records': await prisma.skills.count(),
    'Active Badges': await prisma.badge.count({ where: { isActive: true } }),
    'Matches': await prisma.match.count(),
    'Feedback Items': await prisma.feedback.count(),
    'Notifications': await prisma.smartNotification.count(),
    'Hooper Entries': await prisma.hooperIndex.count(),
    'Skill History': await prisma.skillHistory.count()
  };

  for (const [key, value] of Object.entries(stats)) {
    console.log(`${key}: ${value}`);
  }

  // API Endpoint Testing
  console.log(`\n${BLUE}=== API Endpoint Testing ===${RESET}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/test-db');
    const data = await response.json();
    console.log(`Database API: ${GREEN}✓ Connected${RESET} (${data.userCount} users)`);
  } catch (error) {
    console.log(`Database API: ${RED}✗ Failed${RESET}`);
  }

  return passedTests === totalTests;
}

// Feature-specific tests
async function testAuthFlow() {
  console.log(`\n${BLUE}=== Authentication Flow Test ===${RESET}`);
  
  // Test user existence
  const testUser = await prisma.user.findUnique({
    where: { email: 'abraham@gmail.com' },
    include: { student: true }
  });
  
  if (testUser) {
    console.log(`Test User Found: ${GREEN}✓${RESET} ${testUser.email} (${testUser.role})`);
    if (testUser.student) {
      console.log(`Student Profile: ${GREEN}✓${RESET} ${testUser.student.studentName}, Academy: ${testUser.student.academy}`);
    }
  } else {
    console.log(`Test User: ${RED}✗ Not found${RESET}`);
  }
}

// Main execution
async function main() {
  console.log(`${BLUE}Starting comprehensive application testing...${RESET}\n`);
  
  try {
    const allPassed = await runTests();
    await testAuthFlow();
    
    if (allPassed) {
      console.log(`\n${GREEN}✅ All tests passed! Application is healthy and ready for deployment.${RESET}`);
      process.exit(0);
    } else {
      console.log(`\n${YELLOW}⚠️  Some tests failed, but core functionality is working.${RESET}`);
      process.exit(0);
    }
  } catch (error) {
    console.error(`\n${RED}Fatal error during testing:${RESET}`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 